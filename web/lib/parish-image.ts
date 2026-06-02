/** Bendra logika su API — parapijų miniatiūros ir galerija. */
export const PARISH_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80";

const BROKEN_IMAGE_IDS = [
  "photo-1551884830-bf36c308ed29",
  "photo-1548013146-7249fcee8f75",
];

export function isDisplayableParishImage(url: string): boolean {
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

export function parishCardImage(image: string, galleryUrls?: string[]): string {
  const fromGallery = galleryUrls?.find(isDisplayableParishImage);
  if (fromGallery) return fromGallery;
  if (image && isDisplayableParishImage(image)) return image;
  return PARISH_FALLBACK_IMAGE;
}
