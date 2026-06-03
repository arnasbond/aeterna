import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getParish } from "./aeterna-store.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "priest-sessions";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type PriestSession = {
  token: string;
  parishId: string;
  expiresAt: string;
};

const memory = new Map<string, string>();

async function loadSessions(): Promise<PriestSession[]> {
  const rows = await loadJsonStore<PriestSession[]>(STORE_KEY, []);
  const now = Date.now();
  return rows.filter((s) => new Date(s.expiresAt).getTime() > now);
}

async function persistSessions(sessions: PriestSession[]): Promise<void> {
  await saveJsonStore(STORE_KEY, sessions);
}

function syncMemory(sessions: PriestSession[]) {
  memory.clear();
  for (const s of sessions) memory.set(s.token, s.parishId);
}

export async function createPriestSession(
  parishId: string
): Promise<{ token: string; parishId: string } | null> {
  if (!getParish(parishId)) return null;
  const token = createHash("sha256")
    .update(`priest:${parishId}:${Date.now()}:${randomUUID()}:${randomBytes(8)}`)
    .digest("hex");
  const row: PriestSession = {
    token,
    parishId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  const sessions = await loadSessions();
  sessions.push(row);
  await persistSessions(sessions);
  memory.set(token, parishId);
  return { token, parishId };
}

export async function getPriestParishIdFromSession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const cached = memory.get(token);
  if (cached) return cached;

  const sessions = await loadSessions();
  syncMemory(sessions);
  return memory.get(token) ?? null;
}

/** @deprecated use getPriestParishIdFromSession — kept for sync callers during migration */
export function getPriestParishIdSync(token: string | undefined): string | null {
  if (!token) return null;
  return memory.get(token) ?? null;
}
