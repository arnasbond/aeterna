import type { ParishProfileInput, ParishProfileSection } from "../types/parish-profile.js";

function decodeHtml(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim();
}

function stripTags(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function metaContent(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${key}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtml(m[1]);
  }
  return "";
}

function uniqueStrings(items: string[], max = 5): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const s = raw.trim();
    if (!s || s.length < 4 || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function resolveUrl(src: string, pageUrl: string): string | null {
  try {
    if (src.startsWith("data:")) return null;
    if (src.startsWith("//")) return `https:${src}`;
    return new URL(src, pageUrl).href;
  } catch {
    return null;
  }
}

const SKIP_IMAGE =
  /icon|logo|favicon|sprite|avatar|badge|pixel|1x1|spacer|blank|emoji|svg|facebook\.|instagram\.|twitter\.|youtube\.|linkedin\.|tiktok\.|whatsapp\.|telegram\./i;

function isLikelyPhotoUrl(url: string): boolean {
  if (SKIP_IMAGE.test(url)) return false;
  if (/\.gif(\?|$)/i.test(url)) {
    try {
      const path = new URL(url).pathname.toLowerCase();
      if (!/photo|nuotr|gallery|img|pix\/[^/]*(bazn|kated|church)/.test(path)) return false;
    } catch {
      return false;
    }
  }
  if (/\.(jpe?g|png|webp|avif)(\?|$)/i.test(url)) return true;
  if (/\/(uploads?|media|images?|gallery|dms3rep|photo|wp-content|files|assets)/i.test(url)) return true;
  if (/cdn-website|cloudinary|imgix|unsplash/i.test(url)) return true;
  try {
    const u = new URL(url);
    if (!u.pathname || u.pathname === "/" || u.pathname.length < 4) return false;
    return u.pathname.length > 10;
  } catch {
    return false;
  }
}

function extractImages(html: string, pageUrl: string, max = 12): string[] {
  const found: string[] = [];
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+data-src=["']([^"']+)["']/gi,
    /background-image:\s*url\(["']?([^"')]+)["']?\)/gi,
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const abs = resolveUrl(m[1], pageUrl);
      if (!abs || !/^https?:\/\//i.test(abs)) continue;
      if (!isLikelyPhotoUrl(abs)) continue;
      found.push(abs);
    }
  }

  return uniqueStrings(found, max);
}

function extractH2Sections(html: string): ParishProfileSection[] {
  const sections: ParishProfileSection[] = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const title = stripTags(m[1]).slice(0, 120);
    const body = stripTags(m[2]).slice(0, 4000);
    if (title && body.length > 20) sections.push({ title, body });
    if (sections.length >= 12) break;
  }
  return sections;
}

function mapSectionToFields(
  title: string,
  body: string,
  fields: ParishProfileInput
): void {
  const t = title.toLowerCase();
  if (/mišios|misa|liturgij|pamald/.test(t) && !fields.massSchedule) {
    fields.massSchedule = body.slice(0, 3000);
  } else if (/sakrament|krikšt|santuok|konfirmac/.test(t) && !fields.sacraments) {
    fields.sacraments = body.slice(0, 3000);
  } else if (/klebon|kunig|pastor|rektor/.test(t) && !fields.priestName) {
    const name = body.split("\n")[0]?.slice(0, 120) || "";
    if (name.length < 80) fields.priestName = name;
    if (!fields.about) fields.about = body.slice(0, 4000);
  } else if (/kontakt|adres|rekvizit|ryšys/.test(t)) {
    if (!fields.address && /g\.|gatv|al\.|pl\.|miest|lt-/i.test(body)) {
      fields.address = body.split("\n").find((l) => /g\.|gatv|al\.|pl\.|lt-/i.test(l))?.slice(0, 300) || body.slice(0, 500);
    }
    if (!fields.officeHours && /valand|darbo|būstin/.test(t + body)) {
      fields.officeHours = body.slice(0, 1500);
    }
  } else if (/išpažint|saugom/.test(t) && !fields.confessionTimes) {
    fields.confessionTimes = body.slice(0, 1500);
  } else if (/naujien|skelb|aktual/.test(t) && !fields.announcements) {
    fields.announcements = body.slice(0, 3000);
  } else if (/apie|istorij|parapij/.test(t) && !fields.about) {
    fields.about = body.slice(0, 5000);
  }
}

export async function importProfileFromWebsite(url: string): Promise<ParishProfileInput> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  let html: string;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AETERNA-ParishImporter/1.0 (+https://aeterna.lt)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } finally {
    clearTimeout(timer);
  }

  const fields: ParishProfileInput = {
    extraSections: [],
    galleryUrls: [],
  };

  const desc =
    metaContent(html, "description") ||
    metaContent(html, "og:description") ||
    metaContent(html, "twitter:description");
  if (desc) fields.shortDescription = desc.slice(0, 500);

  const ogImage = metaContent(html, "og:image");
  const pageImages = extractImages(html, url, 12);
  const gallery = uniqueStrings(
    [...(ogImage && ogImage.startsWith("http") ? [ogImage] : []), ...pageImages],
    12
  );
  if (gallery.length > 0) fields.galleryUrls = gallery;

  const mailtos = [...html.matchAll(/mailto:([^\s"'<>]+)/gi)].map((m) => m[1]);
  const emails = uniqueStrings([
    ...mailtos,
    ...(html.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? []),
  ]);
  if (emails[0]) fields.email = emails[0];

  const tels = uniqueStrings([
    ...(html.match(/tel:([+\d\s()-]+)/gi) ?? []).map((t) => t.replace(/^tel:/i, "")),
    ...(html.match(/\+370[\d\s()-]{8,}/g) ?? []),
    ...(html.match(/8[\d\s()-]{7,}/g) ?? []),
  ]);
  if (tels[0]) fields.phone = tels[0];

  const sections = extractH2Sections(html);
  for (const s of sections) {
    mapSectionToFields(s.title, s.body, fields);
  }
  fields.extraSections = sections.filter(
    (s) =>
      s.body !== fields.massSchedule &&
      s.body !== fields.about &&
      s.body !== fields.announcements
  );

  if (!fields.about) {
    const mainMatch =
      html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
      html.match(/<div[^>]+class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const chunk = mainMatch?.[1] ?? html;
    const text = stripTags(chunk);
    const paras = text.split(/\n\n+/).filter((p) => p.length > 60);
    if (paras[0]) fields.about = paras.slice(0, 4).join("\n\n").slice(0, 6000);
    if (!fields.shortDescription && paras[0]) {
      fields.shortDescription = paras[0].slice(0, 400);
    }
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const pageTitle = stripTags(titleMatch[1]);
    if (pageTitle && !fields.priestName && /klebonas|kun\./i.test(pageTitle)) {
      const km = pageTitle.match(/klebonas\s+([^|–-]+)/i);
      if (km?.[1]) fields.priestName = km[1].trim().slice(0, 120);
    }
  }

  return fields;
}
