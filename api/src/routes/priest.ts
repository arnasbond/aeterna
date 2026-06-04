import type { FastifyInstance, FastifyRequest } from "fastify";
import type { PriestAccessRequestInput, PriestLoginInput } from "../types/aeterna.js";
import {
  confirmMassBooking,
  createMassSlot,
  getPriestDashboard,
  listMassesForPriest,
  priestLogin,
  resolvePriestParishId,
} from "../services/mass-candle-store.js";
import {
  acknowledgeMassSlotRequest,
  listPendingMassSlotRequests,
  unreadMassSlotRequestCount,
} from "../services/mass-slot-request-store.js";
import { requestPriestOtp, verifyPriestOtp } from "../services/priest-otp-store.js";
import { submitPriestAccessRequest } from "../services/priest-access-store.js";
import type { ParishProfileInput } from "../types/parish-profile.js";
import {
  getParishDetail,
  importParishProfileFromWebsite,
  updateParishProfile,
} from "../services/parish-profile-store.js";

async function parishFromRequest(req: FastifyRequest): Promise<string | null> {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.headers["x-priest-token"];
  const t = typeof token === "string" ? token : undefined;
  return resolvePriestParishId(t);
}

export async function priestRoutes(app: FastifyInstance) {
  app.post<{ Body: PriestAccessRequestInput }>("/api/v1/priest/access-request", async (req, reply) => {
    const { parishId, priestName, email, phone, note } = req.body ?? {};
    if (!parishId || !priestName?.trim() || !email?.trim()) {
      return reply.status(400).send({
        success: false,
        error: { message: "parishId, priestName ir email privalomi" },
      });
    }
    try {
      const row = await submitPriestAccessRequest({
        parishId,
        priestName,
        email,
        phone,
        note,
      });
      return {
        success: true,
        data: {
          id: row.id,
          message:
            "Užklausa išsiųsta administratoriui. Prisijungti galėsite gavę patvirtinimą ir laikiną slaptažodį.",
        },
      };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko pateikti užklausos" },
      });
    }
  });

  app.post<{ Body: PriestLoginInput }>("/api/v1/priest/login", async (req, reply) => {
    const { parishId, password } = req.body ?? {};
    if (!parishId) {
      return reply.status(400).send({ success: false, error: { message: "parishId privalomas" } });
    }
    const session = await priestLogin(parishId, password ?? "");
    if (!session) {
      return reply.status(401).send({
        success: false,
        error: {
          message:
            "Neteisingi duomenys arba nepatvirtinta prieiga. Pateikite užklausą administratoriui ir naudokite gautą laikiną slaptažodį.",
        },
      });
    }
    return { success: true, data: session };
  });

  app.post<{ Body: { parishId?: string; email?: string } }>(
    "/api/v1/priest/auth/request-code",
    async (req, reply) => {
      const { parishId, email } = req.body ?? {};
      if (!parishId || !email?.trim()) {
        return reply.status(400).send({
          success: false,
          error: { message: "parishId ir email privalomi" },
        });
      }
      try {
        const result = await requestPriestOtp(parishId, email);
        return { success: true, data: result };
      } catch (e) {
        return reply.status(400).send({
          success: false,
          error: { message: e instanceof Error ? e.message : "Nepavyko išsiųsti kodo" },
        });
      }
    }
  );

  app.post<{ Body: { parishId?: string; email?: string; code?: string } }>(
    "/api/v1/priest/auth/verify-code",
    async (req, reply) => {
      const { parishId, email, code } = req.body ?? {};
      if (!parishId || !email?.trim() || !code?.trim()) {
        return reply.status(400).send({
          success: false,
          error: { message: "parishId, email ir code privalomi" },
        });
      }
      const session = await verifyPriestOtp(parishId, email, code);
      if (!session) {
        return reply.status(401).send({
          success: false,
          error: { message: "Neteisingas arba pasibaigęs kodas" },
        });
      }
      return { success: true, data: session };
    }
  );

  app.get("/api/v1/priest/dashboard", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    return { success: true, data: await getPriestDashboard(parishId) };
  });

  app.get("/api/v1/priest/masses", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    return { success: true, data: await listMassesForPriest(parishId) };
  });

  app.post<{ Body: { dateTime: string } }>("/api/v1/priest/masses", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    if (!req.body?.dateTime) {
      return reply.status(400).send({ success: false, error: { message: "dateTime privalomas" } });
    }
    const slot = await createMassSlot(parishId, req.body.dateTime);
    return { success: true, data: slot };
  });

  app.get("/api/v1/priest/parish-profile", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    const detail = await getParishDetail(parishId);
    if (!detail) {
      return reply.status(404).send({ success: false, error: { message: "Parapija nerasta" } });
    }
    return { success: true, data: detail };
  });

  app.put<{ Body: ParishProfileInput }>("/api/v1/priest/parish-profile", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    try {
      const profile = await updateParishProfile(parishId, req.body ?? {});
      return { success: true, data: profile };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko išsaugoti" },
      });
    }
  });

  app.post<{ Body: { url?: string } }>("/api/v1/priest/parish-profile/import-website", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    try {
      const profile = await importParishProfileFromWebsite(parishId, req.body?.url);
      return {
        success: true,
        data: {
          profile,
          message: "Informacija perkelta iš oficialios svetainės. Peržiūrėkite ir patikslinkite laukus.",
        },
      };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko importuoti" },
      });
    }
  });

  app.patch<{ Params: { id: string } }>("/api/v1/priest/masses/:id/confirm", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    try {
      const slot = await confirmMassBooking(req.params.id, parishId);
      return { success: true, data: slot };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko patvirtinti" },
      });
    }
  });

  app.get("/api/v1/priest/mass-slot-requests/unread", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    return { success: true, data: { count: await unreadMassSlotRequestCount(parishId) } };
  });

  app.get("/api/v1/priest/mass-slot-requests", async (req, reply) => {
    const parishId = await parishFromRequest(req);
    if (!parishId) {
      return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
    }
    return { success: true, data: await listPendingMassSlotRequests(parishId) };
  });

  app.patch<{ Params: { id: string } }>(
    "/api/v1/priest/mass-slot-requests/:id/acknowledge",
    async (req, reply) => {
      const parishId = await parishFromRequest(req);
      if (!parishId) {
        return reply.status(401).send({ success: false, error: { message: "Reikalingas klebono token" } });
      }
      const row = await acknowledgeMassSlotRequest(req.params.id, parishId);
      if (!row) {
        return reply.status(404).send({ success: false, error: { message: "Prašymas nerastas" } });
      }
      return { success: true, data: row };
    }
  );
}
