/** MVP mokėjimų sluoksnis — production pakeisti Stripe Checkout / Connect */

export {
  CANDLE_SERVICE_FEE_CENTS,
  processCandlePayment,
  type CandlePaymentResult,
} from "./stripe-connect-mock.js";

export const BASE_MEMBERSHIP_CENTS = 3900;
export const PREMIUM_MONTHLY_CENTS = 299;
export const PREMIUM_YEARLY_CENTS = 2500;

export type MembershipPaymentResult = {
  paymentId: string;
  currency: "EUR";
  totalChargedCents: number;
  platformAmountCents: number;
  parishAmountCents: number;
  status: "succeeded";
  message: string;
};

export function processMembershipPayment(input: {
  parishId: string;
  amountCents: number;
}): MembershipPaymentResult {
  const totalChargedCents = Math.max(0, Math.round(input.amountCents));
  return {
    paymentId: `pi_mem_${Date.now().toString(36)}`,
    currency: "EUR",
    totalChargedCents,
    platformAmountCents: totalChargedCents,
    parishAmountCents: 0,
    status: "succeeded",
    message:
      "Mock Stripe: skaitmeninės narystės mokestis — 100% AETERNA platformai (ne parapijai).",
  };
}

export type PremiumSubscriptionResult = {
  paymentId: string;
  currency: "EUR";
  plan: "monthly" | "yearly";
  amountCents: number;
  platformAmountCents: number;
  status: "succeeded";
  message: string;
};

export function processPremiumSubscription(input: {
  memorialSlug: string;
  plan: "monthly" | "yearly";
}): PremiumSubscriptionResult {
  const amountCents =
    input.plan === "yearly" ? PREMIUM_YEARLY_CENTS : PREMIUM_MONTHLY_CENTS;
  return {
    paymentId: `pi_prem_${Date.now().toString(36)}`,
    currency: "EUR",
    plan: input.plan,
    amountCents,
    platformAmountCents: amountCents,
    status: "succeeded",
    message:
      input.plan === "yearly"
        ? "Mock Stripe: Premium narystė 25 €/metus — funkcijos atrakintos."
        : "Mock Stripe: Premium narystė 2,99 €/mėn. — funkcijos atrakintos.",
  };
}
