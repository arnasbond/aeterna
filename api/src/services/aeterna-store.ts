import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import {
  DEMO_AETERNA_MEMORIAL,
  DEMO_MEDIA_VERSION,
  DEMO_MEMORIAL_SLUG,
} from "../data/demo-aeterna.js";
import { LT_PARISHES } from "../data/lt-parishes.js";
import type {
  AeternaMemorial,
  AeternaMemorialPublic,
  CreateMemorialInput,
  Parish,
  ParishSummary,
} from "../types/aeterna.js";

const MEMORIALS_FILE = join(config.dataDir, "aeterna-memorials.json");
const ORDERS_FILE = join(config.dataDir, "aeterna-orders.json");

const PARISH_COMMISSION_BPS = Number(process.env.AETERNA_PARISH_COMMISSION_BPS || 2000);

export type DonationKind = "memorial" | "candle" | "mass";

export type DonationRow = {
  id: string;
  kind: DonationKind;
  memorialId: string | null;
  referenceId: string | null;
  parishId: string;
  totalAmountCents: number;
  parishAmountCents: number;
  serviceFeeCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

type OrderRow = DonationRow;

let memorialsCache: Map<string, AeternaMemorial> | null = null;
let ordersCache: OrderRow[] | null = null;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function profileUrl(slug: string): string {
  const base = (process.env.PUBLIC_WEB_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/m/${slug}`;
}

function qrPlaceholder(slug: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl(slug))}`;
}

function seedMemorials(): Map<string, AeternaMemorial> {
  const m = new Map<string, AeternaMemorial>();
  const slug = DEMO_MEMORIAL_SLUG;
  const now = new Date().toISOString();
  m.set(slug, {
    id: randomUUID(),
    slug,
    profileUrl: profileUrl(slug),
    qrCodeUrl: qrPlaceholder(slug),
    createdAt: now,
    updatedAt: now,
    ...DEMO_AETERNA_MEMORIAL,
    demoMediaVersion: DEMO_MEDIA_VERSION,
  } as AeternaMemorial);
  return m;
}

async function loadMemorials(): Promise<Map<string, AeternaMemorial>> {
  if (memorialsCache) return memorialsCache;
  await mkdir(config.dataDir, { recursive: true });
  try {
    const raw = await readFile(MEMORIALS_FILE, "utf8");
    const arr = JSON.parse(raw) as AeternaMemorial[];
    memorialsCache = new Map(arr.map((r) => [r.slug, r]));
  } catch {
    memorialsCache = seedMemorials();
    await saveMemorials();
  }
  if (!memorialsCache.has(DEMO_MEMORIAL_SLUG)) {
    const seeded = seedMemorials().get(DEMO_MEMORIAL_SLUG)!;
    memorialsCache.set(DEMO_MEMORIAL_SLUG, seeded);
    await saveMemorials();
  } else {
    const existing = memorialsCache.get(DEMO_MEMORIAL_SLUG)!;
    const demoVersion = (existing as AeternaMemorial & { demoMediaVersion?: number }).demoMediaVersion ?? 0;
    const needsDemoRefresh =
      demoVersion < DEMO_MEDIA_VERSION ||
      existing.fullName !== DEMO_AETERNA_MEMORIAL.fullName ||
      !existing.farewellMessage ||
      !existing.videoUrl ||
      existing.mediaGallery.length < DEMO_AETERNA_MEMORIAL.mediaGallery.length;

    if (needsDemoRefresh) {
      memorialsCache.set(DEMO_MEMORIAL_SLUG, {
        ...existing,
        ...DEMO_AETERNA_MEMORIAL,
        id: existing.id,
        slug: DEMO_MEMORIAL_SLUG,
        createdAt: existing.createdAt,
        profileUrl: profileUrl(DEMO_MEMORIAL_SLUG),
        qrCodeUrl: qrPlaceholder(DEMO_MEMORIAL_SLUG),
        updatedAt: new Date().toISOString(),
        demoMediaVersion: DEMO_MEDIA_VERSION,
      } as AeternaMemorial);
      await saveMemorials();
    }
  }
  return memorialsCache;
}

async function saveMemorials(): Promise<void> {
  if (!memorialsCache) return;
  await writeFile(MEMORIALS_FILE, JSON.stringify([...memorialsCache.values()], null, 2));
}

async function loadOrders(): Promise<OrderRow[]> {
  if (ordersCache) return ordersCache;
  await mkdir(config.dataDir, { recursive: true });
  try {
    ordersCache = JSON.parse(await readFile(ORDERS_FILE, "utf8")) as OrderRow[];
  } catch {
    ordersCache = [];
  }
  return ordersCache;
}

async function saveOrders(): Promise<void> {
  await writeFile(ORDERS_FILE, JSON.stringify(ordersCache ?? [], null, 2));
}

export function listParishes(): Parish[] {
  return LT_PARISHES;
}

export function getParish(id: string): Parish | null {
  return LT_PARISHES.find((p) => p.id === id) ?? null;
}

export function splitAmount(totalCents: number): {
  parishCommissionCents: number;
  serviceFeeCents: number;
} {
  const parishCommissionCents = Math.round((totalCents * PARISH_COMMISSION_BPS) / 10000);
  return {
    parishCommissionCents,
    serviceFeeCents: totalCents - parishCommissionCents,
  };
}

export async function getMemorialBySlug(slug: string): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  return map.get(slug) ?? null;
}

export async function findMemorialByPerson(
  fullName: string,
  birthDate: string,
  deathDate: string
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const targetName = fullName.trim().toLowerCase();
  for (const row of map.values()) {
    if (
      row.fullName.trim().toLowerCase() === targetName &&
      row.birthDate === birthDate &&
      row.deathDate === deathDate
    ) {
      return row;
    }
  }
  return null;
}

export async function getMemorialPublic(slug: string): Promise<AeternaMemorialPublic | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row || row.privacyStatus !== "public") return null;
  const parish = getParish(row.parishId);
  if (!parish) return null;
  const { userId: _, ...rest } = row;
  return {
    ...rest,
    parish: {
      id: parish.id,
      title: parish.title,
      diocese: parish.diocese,
      supportGoal: parish.supportGoal,
      image: parish.image,
    },
  };
}

export async function createMemorial(input: CreateMemorialInput): Promise<AeternaMemorial> {
  const parish = getParish(input.parishId);
  if (!parish) throw new Error("Parapija nerasta");

  const map = await loadMemorials();
  let base = slugify(input.fullName) || "atminimas";
  let slug = base;
  let n = 1;
  while (map.has(slug)) {
    slug = `${base}-${n++}`;
  }

  const now = new Date().toISOString();
  const row: AeternaMemorial = {
    id: randomUUID(),
    slug,
    userId: null,
    parishId: input.parishId,
    fullName: input.fullName,
    birthDate: input.birthDate ?? null,
    deathDate: input.deathDate ?? null,
    biography: input.biography ?? "",
    mediaGallery: input.mediaGallery ?? [],
    videoUrl: input.videoUrl ?? null,
    geoLocation: null,
    privacyStatus: input.privacyStatus ?? "public",
    profileUrl: profileUrl(slug),
    qrCodeUrl: qrPlaceholder(slug),
    createdAt: now,
    updatedAt: now,
  };
  map.set(slug, row);
  await saveMemorials();
  return row;
}

export async function setMemorialLocation(
  slug: string,
  lat: number,
  lng: number
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row) return null;
  row.geoLocation = { lat, lng };
  row.updatedAt = new Date().toISOString();
  map.set(slug, row);
  await saveMemorials();
  return row;
}

export async function recordDonation(
  parishId: string,
  totalCents: number,
  kind: DonationKind,
  referenceId: string | null,
  memorialId: string | null
): Promise<DonationRow> {
  const split = kind === "memorial" ? splitAmount(totalCents) : { parishCommissionCents: totalCents, serviceFeeCents: 0 };
  const order: DonationRow = {
    id: randomUUID(),
    kind,
    memorialId,
    referenceId,
    parishId,
    totalAmountCents: totalCents,
    parishAmountCents: split.parishCommissionCents,
    serviceFeeCents: split.serviceFeeCents,
    currency: "EUR",
    status: "completed_stub",
    createdAt: new Date().toISOString(),
  };
  const orders = await loadOrders();
  orders.push(order);
  ordersCache = orders;
  await saveOrders();
  return order;
}

/** @deprecated use recordDonation */
export async function recordOrder(
  parishId: string,
  totalCents: number,
  memorialId: string | null
): Promise<DonationRow> {
  return recordDonation(parishId, totalCents, "memorial", memorialId, memorialId);
}

export async function getDonationsForParish(parishId: string): Promise<DonationRow[]> {
  const orders = await loadOrders();
  return orders.filter((o) => o.parishId === parishId);
}

export async function parishAdminSummary(): Promise<ParishSummary[]> {
  const orders = await loadOrders();
  const byParish = new Map<string, ParishSummary>();

  for (const p of LT_PARISHES) {
    byParish.set(p.id, {
      parishId: p.id,
      title: p.title,
      totalOrders: 0,
      totalAmountCents: 0,
      parishCommissionCents: 0,
    });
  }

  for (const o of orders) {
    const s = byParish.get(o.parishId);
    if (!s) continue;
    s.totalOrders += 1;
    s.totalAmountCents += o.totalAmountCents;
    s.parishCommissionCents += o.parishAmountCents ?? (o as { parishCommissionCents?: number }).parishCommissionCents ?? 0;
  }
  return [...byParish.values()];
}
