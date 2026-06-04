import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { config } from "./config.js";
import { bootstrapDataDir } from "./bootstrap-data.js";
import { apiRoutes } from "./routes/index.js";
import { appConfigRoutes } from "./routes/app-config.js";
import { webRedirectRoutes } from "./routes/web-redirects.js";
import { mediaRoutes } from "./routes/media.js";
import { publicWebUrl } from "./public-urls.js";
import { jsonStoreBackend } from "./services/persistent-json-store.js";

export async function buildApp(): Promise<FastifyInstance> {
  await bootstrapDataDir();

  const app = Fastify({
    logger: process.env.NODE_ENV !== "production",
    bodyLimit: 15 * 1024 * 1024,
  });

  await app.register(cors, {
    origin:
      process.env.NODE_ENV === "production" && config.corsOrigins.length
        ? config.corsOrigins
        : true,
    credentials: true,
  });

  app.get("/health", async () => ({
    status: "ok",
    app: "AETERNA API",
    env: process.env.NODE_ENV || "development",
    jsonStore: jsonStoreBackend(),
    blobStorage: !!(config.blobReadWriteToken || config.blobStoreId),
    kvMediaFallback: !!(config.kvRestUrl && config.kvRestToken),
  }));

  app.get("/api/v1", async () => ({
    success: true,
    data: {
      name: "AETERNA",
      version: "1.1.0",
      modules: ["memorials", "candles", "masses", "auth", "priest"],
    },
  }));

  await apiRoutes(app);
  await mediaRoutes(app);
  await appConfigRoutes(app);
  await webRedirectRoutes(app);

  app.setNotFoundHandler(async (req, reply) => {
    const path = req.url.split("?")[0] ?? "/";
    if (path.startsWith("/api") || path === "/health") {
      return reply.status(404).send({
        message: `Route ${req.method}:${path} not found`,
        error: "Not Found",
        statusCode: 404,
        hint: "AETERNA API — naudokite /api/v1. Svetainė: " + publicWebUrl(),
      });
    }
    return reply.redirect(`${publicWebUrl()}${req.url}`, 302);
  });

  await app.ready();
  return app;
}
