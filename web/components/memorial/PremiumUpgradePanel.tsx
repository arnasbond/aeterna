"use client";

import { useState } from "react";
import { upgradeMemorialPremium } from "@/lib/api";
import { parishDonationNoteWithAmount } from "@/lib/parish-donation";
import {
  formatPremiumPrice,
  getMembershipPlan,
  hasStoredPremiumContent,
  PREMIUM_DATA_RETENTION_MONTHS,
  PREMIUM_FEATURES,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_RETENTION_NOTE,
  PREMIUM_YEARLY_CENTS,
  premiumRenewalLabel,
  STANDARD_FEATURES,
  type PremiumPlan,
} from "@/lib/premium";

type Props = {
  slug: string;
  isPremium: boolean;
  parishTitle?: string;
  videoUrl?: string | null;
  familyTree?: unknown[] | null;
  mediaGallery?: string[] | null;
  onUpgraded?: () => void;
};

export function PremiumUpgradePanel({
  slug,
  isPremium,
  parishTitle,
  videoUrl,
  familyTree,
  mediaGallery,
  onUpgraded,
}: Props) {
  const [billing, setBilling] = useState<PremiumPlan>("yearly");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const storedPremium = hasStoredPremiumContent({
    isPremium,
    videoUrl,
    familyTree,
    mediaGallery,
  });
  const premiumPlan = getMembershipPlan("premium");
  const upgradeCents = billing === "yearly" ? PREMIUM_YEARLY_CENTS : PREMIUM_MONTHLY_CENTS;

  async function upgrade() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await upgradeMemorialPremium(slug, billing);
      setMsg(res.message);
      onUpgraded?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko aktyvuoti Premium");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="premium" className="ae-card ae-premium-panel ae-membership-admin">
      <div className="ae-membership-admin__head">
        <div>
          <p className="ae-membership-admin__eyebrow">Narystės planas</p>
          <h2 className="chronicle-serif ae-membership-admin__title">
            {isPremium ? "Premium aktyvuota" : storedPremium ? "Premium neaktyvu — duomenys saugomi" : "Pereikite į Premium"}
          </h2>
        </div>
        <span className={`ae-membership-admin__badge${isPremium ? " ae-membership-admin__badge--premium" : ""}`}>
          {isPremium ? "Premium" : "Pagrindinis"}
        </span>
      </div>

      {isPremium ? (
        <>
          <p className="ae-hint" style={{ margin: "0 0 0.75rem" }}>
            Aktyvi Premium prenumerata — visos papildomos funkcijos veikia.
          </p>
          <ul className="ae-membership-plan__features ae-membership-plan__features--plain">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {storedPremium ? (
            <p className="ae-membership-plans__retention ae-membership-plans__retention--highlight">
              Jūsų Premium turinys (galerija, vaizdo įrašas, giminės medis) <strong>išsaugotas</strong>{" "}
              {PREMIUM_DATA_RETENTION_MONTHS} mėn., bet viešai neaktyvus. Atnaujinkite prenumeratą — viskas vėl
              atsivers be papildomo įvedimo.
            </p>
          ) : (
            <p className="ae-hint" style={{ margin: "0 0 1rem" }}>
              Dabar turite <strong>Pagrindinį</strong> planą. Premium — nuo{" "}
              {formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn. arba{" "}
              {formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus.
            </p>
          )}

          <div className="ae-membership-compare">
            <div className="ae-membership-compare__col">
              <p className="ae-membership-compare__label">Dabar — Pagrindinis</p>
              <ul className="ae-membership-plan__features ae-membership-plan__features--plain">
                {STANDARD_FEATURES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="ae-membership-compare__col ae-membership-compare__col--premium">
              <p className="ae-membership-compare__label">{premiumPlan.name}</p>
              <ul className="ae-membership-plan__features ae-membership-plan__features--plain">
                {premiumPlan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <fieldset className="ae-membership-billing">
            <legend>Premium prenumeratos laikotarpis</legend>
            <label className="ae-membership-billing__option">
              <input
                type="radio"
                name="premium-billing-admin"
                value="yearly"
                checked={billing === "yearly"}
                onChange={() => setBilling("yearly")}
              />
              <span>
                <strong>{formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus</strong>
                <span className="ae-membership-billing__badge">Rekomenduojama</span>
              </span>
            </label>
            <label className="ae-membership-billing__option">
              <input
                type="radio"
                name="premium-billing-admin"
                value="monthly"
                checked={billing === "monthly"}
                onChange={() => setBilling("monthly")}
              />
              <span>
                <strong>{formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.</strong>
              </span>
            </label>
          </fieldset>

          <p className="ae-membership-plans__parish-donation">
            {parishDonationNoteWithAmount(upgradeCents, parishTitle)}
          </p>

          <p className="ae-membership-plans__retention">{PREMIUM_RETENTION_NOTE}</p>

          <div className="ae-membership-admin__actions">
            <button type="button" className="ae-btn ae-btn--gold" disabled={busy} onClick={() => void upgrade()}>
              {busy
                ? "Apdorojama…"
                : storedPremium
                  ? `Atnaujinti Premium — ${premiumRenewalLabel(billing)}`
                  : `Aktyvuoti Premium — ${premiumRenewalLabel(billing)}`}
            </button>
          </div>
        </>
      )}

      {err && <p className="ae-error" style={{ marginTop: "0.75rem" }}>{err}</p>}
      {msg && (
        <p className="ae-hint" style={{ marginTop: "0.75rem" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
