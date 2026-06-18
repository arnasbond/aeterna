import { MEMORIAL_PACKAGE_CENTS } from "@/lib/qr-plates";

export const BASE_MEMBERSHIP_CENTS = MEMORIAL_PACKAGE_CENTS;
export const PREMIUM_MONTHLY_CENTS = 199;
export const PREMIUM_YEARLY_CENTS = 2500;
export const PREMIUM_DATA_RETENTION_MONTHS = 3;

export type PremiumPlan = "monthly" | "yearly";
export type MembershipPlanId = "standard" | "premium";

export function formatPremiumPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export const PREMIUM_MONTHLY_LABEL = `${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`;
export const PREMIUM_YEARLY_LABEL = `${formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus`;

export const PREMIUM_RETENTION_NOTE =
  `Nutraukus Premium ar neapmokėjus — memorialas lieka Pagrindiniame plane. Įrašyti Premium duomenys (papildomos nuotraukos, vaizdo įrašas, giminės medis) saugomi ${PREMIUM_DATA_RETENTION_MONTHS} mėn. ir vėl aktyvuojami, kai atnaujinsite prenumeratą.`;

export const STANDARD_FEATURES = [
  "Memorialinis puslapis su QR kodu",
  "Iki 10 nuotraukų galerijoje",
  "Virtuali žvakutė ir parama parapijai",
  "Pagrindiniai duomenys saugomi visada — net ir be Premium",
] as const;

export const PREMIUM_FEATURES = [
  "Neribota nuotraukų galerija (daugiau nei 10)",
  "Vaizdo įrašo įkėlimas memorialiniame puslapyje",
  "Giminės medžio skiltis",
  "Automatiniai priminimai apie metines el. paštu",
  "Prenumerata — 1,99 €/mėn. arba 25 €/metus (metinis rekomenduojamas)",
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
    tagline: "Papildomos galimybės su prenumerata",
    features: PREMIUM_FEATURES,
    popular: true,
  },
];

export function premiumAddonCents(billing: PremiumPlan = "yearly"): number {
  return billing === "yearly" ? PREMIUM_YEARLY_CENTS : PREMIUM_MONTHLY_CENTS;
}

export function premiumAddonLabel(billing: PremiumPlan = "yearly"): string {
  return billing === "yearly" ? PREMIUM_YEARLY_LABEL : PREMIUM_MONTHLY_LABEL;
}

export function premiumRenewalLabel(billing: PremiumPlan): string {
  return billing === "yearly" ? PREMIUM_YEARLY_LABEL : PREMIUM_MONTHLY_LABEL;
}

/** Pirmo apmokėjimo suma vedlio žingsnyje */
export function membershipTotalCents(
  planId: MembershipPlanId,
  plateAddOnCents = 0,
  premiumBilling: PremiumPlan = "yearly"
): number {
  const premiumFirst = planId === "premium" ? premiumAddonCents(premiumBilling) : 0;
  return BASE_MEMBERSHIP_CENTS + premiumFirst + plateAddOnCents;
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
