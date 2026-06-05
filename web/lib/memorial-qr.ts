import { getSiteOrigin } from "@/lib/site";

/** Viešas atminties puslapio URL (QR turinys). */
export function memorialProfileUrl(slug: string, stored?: string | null): string {
  const s = stored?.trim();
  if (s?.startsWith("http")) return s;
  return `${getSiteOrigin()}/m/${slug}`;
}

/** QR paveikslėlis (api.qrserver.com arba išsaugotas memorial.qrCodeUrl). */
export function memorialQrImageUrl(slug: string, size = 300, stored?: string | null): string {
  const s = stored?.trim();
  if (s?.includes("create-qr-code")) {
    try {
      const u = new URL(s);
      u.searchParams.set("size", `${size}x${size}`);
      return u.toString();
    } catch {
      /* fall through */
    }
  }
  const data = memorialProfileUrl(slug, s && !s.includes("create-qr-code") ? s : null);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function downloadQrPng(imageUrl: string, filename: string): Promise<void> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Nepavyko atsisiųsti QR");
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}
