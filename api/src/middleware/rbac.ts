import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthPrincipal, UserRole } from "../types/rbac.js";

/** Mock / scaffold — vėliau JWT + OTP + OAuth */
export function getPrincipal(req: FastifyRequest): AuthPrincipal | null {
  const role = req.headers["x-aeterna-role"] as UserRole | undefined;
  const email = req.headers["x-aeterna-email"];
  if (!role || typeof email !== "string") return null;
  return {
    role,
    userId: `mock-${role}`,
    email,
    parishId: typeof req.headers["x-parish-id"] === "string" ? req.headers["x-parish-id"] : undefined,
  };
}

export function requireRole(roles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const p = getPrincipal(req);
    if (!p || !roles.includes(p.role)) {
      reply.status(403).send({ success: false, error: { message: "Neturite prieigos" } });
    }
  };
}
