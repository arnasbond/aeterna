/** Stripe Premium subscriptions + webhook handling */

import Stripe from "stripe";
import { config } from "../config.js";

export {
  CANDLE_SERVICE_FEE_CENTS,
  processCandlePayment,
  type CandlePaymentResult,
} from "./stripe-connect-mock.js";

export const BASE_MEMBERSHIP_CENTS = 3900;
export const PREMIUM_MONTHLY_CENTS = 199;
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
  const parishAmountCents = Math.round((totalChargedCents * 20) / 100);
  const platformAmountCents = totalChargedCents - parishAmountCents;
  return {
    paymentId: `pi_mem_${Date.now().toString(36)}`,
    currency: "EUR",
    totalChargedCents,
    platformAmountCents,
    parishAmountCents,
    status: "succeeded",
    message: `Mock Stripe: apmokėta ${(totalChargedCents / 100).toFixed(2)} € — ${(parishAmountCents / 100).toFixed(2)} € (20 %) auka parapijai, ${(platformAmountCents / 100).toFixed(2)} € platformai.`,
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
  const parishAmountCents = Math.round((amountCents * 20) / 100);
  const platformAmountCents = amountCents - parishAmountCents;
  return {
    paymentId: `pi_prem_${Date.now().toString(36)}`,
    currency: "EUR",
    plan: input.plan,
    amountCents,
    platformAmountCents,
    status: "succeeded",
    message:
      input.plan === "yearly"
        ? `Mock Stripe: Premium 25 €/metus — ${(parishAmountCents / 100).toFixed(2)} € (20 %) auka parapijai, funkcijos atrakintos.`
        : `Mock Stripe: Premium 1,99 €/mėn. — ${(parishAmountCents / 100).toFixed(2)} € (20 %) auka parapijai, funkcijos atrakintos.`,
  };
}

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!config.stripeSecretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey);
  }
  return stripeClient;
}

/** Verify Stripe-Signature and parse webhook payload (requires raw request body). */
export function constructVerifiedStripeEvent(rawBody: Buffer, signature: string): Stripe.Event {
  const secret = config.stripeWebhookSecret;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
