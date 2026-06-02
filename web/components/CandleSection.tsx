"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { findMemorialForCandle, lightCandle } from "@/lib/api";

export function CandleSection() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const found = await findMemorialForCandle(fullName, birthDate, deathDate);
      await lightCandle({
        memorialSlug: found.slug,
        donorName: donorName || "Anonimas",
        amountCents: amount * 100,
      });
      router.push(`/m/${found.slug}?candle=1`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko uždegti žvakutės");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="zvakute" className="ae-section ae-candle-section">
      <div className="ae-candle-card">
        <div className="ae-candle-card__head">
          <span className="ae-candle-icon" aria-hidden>
            🔥
          </span>
          <h2>Uždekite virtualią žvakutę</h2>
          <p>Auka nukeliaus tiesiai į velionio parapiją.</p>
        </div>
        <form className="ae-candle-form" onSubmit={submit}>
          <div className="ae-field">
            <label>Mirusiojo vardas ir pavardė *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="ae-field-row">
            <div className="ae-field">
              <label>Gimimo data *</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
            </div>
            <div className="ae-field">
              <label>Mirties data *</label>
              <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} required />
            </div>
          </div>
          <div className="ae-field">
            <label>Jūsų vardas (kas uždegė)</label>
            <input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Pvz. Marija" />
          </div>
          <div className="ae-field">
            <label>Aukos suma parapijai (€)</label>
            <select value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
              <option value={5}>5 € — tiesiogiai bažnyčiai</option>
              <option value={10}>10 € — tiesiogiai bažnyčiai</option>
              <option value={20}>20 € — tiesiogiai bažnyčiai</option>
            </select>
          </div>
          {err && <p className="ae-error">{err}</p>}
          <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy}>
            {busy ? "Uždegiama…" : "Uždegti žvakutę ir pašventinti"}
          </button>
          <p className="ae-hint">
            Demo: <strong>Stasė</strong>, 1936-05-12 — 2024-12-24
          </p>
        </form>
      </div>
    </section>
  );
}
