import { randomUUID } from "node:crypto";
import {
  DEMO_AETERNA_MEMORIAL,
  DEMO_MEDIA_VERSION,
  DEMO_MEMORIAL_SLUG,
  DEMO_VARDENIS_MEMORIAL,
  DEMO_VARDENIS_SLUG,
} from "../data/demo-aeterna.js";
import { LT_PARISHES } from "../data/lt-parishes.js";
import type {
  AeternaMemorial,
  AeternaMemorialPublic,
  CreateMemorialInput,
  Parish,
  ParishSummary,
} from "../types/aeterna.js";
import { sanitizeMediaGallery, sanitizeMediaUrl } from "../media-url-sanitize.js";
import { getParishById, resolveParishId } from "../lib/parish-id-legacy.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";
import { CANDLE_SERVICE_FEE_CENTS, PREMIUM_MONTHLY_CENTS, PREMIUM_YEARLY_CENTS } from "./stripe.js";

const MEMORIALS_KEY = "aeterna-memorials";
const ORDERS_KEY = "aeterna-orders";

const PARISH_COMMISSION_BPS = Number(process.env.AETERNA_PARISH_COMMISSION_BPS || 2000);

export type DonationKind = "memorial" | "candle" | "mass" | "premium";

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
  const now = new Date().toISOString();
  for (const [slug, demo] of [
    [DEMO_MEMORIAL_SLUG, DEMO_AETERNA_MEMORIAL],
    [DEMO_VARDENIS_SLUG, DEMO_VARDENIS_MEMORIAL],
  ] as const) {
    m.set(slug, {
      id: randomUUID(),
      slug,
      profileUrl: profileUrl(slug),
      qrCodeUrl: qrPlaceholder(slug),
      createdAt: now,
      updatedAt: now,
      ...demo,
      demoMediaVersion: DEMO_MEDIA_VERSION,
    } as AeternaMemorial);
  }
  return m;
}

async function loadMemorials(): Promise<Map<string, AeternaMemorial>> {
  if (memorialsCache) return memorialsCache;
  const arr = await loadJsonStore<AeternaMemorial[]>(MEMORIALS_KEY, []);
  if (arr.length === 0) {
    memorialsCache = seedMemorials();
    await saveMemorials();
  } else {
    memorialsCache = new Map(arr.map((r) => [r.slug, r]));
  }
  for (const slug of [DEMO_MEMORIAL_SLUG, DEMO_VARDENIS_SLUG] as const) {
    if (!memorialsCache.has(slug)) {
      const seeded = seedMemorials().get(slug)!;
      memorialsCache.set(slug, seeded);
      await saveMemorials();
    }
  }
  if (memorialsCache.has(DEMO_MEMORIAL_SLUG)) {
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
  if (!memorialsCache.has(DEMO_VARDENIS_SLUG)) {
    const seeded = seedMemorials().get(DEMO_VARDENIS_SLUG)!;
    memorialsCache.set(DEMO_VARDENIS_SLUG, seeded);
    await saveMemorials();
  } else {
    const v = memorialsCache.get(DEMO_VARDENIS_SLUG)!;
    if (!v.geoLocation) {
      memorialsCache.set(DEMO_VARDENIS_SLUG, {
        ...v,
        ...DEMO_VARDENIS_MEMORIAL,
        id: v.id,
        slug: DEMO_VARDENIS_SLUG,
        updatedAt: new Date().toISOString(),
        demoMediaVersion: DEMO_MEDIA_VERSION,
      } as AeternaMemorial);
      await saveMemorials();
    }
  }
  let approvedPending = false;
  for (const row of memorialsCache.values()) {
    row.isPremium = row.isPremium ?? false;
    row.familyTree = row.familyTree ?? [];
    row.anniversaryRemindersEnabled = row.anniversaryRemindersEnabled ?? false;
    if (row.moderationStatus === "pending") {
      row.moderationStatus = "approved";
      row.updatedAt = new Date().toISOString();
      approvedPending = true;
    }
  }
  if (approvedPending) await saveMemorials();

  return memorialsCache;
}

async function saveMemorials(): Promise<void> {
  if (!memorialsCache) return;
  await saveJsonStore(MEMORIALS_KEY, [...memorialsCache.values()]);
}

async function loadOrders(): Promise<OrderRow[]> {
  if (ordersCache) return ordersCache;
  ordersCache = await loadJsonStore<OrderRow[]>(ORDERS_KEY, []);
  return ordersCache;
}

async function saveOrders(): Promise<void> {
  await saveJsonStore(ORDERS_KEY, ordersCache ?? []);
}

export function listParishes(): Parish[] {
  return LT_PARISHES;
}

export function getParish(id: string): Parish | null {
  return getParishById(id);
}

/** Atnaujina memorialų parishId po parapijų sąrašo migracijos (katalikai → RC JAR). */
export async function repairMemorialParishIds(): Promise<number> {
  const map = await loadMemorials();
  let fixed = 0;
  for (const row of map.values()) {
    const resolved = resolveParishId(row.parishId);
    if (resolved !== row.parishId && getParishById(resolved)) {
      row.parishId = resolved;
      row.updatedAt = new Date().toISOString();
      map.set(row.slug, row);
      fixed++;
    }
  }
  if (fixed > 0) await saveMemorials();
  return fixed;
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

export type MemorialSearchHit = {
  slug: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
};

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export async function searchMemorialsPublic(
  query: string,
  limit = 10
): Promise<MemorialSearchHit[]> {
  const q = normalizeSearchText(query);
  if (!q) return [];

  const map = await loadMemorials();
  const scored: { score: number; hit: MemorialSearchHit }[] = [];

  for (const row of map.values()) {
    const mod = row.moderationStatus ?? "approved";
    if (row.privacyStatus !== "public" || mod === "rejected" || mod === "pending") continue;

    const name = normalizeSearchText(row.fullName);
    const slug = normalizeSearchText(row.slug);
    const words = name.split(/\s+/).filter(Boolean);

    let score = 0;
    if (slug.startsWith(q) || name.startsWith(q)) score = 4;
    else if (words.some((w) => w.startsWith(q))) score = 3;
    else if (slug.includes(q) || name.includes(q)) score = 2;
    else continue;

    scored.push({
      score,
      hit: {
        slug: row.slug,
        fullName: row.fullName,
        birthDate: row.birthDate,
        deathDate: row.deathDate,
        portraitUrl: row.portraitUrl ?? row.mediaGallery?.[0] ?? null,
      },
    });
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.hit.fullName.localeCompare(b.hit.fullName, "lt")
    )
    .slice(0, Math.min(20, Math.max(1, limit)))
    .map((s) => s.hit);
}

export async function getMemorialPublic(slug: string): Promise<AeternaMemorialPublic | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  const mod = row?.moderationStatus ?? "approved";
  if (!row || row.privacyStatus !== "public" || mod === "rejected") return null;
  if (mod === "pending") return null;
  const parish = getParish(row.parishId);
  if (!parish) return null;
  const { userId, ...rest } = row;
  return {
    ...rest,
    isPremium: row.isPremium ?? false,
    linkedToAccount: !!userId,
    parish: {
      id: parish.id,
      title: parish.title,
      diocese: parish.diocese,
      supportGoal: parish.supportGoal,
      image: parish.image,
    },
  };
}

export async function claimMemorialForUser(
  slug: string,
  userId: string
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row) return null;
  if (row.userId && row.userId !== userId) {
    throw new Error("Šis profilis jau pririštas prie kitos paskyros");
  }
  if (row.userId === userId) return row;

  const { MAX_MEMORIALS_PER_USER } = await import("./user-store.js");
  const owned = await listMemorialsByUserId(userId);
  if (owned.length >= MAX_MEMORIALS_PER_USER) {
    throw new Error(`Vienoje paskyroje galima iki ${MAX_MEMORIALS_PER_USER} atminties profilių`);
  }

  row.userId = userId;
  row.updatedAt = new Date().toISOString();
  map.set(slug, row);
  await saveMemorials();
  return row;
}

export async function listMemorialsByUserId(userId: string): Promise<AeternaMemorial[]> {
  const map = await loadMemorials();
  return [...map.values()]
    .filter((m) => m.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createMemorial(
  input: CreateMemorialInput,
  userId?: string | null
): Promise<AeternaMemorial> {
  const parish = getParish(input.parishId);
  if (!parish) throw new Error("Parapija nerasta");

  if (userId) {
    const owned = await listMemorialsByUserId(userId);
    const { MAX_MEMORIALS_PER_USER } = await import("./user-store.js");
    if (owned.length >= MAX_MEMORIALS_PER_USER) {
      throw new Error(`Vienoje paskyroje galima iki ${MAX_MEMORIALS_PER_USER} atminties profilių`);
    }
  }

  const map = await loadMemorials();
  let base = slugify(input.fullName) || "atminimas";
  let slug = base;
  let n = 1;
  while (map.has(slug)) {
    slug = `${base}-${n++}`;
  }

  const isPremium = !!input.isPremium;
  const galleryAll = sanitizeMediaGallery(input.mediaGallery);
  const gallery = isPremium ? galleryAll : galleryAll.slice(0, 10);
  const portrait = input.portraitUrl
    ? sanitizeMediaUrl(input.portraitUrl)
    : (gallery[0] ?? null);
  const video = isPremium
    ? input.videoUrl && !input.videoUrl.trim().startsWith("data:")
      ? sanitizeMediaUrl(input.videoUrl) ?? input.videoUrl.trim()
      : null
    : null;

  const now = new Date().toISOString();
  const row: AeternaMemorial = {
    id: randomUUID(),
    slug,
    userId: userId ?? null,
    parishId: input.parishId,
    fullName: input.fullName,
    birthDate: input.birthDate ?? null,
    deathDate: input.deathDate ?? null,
    biography: input.biography ?? "",
    isPremium,
    familyTree: [],
    anniversaryRemindersEnabled: false,
    portraitUrl: portrait,
    mediaGallery: gallery,
    videoUrl: video,
    geoLocation: null,
    privacyStatus: input.privacyStatus ?? "public",
    moderationStatus: "approved",
    profileUrl: profileUrl(slug),
    qrCodeUrl: qrPlaceholder(slug),
    createdAt: now,
    updatedAt: now,
  };
  map.set(slug, row);
  await saveMemorials();
  return row;
}

export async function updateMemorialByOwner(
  slug: string,
  userId: string,
  patch: {
    fullName?: string;
    birthDate?: string | null;
    deathDate?: string | null;
    biography?: string;
    farewellMessage?: string | null;
    videoUrl?: string | null;
    portraitUrl?: string | null;
    mediaGallery?: string[];
    privacyStatus?: "public" | "private";
    parishId?: string;
    familyTree?: import("../types/aeterna.js").FamilyTreeNode[];
    anniversaryRemindersEnabled?: boolean;
  }
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row || row.userId !== userId) return null;

  if (patch.parishId !== undefined) {
    const parish = getParish(patch.parishId);
    if (!parish) throw new Error("Parapija nerasta — pasirinkite iš sąrašo");
    row.parishId = parish.id;
  }

  if (patch.fullName?.trim()) row.fullName = patch.fullName.trim();
  if (patch.birthDate !== undefined) row.birthDate = patch.birthDate;
  if (patch.deathDate !== undefined) row.deathDate = patch.deathDate;
  if (patch.biography !== undefined) row.biography = patch.biography;
  if (patch.farewellMessage !== undefined) row.farewellMessage = patch.farewellMessage;
  if (patch.videoUrl !== undefined) {
    if (!row.isPremium) {
      row.videoUrl = null;
    } else {
      row.videoUrl =
        patch.videoUrl && patch.videoUrl.trim()
          ? sanitizeMediaUrl(patch.videoUrl) ?? patch.videoUrl.trim()
          : null;
    }
  }
  if (patch.portraitUrl !== undefined) {
    if (patch.portraitUrl) {
      row.portraitUrl = sanitizeMediaUrl(patch.portraitUrl);
    }
    /** Tuščias portraitUrl neištrina esamos nuotraukos — tik aiškus [] gallery arba naujas URL */
  }
  if (patch.mediaGallery !== undefined) {
    if (patch.mediaGallery.length > 0) {
      const gallery = sanitizeMediaGallery(patch.mediaGallery);
      row.mediaGallery = row.isPremium ? gallery : gallery.slice(0, 10);
    }
  }
  if (patch.privacyStatus !== undefined) row.privacyStatus = patch.privacyStatus;
  if (patch.familyTree !== undefined) {
    if (!row.isPremium) throw new Error("Giminės medis pasiekiamas tik Premium narystei");
    row.familyTree = patch.familyTree
      .filter((n) => n.name?.trim())
      .map((n) => ({
        id: n.id || randomUUID(),
        name: n.name.trim(),
        relation: n.relation?.trim() || "giminaitis",
        birthDate: n.birthDate ?? null,
        deathDate: n.deathDate ?? null,
        note: n.note?.trim() || null,
      }))
      .slice(0, 48);
  }
  if (patch.anniversaryRemindersEnabled !== undefined) {
    if (!row.isPremium) throw new Error("Metinių priminimai pasiekiami tik Premium narystei");
    row.anniversaryRemindersEnabled = !!patch.anniversaryRemindersEnabled;
  }
  row.updatedAt = new Date().toISOString();
  map.set(slug, row);
  await saveMemorials();
  return row;
}

/** Atkuria mediją iš kito slug (pvz. dublikato po klaidingo išsaugojimo). */
export async function restoreMemorialMediaFromSlug(
  targetSlug: string,
  sourceSlug: string
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const target = map.get(targetSlug);
  const source = map.get(sourceSlug);
  if (!target || !source) return null;

  const gallery = sanitizeMediaGallery(
    source.mediaGallery?.length ? source.mediaGallery : target.mediaGallery
  );
  const galleryLimited = target.isPremium ? gallery : gallery.slice(0, 10);
  const portrait =
    sanitizeMediaUrl(source.portraitUrl ?? "") ??
    sanitizeMediaUrl(source.mediaGallery?.[0] ?? "") ??
    target.portraitUrl;

  target.portraitUrl = portrait;
  target.mediaGallery = galleryLimited.length ? galleryLimited : target.mediaGallery;
  if (!target.isPremium) {
    target.videoUrl = null;
  } else if (source.videoUrl && !target.videoUrl) {
    target.videoUrl = sanitizeMediaUrl(source.videoUrl) ?? source.videoUrl;
  }
  target.profileUrl = profileUrl(targetSlug);
  target.qrCodeUrl = qrPlaceholder(targetSlug);
  target.updatedAt = new Date().toISOString();
  map.set(targetSlug, target);
  await saveMemorials();
  return target;
}

export async function activateMemorialPremium(
  slug: string,
  userId: string,
  plan: "monthly" | "yearly"
): Promise<AeternaMemorial> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row || row.userId !== userId) {
    throw new Error("Profilis nerastas arba priklauso kitam vartotojui");
  }
  if (row.isPremium) return row;

  const amountCents = plan === "yearly" ? PREMIUM_YEARLY_CENTS : PREMIUM_MONTHLY_CENTS;
  await recordDonation(row.parishId, amountCents, "premium", slug, row.id);
  row.isPremium = true;
  row.updatedAt = new Date().toISOString();
  map.set(slug, row);
  await saveMemorials();
  return row;
}

export async function setMemorialLocation(
  slug: string,
  lat: number,
  lng: number,
  userId?: string | null
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row) return null;
  if (row.userId && row.userId !== userId) return null;
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
  // Narystė ir Premium — 100% platformai. Žvakutės/misės — parapijai + 0,50 € platformai.
  const MASS_SERVICE_FEE_CENTS = CANDLE_SERVICE_FEE_CENTS;
  const split =
    kind === "memorial" || kind === "premium"
      ? { parishCommissionCents: 0, serviceFeeCents: totalCents }
      : kind === "candle"
        ? {
            serviceFeeCents: CANDLE_SERVICE_FEE_CENTS,
            parishCommissionCents: Math.max(0, totalCents - CANDLE_SERVICE_FEE_CENTS),
          }
        : {
            // kind === "mass"
            serviceFeeCents: MASS_SERVICE_FEE_CENTS,
            parishCommissionCents: Math.max(0, totalCents - MASS_SERVICE_FEE_CENTS),
          };
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

export type MemorialModerationRow = Pick<
  AeternaMemorial,
  "id" | "slug" | "fullName" | "parishId" | "createdAt" | "moderationStatus" | "privacyStatus"
> & { parishTitle: string };

export async function listPendingMemorials(): Promise<MemorialModerationRow[]> {
  const map = await loadMemorials();
  const out: MemorialModerationRow[] = [];
  for (const row of map.values()) {
    if ((row.moderationStatus ?? "approved") !== "pending") continue;
    const parish = getParish(row.parishId);
    out.push({
      id: row.id,
      slug: row.slug,
      fullName: row.fullName,
      parishId: row.parishId,
      parishTitle: parish?.title ?? row.parishId,
      createdAt: row.createdAt,
      moderationStatus: row.moderationStatus ?? "pending",
      privacyStatus: row.privacyStatus,
    });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setMemorialModeration(
  slug: string,
  status: "approved" | "rejected"
): Promise<AeternaMemorial | null> {
  const map = await loadMemorials();
  const row = map.get(slug);
  if (!row) return null;
  row.moderationStatus = status;
  row.updatedAt = new Date().toISOString();
  await saveMemorials();
  return row;
}
