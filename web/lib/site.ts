import { resolveApiBase } from "@/lib/api";

/** Viešas svetainės adresas (dalinimui, meta). */
export function getSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://aeterna-web-six.vercel.app";
}

/** Tiesioginė AETERNA Android APK nuoroda. */
export function getApkDownloadUrl(): string {
  const direct = process.env.NEXT_PUBLIC_APK_URL?.trim();
  if (direct) return direct.replace(/\/$/, "");

  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = api ? api.replace(/\/$/, "") : typeof window !== "undefined" ? resolveApiBase() : "https://api-three-chi-63.vercel.app";
  return `${base}/api/v1/app/android/download`;
}

export function getAppDownloadPageUrl(): string {
  return `${getSiteOrigin()}/atsisiusti`;
}
