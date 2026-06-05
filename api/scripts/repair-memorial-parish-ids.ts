import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envFile = [".env.restore.prod", ".env.production.local", ".env.local"].find((f) =>
  existsSync(resolve(process.cwd(), f))
);
if (envFile) dotenv.config({ path: resolve(process.cwd(), envFile) });

const { clearJsonStoreCache } = await import("../src/services/persistent-json-store.js");
const { legacyParishIdCount } = await import("../src/lib/parish-id-legacy.js");
const { repairMemorialParishIds } = await import("../src/services/aeterna-store.js");

clearJsonStoreCache();
console.log("Legacy parish ID map:", legacyParishIdCount());
const fixed = await repairMemorialParishIds();
console.log("Pataisyta memorialų:", fixed);
