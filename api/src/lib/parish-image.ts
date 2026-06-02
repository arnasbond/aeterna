/** Patikimi numatytieji vaizdai (seni Unsplash ID nebeveikia — 404). */
export const PARISH_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80";

export const DIOCESE_FALLBACK_IMAGE: Record<string, string> = {
  "Kauno arkivyskupija":
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
  "Kaišiadorių vyskupija":
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80",
  "Panevėžio vyskupija":
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80",
  "Šiaulių vyskupija":
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80",
  "Telšių vyskupija":
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80",
  "Vilkaviškio vyskupija":
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
  "Vilniaus arkivyskupija":
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80",
};

const BROKEN_IMAGE_IDS = [
  "photo-1551884830-bf36c308ed29",
  "photo-1548013146-7249fcee8f75",
];

export function isDisplayableParishImageUrl(url: string): boolean {
  const s = url.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  if (/facebook\.|instagram\.|twitter\.|youtube\.|linkedin\.|favicon|icon|logo|\.gif(\?|$)/i.test(s))
    return false;
  if (BROKEN_IMAGE_IDS.some((id) => s.includes(id))) return false;
  try {
    const u = new URL(s);
    if (!u.pathname || u.pathname === "/" || u.pathname.length < 4) return false;
  } catch {
    return false;
  }
  return true;
}

export function fallbackImageForDiocese(diocese: string): string {
  return DIOCESE_FALLBACK_IMAGE[diocese] ?? PARISH_FALLBACK_IMAGE;
}

/** Pirmoji tinkama galerijos nuotrauka arba pataisytas numatytasis vaizdas. */
export function resolveParishImageUrl(
  storedImage: string,
  galleryUrls: string[] | undefined,
  diocese?: string
): string {
  const fromGallery = galleryUrls?.find(isDisplayableParishImageUrl);
  if (fromGallery) return fromGallery;
  if (storedImage && isDisplayableParishImageUrl(storedImage)) return storedImage;
  return diocese ? fallbackImageForDiocese(diocese) : PARISH_FALLBACK_IMAGE;
}
