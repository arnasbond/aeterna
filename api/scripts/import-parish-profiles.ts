/**
 * Perkelia informaciją iš oficialių parapijų svetainių į parish-profiles.json
 * Paleisti: npm run import:parish-profiles
 */
import { listParishProfilesWithWebsite, importParishProfileFromWebsite } from "../src/services/parish-profile-store.js";

const DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const list = await listParishProfilesWithWebsite();
  console.log(`Importuojama ${list.length} parapijų…\n`);

  let ok = 0;
  let fail = 0;

  for (const row of list) {
    process.stdout.write(`• ${row.title.slice(0, 50)}… `);
    try {
      await importParishProfileFromWebsite(row.parishId, row.websiteUrl);
      console.log("OK");
      ok++;
    } catch (e) {
      console.log(`SKIP (${e instanceof Error ? e.message : e})`);
      fail++;
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nBaigta: ${ok} sėkmė, ${fail} praleista.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
