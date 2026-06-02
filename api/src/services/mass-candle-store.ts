import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { config } from "../config.js";
import type {
  LightCandleInput,
  MassBookingInput,
  MassSchedule,
  PriestDashboard,
  VirtualCandle,
} from "../types/aeterna.js";
import {
  findMemorialByPerson,
  getMemorialBySlug,
  getParish,
  recordDonation,
} from "./aeterna-store.js";
import { isTestLoginPassword, verifyPriestTemporaryPassword } from "./priest-access-store.js";

const MASSES_FILE = join(config.dataDir, "aeterna-masses.json");
const CANDLES_FILE = join(config.dataDir, "aeterna-candles.json");

const priestTokens = new Map<string, string>();

let massesCache: MassSchedule[] | null = null;
let candlesCache: VirtualCandle[] | null = null;

function seedMasses(): MassSchedule[] {
  const parishId = "parish-vilnius-cathedral";
  const base = new Date();
  base.setDate(base.getDate() + ((7 - base.getDay()) % 7) + 7);
  const d = base.toISOString().slice(0, 10);
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      parishId,
      dateTime: `${d}T10:00:00`,
      isAvailable: true,
      intentions: null,
      bookedBy: null,
      status: "open",
      donationAmountCents: null,
      createdAt: now,
    },
    {
      id: randomUUID(),
      parishId,
      dateTime: `${d}T12:00:00`,
      isAvailable: true,
      intentions: null,
      bookedBy: null,
      status: "open",
      donationAmountCents: null,
      createdAt: now,
    },
    {
      id: randomUUID(),
      parishId,
      dateTime: `${d}T18:00:00`,
      isAvailable: false,
      intentions: "Už šeimos narius",
      bookedBy: "Demo užsakovas",
      status: "confirmed",
      donationAmountCents: 1500,
      createdAt: now,
    },
  ];
}

async function loadMasses(): Promise<MassSchedule[]> {
  if (massesCache) return massesCache;
  await mkdir(config.dataDir, { recursive: true });
  try {
    massesCache = JSON.parse(await readFile(MASSES_FILE, "utf8")) as MassSchedule[];
  } catch {
    massesCache = seedMasses();
    await saveMasses();
  }
  return massesCache;
}

async function saveMasses(): Promise<void> {
  await writeFile(MASSES_FILE, JSON.stringify(massesCache ?? [], null, 2));
}

async function loadCandles(): Promise<VirtualCandle[]> {
  if (candlesCache) return candlesCache;
  await mkdir(config.dataDir, { recursive: true });
  try {
    candlesCache = JSON.parse(await readFile(CANDLES_FILE, "utf8")) as VirtualCandle[];
  } catch {
    candlesCache = [];
    await saveCandles();
  }
  return candlesCache;
}

async function saveCandles(): Promise<void> {
  await writeFile(CANDLES_FILE, JSON.stringify(candlesCache ?? [], null, 2));
}

export async function priestLogin(
  parishId: string,
  password: string
): Promise<{ token: string; parishId: string } | null> {
  if (!getParish(parishId)) return null;
  const ok =
    !config.requirePasswords ||
    isTestLoginPassword(password) ||
    (await verifyPriestTemporaryPassword(parishId, password));
  if (!ok) return null;
  const token = createHash("sha256").update(`${parishId}:${Date.now()}:${randomUUID()}`).digest("hex");
  priestTokens.set(token, parishId);
  return { token, parishId };
}

export function getPriestParishId(token: string | undefined): string | null {
  if (!token) return null;
  return priestTokens.get(token) ?? null;
}

export async function getAvailableMasses(parishId: string): Promise<MassSchedule[]> {
  const masses = await loadMasses();
  return masses.filter((m) => m.parishId === parishId && m.isAvailable && m.status === "open");
}

export async function bookMass(input: MassBookingInput): Promise<MassSchedule> {
  const masses = await loadMasses();
  const slot = masses.find((m) => m.id === input.massId);
  if (!slot || !slot.isAvailable || slot.status !== "open") {
    throw new Error("Pasirinktas laikas nebeprieinamas");
  }
  const amount = input.amountCents ?? 1500;
  slot.isAvailable = false;
  slot.status = "pending";
  slot.intentions = input.intentions.trim();
  slot.bookedBy = input.donorName.trim();
  slot.donationAmountCents = amount;
  massesCache = masses;
  await saveMasses();
  await recordDonation(slot.parishId, amount, "mass", slot.id, slot.id);
  return slot;
}

export async function listMassesForPriest(parishId: string): Promise<MassSchedule[]> {
  const masses = await loadMasses();
  return masses
    .filter((m) => m.parishId === parishId)
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
}

export async function createMassSlot(
  parishId: string,
  dateTime: string
): Promise<MassSchedule> {
  const slot: MassSchedule = {
    id: randomUUID(),
    parishId,
    dateTime,
    isAvailable: true,
    intentions: null,
    bookedBy: null,
    status: "open",
    donationAmountCents: null,
    createdAt: new Date().toISOString(),
  };
  const masses = await loadMasses();
  masses.push(slot);
  massesCache = masses;
  await saveMasses();
  return slot;
}

export async function confirmMassBooking(massId: string, parishId: string): Promise<MassSchedule> {
  const masses = await loadMasses();
  const slot = masses.find((m) => m.id === massId && m.parishId === parishId);
  if (!slot) throw new Error("Mišios nerastos");
  slot.status = "confirmed";
  massesCache = masses;
  await saveMasses();
  return slot;
}

export async function lightCandle(input: LightCandleInput): Promise<VirtualCandle> {
  const memorial = await getMemorialBySlug(input.memorialSlug);
  if (!memorial) throw new Error("Profilis nerastas");

  const candle: VirtualCandle = {
    id: randomUUID(),
    memorialId: memorial.id,
    memorialSlug: memorial.slug,
    parishId: memorial.parishId,
    donorName: input.donorName.trim() || "Anonimas",
    litAt: new Date().toISOString(),
    donationAmountCents: input.amountCents,
  };
  const candles = await loadCandles();
  candles.push(candle);
  candlesCache = candles;
  await saveCandles();
  await recordDonation(memorial.parishId, input.amountCents, "candle", candle.id, memorial.id);
  return candle;
}

export async function listCandlesForMemorial(slug: string): Promise<VirtualCandle[]> {
  const candles = await loadCandles();
  return candles
    .filter((c) => c.memorialSlug === slug)
    .sort((a, b) => b.litAt.localeCompare(a.litAt));
}

export async function findMemorialSlug(
  fullName: string,
  birthDate: string,
  deathDate: string
): Promise<string | null> {
  const row = await findMemorialByPerson(fullName, birthDate, deathDate);
  return row?.slug ?? null;
}

export async function getPriestDashboard(parishId: string): Promise<PriestDashboard> {
  const parish = getParish(parishId);
  if (!parish) throw new Error("Parapija nerasta");

  const masses = await listMassesForPriest(parishId);
  const candles = (await loadCandles()).filter((c) => c.parishId === parishId);
  const donations = await import("./aeterna-store.js").then((m) => m.getDonationsForParish(parishId));

  const candlesTotalCents = candles.reduce((s, c) => s + c.donationAmountCents, 0);
  const massesTotalCents = masses
    .filter((m) => m.donationAmountCents)
    .reduce((s, m) => s + (m.donationAmountCents ?? 0), 0);
  const memorialsTotalCents = donations
    .filter((d) => d.kind === "memorial")
    .reduce((s, d) => s + d.parishAmountCents, 0);

  return {
    parish,
    finances: {
      candlesTotalCents,
      massesTotalCents,
      memorialsTotalCents,
      totalCents: candlesTotalCents + massesTotalCents + memorialsTotalCents,
    },
    pendingMasses: masses.filter((m) => m.status === "pending").length,
    upcomingSlots: masses.filter((m) => m.isAvailable && m.status === "open").length,
  };
}

