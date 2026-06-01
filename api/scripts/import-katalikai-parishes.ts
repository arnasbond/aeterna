/**
 * Importuoja parapijas iš https://www.katalikai.lt/index.php?id=53
 * Paleisti: npm run import:parishes
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Parish } from "../src/types/aeterna.js";
import { dioceseFromHeader, normalizeLt, resolvePlace } from "./lt-place-coords.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dir, "katalikai-53.html");
const OUT_JSON = join(__dir, "../src/data/katalikai-parishes.json");
const OUT_TS = join(__dir, "../src/data/lt-parishes.ts");

const DIOCESE_IMAGE: Record<string, string> = {
  "Kauno arkivyskupija":
    "https://images.unsplash.com/photo-1551884830-bf36c308ed29?auto=format&fit=crop&w=800&q=80",
  "Kaišiadorių vyskupija":
    "https://images.unsplash.com/photo-1548013146-7249fcee8f75?auto=format&fit=crop&w=800&q=80",
  "Panevėžio vyskupija":
    "https://images.unsplash.com/photo-1548013146-7249fcee8f75?auto=format&fit=crop&w=800&q=80",
  "Šiaulių vyskupija":
    "https://images.unsplash.com/photo-1548013146-7249fcee8f75?auto=format&fit=crop&w=800&q=80",
  "Telšių vyskupija":
    "https://images.unsplash.com/photo-1548013146-7249fcee8f75?auto=format&fit=crop&w=800&q=80",
  "Vilkaviškio vyskupija":
    "https://images.unsplash.com/photo-1548013146-7249fcee8f75?auto=format&fit=crop&w=800&q=80",
  "Vilniaus arkivyskupija":
    "https://images.unsplash.com/photo-1551884830-bf36c308ed29?auto=format&fit=crop&w=800&q=80",
};

function slugify(title: string): string {
  const base = normalizeLt(title).replace(/\s+/g, "-").slice(0, 72);
  return `parish-${base || "unknown"}`;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/\s*\(pakuta\.lt\)\s*/gi, "")
    .trim();
}

function decodeHtml(html: Buffer): string {
  try {
    return new TextDecoder("windows-1257").decode(html);
  } catch {
    return html.toString("utf8");
  }
}

type RawParish = { title: string; url: string; diocese: string };

function parseParishes(html: string): RawParish[] {
  const section = html.match(/<a name="parapijos"><\/a>[\s\S]*?(?=Sàraðas atnaujintas|Sąrašas atnaujintas)/i);
  if (!section) throw new Error("Nepavyko rasti parapijų sekcijos HTML");
  const body = section[0];
  const results: RawParish[] = [];
  let diocese = "Lietuva";

  const blocks = body.split(/<ul>/i);
  for (const block of blocks) {
    const dioceseMatch = block.match(/<b>\s*<a[^>]*>([^<]+)<\/a>\s*<\/b>/i);
    if (dioceseMatch) {
      diocese = dioceseFromHeader(dioceseMatch[1]!);
    }
    const linkRe = /<li[^>]*>\s*(?:<b>)?\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(block)) !== null) {
      const url = m[1]!.trim().replace(/^httpss:/i, "https:");
      const title = cleanTitle(m[2]!.replace(/<[^>]+>/g, ""));
      if (!title || title.length < 4) continue;
      if (/VYSKUPIJA/i.test(title)) continue;
      results.push({ title, url, diocese });
    }
  }
  return results;
}

function jitter(base: number, seed: string, scale = 0.012): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const t = (h % 1000) / 1000 - 0.5;
  return base + t * scale;
}

function toParish(raw: RawParish, usedIds: Set<string>): Parish {
  const place = resolvePlace(raw.title, raw.diocese);
  let id = slugify(raw.title);
  if (usedIds.has(id)) {
    let n = 2;
    while (usedIds.has(`${id}-${n}`)) n++;
    id = `${id}-${n}`;
  }
  usedIds.add(id);

  const lat = jitter(place.lat, raw.title);
  const lng = jitter(place.lng, raw.title + "lng");

  return {
    id,
    title: raw.title,
    diocese: raw.diocese,
    deaneryId: place.deaneryId,
    deaneryName: place.deaneryName,
    lat,
    lng,
    city: place.city,
    websiteUrl: raw.url,
    image: DIOCESE_IMAGE[raw.diocese] ?? DIOCESE_IMAGE["Vilniaus arkivyskupija"]!,
    bankAccount: "LT00 0000 0000 0000 0000",
    supportGoal: `Parama ${raw.title} veiklai ir socialinei pagalbai`,
    source: "katalikai.lt",
    sourceUrl: "https://www.katalikai.lt/index.php?id=53",
    updatedAt: "2026-02-02",
  };
}

async function fetchFreshHtml(): Promise<Buffer> {
  const res = await fetch("https://www.katalikai.lt/index.php?id=53", {
    headers: { "User-Agent": "AETERNA-parish-import/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  let htmlBuf: Buffer;
  try {
    htmlBuf = await fetchFreshHtml();
    await writeFile(HTML_PATH, htmlBuf);
    console.log("Atnaujintas HTML iš katalikai.lt");
  } catch (e) {
    console.warn("Nepavyko atsisiųsti — naudojamas vietinis failas:", e);
    htmlBuf = await readFile(HTML_PATH);
  }

  const html = decodeHtml(htmlBuf).replace(/<!--[\s\S]*?-->/g, "");
  const raw = parseParishes(html);
  const usedIds = new Set<string>();
  const parishes: Parish[] = raw.map((r) => toParish(r, usedIds));

  // Demo memorial — Vilniaus arkikatedra
  const cathedral = parishes.find((p) =>
    normalizeLt(p.title).includes("vilniaus") && normalizeLt(p.title).includes("arkikatedra")
  );
  if (cathedral) {
    (parishes as Parish & { _demoMemorial?: boolean }).find;
    console.log(`Demo parapija (ona-demo): ${cathedral.id}`);
  }

  const meta = {
    source: "https://www.katalikai.lt/index.php?id=53",
    importedAt: new Date().toISOString(),
    count: parishes.length,
    demoParishId: cathedral?.id ?? parishes[0]?.id,
  };

  await writeFile(OUT_JSON, JSON.stringify({ meta, parishes }, null, 2), "utf8");

  const ts = `import type { Parish } from "../types/aeterna.js";

/** AUTO-GENERATED — npm run import:parishes (${meta.count} parapijos iš katalikai.lt, ${meta.source}) */
export const LT_PARISHES: Parish[] = ${JSON.stringify(parishes, null, 2)} as Parish[];

export const KATALIKAI_META = ${JSON.stringify(meta, null, 2)} as const;

/** Demo memorialui (ona-demo) naudoti šią parapiją */
export const DEMO_PARISH_ID = ${JSON.stringify(cathedral?.id ?? "parish-vilniaus-sv-stanislovo-ir-sv-vladislovo-arkikatedra-bazilika")};
`;

  await writeFile(OUT_TS, ts, "utf8");
  console.log(`Importuota ${parishes.length} parapijų → ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
