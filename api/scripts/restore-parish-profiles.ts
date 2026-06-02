/**
 * Priverstinai įkelia parish-profiles.json į KV/Blob (produkcija).
 * Paleisti: npm run restore:parish-profiles
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env.production.local") });

async function main() {
  const { readParishProfilesSeed, ensureParishProfilesFromSeed } = await import(
    "../src/services/parish-profiles-seed.js"
  );
  const { saveJsonStore, jsonStoreBackend } = await import("../src/services/persistent-json-store.js");

  const seed = await readParishProfilesSeed();
  if (seed.length === 0) {
    console.error("seeds/parish-profiles.json nerastas arba tuščias.");
    process.exit(1);
  }

  const imported = seed.filter((p) => p.importedFrom?.trim()).length;
  console.log(`Saugykla: ${jsonStoreBackend()}`);
  console.log(`Seed: ${seed.length} profilių (${imported} su importu iš svetainių)`);

  await saveJsonStore("parish-profiles", seed);
  const check = await ensureParishProfilesFromSeed();
  console.log(`Įkelta. Patikra: ${check.count} profilių.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
