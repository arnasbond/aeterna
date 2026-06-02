import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../config.js";

export type JsonStoreBackend = "kv" | "blob" | "filesystem";

const memory = new Map<string, unknown>();

function storePath(key: string) {
  return join(config.dataDir, `${key}.json`);
}

function blobPathname(key: string) {
  return `aeterna-stores/${key}.json`;
}

function kvKey(key: string) {
  return `aeterna:${key}`;
}

export function jsonStoreBackend(): JsonStoreBackend {
  if (config.kvRestUrl && config.kvRestToken) return "kv";
  if (config.blobReadWriteToken) return "blob";
  return "filesystem";
}

async function loadFromFilesystem<T>(key: string, fallback: T): Promise<T> {
  await mkdir(config.dataDir, { recursive: true });
  try {
    return JSON.parse(await readFile(storePath(key), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function saveToFilesystem<T>(key: string, value: T): Promise<void> {
  await mkdir(config.dataDir, { recursive: true });
  await writeFile(storePath(key), JSON.stringify(value, null, 2));
}

async function loadFromKv<T>(key: string, fallback: T): Promise<T> {
  const base = config.kvRestUrl!;
  const token = config.kvRestToken!;
  const res = await fetch(`${base}/get/${encodeURIComponent(kvKey(key))}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`KV get failed (${res.status})`);
  }
  const payload = (await res.json()) as { result: string | null };
  if (payload.result == null) return fallback;
  if (typeof payload.result === "string") {
    return JSON.parse(payload.result) as T;
  }
  return payload.result as T;
}

async function saveToKv<T>(key: string, value: T): Promise<void> {
  const base = config.kvRestUrl!;
  const token = config.kvRestToken!;
  const res = await fetch(`${base}/set/${encodeURIComponent(kvKey(key))}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value),
  });
  if (!res.ok) {
    throw new Error(`KV set failed (${res.status})`);
  }
}

async function loadFromBlob<T>(key: string, fallback: T): Promise<T> {
  const { get } = await import("@vercel/blob");
  const pathname = blobPathname(key);
  try {
    const result = await get(pathname, {
      access: "private",
      token: config.blobReadWriteToken,
    });
    if (!result?.stream) {
      return fallback;
    }
    const text = await new Response(result.stream).text();
    if (!text.trim()) return fallback;
    return JSON.parse(text) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/not found|404/i.test(message)) return fallback;
    throw err;
  }
}

async function saveToBlob<T>(key: string, value: T): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(blobPathname(key), JSON.stringify(value, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: config.blobReadWriteToken,
    contentType: "application/json",
  });
}

async function loadRaw<T>(key: string, fallback: T): Promise<T> {
  switch (jsonStoreBackend()) {
    case "kv":
      return loadFromKv(key, fallback);
    case "blob":
      return loadFromBlob(key, fallback);
    default:
      return loadFromFilesystem(key, fallback);
  }
}

async function saveRaw<T>(key: string, value: T): Promise<void> {
  switch (jsonStoreBackend()) {
    case "kv":
      await saveToKv(key, value);
      break;
    case "blob":
      await saveToBlob(key, value);
      break;
    default:
      await saveToFilesystem(key, value);
  }
}

/** Load JSON; migrates from local filesystem to cloud when cloud is empty. */
export async function loadJsonStore<T>(key: string, fallback: T): Promise<T> {
  const cached = memory.get(key);
  if (cached !== undefined) return cached as T;

  const backend = jsonStoreBackend();
  let value = await loadRaw(key, fallback);

  const shouldMigrate =
    backend !== "filesystem" && JSON.stringify(value) === JSON.stringify(fallback);
  if (shouldMigrate) {
    const local = await loadFromFilesystem(key, fallback);
    if (JSON.stringify(local) !== JSON.stringify(fallback)) {
      value = local;
      await saveRaw(key, value);
    }
  }

  memory.set(key, value);
  return value;
}

export async function saveJsonStore<T>(key: string, value: T): Promise<void> {
  memory.set(key, value);
  await saveRaw(key, value);
}

export function clearJsonStoreCache(key?: string) {
  if (key) memory.delete(key);
  else memory.clear();
}
