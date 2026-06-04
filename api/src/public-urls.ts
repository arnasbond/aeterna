export const DEFAULT_WEB = "https://aeterna-web-six.vercel.app";
export const DEFAULT_API = "https://api-three-chi-63.vercel.app";

function looksLikeApiHost(url: string): boolean {
  const h = url.toLowerCase();
  return (
    h.includes("api-three") ||
    (h.includes("api-") && h.includes("vercel.app")) ||
    h.includes("aeterna-api") ||
    (h.includes(":4000") && !h.includes(":3000"))
  );
}

/** Viešoji svetainė (Next.js) — ne API hostas. */
export function publicWebUrl(): string {
  const u =
    process.env.PUBLIC_WEB_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    DEFAULT_WEB;
  const clean = u.replace(/\/$/, "");
  if (looksLikeApiHost(clean)) return DEFAULT_WEB;
  return clean;
}

export function publicApiUrl(reqHost?: string, reqProto?: string): string {
  const env =
    process.env.PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (reqHost && reqProto && reqHost.includes("api-")) {
    return `${reqProto}://${reqHost}`.replace(/\/$/, "");
  }
  return DEFAULT_API;
}
