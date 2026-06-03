import { randomUUID } from "node:crypto";
import { config } from "../config.js";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export async function uploadMemorialMedia(
  base64: string,
  filename: string,
  contentType: string
): Promise<string> {
  const type = contentType.split(";")[0]?.trim().toLowerCase() || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    throw new Error("Nepalaikomas failo formatas. Naudokite JPG, PNG, WEBP arba MP4.");
  }

  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) throw new Error("Tuščias failas");
  if (buffer.length > MAX_BYTES) throw new Error("Failas per didelis (maks. 8 MB)");

  if (!config.blobReadWriteToken) {
    return `data:${type};base64,${base64}`;
  }

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
