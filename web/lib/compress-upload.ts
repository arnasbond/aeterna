/** Paruošia failą įkėlimui — suspaudžia nuotraukas, konvertuoja HEIC, atpažįsta MIME. */

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "quicktime"]);
const MAX_IMAGE_BYTES = 2_800_000;
const MAX_VIDEO_BYTES = 8 * 1024 * 1024;

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

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|Mobile|AeternaApp/i.test(navigator.userAgent);
}

export function guessFileMime(file: File): string {
  const type = file.type?.split(";")[0]?.trim().toLowerCase();
  if (type && type !== "application/octet-stream") return type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MIME[ext] ?? "application/octet-stream";
}

function isImageFile(file: File): boolean {
  const mime = guessFileMime(file);
  if (mime.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXT.has(ext);
}

function isVideoFile(file: File): boolean {
  const mime = guessFileMime(file);
  if (mime.startsWith("video/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXT.has(ext);
}

function isHeic(file: File): boolean {
  const mime = guessFileMime(file);
  return mime === "image/heic" || mime === "image/heif" || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
}

async function heicToJpeg(file: File): Promise<File> {
  try {
    const mod = await import("heic2any");
    const heic2any = mod.default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const blob = Array.isArray(out) ? out[0]! : out;
    const name = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    throw new Error(
      "iPhone HEIC formatas nepalaikomas. Nustatymai → Kamera → Formatai → „Suderinamumas“ (JPG), arba pasirinkite JPG nuotrauką."
    );
  }
}

async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_IMAGE_BYTES && guessFileMime(file) === "image/jpeg") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxSide = 2048;
  let { width, height } = bitmap;
  if (width > maxSide || height > maxSide) {
    const scale = maxSide / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Nepavyko apdoroti nuotraukos");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.88;
  let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  }
  if (!blob) throw new Error("Nepavyko suspausti nuotraukos");

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export async function prepareUploadFile(file: File): Promise<File> {
  if (isVideoFile(file)) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Vaizdo įrašas per didelis (maks. 8 MB). Sutrumpinkite arba naudokite YouTube nuorodą.");
    }
    return file;
  }

  if (!isImageFile(file)) {
    throw new Error("Pasirinkite nuotrauką (JPG, PNG) arba vaizdo įrašą (MP4).");
  }

  let prepared = file;
  if (isHeic(prepared)) {
    try {
      prepared = await heicToJpeg(prepared);
    } catch (e) {
      if (isMobileDevice() && prepared.size <= MAX_IMAGE_BYTES) {
        return prepared;
      }
      throw e;
    }
  }
  try {
    return await compressImage(prepared);
  } catch (e) {
    if (isMobileDevice() && prepared.size <= MAX_IMAGE_BYTES) {
      return prepared;
    }
    throw e;
  }
}
