import { randomUUID } from "node:crypto";
import type { CreateGuestbookInput, GuestbookEntry, GuestbookEntryStatus } from "../types/guestbook.js";
import { getMemorialBySlug } from "./aeterna-store.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "guestbook-entries";

let cache: GuestbookEntry[] | null = null;

async function loadEntries(): Promise<GuestbookEntry[]> {
  if (cache) return cache;
  cache = await loadJsonStore<GuestbookEntry[]>(STORE_KEY, []);
  return cache;
}

async function saveEntries(): Promise<void> {
  await saveJsonStore(STORE_KEY, cache ?? []);
}

export async function listApprovedGuestbook(slug: string): Promise<GuestbookEntry[]> {
  const entries = await loadEntries();
  return entries
    .filter((e) => e.memorialSlug === slug && e.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listGuestbookForOwner(slug: string, userId: string): Promise<GuestbookEntry[]> {
  const memorial = await getMemorialBySlug(slug);
  if (!memorial || memorial.userId !== userId) return [];
  const entries = await loadEntries();
  return entries
    .filter((e) => e.memorialSlug === slug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addGuestbookEntry(
  slug: string,
  input: CreateGuestbookInput
): Promise<GuestbookEntry> {
  const memorial = await getMemorialBySlug(slug);
  if (!memorial) throw new Error("Profilis nerastas");

  const message = input.message.trim();
  if (message.length < 3) throw new Error("Parašykite bent kelis žodžius");
  if (message.length > 2000) throw new Error("Žinutė per ilga (max 2000 simbolių)");

  const row: GuestbookEntry = {
    id: randomUUID(),
    memorialSlug: slug,
    authorName: input.authorName.trim() || "Anonimas",
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };
  const entries = await loadEntries();
  entries.push(row);
  cache = entries;
  await saveEntries();
  return row;
}

export async function setGuestbookEntryStatus(
  slug: string,
  entryId: string,
  userId: string,
  status: GuestbookEntryStatus
): Promise<GuestbookEntry | null> {
  const memorial = await getMemorialBySlug(slug);
  if (!memorial || memorial.userId !== userId) return null;

  const entries = await loadEntries();
  const row = entries.find((e) => e.id === entryId && e.memorialSlug === slug);
  if (!row) return null;
  row.status = status;
  row.reviewedAt = new Date().toISOString();
  cache = entries;
  await saveEntries();
  return row;
}

export async function pendingGuestbookCount(slug: string, userId: string): Promise<number> {
  const rows = await listGuestbookForOwner(slug, userId);
  return rows.filter((e) => e.status === "pending").length;
}
