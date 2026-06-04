"use client";

export const DONATION_PRESET_EUR = [10, 15, 20, 25] as const;
export const DONATION_MIN_EUR = 5;
export const DONATION_MAX_EUR = 500;

export function donationAmountCents(
  presetEur: number,
  customMode: boolean,
  customInput: string
): number | null {
  if (customMode) {
    const n = parseFloat(customInput.replace(",", "."));
    if (!Number.isFinite(n)) return null;
    const rounded = Math.round(n * 100) / 100;
    if (rounded < DONATION_MIN_EUR || rounded > DONATION_MAX_EUR) return null;
    return Math.round(rounded * 100);
  }
  return Math.round(presetEur * 100);
}

type Props = {
  presetEur: number;
  customMode: boolean;
  customInput: string;
  onPreset: (eur: number) => void;
  onCustomMode: () => void;
  onCustomInput: (value: string) => void;
  label?: string;
  className?: string;
};

export function DonationAmountPicker({
  presetEur,
  customMode,
  customInput,
  onPreset,
  onCustomMode,
  onCustomInput,
  label = "Aukos suma",
  className = "",
}: Props) {
  return (
    <div className={className}>
      <p className="ch-sheet__label" style={{ margin: "0 0 0.5rem" }}>
        {label}
      </p>
      <div className="ch-amount-pills" role="group" aria-label={label}>
        {DONATION_PRESET_EUR.map((a) => (
          <button
            key={a}
            type="button"
            className={`ch-amount-pill${!customMode && presetEur === a ? " ch-amount-pill--active" : ""}`}
            aria-pressed={!customMode && presetEur === a}
            onClick={() => onPreset(a)}
          >
            {a} €
          </button>
        ))}
        <button
          type="button"
          className={`ch-amount-pill ch-amount-pill--custom${customMode ? " ch-amount-pill--active" : ""}`}
          aria-pressed={customMode}
          onClick={onCustomMode}
        >
          Kita suma
        </button>
      </div>
      {customMode && (
        <div className="ae-field" style={{ marginTop: "0.75rem" }}>
          <label htmlFor="donation-custom-eur">Jūsų suma (€)</label>
          <input
            id="donation-custom-eur"
            type="number"
            inputMode="decimal"
            min={DONATION_MIN_EUR}
            max={DONATION_MAX_EUR}
            step="0.01"
            value={customInput}
            onChange={(e) => onCustomInput(e.target.value)}
            placeholder={`Pvz. 30 (nuo ${DONATION_MIN_EUR} €)`}
            required
          />
        </div>
      )}
    </div>
  );
}
