import { randomUUID } from "node:crypto";
import type {
  CreateMassSlotRequestInput,
  MassSlotRequest,
  MassSlotRequestSource,
} from "../types/mass-slot-request.js";
import { getParish } from "./aeterna-store.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "mass-slot-requests";

function now() {
  return new Date().toISOString();
}

async function loadAll(): Promise<MassSlotRequest[]> {
  return loadJsonStore<MassSlotRequest[]>(STORE_KEY, []);
}

async function saveAll(rows: MassSlotRequest[]): Promise<void> {
  await saveJsonStore(STORE_KEY, rows);
}

const SOURCES: MassSlotRequestSource[] = ["home", "parish_hub", "memorial"];

export async function createMassSlotRequest(
  input: CreateMassSlotRequestInput
): Promise<MassSlotRequest> {
  const parishId = input.parishId?.trim();
  if (!parishId || !getParish(parishId)) {
    throw new Error("Parapija nerasta");
  }

  const requesterName = input.requesterName?.trim() || "Tikintysis";
  const message =
    input.message?.trim() ||
    "Prašome atidaryti laisvus Šv. Mišių laikus užsakymams nuotoliu.";
  const source = SOURCES.includes(input.source as MassSlotRequestSource)
    ? (input.source as MassSlotRequestSource)
    : "home";

  const rows = await loadAll();
  const recent = rows.find(
    (r) =>
      r.parishId === parishId &&
      r.status === "pending" &&
      r.requesterName === requesterName &&
      Date.now() - new Date(r.createdAt).getTime() < 15 * 60_000
  );
  if (recent) {
    throw new Error("Prašymas jau išsiųstas. Kunigas netrukus turėtų reaguoti.");
  }

  const row: MassSlotRequest = {
    id: randomUUID(),
    parishId,
    requesterName,
    message,
    source,
    status: "pending",
    createdAt: now(),
    acknowledgedAt: null,
  };

  rows.push(row);
  await saveAll(rows);
  return row;
}

export async function listPendingMassSlotRequests(parishId: string): Promise<MassSlotRequest[]> {
  const rows = await loadAll();
  return rows
    .filter((r) => r.parishId === parishId && r.status === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function unreadMassSlotRequestCount(parishId: string): Promise<number> {
  const rows = await loadAll();
  return rows.filter((r) => r.parishId === parishId && r.status === "pending").length;
}

export async function acknowledgeMassSlotRequest(
  id: string,
  parishId: string
): Promise<MassSlotRequest | null> {
  const rows = await loadAll();
  const idx = rows.findIndex((r) => r.id === id && r.parishId === parishId);
  if (idx < 0) return null;
  rows[idx] = {
    ...rows[idx],
    status: "acknowledged",
    acknowledgedAt: now(),
  };
  await saveAll(rows);
  return rows[idx];
}
