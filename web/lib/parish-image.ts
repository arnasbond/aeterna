/** Bendra logika su API — parapijų miniatiūros ir galerija. */
export const PARISH_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80";

const STOCK_IMAGE_IDS = [
  "photo-1551884830-bf36c308ed29",
  "photo-1548013146-7249fcee8f75",
  "photo-1511895426328-dc8714191300",
  "photo-1477617722074-45613a51bf6d",
  "photo-1516627145497-ae6968895b74",
  "photo-1548013146-724f63864393",
];

export const DIOCESE_FALLBACK_IMAGE: Record<string, string> = {
  "Kauno arkivyskupija": PARISH_FALLBACK_IMAGE,
  "Kaišiadorių vyskupija": PARISH_FALLBACK_IMAGE,
  "Panevėžio vyskupija": PARISH_FALLBACK_IMAGE,
  "Šiaulių vyskupija": PARISH_FALLBACK_IMAGE,
  "Telšių vyskupija": PARISH_FALLBACK_IMAGE,
  "Vilkaviškio vyskupija": PARISH_FALLBACK_IMAGE,
  "Vilniaus arkivyskupija": PARISH_FALLBACK_IMAGE,
};

const ALLOWED_CHURCH_UNSPLASH = ["photo-1438032005730-c779502df39b"];

const JUNK_URL_RE =
  /facebook\.|instagram\.|twitter\.|youtube\.|linkedin\.|favicon|\/icon|\/logo|social-network|ogimage|placeholder|pexels|stock-photo|emoji|avatar|banner-ad|\/ads\/|gold-\d|fonas-|plakatas|skaidre|139x68|_m\.jpg|images\.jpeg$|camera|portrait|selfie|headshot|people-|person-/i;

const CHURCH_URL_RE =
  /baznyc|bažny|church|chapel|katedr|cathedral|svent|šv\.|sakrament|pamald|altar|mišios|misa|nave|tower|steeple|crucifix|koplyt|šventov/i;

export function isDisplayableParishImage(url: string): boolean {
  const s = url.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  if (ALLOWED_CHURCH_UNSPLASH.some((id) => s.includes(id))) return true;
  if (JUNK_URL_RE.test(s)) return false;
  if (/unsplash/i.test(s)) return false;
  if (STOCK_IMAGE_IDS.some((id) => s.includes(id))) return false;
  try {
    const u = new URL(s);
    if (!u.pathname || u.pathname === "/" || u.pathname.length < 4) return false;
    if (/\.gif(\?|$)/i.test(u.pathname)) return false;
  } catch {
    return false;
  }
  return true;
}

function scoreParishImageUrl(url: string): number {
  if (!isDisplayableParishImage(url)) return -1000;
  const lower = url.toLowerCase();
  let score = 10;

  if (CHURCH_URL_RE.test(lower)) score += 35;
  if (/\.jpe?g(\?|$)/i.test(lower)) score += 12;
  if (/wp-content\/uploads\/\d{4}\//i.test(lower)) score += 22;
  if (/site\/files\/image/i.test(lower)) score += 8;

  const dim = lower.match(/(\d{2,3})x(\d{2,3})/);
  if (dim) {
    const w = Number.parseInt(dim[1]!, 10);
    const h = Number.parseInt(dim[2]!, 10);
    if (w < 320 || h < 200) score -= 25;
    if (w >= 600) score += 8;
  }

  if (/\.png(\?|$)/i.test(lower)) score -= 28;
  if (/multi\/opt\//i.test(lower) && /348w|199w/i.test(lower)) score -= 15;

  return score;
}

export function pickBestParishGalleryImage(galleryUrls: string[] | undefined): string | null {
  if (!galleryUrls?.length) return null;
  let best: { url: string; score: number } | null = null;
  for (const raw of galleryUrls) {
    const score = scoreParishImageUrl(raw);
    if (score < 12) continue;
    if (!best || score > best.score) best = { url: raw.trim(), score };
  }
  return best?.url ?? null;
}

export function parishCardImage(image: string, galleryUrls?: string[], diocese?: string): string {
  const fromGallery = pickBestParishGalleryImage(galleryUrls);
  if (fromGallery) return fromGallery;
  if (image && isDisplayableParishImage(image) && !STOCK_IMAGE_IDS.some((id) => image.includes(id))) {
    return image;
  }
  if (diocese && DIOCESE_FALLBACK_IMAGE[diocese]) return DIOCESE_FALLBACK_IMAGE[diocese];
  return PARISH_FALLBACK_IMAGE;
}

/** Rūšiuota galerija — geriausios bažnyčių nuotraukos pirmos. */
export function parishGalleryUrls(galleryUrls: string[] | undefined): string[] {
  if (!galleryUrls?.length) return [];
  return galleryUrls
    .map((u) => u.trim())
    .filter(isDisplayableParishImage)
    .sort((a, b) => scoreParishImageUrl(b) - scoreParishImageUrl(a));
}
