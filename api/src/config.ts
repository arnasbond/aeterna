import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

const dataRoot =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? "/tmp/aeterna-data" : resolve(process.cwd(), "data"));

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigins: (
    process.env.CORS_ORIGINS ||
    "http://localhost:3000,http://127.0.0.1:3000,https://aeterna-mauve.vercel.app"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  dataDir: dataRoot,
  /** Vercel KV / Upstash REST (nuolatinei JSON saugyklai) */
  kvRestUrl: process.env.KV_REST_API_URL?.replace(/\/$/, "") || "",
  kvRestToken: process.env.KV_REST_API_TOKEN || "",
  /** Vercel Blob (alternatyva KV) */
  blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || "",
  /** Laikinas testinis prisijungimas — išjungti: AETERNA_DISABLE_TEST_LOGIN=1 */
  testLoginEnabled:
    process.env.AETERNA_DISABLE_TEST_LOGIN !== "1" && process.env.NODE_ENV !== "production",
  testLoginPassword: process.env.AETERNA_TEST_LOGIN_PASSWORD || "12345678",
  /**
   * Slaptažodžių tikrinimas. Laikinai išjungta testavimui.
   * Įjungti vėliau: AETERNA_REQUIRE_PASSWORDS=1 (ir web: NEXT_PUBLIC_AETERNA_REQUIRE_PASSWORDS=1)
   */
  requirePasswords: process.env.AETERNA_REQUIRE_PASSWORDS === "1",
  /** Resend.com — el. pašto OTP klebonams */
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.AETERNA_EMAIL_FROM || "AETERNA <onboarding@resend.dev>",
};
