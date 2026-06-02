import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getPriestParishId } from "../services/mass-candle-store.js";
import { getAdminFromToken } from "../services/priest-access-store.js";
import {
  createThreadForParish,
  getThread,
  listAllThreads,
  listThreadsForParish,
  markThreadRead,
  postMessage,
  unreadCountForAdmin,
  unreadCountForParish,
  updateThreadStatus,
} from "../services/support-message-store.js";
import type {
  CreateSupportThreadInput,
  PostSupportMessageInput,
  UpdateSupportThreadInput,
} from "../types/support-message.js";

function priestParishId(req: FastifyRequest): string | null {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.headers["x-priest-token"];
  const t = typeof token === "string" ? token : undefined;
  return getPriestParishId(t);
}

function adminToken(req: FastifyRequest): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const h = req.headers["x-admin-token"];
  return typeof h === "string" ? h : undefined;
}

function requirePriest(req: FastifyRequest, reply: FastifyReply): string | null {
  const parishId = priestParishId(req);
  if (!parishId) {
    reply.status(401).send({ success: false, error: { message: "Reikalingas prisijungimas" } });
    return null;
  }
  return parishId;
}

function requireAdmin(req: FastifyRequest, reply: FastifyReply): boolean {
  if (!getAdminFromToken(adminToken(req))) {
    reply.status(401).send({ success: false, error: { message: "Reikalingas administratoriaus prisijungimas" } });
    return false;
  }
  return true;
}

function authorLabelFromBody(req: FastifyRequest): string {
  const body = req.body as { authorName?: string } | undefined;
  return body?.authorName?.trim() || "";
}

export async function priestSupportRoutes(app: FastifyInstance) {
  app.get("/api/v1/priest/support/unread", async (req, reply) => {
    const parishId = requirePriest(req, reply);
    if (!parishId) return;
    return { success: true, data: { count: await unreadCountForParish(parishId) } };
  });

  app.get("/api/v1/priest/support/threads", async (req, reply) => {
    const parishId = requirePriest(req, reply);
    if (!parishId) return;
    return { success: true, data: await listThreadsForParish(parishId) };
  });

  app.post<{ Body: CreateSupportThreadInput & { authorName?: string } }>(
    "/api/v1/priest/support/threads",
    async (req, reply) => {
      const parishId = requirePriest(req, reply);
      if (!parishId) return;
      try {
        const label = authorLabelFromBody(req) || "Parapijos administratorius";
        const data = await createThreadForParish(parishId, "priest", label, req.body ?? ({} as CreateSupportThreadInput));
        return { success: true, data };
      } catch (e) {
        return reply.status(400).send({
          success: false,
          error: { message: e instanceof Error ? e.message : "Nepavyko sukurti" },
        });
      }
    }
  );

  app.get<{ Params: { id: string } }>("/api/v1/priest/support/threads/:id", async (req, reply) => {
    const parishId = requirePriest(req, reply);
    if (!parishId) return;
    const data = await getThread(req.params.id, parishId);
    if (!data) {
      return reply.status(404).send({ success: false, error: { message: "Pokalbis nerastas" } });
    }
    await markThreadRead(req.params.id, "priest", parishId);
    return { success: true, data };
  });

  app.post<{ Params: { id: string }; Body: PostSupportMessageInput & { authorName?: string } }>(
    "/api/v1/priest/support/threads/:id/messages",
    async (req, reply) => {
      const parishId = requirePriest(req, reply);
      if (!parishId) return;
      try {
        const label = authorLabelFromBody(req) || "Parapijos administratorius";
        const data = await postMessage(req.params.id, "priest", label, req.body?.body ?? "", parishId);
        return { success: true, data };
      } catch (e) {
        return reply.status(400).send({
          success: false,
          error: { message: e instanceof Error ? e.message : "Nepavyko išsiųsti" },
        });
      }
    }
  );

  app.patch<{ Params: { id: string } }>("/api/v1/priest/support/threads/:id/read", async (req, reply) => {
    const parishId = requirePriest(req, reply);
    if (!parishId) return;
    await markThreadRead(req.params.id, "priest", parishId);
    return { success: true, data: { ok: true } };
  });
}

export async function adminSupportRoutes(app: FastifyInstance) {
  app.get("/api/v1/admin/support/unread", async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    return { success: true, data: { count: await unreadCountForAdmin() } };
  });

  app.get<{ Querystring: { parishId?: string } }>("/api/v1/admin/support/threads", async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const { parishId } = req.query;
    if (parishId) {
      return { success: true, data: await listThreadsForParish(parishId) };
    }
    return { success: true, data: await listAllThreads() };
  });

  app.post<{ Body: CreateSupportThreadInput & { parishId: string; authorName?: string } }>(
    "/api/v1/admin/support/threads",
    async (req, reply) => {
      if (!requireAdmin(req, reply)) return;
      const { parishId } = req.body ?? {};
      if (!parishId) {
        return reply.status(400).send({ success: false, error: { message: "parishId privalomas" } });
      }
      try {
        const label = authorLabelFromBody(req) || "AETERNA administratorius";
        const data = await createThreadForParish(parishId, "admin", label, req.body);
        return { success: true, data };
      } catch (e) {
        return reply.status(400).send({
          success: false,
          error: { message: e instanceof Error ? e.message : "Nepavyko sukurti" },
        });
      }
    }
  );

  app.get<{ Params: { id: string } }>("/api/v1/admin/support/threads/:id", async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    const data = await getThread(req.params.id);
    if (!data) {
      return reply.status(404).send({ success: false, error: { message: "Pokalbis nerastas" } });
    }
    await markThreadRead(req.params.id, "admin");
    return { success: true, data };
  });

  app.post<{ Params: { id: string }; Body: PostSupportMessageInput }>(
    "/api/v1/admin/support/threads/:id/messages",
    async (req, reply) => {
      if (!requireAdmin(req, reply)) return;
      try {
        const data = await postMessage(
          req.params.id,
          "admin",
          authorLabelFromBody(req) || "AETERNA administratorius",
          req.body?.body ?? ""
        );
        return { success: true, data };
      } catch (e) {
        return reply.status(400).send({
          success: false,
          error: { message: e instanceof Error ? e.message : "Nepavyko išsiųsti" },
        });
      }
    }
  );

  app.patch<{ Params: { id: string }; Body: UpdateSupportThreadInput }>(
    "/api/v1/admin/support/threads/:id",
    async (req, reply) => {
      if (!requireAdmin(req, reply)) return;
      const thread = await updateThreadStatus(req.params.id, req.body ?? {});
      if (!thread) {
        return reply.status(404).send({ success: false, error: { message: "Pokalbis nerastas" } });
      }
      return { success: true, data: thread };
    }
  );

  app.patch<{ Params: { id: string } }>("/api/v1/admin/support/threads/:id/read", async (req, reply) => {
    if (!requireAdmin(req, reply)) return;
    await markThreadRead(req.params.id, "admin");
    return { success: true, data: { ok: true } };
  });
}
