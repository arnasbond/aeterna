import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { kvMediaEnabled, saveMediaToKv } from "./media-kv-store.js";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

function resolveContentType(contentType: string, filename: string): string {
  const type = contentType.split(";")[0]?.trim().toLowerCase();
  if (type && type !== "application/octet-stream" && ALLOWED.has(type)) return type;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] ?? type ?? "application/octet-stream";
}

const STORAGE_HELP =
  "Vercel API projekte įjunkite Blob: Storage → Create Blob → Connect (BLOB_READ_WRITE_TOKEN). Žr. VERCEL-BLOB-SETUP.txt";

export async function uploadMemorialMedia(
  base64: string,
  filename: string,
  contentType: string,
  publicApiBase?: string
): Promise<string> {
  const type = resolveContentType(contentType, filename);
  if (!ALLOWED.has(type)) {
    throw new Error("Nepalaikomas failo formatas. Naudokite JPG, PNG, WEBP, HEIC arba MP4.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) throw new Error("Tuščias failas");
  if (buffer.length > MAX_BYTES) {
    throw new Error("Failas per didelis (maks. 12 MB). Bandykite mažesnę nuotrauką.");
  }

  if (config.blobReadWriteToken) {
    const { put } = await import("@vercel/blob");
    const ext = filename.includes(".") ? filename.split(".").pop()!.toLowerCase() : "bin";
    const pathname = `memorial-media/${randomUUID()}.${ext}`;
    const blob = await put(pathname, buffer, {
      access: "public",
      token: config.blobReadWriteToken,
      contentType: type,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (kvMediaEnabled() && publicApiBase) {
    return saveMediaToKv(buffer, type, publicApiBase);
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    throw new Error(`Failų saugykla nesukonfigūruota. ${STORAGE_HELP}`);
  }

  return `data:${type};base64,${base64}`;
}
