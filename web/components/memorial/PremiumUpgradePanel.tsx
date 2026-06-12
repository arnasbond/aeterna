"use client";

import { useState } from "react";
import { upgradeMemorialPremium } from "@/lib/api";
import {
  formatPremiumPrice,
  PREMIUM_FEATURES,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_YEARLY_CENTS,
  type PremiumPlan,
} from "@/lib/premium";
import { GLASS_CARD } from "@/lib/glass-card";

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

  return (
    <div id="premium" className={`ae-card ae-premium-panel ${GLASS_CARD}`} style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
      <h2 className="chronicle-serif text-stone-900" style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
        Premium narystė
      </h2>
      {isPremium ? (
        <>
          <p className="ae-hint text-[#0F2519]" style={{ margin: 0 }}>
            ✓ Aktyvuota — visi Premium privalumai pasiekiami šiam memorialui.
          </p>
          <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1.1rem", lineHeight: 1.65, color: "var(--ae-muted)" }}>
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="ae-hint" style={{ margin: "0 0 0.75rem" }}>
            Atrakinkite papildomas funkcijas šiam memorialui — vienkartinis mokėjimas (MVP simuliacija).
          </p>
          <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", lineHeight: 1.65, color: "var(--ae-muted)" }}>
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              disabled={!!busy}
              onClick={() => void upgrade("monthly")}
            >
              {busy === "monthly" ? "Apdorojama…" : `${formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.`}
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--outline"
              disabled={!!busy}
              onClick={() => void upgrade("yearly")}
            >
              {busy === "yearly" ? "Apdorojama…" : `${formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus`}
            </button>
          </div>
        </>
      )}
      {err && <p className="ae-error" style={{ marginTop: "0.75rem" }}>{err}</p>}
      {msg && (
        <p className="ae-hint text-[#0F2519]" style={{ marginTop: "0.75rem" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
