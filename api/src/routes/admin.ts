import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "../config.js";
import {
  listPendingMemorials,
  setMemorialModeration,
} from "../services/aeterna-store.js";
import {
  adminLogin,
  approvePriestAccessRequest,
  listPriestAccessRequests,
  rejectPriestAccessRequest,
  resolveAdminFromToken,
} from "../services/priest-access-store.js";

function adminToken(req: FastifyRequest): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const h = req.headers["x-admin-token"];
  return typeof h === "string" ? h : undefined;
}

async function requireAdmin(req: FastifyRequest, reply: { status: (n: number) => { send: (b: unknown) => unknown } }) {
  if (!(await resolveAdminFromToken(adminToken(req)))) {
    reply.status(401).send({ success: false, error: { message: "Reikalingas administratoriaus prisijungimas" } });
    return false;
  }
  return true;
}

export async function adminRoutes(app: FastifyInstance) {
  app.post<{ Body: { password?: string } }>("/api/v1/admin/login", async (req, reply) => {
    const password = req.body?.password?.trim() ?? "";
    if (config.requirePasswords && !password) {
      return reply.status(400).send({ success: false, error: { message: "Slaptažodis privalomas" } });
    }
    const token = await adminLogin(password);
    if (!token) {
      return reply.status(401).send({ success: false, error: { message: "Neteisingas administratoriaus slaptažodis" } });
    }
    return { success: true, data: { token } };
  });

  app.get("/api/v1/admin/priest-requests", async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return;
    const list = await listPriestAccessRequests();
    return { success: true, data: list };
  });

  app.post<{ Params: { id: string } }>("/api/v1/admin/priest-requests/:id/approve", async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return;
    try {
      const result = await approvePriestAccessRequest(req.params.id);
      return {
        success: true,
        data: {
          request: result.request,
          temporaryPassword: result.temporaryPassword,
          expiresAt: result.expiresAt,
          message:
            "Laikinas slaptažodis sugeneruotas. Perduokite jį klebonui saugiu kanalu — čia rodomas tik vieną kartą.",
        },
      };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko patvirtinti" },
      });
    }
  });

  app.post<{ Params: { id: string } }>("/api/v1/admin/priest-requests/:id/reject", async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return;
    try {
      const request = await rejectPriestAccessRequest(req.params.id);
      return { success: true, data: request };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko atmesti" },
      });
    }
  });

  app.get("/api/v1/admin/memorials/pending", async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return;
    return { success: true, data: await listPendingMemorials() };
  });

  app.post<{ Params: { slug: string } }>("/api/v1/admin/memorials/:slug/approve", async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return;
    const row = await setMemorialModeration(req.params.slug, "approved");
    if (!row) {
      return reply.status(404).send({ success: false, error: { message: "Memorialas nerastas" } });
    }
    return { success: true, data: { slug: row.slug, moderationStatus: row.moderationStatus } };
  });

  app.post<{ Params: { slug: string } }>("/api/v1/admin/memorials/:slug/reject", async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return;
    const row = await setMemorialModeration(req.params.slug, "rejected");
    if (!row) {
      return reply.status(404).send({ success: false, error: { message: "Memorialas nerastas" } });
    }
    return { success: true, data: { slug: row.slug, moderationStatus: row.moderationStatus } };
  });
}
