import type { FastifyInstance } from "fastify";
import { publicWebUrl } from "../public-urls.js";

const WEB_PATHS = [
  "/paieska",
  "/atsisiusti",
  "/wizard",
  "/map",
  "/parishes",
  "/qr-ploksteles",
  "/priest/login",
  "/admin/login",
] as const;

/** Jei kas nors atidaro API domeną naršyklėje — peradresuoti į svetainę. */
export async function webRedirectRoutes(app: FastifyInstance) {
  const web = () => publicWebUrl();

  app.get("/", async (_req, reply) => {
    return reply.redirect(302, `${web()}/`);
  });

  for (const path of WEB_PATHS) {
    app.get(path, async (_req, reply) => {
      return reply.redirect(302, `${web()}${path}`);
    });
  }

  app.get<{ Params: { slug: string } }>("/m/:slug", async (req, reply) => {
    return reply.redirect(302, `${web()}/m/${encodeURIComponent(req.params.slug)}`);
  });

  app.get<{ Params: { id: string } }>("/parishes/:id", async (req, reply) => {
    return reply.redirect(302, `${web()}/parishes/${encodeURIComponent(req.params.id)}`);
  });
}
