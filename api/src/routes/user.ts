import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createMemorial,
  getMemorialBySlug,
  listMemorialsByUserId,
  setMemorialLocation,
  updateMemorialByOwner,
} from "../services/aeterna-store.js";
import type { CreateMemorialInput } from "../types/aeterna.js";
import type { UpdateMemorialInput, UserLoginInput, UserRegisterInput } from "../types/user.js";
import { config } from "../config.js";
import {
  getUserById,
  getUserIdFromToken,
  loginUser,
  registerUser,
} from "../services/user-store.js";

function userTokenFromRequest(req: FastifyRequest): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const h = req.headers["x-user-token"];
  return typeof h === "string" ? h : undefined;
}

function userIdFromRequest(req: FastifyRequest): string | null {
  return getUserIdFromToken(userTokenFromRequest(req));
}

function requireUser(req: FastifyRequest, reply: FastifyReply): string | null {
  const id = userIdFromRequest(req);
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

  app.get("/api/v1/auth/me", async (req, reply) => {
    const userId = requireUser(req, reply);
    if (!userId) return;
    const user = await getUserById(userId);
    if (!user) {
      return reply.status(401).send({ success: false, error: { message: "Sesija nebegalioja" } });
    }
    return { success: true, data: user };
  });

  app.get("/api/v1/user/memorials", async (req, reply) => {
    const userId = requireUser(req, reply);
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
    const userId = requireUser(req, reply);
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
      const userId = requireUser(req, reply);
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
    const userId = requireUser(req, reply);
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
    const userId = requireUser(req, reply);
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
}
