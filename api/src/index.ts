import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import { bootstrapDataDir } from "./bootstrap-data.js";
import { apiRoutes } from "./routes/index.js";
import { appUpdateRoutes } from "./routes/app-update.js";

const app = Fastify({ logger: true });

await bootstrapDataDir();

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
  data: { name: "AETERNA", version: "1.1.0", modules: ["memorials", "candles", "masses", "priest"] },
}));

await apiRoutes(app);
await appUpdateRoutes(app);

try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
