import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import type {
  CreateSupportThreadInput,
  SupportAuthorRole,
  SupportCategory,
  SupportMessage,
  SupportStatus,
  SupportThread,
  UpdateSupportThreadInput,
} from "../types/support-message.js";
import { getParish } from "./aeterna-store.js";

const STORE_FILE = join(config.dataDir, "support-messages.json");

type StoreData = {
  threads: SupportThread[];
  messages: SupportMessage[];
};

let cache: StoreData | null = null;

async function load(): Promise<StoreData> {
  if (cache) return cache;
  await mkdir(config.dataDir, { recursive: true });
  try {
    cache = JSON.parse(await readFile(STORE_FILE, "utf8")) as StoreData;
  } catch {
    cache = { threads: [], messages: [] };
    await save();
  }
  return cache;
}

async function save(): Promise<void> {
  await writeFile(STORE_FILE, JSON.stringify(cache ?? { threads: [], messages: [] }, null, 2));
}

function now() {
  return new Date().toISOString();
}

type StoredMessage = SupportMessage & { readByPriest?: boolean; readByAdmin?: boolean };

function threadWithCounts(thread: SupportThread, messages: StoredMessage[]): SupportThread {
  const inThread = messages.filter((m) => m.threadId === thread.id);
  const priestUnread = inThread.filter((m) => m.authorRole === "admin" && !m.readByPriest).length;
  const adminUnread = inThread.filter((m) => m.authorRole === "priest" && !m.readByAdmin).length;
  return { ...thread, priestUnread, adminUnread };
}

function recountThread(threadId: string, data: StoreData) {
  const idx = data.threads.findIndex((t) => t.id === threadId);
  if (idx < 0) return;
  data.threads[idx] = threadWithCounts(data.threads[idx], data.messages);
}

async function getData(): Promise<{ threads: SupportThread[]; messages: StoredMessage[] }> {
  const raw = await load();
  return raw as { threads: SupportThread[]; messages: StoredMessage[] };
}

export async function listThreadsForParish(parishId: string): Promise<SupportThread[]> {
  const data = await getData();
  return data.threads
    .filter((t) => t.parishId === parishId)
    .map((t) => threadWithCounts(t, data.messages))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listAllThreads(): Promise<SupportThread[]> {
  const data = await getData();
  return data.threads
    .map((t) => threadWithCounts(t, data.messages))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getThread(
  threadId: string,
  parishId?: string
): Promise<{ thread: SupportThread; messages: SupportMessage[] } | null> {
  const data = await getData();
  const thread = data.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  if (parishId && thread.parishId !== parishId) return null;

  const messages = data.messages
    .filter((m) => m.threadId === threadId)
    .map(({ readByPriest: _p, readByAdmin: _a, ...m }) => m)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return { thread: threadWithCounts(thread, data.messages), messages };
}

export async function createThreadForParish(
  parishId: string,
  authorRole: SupportAuthorRole,
  authorLabel: string,
  input: CreateSupportThreadInput
): Promise<{ thread: SupportThread; messages: SupportMessage[] }> {
  const parish = getParish(parishId);
  if (!parish) throw new Error("Parapija nerasta");

  const subject = input.subject?.trim();
  const body = input.body?.trim();
  if (!subject || subject.length < 3) throw new Error("Įrašykite temą (bent 3 simboliai)");
  if (!body || body.length < 5) throw new Error("Įrašykite žinutę (bent 5 simboliai)");

  const validCategories: SupportCategory[] = ["problem", "fix", "request", "other"];
  const category = validCategories.includes(input.category) ? input.category : "other";

  const data = await getData();
  const ts = now();
  const threadId = randomUUID();

  const thread: SupportThread = {
    id: threadId,
    parishId,
    parishTitle: parish.title,
    subject,
    category,
    status: "open",
    createdAt: ts,
    updatedAt: ts,
    priestUnread: 0,
    adminUnread: authorRole === "priest" ? 1 : 0,
  };

  const message: StoredMessage = {
    id: randomUUID(),
    threadId,
    authorRole,
    authorLabel: authorLabel.trim() || (authorRole === "admin" ? "AETERNA administratorius" : "Parapija"),
    body,
    createdAt: ts,
    readByPriest: authorRole === "priest",
    readByAdmin: authorRole === "admin",
  };

  data.threads.push(thread);
  data.messages.push(message);
  recountThread(threadId, data);
  cache = data;
  await save();

  return getThread(threadId, parishId) as Promise<{ thread: SupportThread; messages: SupportMessage[] }>;
}

export async function postMessage(
  threadId: string,
  authorRole: SupportAuthorRole,
  authorLabel: string,
  bodyRaw: string,
  parishId?: string
): Promise<{ thread: SupportThread; messages: SupportMessage[] }> {
  const body = bodyRaw?.trim();
  if (!body || body.length < 1) throw new Error("Žinutė negali būti tuščia");

  const data = await getData();
  const thread = data.threads.find((t) => t.id === threadId);
  if (!thread) throw new Error("Pokalbis nerastas");
  if (parishId && thread.parishId !== parishId) throw new Error("Neturite prieigos");

  const ts = now();
  const message: StoredMessage = {
    id: randomUUID(),
    threadId,
    authorRole,
    authorLabel: authorLabel.trim() || (authorRole === "admin" ? "AETERNA administratorius" : "Parapija"),
    body,
    createdAt: ts,
    readByPriest: authorRole === "priest",
    readByAdmin: authorRole === "admin",
  };

  data.messages.push(message);
  thread.updatedAt = ts;
  if (thread.status === "resolved") thread.status = "in_progress";
  recountThread(threadId, data);
  cache = data;
  await save();

  return getThread(threadId, parishId) as Promise<{ thread: SupportThread; messages: SupportMessage[] }>;
}

export async function updateThreadStatus(
  threadId: string,
  input: UpdateSupportThreadInput,
  parishId?: string
): Promise<SupportThread | null> {
  const data = await getData();
  const thread = data.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  if (parishId && thread.parishId !== parishId) return null;

  const valid: SupportStatus[] = ["open", "in_progress", "resolved"];
  if (input.status && valid.includes(input.status)) {
    thread.status = input.status;
    thread.updatedAt = now();
  }

  recountThread(threadId, data);
  cache = data;
  await save();
  return threadWithCounts(thread, data.messages);
}

export async function markThreadRead(
  threadId: string,
  readerRole: SupportAuthorRole,
  parishId?: string
): Promise<void> {
  const data = await getData();
  const thread = data.threads.find((t) => t.id === threadId);
  if (!thread) return;
  if (parishId && thread.parishId !== parishId) return;

  for (const m of data.messages) {
    if (m.threadId !== threadId) continue;
    if (readerRole === "priest" && m.authorRole === "admin") m.readByPriest = true;
    if (readerRole === "admin" && m.authorRole === "priest") m.readByAdmin = true;
  }

  recountThread(threadId, data);
  cache = data;
  await save();
}

export async function unreadCountForParish(parishId: string): Promise<number> {
  const threads = await listThreadsForParish(parishId);
  return threads.reduce((n, t) => n + t.priestUnread, 0);
}

export async function unreadCountForAdmin(): Promise<number> {
  const threads = await listAllThreads();
  return threads.reduce((n, t) => n + t.adminUnread, 0);
}
