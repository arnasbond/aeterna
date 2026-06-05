export type PlateTierId = "standard" | "premium" | "prestige";

export type PlateTier = {
  id: PlateTierId;
  name: string;
  tagline: string;
  priceCents: number;
  material: string;
  size: string;
  finish: string;
  features: string[];
  variant: PlateTierId;
  popular?: boolean;
};

/** Skaitmeninio memorialo paketas (be plokštelės) */
export const MEMORIAL_PACKAGE_CENTS = 3900; // 39 €

export const PLATE_TIERS: PlateTier[] = [
  {
    id: "standard",
    name: "Standartinė",
    tagline: "Patikima ir praktiška",
    priceCents: 4900,
    material: "Anoduotas aliuminis",
    size: "6 × 6 cm",
    finish: "Šviesiai sidabrinė",
    features: [
      "Lazerinis graviruotas QR kodas",
      "Atsparumas lietui ir šalčiui",
      "2 montavimo skylės",
      "Standartinis šriftas „Amžina atmintis“",
    ],
    variant: "standard",
  },
  {
    id: "premium",
    name: "Geresnė",
    tagline: "Premium išvaizda",
    priceCents: 8900,
    material: "Nerūdijantis plienas",
    size: "7 × 7 cm",
    finish: "Matinė juoda su auksu",
    features: [
      "Kontrastinis QR — lengviau skenuoti",
      "UV apsaugos sluoksnis",
      "Keramikinis intarzo rėmelis",
      "Asmeninė užrašo eilutė (iki 24 simbolių)",
    ],
    variant: "premium",
    popular: true,
  },
  {
    id: "prestige",
    name: "Geriausia",
    tagline: "Išskirtinė prie paminklo",
    priceCents: 12900,
    material: "Žalvaris su apsauga",
    size: "8 × 8 cm",
    finish: "Šiltas auksinis atspalvis",
    features: [
      "Gilus graviravimas — ilgaamžiškumas",
      "Pilnas montavimo komplektas",
      "25 metų gamintojo garantija",
      "Prioritetinis gamybos terminas (7 d.)",
    ],
    variant: "prestige",
  },
];

export function getPlateTier(id: string | null | undefined): PlateTier | null {
  if (!id) return null;
  return PLATE_TIERS.find((t) => t.id === id) ?? null;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function packageTotalCents(plateId: PlateTierId | null): number {
  const plate = plateId ? getPlateTier(plateId) : null;
  return MEMORIAL_PACKAGE_CENTS + (plate?.priceCents ?? 0);
}
