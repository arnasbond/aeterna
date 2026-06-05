"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lightCandle } from "@/lib/api";

const PRESET_AMOUNTS = [5, 10, 20] as const;
const SERVICE_FEE_EUR = 0.5;
const MIN_CUSTOM = 1;
const MAX_CUSTOM = 5000;

type Props = {
  slug: string;
  parishTitle: string;
  isPremium?: boolean;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function MemorialCandleSheet({ slug, parishTitle, isPremium, open, onClose, onSuccess }: Props) {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState<number>(10);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");
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

  const customAmount = customMode ? parseFloat(customInput.replace(",", ".")) : NaN;
  const effectiveAmount = customMode
    ? Number.isFinite(customAmount)
      ? Math.round(customAmount * 100) / 100
      : 0
    : amount;
  const total = effectiveAmount + SERVICE_FEE_EUR;
  const canSubmit =
    effectiveAmount >= MIN_CUSTOM &&
    effectiveAmount <= MAX_CUSTOM &&
    (!customMode || customInput.trim().length > 0);

  function selectPreset(value: number) {
    setCustomMode(false);
    setCustomInput("");
    setAmount(value);
    setErr(null);
  }

  function selectCustom() {
    setCustomMode(true);
    setErr(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setErr(`Įveskite sumą nuo ${MIN_CUSTOM} iki ${MAX_CUSTOM} €`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await lightCandle({
        memorialSlug: slug,
        donorName: donorName.trim() || "Anonimas",
        amountCents: Math.round(effectiveAmount * 100),
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
        <p className="ch-sheet__lead">
          Auka keliauja tiesiai į <strong>{parishTitle}</strong> parapiją.
        </p>

        <form onSubmit={submit} className="ch-sheet__form">
          <div className="ae-field">
            <label>Jūsų vardas</label>
            <input
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Kas uždegė žvakutę"
              required
            />
          </div>

          <p className="ch-sheet__label">Aukos suma</p>
          <div className="ch-amount-pills" role="group" aria-label="Aukos suma eurais">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                className={`ch-amount-pill${!customMode && amount === a ? " ch-amount-pill--active" : ""}`}
                aria-pressed={!customMode && amount === a}
                onClick={() => selectPreset(a)}
              >
                {a} €
              </button>
            ))}
            <button
              type="button"
              className={`ch-amount-pill ch-amount-pill--custom${customMode ? " ch-amount-pill--active" : ""}`}
              aria-pressed={customMode}
              onClick={selectCustom}
            >
              Kita suma
            </button>
          </div>

          {customMode && (
            <div className="ae-field ch-sheet__custom-field">
              <label htmlFor="candle-custom-amount">Jūsų suma (€)</label>
              <input
                id="candle-custom-amount"
                type="number"
                inputMode="decimal"
                min={MIN_CUSTOM}
                max={MAX_CUSTOM}
                step="0.01"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Pvz. 50 arba 100"
                autoFocus
                required
              />
            </div>
          )}

          <p className="ch-fee-disclaimer">
            <em>
              Papildomai taikomas 0.50 € sistemos aptarnavimo mokestis. 100% pasirinktos aukos keliauja tiesiai į
              parapijos sąskaitą.
            </em>
          </p>

          <p className="ch-fee-note">
            Iš viso mokėti: <strong>{canSubmit ? total.toFixed(2) : "—"} €</strong>
            {canSubmit && (
              <>
                {" "}
                (auka {effectiveAmount.toFixed(2)} € + aptarnavimas {SERVICE_FEE_EUR.toFixed(2)} €)
              </>
            )}
          </p>

          {err && <p className="ae-error">{err}</p>}

          <button type="submit" className="ch-btn ch-btn--primary ch-btn--block" disabled={busy || !canSubmit}>
            {busy ? "Apdorojama…" : canSubmit ? `🕯️ Uždegti ir paaukoti ${total.toFixed(2)} €` : "Pasirinkite sumą"}
          </button>
          <button type="button" className="ch-btn ch-btn--outline ch-btn--block ch-sheet__cancel" onClick={onClose}>
            Atšaukti
          </button>
        </form>

        {!isPremium && (
          <div style={{ marginTop: "1rem" }}>
            <p className="ch-sheet__lead" style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>
              Premium narystės privalumai (atrakinti)
            </p>
            <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.1rem", color: "var(--ch-muted)", lineHeight: 1.65 }}>
              <li>Neribota media galerija (daugiau nei 10 nuotraukų + kontroliuojamas video)</li>
              <li>Giminės medžio skiltis</li>
              <li>Automatiniai priminimai apie metines</li>
            </ul>
            <Link href={`/paskyra/atmintis/${slug}#premium`} className="ch-btn ch-btn--outline ch-btn--block">
              Atnaujinti į Premium
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
