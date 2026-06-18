"use client";

import { useState } from "react";
import { upgradeMemorialPremium } from "@/lib/api";
import {
  formatPremiumPrice,
  getMembershipPlan,
  hasStoredPremiumContent,
  PREMIUM_FEATURES,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_RETENTION_NOTE,
  PREMIUM_SUBSCRIPTION_LABEL,
  STANDARD_FEATURES,
} from "@/lib/premium";

type Props = {
  slug: string;
  isPremium: boolean;
  videoUrl?: string | null;
  familyTree?: unknown[] | null;
  mediaGallery?: string[] | null;
  onUpgraded?: () => void;
};

export function PremiumUpgradePanel({
  slug,
  isPremium,
  videoUrl,
  familyTree,
  mediaGallery,
  onUpgraded,
}: Props) {
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

  async function upgrade() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await upgradeMemorialPremium(slug, "monthly");
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
            Aktyvi Premium prenumerata ({PREMIUM_SUBSCRIPTION_LABEL}) — visos papildomos funkcijos veikia.
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
              Jūsų Premium turinys (galerija, vaizdo įrašas, giminės medis) <strong>išsaugotas</strong>, bet
              viešai neaktyvus. Atnaujinkite prenumeratą — viskas vėl atsivers be papildomo įvedimo.
            </p>
          ) : (
            <p className="ae-hint" style={{ margin: "0 0 1rem" }}>
              Dabar turite <strong>Pagrindinį</strong> planą. Premium — tik {PREMIUM_SUBSCRIPTION_LABEL}.
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

          <p className="ae-membership-plans__retention">{PREMIUM_RETENTION_NOTE}</p>

          <div className="ae-membership-admin__actions">
            <button type="button" className="ae-btn ae-btn--gold" disabled={busy} onClick={() => void upgrade()}>
              {busy
                ? "Apdorojama…"
                : storedPremium
                  ? `Atnaujinti Premium — ${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`
                  : `Aktyvuoti Premium — ${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`}
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
