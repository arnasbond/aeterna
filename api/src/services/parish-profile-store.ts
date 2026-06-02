import { getParish, listParishes } from "./aeterna-store.js";
import type { Parish } from "../types/aeterna.js";
import type { ParishProfile, ParishProfileInput } from "../types/parish-profile.js";
import { importProfileFromWebsite } from "./website-profile-import.js";
import { resolveParishImageUrl } from "../lib/parish-image.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";

const STORE_KEY = "parish-profiles";

let profilesCache: Map<string, ParishProfile> | null = null;

function uniqueGallery(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    const s = u.trim();
    if (!s || !/^https?:\/\//i.test(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= 16) break;
  }
  return out;
}

export function emptyParishProfile(parishId: string): ParishProfile {
  const now = new Date().toISOString();
  return {
    parishId,
    shortDescription: "",
    about: "",
    address: "",
    phone: "",
    email: "",
    priestName: "",
    deputyPriestName: "",
    massSchedule: "",
    confessionTimes: "",
    officeHours: "",
    sacraments: "",
    announcements: "",
    bankDetails: "",
    galleryUrls: [],
    extraSections: [],
    importedFrom: null,
    importedAt: null,
    updatedAt: now,
  };
}

async function loadProfilesArray(): Promise<ParishProfile[]> {
  return loadJsonStore<ParishProfile[]>(STORE_KEY, []);
}

async function loadProfiles(): Promise<Map<string, ParishProfile>> {
  if (profilesCache) return profilesCache;
  const arr = await loadProfilesArray();
  profilesCache = new Map(arr.map((p) => [p.parishId, p]));
  return profilesCache;
}

async function saveProfiles(): Promise<void> {
  if (!profilesCache) return;
  await saveJsonStore(STORE_KEY, [...profilesCache.values()]);
}

export function invalidateParishProfilesCache() {
  profilesCache = null;
}

export async function getParishProfile(parishId: string): Promise<ParishProfile> {
  const map = await loadProfiles();
  return map.get(parishId) ?? emptyParishProfile(parishId);
}

export type ParishDetail = Parish & { profile: ParishProfile };

export async function getParishDetail(id: string): Promise<ParishDetail | null> {
  const parish = getParish(id);
  if (!parish) return null;
  const profile = await getParishProfile(id);
  const image = resolveParishImageUrl(parish.image, profile.galleryUrls, parish.diocese);
  return { ...parish, image, profile };
}

/** Parapijų sąrašui — miniatiūra iš galerijos arba veikiantis numatytasis vaizdas. */
export async function listParishesForPublic(): Promise<Parish[]> {
  const map = await loadProfiles();
  return listParishes().map((p) => {
    const profile = map.get(p.id);
    const image = resolveParishImageUrl(
      p.image,
      profile?.galleryUrls,
      p.diocese
    );
    return image === p.image ? p : { ...p, image };
  });
}

function mergeProfile(
  existing: ParishProfile,
  patch: ParishProfileInput,
  opts?: { importedFrom?: string }
): ParishProfile {
  const now = new Date().toISOString();
  return {
    ...existing,
    shortDescription: patch.shortDescription ?? existing.shortDescription,
    about: patch.about ?? existing.about,
    address: patch.address ?? existing.address,
    phone: patch.phone ?? existing.phone,
    email: patch.email ?? existing.email,
    priestName: patch.priestName ?? existing.priestName,
    deputyPriestName: patch.deputyPriestName ?? existing.deputyPriestName,
    massSchedule: patch.massSchedule ?? existing.massSchedule,
    confessionTimes: patch.confessionTimes ?? existing.confessionTimes,
    officeHours: patch.officeHours ?? existing.officeHours,
    sacraments: patch.sacraments ?? existing.sacraments,
    announcements: patch.announcements ?? existing.announcements,
    bankDetails: patch.bankDetails ?? existing.bankDetails,
    galleryUrls: patch.galleryUrls ?? existing.galleryUrls,
    extraSections: patch.extraSections ?? existing.extraSections,
    importedFrom: opts?.importedFrom ?? existing.importedFrom,
    importedAt: opts?.importedFrom ? now : existing.importedAt,
    updatedAt: now,
  };
}

/** Perrašo laukus klebono redagavimui */
export async function updateParishProfile(
  parishId: string,
  input: ParishProfileInput
): Promise<ParishProfile> {
  if (!getParish(parishId)) throw new Error("Parapija nerasta");
  const map = await loadProfiles();
  const existing = map.get(parishId) ?? emptyParishProfile(parishId);
  const now = new Date().toISOString();
  const updated: ParishProfile = {
    ...existing,
    ...input,
    parishId,
    importedFrom: existing.importedFrom,
    importedAt: existing.importedAt,
    updatedAt: now,
  };
  map.set(parishId, updated);
  await saveProfiles();
  return updated;
}

export async function importParishProfileFromWebsite(
  parishId: string,
  overrideUrl?: string
): Promise<ParishProfile> {
  const parish = getParish(parishId);
  if (!parish) throw new Error("Parapija nerasta");
  const url = (overrideUrl?.trim() || parish.websiteUrl)?.trim();
  if (!url) throw new Error("Parapija neturi oficialios svetainės nuorodos");

  const imported = await importProfileFromWebsite(url);
  const map = await loadProfiles();
  const existing = map.get(parishId) ?? emptyParishProfile(parishId);

  const filled: ParishProfileInput = {
    shortDescription: imported.shortDescription || existing.shortDescription,
    about: imported.about || existing.about,
    address: imported.address || existing.address,
    phone: imported.phone || existing.phone,
    email: imported.email || existing.email,
    priestName: imported.priestName || existing.priestName,
    deputyPriestName: imported.deputyPriestName || existing.deputyPriestName,
    massSchedule: imported.massSchedule || existing.massSchedule,
    confessionTimes: imported.confessionTimes || existing.confessionTimes,
    officeHours: imported.officeHours || existing.officeHours,
    sacraments: imported.sacraments || existing.sacraments,
    announcements: imported.announcements || existing.announcements,
    bankDetails: parish.bankAccount
      ? `Parama: ${parish.bankAccount}\n${parish.supportGoal}`
      : existing.bankDetails,
    galleryUrls:
      imported.galleryUrls && imported.galleryUrls.length > 0
        ? uniqueGallery(imported.galleryUrls)
        : existing.galleryUrls,
    extraSections:
      imported.extraSections && imported.extraSections.length > 0
        ? imported.extraSections
        : existing.extraSections,
  };

  const updated = mergeProfile(existing, filled, { importedFrom: url });
  map.set(parishId, updated);
  await saveProfiles();
  return updated;
}

export async function listParishProfilesWithWebsite(): Promise<
  { parishId: string; title: string; websiteUrl: string }[]
> {
  const { listParishes } = await import("./aeterna-store.js");
  return listParishes()
    .filter((p) => p.websiteUrl)
    .map((p) => ({ parishId: p.id, title: p.title, websiteUrl: p.websiteUrl! }));
}
