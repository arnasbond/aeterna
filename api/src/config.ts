import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  dataDir: resolve(process.cwd(), "data"),
  /** Laikinas testinis prisijungimas — išjungti: AETERNA_DISABLE_TEST_LOGIN=1 */
  testLoginEnabled:
    process.env.AETERNA_DISABLE_TEST_LOGIN !== "1" && process.env.NODE_ENV !== "production",
  testLoginPassword: process.env.AETERNA_TEST_LOGIN_PASSWORD || "12345678",
};
