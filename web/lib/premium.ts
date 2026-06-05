export const PREMIUM_MONTHLY_CENTS = 299;
export const PREMIUM_YEARLY_CENTS = 2500;

export type PremiumPlan = "monthly" | "yearly";

export function formatPremiumPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export const PREMIUM_FEATURES = [
  "Neribota nuotraukų galerija (daugiau nei 10)",
  "Vaizdo įrašo įkėlimas memorialiniame puslapyje",
  "Giminės medžio skiltis",
  "Automatiniai priminimai apie metines el. paštu",
] as const;
