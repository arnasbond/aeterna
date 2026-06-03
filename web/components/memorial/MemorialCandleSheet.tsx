"use client";

import { useEffect, useState } from "react";
import { lightCandle } from "@/lib/api";

const AMOUNTS = [5, 10, 20] as const;
const SERVICE_FEE_EUR = 0.5;

type Props = {
  slug: string;
  parishTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function MemorialCandleSheet({ slug, parishTitle, open, onClose, onSuccess }: Props) {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState<number>(10);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const total = amount + SERVICE_FEE_EUR;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await lightCandle({
        memorialSlug: slug,
        donorName: donorName.trim() || "Anonimas",
        amountCents: amount * 100,
      });
      onSuccess();
      onClose();
      window.location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Mokėjimas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ch-sheet-backdrop" role="presentation" onClick={onClose}>
      <div className="ch-sheet" role="dialog" aria-modal aria-labelledby="candle-sheet-title" onClick={(e) => e.stopPropagation()}>
        <div className="ch-sheet__handle" aria-hidden />
        <h3 id="candle-sheet-title" className="chronicle-serif">
          Uždegti atminimo žvakutę
        </h3>
        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ch-muted)" }}>
          100% aukos ({amount} €) — tiesiai į <strong>{parishTitle}</strong> sąskaitą. Platformos priežiūra +{SERVICE_FEE_EUR.toFixed(2)} €.
        </p>

        <form onSubmit={submit} style={{ marginTop: "1rem" }}>
          <div className="ae-field">
            <label>Jūsų vardas</label>
            <input
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Kas uždegė žvakutę"
              required
            />
          </div>

          <p style={{ fontSize: "0.85rem", fontWeight: 600, margin: "0.75rem 0 0.35rem" }}>Aukos suma</p>
          <div className="ch-amount-pills">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                className={`ch-amount-pill${amount === a ? " ch-amount-pill--active" : ""}`}
                onClick={() => setAmount(a)}
              >
                {a} €
              </button>
            ))}
          </div>

          <p className="ch-fee-note">
            Iš viso mokėti: <strong>{total.toFixed(2)} €</strong> (mock Stripe Connect — parapijai {amount} €, platformai{" "}
            {SERVICE_FEE_EUR.toFixed(2)} €)
          </p>

          {err && <p className="ae-error">{err}</p>}

          <button type="submit" className="ch-btn ch-btn--primary ch-btn--block" disabled={busy}>
            {busy ? "Apdorojama…" : `🕯️ Uždegti ir paaukoti ${total.toFixed(2)} €`}
          </button>
          <button type="button" className="ch-btn ch-btn--outline ch-btn--block" style={{ marginTop: "0.5rem" }} onClick={onClose}>
            Atšaukti
          </button>
        </form>
      </div>
    </div>
  );
}
