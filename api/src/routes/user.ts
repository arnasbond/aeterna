import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createMemorial,
  getMemorialBySlug,
  listMemorialsByUserId,
  setMemorialLocation,
  updateMemorialByOwner,
} from "../services/aeterna-store.js";
import {
  listGuestbookForOwner,
  setGuestbookEntryStatus,
} from "../services/guestbook-store.js";
import type { CreateMemorialInput } from "../types/aeterna.js";
import type { UpdateMemorialInput, UserLoginInput, UserRegisterInput } from "../types/user.js";
import { config } from "../config.js";
import {
  getUserById,
  getUserIdFromToken,
  loginUser,
  oauthLoginUser,
  registerUser,
} from "../services/user-store.js";

function userTokenFromRequest(req: FastifyRequest): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const h = req.headers["x-user-token"];
  return typeof h === "string" ? h : undefined;
}

async function userIdFromRequest(req: FastifyRequest): Promise<string | null> {
  return getUserIdFromToken(userTokenFromRequest(req));
}

async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  const id = await userIdFromRequest(req);
  if (!id) {
    reply.status(401).send({
      success: false,
      error: { message: "Prisijunkite, kad pasiektumėte savo paskyrą" },
    });
    return null;
  }
  return id;
}

export async function userRoutes(app: FastifyInstance) {
  app.post<{ Body: UserRegisterInput }>("/api/v1/auth/register", async (req, reply) => {
    try {
      const data = await registerUser(req.body ?? ({} as UserRegisterInput));
      return { success: true, data };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Registracija nepavyko" },
      });
    }
  });

  app.post<{ Body: UserLoginInput }>("/api/v1/auth/login", async (req, reply) => {
    const { email, password } = req.body ?? {};
    if (config.requirePasswords && (!email?.trim() || !password)) {
      return reply.status(400).send({
        success: false,
        error: { message: "El. paštas ir slaptažodis privalomi" },
      });
    }
    const session = await loginUser(email ?? "", password ?? "");
    if (!session) {
      return reply.status(401).send({
        success: false,
        error: { message: "Neteisingas el. paštas arba slaptažodis" },
      });
    }
    return { success: true, data: session };
  });

  app.post<{
    Body: { provider?: "google" | "facebook"; email?: string; fullName?: string };
  }>("/api/v1/auth/oauth", async (req, reply) => {
    const { provider, email, fullName } = req.body ?? {};
    if (provider !== "google" && provider !== "facebook") {
      return reply.status(400).send({
        success: false,
        error: { message: "provider turi būti google arba facebook" },
      });
    }
    try {
      const session = await oauthLoginUser({ provider, email, fullName });
      return { success: true, data: session };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "OAuth prisijungimas nepavyko" },
      });
    }
  });

  app.get("/api/v1/auth/me", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const user = await getUserById(userId);
    if (!user) {
      return reply.status(401).send({ success: false, error: { message: "Sesija nebegalioja" } });
    }
    return { success: true, data: user };
  });

  app.get("/api/v1/user/memorials", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const list = await listMemorialsByUserId(userId);
    return {
      success: true,
      data: list.map((m) => ({
        id: m.id,
        slug: m.slug,
        fullName: m.fullName,
        birthDate: m.birthDate,
        deathDate: m.deathDate,
        parishId: m.parishId,
        profileUrl: m.profileUrl,
        qrCodeUrl: m.qrCodeUrl,
        privacyStatus: m.privacyStatus,
        updatedAt: m.updatedAt,
      })),
    };
  });

  app.get<{ Params: { slug: string } }>("/api/v1/user/memorials/:slug", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const row = await getMemorialBySlug(req.params.slug);
    if (!row || row.userId !== userId) {
      return reply.status(404).send({ success: false, error: { message: "Profilis nerastas" } });
    }
    return { success: true, data: row };
  });

  app.patch<{ Params: { slug: string }; Body: UpdateMemorialInput }>(
    "/api/v1/user/memorials/:slug",
    async (req, reply) => {
      const userId = await requireUser(req, reply);
      if (!userId) return;
      const row = await updateMemorialByOwner(req.params.slug, userId, req.body ?? {});
      if (!row) {
        return reply.status(404).send({
          success: false,
          error: { message: "Profilis nerastas arba priklauso kitam vartotojui" },
        });
      }
      return { success: true, data: row };
    }
  );

  app.post<{ Body: CreateMemorialInput }>("/api/v1/user/memorials", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const body = req.body;
    if (!body?.parishId || !body?.fullName?.trim()) {
      return reply.status(400).send({
        success: false,
        error: { message: "Reikalingi parishId ir fullName" },
      });
    }
    try {
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
  }>("/api/v1/user/memorials/:slug/location", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const { lat, lng } = req.body ?? {};
    if (typeof lat !== "number" || typeof lng !== "number") {
      return reply.status(400).send({
        success: false,
        error: { message: "Nurodykite lat ir lng" },
      });
    }
    const row = await setMemorialLocation(req.params.slug, lat, lng, userId);
    if (!row) {
      return reply.status(404).send({
        success: false,
        error: { message: "Profilis nerastas arba neturite teisės redaguoti" },
      });
    }
    return { success: true, data: { geoLocation: row.geoLocation } };
  });

  app.get<{ Params: { slug: string } }>("/api/v1/user/memorials/:slug/guestbook", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const list = await listGuestbookForOwner(req.params.slug, userId);
    if (list.length === 0) {
      const row = await getMemorialBySlug(req.params.slug);
      if (!row || row.userId !== userId) {
        return reply.status(404).send({ success: false, error: { message: "Profilis nerastas" } });
      }
    }
    return { success: true, data: list };
  });

  app.patch<{
    Params: { slug: string; id: string };
    Body: { status?: "approved" | "rejected" };
  }>("/api/v1/user/memorials/:slug/guestbook/:id", async (req, reply) => {
    const userId = await requireUser(req, reply);
    if (!userId) return;
    const status = req.body?.status;
    if (status !== "approved" && status !== "rejected") {
      return reply.status(400).send({ success: false, error: { message: "status: approved arba rejected" } });
    }
    const row = await setGuestbookEntryStatus(req.params.slug, req.params.id, userId, status);
    if (!row) {
      return reply.status(404).send({ success: false, error: { message: "Įrašas nerastas" } });
    }
    return { success: true, data: row };
  });
}
