import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { DEMO_PARISH_ID } from "../data/lt-parishes.js";
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
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";
import {
  createPriestSession,
  getPriestParishIdFromSession,
  getPriestParishIdSync,
} from "./priest-session-store.js";
import { CANDLE_SERVICE_FEE_CENTS, processCandlePayment } from "./stripe-connect-mock.js";

const MASSES_KEY = "aeterna-masses";
const CANDLES_KEY = "aeterna-candles";

let massesCache: MassSchedule[] | null = null;
let candlesCache: VirtualCandle[] | null = null;

function seedMasses(): MassSchedule[] {
  const parishId = DEMO_PARISH_ID;
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
  const stored = await loadJsonStore<MassSchedule[]>(MASSES_KEY, []);
  if (stored.length === 0) {
    massesCache = seedMasses();
    await saveMasses();
  } else {
    massesCache = stored;
  }
  return massesCache;
}

async function saveMasses(): Promise<void> {
  await saveJsonStore(MASSES_KEY, massesCache ?? []);
}

async function loadCandles(): Promise<VirtualCandle[]> {
  if (candlesCache) return candlesCache;
  candlesCache = await loadJsonStore<VirtualCandle[]>(CANDLES_KEY, []);
  return candlesCache;
}

async function saveCandles(): Promise<void> {
  await saveJsonStore(CANDLES_KEY, candlesCache ?? []);
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
  return createPriestSession(parishId);
}

export function getPriestParishId(token: string | undefined): string | null {
  return getPriestParishIdSync(token);
}

export async function resolvePriestParishId(token: string | undefined): Promise<string | null> {
  const sync = getPriestParishIdSync(token);
  if (sync) return sync;
  return getPriestParishIdFromSession(token);
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
  if (amount < 500) {
    throw new Error("Minimali auka — 5 €");
  }
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

export type LightCandleResult = VirtualCandle & {
  payment: ReturnType<typeof processCandlePayment>;
  serviceFeeCents: number;
  totalChargedCents: number;
};

export async function lightCandle(input: LightCandleInput): Promise<LightCandleResult> {
  const memorial = await getMemorialBySlug(input.memorialSlug);
  if (!memorial) throw new Error("Profilis nerastas");

  const donationCents = Math.max(100, Math.round(input.amountCents));
  const payment = processCandlePayment({
    parishId: memorial.parishId,
    donationCents,
  });

  const candle: VirtualCandle = {
    id: randomUUID(),
    memorialId: memorial.id,
    memorialSlug: memorial.slug,
    parishId: memorial.parishId,
    donorName: input.donorName.trim() || "Anonimas",
    litAt: new Date().toISOString(),
    donationAmountCents: donationCents,
  };
  const candles = await loadCandles();
  candles.push(candle);
  candlesCache = candles;
  await saveCandles();
  await recordDonation(memorial.parishId, donationCents, "candle", candle.id, memorial.id);
  await recordDonation(
    memorial.parishId,
    CANDLE_SERVICE_FEE_CENTS,
    "candle",
    `${candle.id}-fee`,
    memorial.id
  );
  return {
    ...candle,
    payment,
    serviceFeeCents: payment.serviceFeeCents,
    totalChargedCents: payment.totalChargedCents,
  };
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

