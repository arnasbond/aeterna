import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { MapData, Parish, ParishMapPoint } from "../types/aeterna.js";
import { LT_PARISHES } from "../data/lt-parishes.js";
import { getParish, listParishes } from "./aeterna-store.js";

const __dir = dirname(fileURLToPath(import.meta.url));

let deaneriesCache: MapData["deaneries"] | null = null;

const DEANERY_FILE_CANDIDATES = [
  join(__dir, "../data/lt-deaneries.geojson"),
  join(process.cwd(), "dist/data/lt-deaneries.geojson"),
  join(process.cwd(), "src/data/lt-deaneries.geojson"),
  join(process.cwd(), "data/lt-deaneries.geojson"),
];

async function loadDeaneries(): Promise<MapData["deaneries"]> {
  if (deaneriesCache) return deaneriesCache;

  let lastErr: unknown;
  for (const path of DEANERY_FILE_CANDIDATES) {
    try {
      const raw = await readFile(path, "utf8");
      deaneriesCache = JSON.parse(raw) as MapData["deaneries"];
      return deaneriesCache;
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(
    `lt-deaneries.geojson nerastas. Paskutinė klaida: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`
  );
}

function toMapPoint(p: Parish): ParishMapPoint {
  return {
    id: p.id,
    title: p.title,
    diocese: p.diocese,
    deaneryId: p.deaneryId,
    deaneryName: p.deaneryName,
    lat: p.lat,
    lng: p.lng,
    city: p.city,
  };
}

export async function getMapData(): Promise<MapData> {
  const deaneries = await loadDeaneries();
  return {
    deaneries,
    parishes: LT_PARISHES.map(toMapPoint),
  };
}

export function getParishesByDeanery(deaneryId: string): Parish[] {
  return listParishes().filter((p) => p.deaneryId === deaneryId);
}

export function getParishDetail(id: string): Parish | null {
  return getParish(id);
}

export function searchParishes(query: string): Parish[] {
  const q = query.trim().toLowerCase();
  if (!q) return listParishes();
  return listParishes().filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.deaneryName.toLowerCase().includes(q) ||
      p.diocese.toLowerCase().includes(q)
  );
}
