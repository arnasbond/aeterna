import { resolveApiBase } from "@/lib/api";

/** Viešas svetainės adresas (dalinimui, meta). */
export function getSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "https://aeterna-web-six.vercel.app";
}

/** Tiesioginė AETERNA Android APK nuoroda (visada API hostas — ne per Next proxy). */
export function getApkDownloadUrl(): string {
  const direct = process.env.NEXT_PUBLIC_APK_URL?.trim();
  if (direct) return direct.replace(/\/$/, "");

  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) return `${api.replace(/\/$/, "")}/api/v1/app/android/download`;

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isWebHost =
      hostname.includes("aeterna-web") ||
      (hostname.endsWith(".vercel.app") && !hostname.startsWith("api-"));
    if (isWebHost) {
      return "https://api-three-chi-63.vercel.app/api/v1/app/android/download";
    }
    return `${resolveApiBase()}/api/v1/app/android/download`;
  }

  return `${getSiteOrigin()}/releases/aeterna.apk`;
}

export function getAppDownloadPageUrl(): string {
  return `${getSiteOrigin()}/atsisiusti`;
}
