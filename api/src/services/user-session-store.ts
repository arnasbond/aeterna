import { createHash, randomBytes, randomUUID } from "node:crypto";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "user-sessions";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type UserSession = {
  token: string;
  userId: string;
  expiresAt: string;
};

const memory = new Map<string, string>();

async function loadSessions(): Promise<UserSession[]> {
  const rows = await loadJsonStore<UserSession[]>(STORE_KEY, []);
  const now = Date.now();
  return rows.filter((s) => new Date(s.expiresAt).getTime() > now);
}

async function persistSessions(sessions: UserSession[]): Promise<void> {
  await saveJsonStore(STORE_KEY, sessions);
}

function syncMemory(sessions: UserSession[]) {
  memory.clear();
  for (const s of sessions) memory.set(s.token, s.userId);
}

export async function createUserSession(userId: string): Promise<string> {
  const token = createHash("sha256")
    .update(`user:${userId}:${Date.now()}:${randomUUID()}:${randomBytes(8)}`)
    .digest("hex");
  const row: UserSession = {
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  const sessions = await loadSessions();
  sessions.push(row);
  await persistSessions(sessions);
  memory.set(token, userId);
  return token;
}

export function getUserIdFromTokenSync(token: string | undefined): string | null {
  if (!token) return null;
  return memory.get(token) ?? null;
}

export async function resolveUserIdFromToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const cached = memory.get(token);
  if (cached) return cached;
  const sessions = await loadSessions();
  syncMemory(sessions);
  return memory.get(token) ?? null;
}
