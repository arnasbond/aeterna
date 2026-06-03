import { createHash, randomBytes, randomUUID } from "node:crypto";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "admin-sessions";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

type AdminSession = {
  token: string;
  expiresAt: string;
};

const memory = new Map<string, number>();

async function loadSessions(): Promise<AdminSession[]> {
  const rows = await loadJsonStore<AdminSession[]>(STORE_KEY, []);
  const now = Date.now();
  return rows.filter((s) => new Date(s.expiresAt).getTime() > now);
}

async function persistSessions(sessions: AdminSession[]): Promise<void> {
  await saveJsonStore(STORE_KEY, sessions);
}

function syncMemory(sessions: AdminSession[]) {
  memory.clear();
  for (const s of sessions) memory.set(s.token, new Date(s.expiresAt).getTime());
}

export async function createAdminSession(): Promise<string> {
  const token = createHash("sha256")
    .update(`admin:${Date.now()}:${randomUUID()}:${randomBytes(8)}`)
    .digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const sessions = await loadSessions();
  sessions.push({ token, expiresAt });
  await persistSessions(sessions);
  memory.set(token, new Date(expiresAt).getTime());
  return token;
}

export function getAdminFromTokenSync(token: string | undefined): boolean {
  if (!token) return false;
  const exp = memory.get(token);
  if (!exp || exp < Date.now()) {
    memory.delete(token);
    return false;
  }
  return true;
}

export async function resolveAdminFromToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  if (getAdminFromTokenSync(token)) return true;
  const sessions = await loadSessions();
  syncMemory(sessions);
  return getAdminFromTokenSync(token);
}
