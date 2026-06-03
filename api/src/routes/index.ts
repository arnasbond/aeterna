import type { FastifyInstance } from "fastify";
import type {
  CheckoutInput,
  CreateMemorialInput,
  FindMemorialInput,
  LightCandleInput,
  MassBookingInput,
} from "../types/aeterna.js";
import {
  createMemorial,
  getMemorialPublic,
  getParish,
  listParishes,
  parishAdminSummary,
  recordOrder,
  setMemorialLocation,
  splitAmount,
} from "../services/aeterna-store.js";
import {
  bookMass,
  findMemorialSlug,
  getAvailableMasses,
  lightCandle,
  listCandlesForMemorial,
} from "../services/mass-candle-store.js";
import { addGuestbookEntry, listApprovedGuestbook } from "../services/guestbook-store.js";
import type { CreateGuestbookInput } from "../types/guestbook.js";
import { priestRoutes } from "./priest.js";
import { adminRoutes } from "./admin.js";
import { adminSupportRoutes, priestSupportRoutes } from "./support.js";
import { userRoutes } from "./user.js";
import { getUserIdFromToken } from "../services/user-store.js";
import { getMapData, getParishesByDeanery, searchParishes } from "../services/map-store.js";
import { getParishDetail, listParishesForPublic } from "../services/parish-profile-store.js";

const DEFAULT_PLAN_CENTS = 14900;

export async function apiRoutes(app: FastifyInstance) {
  app.get("/api/v1/parishes", async () => ({
    success: true,
    data: await listParishesForPublic(),
  }));

  app.get<{ Params: { id: string } }>("/api/v1/parishes/:id", async (req, reply) => {
    const p = await getParishDetail(req.params.id);
    if (!p) {
      return reply.status(404).send({ success: false, error: { message: "Parapija nerasta" } });
    }
    return { success: true, data: p };
  });

  app.get("/api/v1/map", async (req, reply) => {
    try {
      return { success: true, data: await getMapData() };
    } catch (e) {
      req.log.error(e);
      return reply.status(500).send({
        success: false,
        error: {
          message:
            e instanceof Error ? e.message : "Nepavyko įkelti žemėlapio duomenų (seniūnijos GeoJSON)",
        },
      });
    }
  });

  app.get<{ Querystring: { deaneryId?: string } }>("/api/v1/map/parishes", async (req) => {
    const { deaneryId } = req.query;
    const list = deaneryId ? getParishesByDeanery(deaneryId) : listParishes();
    return { success: true, data: list };
  });

  app.get<{ Querystring: { q?: string } }>("/api/v1/parishes/search", async (req) => ({
    success: true,
    data: searchParishes(req.query.q ?? ""),
  }));

  app.get<{ Params: { slug: string } }>("/api/v1/memorials/:slug/candles", async (req, reply) => {
    const memorial = await getMemorialPublic(req.params.slug);
    if (!memorial) {
      return reply.status(404).send({ success: false, error: { message: "Profilis nerastas" } });
    }
    return { success: true, data: await listCandlesForMemorial(req.params.slug) };
  });

  app.get<{ Params: { slug: string } }>("/api/v1/memorials/:slug", async (req, reply) => {
    const row = await getMemorialPublic(req.params.slug);
    if (!row) {
      return reply.status(404).send({ success: false, error: { message: "Profilis nerastas" } });
    }
    return { success: true, data: row };
  });

  app.post<{ Body: CreateMemorialInput }>("/api/v1/memorials", async (req, reply) => {
    const body = req.body;
    if (!body?.parishId || !body?.fullName?.trim()) {
      return reply.status(400).send({
        success: false,
        error: { message: "Reikalingi parishId ir fullName" },
      });
    }
    try {
      const auth = req.headers.authorization;
      const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
      const userId = await getUserIdFromToken(token);
      const memorial = await createMemorial(body, userId);
      return { success: true, data: memorial };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko sukurti" },
      });
    }
  });

  app.patch<{
    Params: { slug: string };
    Body: { lat?: number; lng?: number };
  }>("/api/v1/memorials/:slug/location", async (req, reply) => {
    const { lat, lng } = req.body ?? {};
    if (typeof lat !== "number" || typeof lng !== "number") {
      return reply.status(400).send({
        success: false,
        error: { message: "Nurodykite lat ir lng" },
      });
    }
    const auth = req.headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
    const userId = await getUserIdFromToken(token);
    const row = await setMemorialLocation(req.params.slug, lat, lng, userId);
    if (!row) {
      return reply.status(404).send({
        success: false,
        error: {
          message: userId
            ? "Profilis nerastas arba priklauso kitam vartotojui"
            : "Prisijunkite, kad nustatytumėte kapo vietą",
        },
      });
    }
    return { success: true, data: { geoLocation: row.geoLocation } };
  });

  app.post<{ Body: CheckoutInput }>("/api/v1/checkout", async (req, reply) => {
    const body = req.body ?? {};
    if (!body.parishId) {
      return reply.status(400).send({
        success: false,
        error: { message: "parishId privalomas" },
      });
    }
    const parish = getParish(body.parishId);
    if (!parish) {
      return reply.status(404).send({ success: false, error: { message: "Parapija nerasta" } });
    }

    const total = body.amountCents ?? DEFAULT_PLAN_CENTS;
    const split = splitAmount(total);
    const order = await recordOrder(body.parishId, total, null);

    return {
      success: true,
      data: {
        sessionId: order.id,
        totalAmountCents: total,
        parishCommissionCents: split.parishCommissionCents,
        serviceFeeCents: split.serviceFeeCents,
        currency: "EUR",
        checkoutUrl: `/wizard?step=done&order=${order.id}`,
        message:
          "MVP: mokėjimas simuliuotas. Production — Stripe/Paysera Marketplace su 20% parapijai.",
      },
    };
  });

  app.get("/api/v1/admin/summary", async () => ({
    success: true,
    data: await parishAdminSummary(),
  }));

  app.get<{ Querystring: { parishId?: string } }>("/api/v1/masses/available", async (req, reply) => {
    const parishId = req.query.parishId;
    if (!parishId) {
      return reply.status(400).send({ success: false, error: { message: "parishId privalomas" } });
    }
    return { success: true, data: await getAvailableMasses(parishId) };
  });

  app.post<{ Body: MassBookingInput }>("/api/v1/masses/book", async (req, reply) => {
    try {
      const slot = await bookMass(req.body);
      return { success: true, data: slot };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Užsakymas nepavyko" },
      });
    }
  });

  app.post<{ Body: FindMemorialInput }>("/api/v1/candles/find", async (req, reply) => {
    const { fullName, birthDate, deathDate } = req.body ?? {};
    if (!fullName?.trim() || !birthDate || !deathDate) {
      return reply.status(400).send({ success: false, error: { message: "Užpildykite visus laukus" } });
    }
    const slug = await findMemorialSlug(fullName, birthDate, deathDate);
    if (!slug) {
      return reply.status(404).send({ success: false, error: { message: "Profilis nerastas. Sukurkite memorialą." } });
    }
    return { success: true, data: { slug, profileUrl: `/m/${slug}` } };
  });

  app.get<{ Params: { slug: string } }>("/api/v1/memorials/:slug/guestbook", async (req, reply) => {
    const memorial = await getMemorialPublic(req.params.slug);
    if (!memorial) {
      return reply.status(404).send({ success: false, error: { message: "Profilis nerastas" } });
    }
    return { success: true, data: await listApprovedGuestbook(req.params.slug) };
  });

  app.post<{ Params: { slug: string }; Body: CreateGuestbookInput }>(
    "/api/v1/memorials/:slug/guestbook",
    async (req, reply) => {
      const memorial = await getMemorialPublic(req.params.slug);
      if (!memorial) {
        return reply.status(404).send({ success: false, error: { message: "Profilis nerastas" } });
      }
      try {
        const row = await addGuestbookEntry(req.params.slug, req.body ?? { authorName: "", message: "" });
        return {
          success: true,
          data: {
            id: row.id,
            message: "Ačiū. Jūsų užuojauta perduota šeimai — bus rodoma po patvirtinimo.",
          },
        };
      } catch (e) {
        return reply.status(400).send({
          success: false,
          error: { message: e instanceof Error ? e.message : "Nepavyko išsaugoti" },
        });
      }
    }
  );

  app.post<{ Body: LightCandleInput }>("/api/v1/candles/light", async (req, reply) => {
    try {
      const candle = await lightCandle(req.body);
      return { success: true, data: candle };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko uždegti žvakutės" },
      });
    }
  });

  await userRoutes(app);
  await priestRoutes(app);
  await adminRoutes(app);
  await priestSupportRoutes(app);
  await adminSupportRoutes(app);
}
