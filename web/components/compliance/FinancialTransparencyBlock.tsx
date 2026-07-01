import { formatEurAmount, SERVICE_FEE_EUR } from "@/lib/financial-compliance";

type Props = {
  /** Parapijai skiriama suma (be aptarnavimo mokesčio), € */
  donationAmountEur: number | null;
  donationLabel?: string;
};

/**
 * Aiškus lėšų skaidymas prieš Stripe/Paysera nukreipimą.
 */
export function FinancialTransparencyBlock({
  donationAmountEur,
  donationLabel = "Parapijos auka (Maldos intencija)",
}: Props) {
  const donationReady = donationAmountEur != null && donationAmountEur > 0;

  return (
    <div className="ae-funds-breakdown" role="region" aria-label="Lėšų skaidymas">
      <div className="ae-funds-breakdown__row">
        <div>
          <p className="ae-funds-breakdown__label">{donationLabel}</p>
          <p className="ae-funds-breakdown__sub">
            100% lėšų nukreipiama tiesiai į šios Parapijos banko sąskaitą.
          </p>
        </div>
        <p className="ae-funds-breakdown__amount">{donationReady ? formatEurAmount(donationAmountEur) : "—"}</p>
      </div>
      <div className="ae-funds-breakdown__row">
        <div>
          <p className="ae-funds-breakdown__label">Sistemos aptarnavimo mokestis</p>
          <p className="ae-funds-breakdown__sub">
            Skiriama platformos „Aeterna“ techninei priežiūrai ir serverių išlaikymui.
          </p>
        </div>
        <p className="ae-funds-breakdown__amount">{formatEurAmount(SERVICE_FEE_EUR)}</p>
      </div>
      {donationReady && (
        <p className="ae-funds-breakdown__total">
          Iš viso mokėti: <strong>{formatEurAmount(donationAmountEur + SERVICE_FEE_EUR)}</strong>
        </p>
      )}
    </div>
  );
}
