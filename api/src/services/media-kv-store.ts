import { randomUUID } from "node:crypto";
import { config } from "../config.js";

/** Upstash KV vieno rakto limitas — tik suspaustos nuotraukos. */
const MAX_KV_BYTES = 750_000;

type MediaRecord = {
  contentType: string;
  data: string;
};

export function kvMediaEnabled(): boolean {
  return !!(config.kvRestUrl && config.kvRestToken);
}

function kvKey(id: string) {
  return `aeterna:media:${id}`;
}

async function kvSet(key: string, value: MediaRecord): Promise<void> {
  const base = config.kvRestUrl!;
  const token = config.kvRestToken!;
  const res = await fetch(`${base}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV set failed (${res.status})`);
}

async function kvGet(key: string): Promise<MediaRecord | null> {
  const base = config.kvRestUrl!;
  const token = config.kvRestToken!;
  const res = await fetch(`${base}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV get failed (${res.status})`);
  const payload = (await res.json()) as { result: string | null };
  if (payload.result == null) return null;
  return typeof payload.result === "string"
    ? (JSON.parse(payload.result) as MediaRecord)
    : (payload.result as MediaRecord);
}

export async function saveMediaToKv(
  buffer: Buffer,
  contentType: string,
  publicBaseUrl: string
): Promise<string> {
  if (buffer.length > MAX_KV_BYTES) {
    throw new Error(
      "Nuotrauka per didelė KV saugyklai. Įjunkite Vercel Blob (BLOB_READ_WRITE_TOKEN) arba naudokite mažesnę JPG."
    );
  }
  const id = randomUUID();
  await kvSet(kvKey(id), {
    contentType,
    data: buffer.toString("base64"),
  });
  const base = publicBaseUrl.replace(/\/$/, "");
  return `${base}/api/v1/media/file/${id}`;
}

export async function loadMediaFromKv(id: string): Promise<MediaRecord | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return kvGet(kvKey(id));
}
