import katalikaiData from "../data/katalikai-parishes.json" with { type: "json" };
import { DEMO_PARISH_ID, LT_PARISHES } from "../data/lt-parishes.js";
import type { Parish } from "../types/aeterna.js";

function titleKey(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Suvienodina katalikai.lt ir RC pavadinimų skirtumus (Mergelės → M. ir pan.). */
function titleKeyLoose(title: string): string {
  return titleKey(title)
    .replace(/\bmergeles\b/g, "m")
    .replace(/\bmergeles\b/g, "m")
    .replace(/\bsvaitikiu\b/g, "svc")
    .replace(/\s+/g, " ")
    .trim();
}

function slugVariants(id: string): string[] {
  const variants = new Set<string>([id]);
  variants.add(id.replace(/-mergeles-/g, "-m-"));
  variants.add(id.replace(/-svc-mergeles-/g, "-svc-m-"));
  variants.add(id.replace(/-mergeles-marijos-/g, "-m-marijos-"));
  return [...variants];
}

function buildLegacyMap(): Map<string, string> {
  const byExact = new Map<string, string>();
  const byLoose = new Map<string, string>();
  for (const p of LT_PARISHES) {
    byExact.set(titleKey(p.title), p.id);
    byLoose.set(titleKeyLoose(p.title), p.id);
  }

  const map = new Map<string, string>();
  for (const old of katalikaiData.parishes ?? []) {
    let newId = byExact.get(titleKey(old.title)) ?? byLoose.get(titleKeyLoose(old.title));
    if (!newId) {
      for (const variant of slugVariants(old.id)) {
        const hit = LT_PARISHES.find((p) => p.id === variant);
        if (hit) {
          newId = hit.id;
          break;
        }
      }
    }
    if (newId && newId !== old.id) {
      map.set(old.id, newId);
    }
  }
  /** Pavadinimai nesutampa po RC JAR importo — kritiniai ID rankiniu būdu */
  const manual: [string, string][] = [
    ["parish-vilniaus-sv-stanislovo-ir-sv-vladislovo-arkikatedra-bazilika", DEMO_PARISH_ID],
  ];
  for (const [from, to] of manual) {
    if (LT_PARISHES.some((p) => p.id === to)) map.set(from, to);
  }
  return map;
}

const LEGACY_PARISH_ID_MAP = buildLegacyMap();

export function resolveParishId(parishId: string): string {
  if (LEGACY_PARISH_ID_MAP.has(parishId)) {
    return LEGACY_PARISH_ID_MAP.get(parishId)!;
  }
  for (const variant of slugVariants(parishId)) {
    if (LT_PARISHES.some((p) => p.id === variant)) {
      return variant;
    }
  }
  return parishId;
}

export function getParishById(parishId: string): Parish | null {
  const id = resolveParishId(parishId);
  return LT_PARISHES.find((p) => p.id === id) ?? null;
}

export function legacyParishIdCount(): number {
  return LEGACY_PARISH_ID_MAP.size;
}
