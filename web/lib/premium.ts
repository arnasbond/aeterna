import { MEMORIAL_PACKAGE_CENTS } from "@/lib/qr-plates";

export const BASE_MEMBERSHIP_CENTS = MEMORIAL_PACKAGE_CENTS;
export const PREMIUM_MONTHLY_CENTS = 299;
export const PREMIUM_YEARLY_CENTS = 2500;

export type PremiumPlan = "monthly" | "yearly";
export type MembershipPlanId = "standard" | "premium";

export function formatPremiumPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export const STANDARD_FEATURES = [
  "Memorialinis puslapis su QR kodu",
  "Iki 10 nuotraukų galerijoje",
  "Virtuali žvakutė ir parama parapijai",
] as const;

export const PREMIUM_FEATURES = [
  "Neribota nuotraukų galerija (daugiau nei 10)",
  "Vaizdo įrašo įkėlimas memorialiniame puslapyje",
  "Giminės medžio skiltis",
  "Automatiniai priminimai apie metines el. paštu",
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
    tagline: "Esminė skaitmeninė atmintis",
    features: STANDARD_FEATURES,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Pilnas memorialas su gimine",
    features: PREMIUM_FEATURES,
    popular: true,
  },
];

export function premiumAddonCents(billing: PremiumPlan): number {
  return billing === "yearly" ? PREMIUM_YEARLY_CENTS : PREMIUM_MONTHLY_CENTS;
}

export function premiumAddonLabel(billing: PremiumPlan): string {
  return billing === "yearly"
    ? `${formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus`
    : `${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`;
}

export function membershipTotalCents(
  planId: MembershipPlanId,
  premiumBilling: PremiumPlan,
  plateAddOnCents = 0
): number {
  const premiumAddon = planId === "premium" ? premiumAddonCents(premiumBilling) : 0;
  return BASE_MEMBERSHIP_CENTS + premiumAddon + plateAddOnCents;
}

export function getMembershipPlan(id: MembershipPlanId): MembershipPlan {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === id) ?? MEMBERSHIP_PLANS[0];
}
