import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "../config.js";
import {
  adminLogin,
  approvePriestAccessRequest,
  getAdminFromToken,
  listPriestAccessRequests,
  rejectPriestAccessRequest,
} from "../services/priest-access-store.js";

function adminToken(req: FastifyRequest): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const h = req.headers["x-admin-token"];
  return typeof h === "string" ? h : undefined;
}

function requireAdmin(req: FastifyRequest, reply: { status: (n: number) => { send: (b: unknown) => unknown } }) {
  if (!getAdminFromToken(adminToken(req))) {
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
    const token = adminLogin(password);
    if (!token) {
      return reply.status(401).send({ success: false, error: { message: "Neteisingas administratoriaus slaptažodis" } });
    }
    return { success: true, data: { token } };
  });

  app.get("/api/v1/admin/priest-requests", async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const list = await listPriestAccessRequests();
    return { success: true, data: list };
  });

  app.post<{ Params: { id: string } }>("/api/v1/admin/priest-requests/:id/approve", async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
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
    if (!requireAdmin(req, reply)) return;
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
}
