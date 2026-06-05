/**
 * Importuoja ~708 parapijų iš RC JAR (lietuvos_parapijos.json).
 * Sujungia su katalikai.lt (svetainės, vyskupijos) kur sutampa pavadinimai.
 *
 * 1) python scripts/fetch-jar-parishes.py
 * 2) npm run import:parishes:jar
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import type { Parish } from "../src/types/aeterna.js";
import { DIOCESE_FALLBACK_IMAGE } from "../src/lib/parish-image.js";
import { normalizeLt, resolvePlace } from "./lt-place-coords.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const JAR_JSON = join(__dir, "lietuvos_parapijos.json");
const KATALIKAI_JSON = join(__dir, "../src/data/katalikai-parishes.json");
const OUT_JSON = join(__dir, "../src/data/jar-parishes.json");
const OUT_TS = join(__dir, "../src/data/lt-parishes.ts");

type JarRow = { kodas: string; pavadinimas: string; adresas: string };

const DIOCESE_KEYWORDS: Array<{ re: RegExp; diocese: string }> = [
  { re: /vilnius|trakai|svencion|ignalin|molet|utena|zaras|pabrade|tverec|nemenc|medinink|lavorisk|maišiagal|rudamin|naujoji vilnia|paneriai|lentvar|vievis|švenčion|šalčinink|varėn|merkin|druskinink/i, diocese: "Vilniaus arkivyskupija" },
  { re: /kaunas|jonava|kedain|rasein|siluva|ukmerge|sirvint|kaisiador|prien|jurbark|kelme|ariogal|dotnuv|garliav|vilkija|čekišk|šiluva|kėdain|jonav|raseini|ukmerg/i, diocese: "Kauno arkivyskupija" },
  { re: /kaišiad|kaisiad|ziezna|pravienisk|žiemoji|širvint|šėta|šeta/i, diocese: "Kaišiadorių vyskupija" },
  { re: /panevez|panevėž|birž|rokisk|rokišk|krekenav|leliun|pasval|kupišk|kupisk|anykšč|anyksc|obeliai|subač|subac/i, diocese: "Panevėžio vyskupija" },
  { re: /šiaul|siaul|pakruoj|tytuven|radvilišk|radvilisk|jonisk|jonisk|kelme|naujoji akmen|akmen|kuršėn|kursen|linkuva|vežai|vežai/i, diocese: "Šiaulių vyskupija" },
  { re: /telš|tels|klaip|kreting|palang|plung|skuod|skuod|šilut|silut|gargžd|gargzd|priekul|nida|šventoji|sventoji|žemaičių kalvar|kalvarij|skaudvil|laukuva|rietav|vainut|švėkšn|sveksn/i, diocese: "Telšių vyskupija" },
  { re: /marijampol|vilkavišk|vilkavisk|alyt|prien|kazlų rūd|kazlu rud|šakiai|sakiai|šilal|silal|kybart|virbal|kalvarij|vepri|lazdij|varėn|varena|sestok|igliauk|bagot|griskabud|marijamp|vilkaviš/i, diocese: "Vilkaviškio vyskupija" },
];

function inferDiocese(title: string, address: string): string {
  const blob = `${title} ${address}`;
  for (const { re, diocese } of DIOCESE_KEYWORDS) {
    if (re.test(blob)) return diocese;
  }
  return "Lietuva";
}

function slugify(title: string, kodas: string): string {
  const base = normalizeLt(title).replace(/\s+/g, "-").slice(0, 64);
  return `parish-${base || kodas}`;
}

function jitter(base: number, seed: string, scale = 0.012): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const t = (h % 1000) / 1000 - 0.5;
  return base + t * scale;
}

function titleKey(title: string): string {
  return normalizeLt(title).replace(/\s+/g, " ");
}

function cleanTitle(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

async function loadKatalikaiByTitle(): Promise<Map<string, Parish>> {
  const map = new Map<string, Parish>();
  try {
    const raw = JSON.parse(await readFile(KATALIKAI_JSON, "utf8")) as { parishes?: Parish[] };
    for (const p of raw.parishes ?? []) {
      map.set(titleKey(p.title), p);
    }
  } catch {
    /* pirmas importas be katalikai */
  }
  return map;
}

function toParish(row: JarRow, katalikai: Map<string, Parish>, usedIds: Set<string>): Parish {
  const title = cleanTitle(row.pavadinimas);
  const key = titleKey(title);
  const kat = katalikai.get(key);
  const diocese = kat?.diocese ?? inferDiocese(title, row.adresas ?? "");
  const place = resolvePlace(title, diocese);

  let id = kat?.id ?? slugify(title, row.kodas);
  if (usedIds.has(id)) {
    let n = 2;
    while (usedIds.has(`${id}-${n}`)) n++;
    id = `${id}-${n}`;
  }
  usedIds.add(id);

  const lat = jitter(kat?.lat ?? place.lat, title);
  const lng = jitter(kat?.lng ?? place.lng, `${title}lng`);

  return {
    id,
    title,
    diocese,
    deaneryId: kat?.deaneryId ?? place.deaneryId,
    deaneryName: kat?.deaneryName ?? place.deaneryName,
    lat,
    lng,
    city: kat?.city ?? place.city,
    websiteUrl: kat?.websiteUrl,
    image: DIOCESE_FALLBACK_IMAGE[diocese] ?? DIOCESE_FALLBACK_IMAGE["Vilniaus arkivyskupija"]!,
    bankAccount: kat?.bankAccount ?? "LT00 0000 0000 0000 0000",
    supportGoal: `Parama ${title} veiklai ir socialinei pagalbai`,
    source: kat ? "jar+katalikai.lt" : "registrucentras.lt/jar",
    sourceUrl:
      kat?.sourceUrl ?? "https://www.registrucentras.lt/aduomenys/?byla=JAR_IREGISTRUOTI.csv",
    updatedAt: new Date().toISOString().slice(0, 10),
    jarCode: row.kodas,
    address: row.adresas?.trim() || undefined,
  };
}

async function ensureJarJson(fetch: boolean): Promise<JarRow[]> {
  if (fetch) {
    console.log("Paleidžiamas fetch-jar-parishes.py...");
    execSync("python scripts/fetch-jar-parishes.py", {
      cwd: join(__dir, ".."),
      stdio: "inherit",
    });
  }
  const raw = await readFile(JAR_JSON, "utf8");
  return JSON.parse(raw) as JarRow[];
}

async function main() {
  const fetch = process.argv.includes("--fetch");
  const rows = await ensureJarJson(fetch);
  const katalikai = await loadKatalikaiByTitle();
  const usedIds = new Set<string>();
  const parishes: Parish[] = rows.map((r) => toParish(r, katalikai, usedIds));

  const cathedral = parishes.find(
    (p) =>
      normalizeLt(p.title).includes("vilniaus") &&
      (normalizeLt(p.title).includes("arkikatedra") || normalizeLt(p.title).includes("arkikatedr"))
  );

  const meta = {
    source: "https://www.registrucentras.lt/aduomenys/?byla=JAR_IREGISTRUOTI.csv",
    katalikaiMerged: katalikai.size,
    importedAt: new Date().toISOString(),
    count: parishes.length,
    demoParishId: cathedral?.id ?? parishes[0]?.id,
  };

  await writeFile(OUT_JSON, JSON.stringify({ meta, parishes }, null, 2), "utf8");

  const ts = `import type { Parish } from "../types/aeterna.js";

/** AUTO-GENERATED — npm run import:parishes:jar (${meta.count} parapijos iš RC JAR) */
export const LT_PARISHES: Parish[] = ${JSON.stringify(parishes, null, 2)} as Parish[];

export const KATALIKAI_META = ${JSON.stringify(meta, null, 2)} as const;

export const DEMO_PARISH_ID = ${JSON.stringify(cathedral?.id ?? "parish-vilniaus-sv-stanislovo-ir-sv-vladislovo-arkikatedra-bazilika")};
`;

  await writeFile(OUT_TS, ts, "utf8");
  console.log(`Importuota ${parishes.length} parapijų (${katalikai.size} sujungta su katalikai.lt)`);
  console.log(`→ ${OUT_TS}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
