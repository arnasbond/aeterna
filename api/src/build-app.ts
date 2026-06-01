import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { config } from "./config.js";
import { bootstrapDataDir } from "./bootstrap-data.js";
import { apiRoutes } from "./routes/index.js";
import { appUpdateRoutes } from "./routes/app-update.js";

export async function buildApp(): Promise<FastifyInstance> {
  await bootstrapDataDir();

  const app = Fastify({ logger: process.env.NODE_ENV !== "production" });

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
  }));

  app.get("/api/v1", async () => ({
    success: true,
    data: {
      name: "AETERNA",
      version: "1.1.0",
      modules: ["memorials", "candles", "masses", "priest"],
    },
  }));

  await apiRoutes(app);
  await appUpdateRoutes(app);
  await app.ready();
  return app;
}
