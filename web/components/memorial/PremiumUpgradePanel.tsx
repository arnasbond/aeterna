"use client";

import { useState } from "react";
import { upgradeMemorialPremium } from "@/lib/api";
import {
  formatPremiumPrice,
  getMembershipPlan,
  PREMIUM_FEATURES,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_YEARLY_CENTS,
  STANDARD_FEATURES,
  type PremiumPlan,
} from "@/lib/premium";

type Props = {
  slug: string;
  isPremium: boolean;
  onUpgraded?: () => void;
};

export function PremiumUpgradePanel({ slug, isPremium, onUpgraded }: Props) {
  const [busy, setBusy] = useState<PremiumPlan | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function upgrade(plan: PremiumPlan) {
    setBusy(plan);
    setErr(null);
    setMsg(null);
    try {
      const res = await upgradeMemorialPremium(slug, plan);
      setMsg(res.message);
      onUpgraded?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko aktyvuoti Premium");
    } finally {
      setBusy(null);
    }
  }

  const premiumPlan = getMembershipPlan("premium");

  return (
    <div id="premium" className="ae-card ae-premium-panel ae-membership-admin">
      <div className="ae-membership-admin__head">
        <div>
          <p className="ae-membership-admin__eyebrow">Narystės planas</p>
          <h2 className="chronicle-serif ae-membership-admin__title">
            {isPremium ? "Premium aktyvuota" : "Pereikite į Premium"}
          </h2>
        </div>
        <span className={`ae-membership-admin__badge${isPremium ? " ae-membership-admin__badge--premium" : ""}`}>
          {isPremium ? "Premium" : "Pagrindinis"}
        </span>
      </div>

      {isPremium ? (
        <>
          <p className="ae-hint" style={{ margin: "0 0 0.75rem" }}>
            Visi Premium privalumai pasiekiami šiam memorialui — galerija, vaizdo įrašas, giminės medis ir metinių
            priminimai.
          </p>
          <ul className="ae-membership-plan__features ae-membership-plan__features--plain">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="ae-hint" style={{ margin: "0 0 1rem" }}>
            Dabar turite <strong>Pagrindinį</strong> planą. Atnaujinkite bet kada — atrakinkite giminės medį, vaizdo
            įrašą ir neribotą galeriją.
          </p>

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

          <div className="ae-membership-admin__actions">
            <button
              type="button"
              className="ae-btn ae-btn--gold"
              disabled={!!busy}
              onClick={() => void upgrade("yearly")}
            >
              {busy === "yearly" ? "Apdorojama…" : `Premium ${formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus`}
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--outline"
              disabled={!!busy}
              onClick={() => void upgrade("monthly")}
            >
              {busy === "monthly" ? "Apdorojama…" : `Premium ${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`}
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
