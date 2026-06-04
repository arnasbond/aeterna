import { DEFAULT_API } from "./production-api-default";

/** Kur Next serveris (ir runtime proxy) peradresuoja /api/v1. */
export function getApiProxyTarget(): string {
  const internal = process.env.API_INTERNAL_URL?.trim();
  if (internal?.startsWith("http")) return internal.replace(/\/$/, "");

  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub?.startsWith("http")) return pub.replace(/\/$/, "");

  if (process.env.VERCEL === "1") return DEFAULT_API;

  return "http://127.0.0.1:4000";
}
