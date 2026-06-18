import { MEMORIAL_PACKAGE_CENTS } from "@/lib/qr-plates";

export const BASE_MEMBERSHIP_CENTS = MEMORIAL_PACKAGE_CENTS;
/** Premium prenumerata — tik mėnesinis mokėjimas */
export const PREMIUM_MONTHLY_CENTS = 199;
/** @deprecated Metinis planas nebenaudojamas UI — palikta API suderinamumui */
export const PREMIUM_YEARLY_CENTS = 2500;

export type PremiumPlan = "monthly" | "yearly";
export type MembershipPlanId = "standard" | "premium";

export function formatPremiumPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export const PREMIUM_SUBSCRIPTION_LABEL = `${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`;

export const PREMIUM_RETENTION_NOTE =
  "Nutraukus Premium ar neapmokėjus — memorialas lieka Pagrindiniame plane. Visi įrašyti duomenys (nuotraukos, vaizdo įrašas, giminės medis) saugomi ir vėl aktyvuojami, kai atnaujinsite prenumeratą.";

export const STANDARD_FEATURES = [
  "Memorialinis puslapis su QR kodu",
  "Iki 10 nuotraukų galerijoje",
  "Virtuali žvakutė ir parama parapijai",
  "Duomenys saugomi visada — net ir be Premium",
] as const;

export const PREMIUM_FEATURES = [
  "Neribota nuotraukų galerija (daugiau nei 10)",
  "Vaizdo įrašo įkėlimas memorialiniame puslapyje",
  "Giminės medžio skiltis",
  "Automatiniai priminimai apie metines el. paštu",
  "Prenumerata — tik 1,99 €/mėn., galite nutraukti bet kada",
] as const;

export type MembershipPlan = {
  id: MembershipPlanId;
  name: string;
  tagline: string;
  features: readonly string[];
  popular?: boolean;
};

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "standard",
    name: "Pagrindinis",
    tagline: "Vienkartinis mokestis — atmintis amžiams",
    features: STANDARD_FEATURES,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Papildomos galimybės su mėnesine prenumerata",
    features: PREMIUM_FEATURES,
    popular: true,
  },
];

export function premiumAddonCents(_billing: PremiumPlan = "monthly"): number {
  return PREMIUM_MONTHLY_CENTS;
}

export function premiumAddonLabel(): string {
  return `${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`;
}

/** Pirmo apmokėjimo suma vedlio žingsnyje */
export function membershipTotalCents(
  planId: MembershipPlanId,
  plateAddOnCents = 0
): number {
  const premiumFirstMonth = planId === "premium" ? PREMIUM_MONTHLY_CENTS : 0;
  return BASE_MEMBERSHIP_CENTS + premiumFirstMonth + plateAddOnCents;
}

export function getMembershipPlan(id: MembershipPlanId): MembershipPlan {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === id) ?? MEMBERSHIP_PLANS[0];
}

export function hasStoredPremiumContent(input: {
  isPremium?: boolean;
  videoUrl?: string | null;
  familyTree?: unknown[] | null;
  mediaGallery?: string[] | null;
}): boolean {
  if (input.isPremium) return false;
  return (
    !!input.videoUrl ||
    (input.familyTree?.length ?? 0) > 0 ||
    (input.mediaGallery?.length ?? 0) > 10
  );
}
