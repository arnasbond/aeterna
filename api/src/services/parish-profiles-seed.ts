import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ParishProfile } from "../types/parish-profile.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "parish-profiles";

export async function readParishProfilesSeed(): Promise<ParishProfile[]> {
  const seedPath = join(process.cwd(), "seeds", "parish-profiles.json");
  try {
    return JSON.parse(await readFile(seedPath, "utf8")) as ParishProfile[];
  } catch {
    return [];
  }
}

function countImported(profiles: ParishProfile[]): number {
  return profiles.filter((p) => p.importedFrom?.trim()).length;
}

/** Atkuria profilius iš seeds, jei debesyje /tmp jų nebėra arba liko tušti. */
export async function ensureParishProfilesFromSeed(): Promise<{ restored: boolean; count: number }> {
  const seed = await readParishProfilesSeed();
  if (seed.length === 0) {
    return { restored: false, count: 0 };
  }

  const current = await loadJsonStore<ParishProfile[]>(STORE_KEY, []);
  const seedImported = countImported(seed);
  const currentImported = countImported(current);

  const shouldRestore =
    current.length === 0 ||
    (seedImported > 0 && currentImported < Math.max(3, Math.floor(seedImported * 0.5)));

  if (!shouldRestore) {
    return { restored: false, count: current.length };
  }

  const byId = new Map<string, ParishProfile>();
  for (const p of current) byId.set(p.parishId, p);
  for (const s of seed) {
    const existing = byId.get(s.parishId);
    if (!existing) {
      byId.set(s.parishId, s);
      continue;
    }
    // Seed perrašo, jei dabartinis tuščias arba neturi importo
    const keepCurrent =
      existing.importedFrom?.trim() &&
      !s.importedFrom?.trim() &&
      (existing.about?.trim() || existing.galleryUrls?.length);
    if (!keepCurrent) byId.set(s.parishId, s);
  }

  const merged = [...byId.values()];
  await saveJsonStore(STORE_KEY, merged);
  return { restored: true, count: merged.length };
}
