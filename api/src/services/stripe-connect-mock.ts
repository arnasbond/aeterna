/** MVP Stripe Connect — simuliuoja split mokėjimą į parapiją + platformos mokestį */

export const CANDLE_SERVICE_FEE_CENTS = 50;

export type CandlePaymentResult = {
  paymentId: string;
  currency: "EUR";
  donationCents: number;
  serviceFeeCents: number;
  totalChargedCents: number;
  parishAmountCents: number;
  platformAmountCents: number;
  stripeConnectAccountId: string;
  status: "succeeded";
  message: string;
};

export function processCandlePayment(input: {
  parishId: string;
  donationCents: number;
}): CandlePaymentResult {
  const donationCents = Math.max(0, Math.round(input.donationCents));
  const serviceFeeCents = CANDLE_SERVICE_FEE_CENTS;
  const totalChargedCents = donationCents + serviceFeeCents;
  const paymentId = `pi_mock_${Date.now().toString(36)}`;

  return {
    paymentId,
    currency: "EUR",
    donationCents,
    serviceFeeCents,
    totalChargedCents,
    parishAmountCents: donationCents,
    platformAmountCents: serviceFeeCents,
    stripeConnectAccountId: `acct_mock_${input.parishId.replace(/[^a-z0-9]/gi, "").slice(0, 24)}`,
    status: "succeeded",
    message:
      "Mock Stripe Connect: 100% aukos pervedama į parapijos Connect sąskaitą; platformos priežiūros mokestis atskiras.",
  };
}
