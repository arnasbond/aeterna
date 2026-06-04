import type { MemorialSearchHit } from "@/lib/api";

/** Vieši demo profiliai — veikia net jei API /memorials/search dar ne deploy'intas. */
export const MEMORIAL_SEARCH_DEMOS: MemorialSearchHit[] = [
  {
    slug: "ona-demo",
    fullName: "Stasė",
    birthDate: "1936-05-12",
    deathDate: "2024-12-24",
    portraitUrl: "https://aeterna-mauve.vercel.app/demo/stase/portrait.jpg",
  },
  {
    slug: "vardenis-pavardenis",
    fullName: "Vardenis Pavardenis",
    birthDate: "1940-01-15",
    deathDate: "2020-06-01",
    portraitUrl: null,
  },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function filterMemorialSearchDemos(query: string, limit = 10): MemorialSearchHit[] {
  const q = norm(query);
  if (!q) return [];

  const scored: { score: number; hit: MemorialSearchHit }[] = [];
  for (const hit of MEMORIAL_SEARCH_DEMOS) {
    const name = norm(hit.fullName);
    const slug = norm(hit.slug);
    const words = name.split(/\s+/).filter(Boolean);
    let score = 0;
    if (slug.startsWith(q) || name.startsWith(q)) score = 4;
    else if (words.some((w) => w.startsWith(q))) score = 3;
    else if (slug.includes(q) || name.includes(q)) score = 2;
    else continue;
    scored.push({ score, hit });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.hit.fullName.localeCompare(b.hit.fullName, "lt"))
    .slice(0, limit)
    .map((s) => s.hit);
}
