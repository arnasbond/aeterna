"use client";

import { useEffect, useState } from "react";
import {
  fetchMemorialCandles,
  formatEuro,
  lightCandle,
  type VirtualCandle,
} from "@/lib/api";

export function MemorialGuestbook({ slug }: { slug: string }) {
  const [candles, setCandles] = useState<VirtualCandle[]>([]);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function reload() {
    fetchMemorialCandles(slug).then(setCandles).catch(() => setCandles([]));
  }

  useEffect(() => {
    reload();
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      await lightCandle({
        memorialSlug: slug,
        donorName: donorName.trim() || "Anonimas",
        amountCents: amount * 100,
      });
      setDonorName("");
      setOk(true);
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko uždegti žvakutės");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vk-memorial-guestbook">
      {candles.length > 0 ? (
        <section className="ae-candles-list">
          <h2 className="ae-candles-list__title">Degančios žvakutės</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {candles.map((c) => (
              <li key={c.id} className="ae-candle-item">
                <span className="ae-candle-item__flame" aria-hidden>
                  🕯️
                </span>
                <div>
                  <strong>{c.donorName}</strong> uždegė žvakutę
                  <br />
                  <span className="ae-candle-item__meta">
                    {new Date(c.litAt).toLocaleString("lt-LT")} · {formatEuro(c.donationAmountCents)}{" "}
                    parapijai
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="vk-memorial-empty">Dar niekas neuždegė žvakutės. Būkite pirmieji.</p>
      )}

      <form className="vk-memorial-candle-form" onSubmit={submit}>
        <h3>Uždekite virtualią žvakutę</h3>
        <p>Auka nukeliaus į šio memorialo parapiją.</p>
        <div className="ae-field">
          <label htmlFor="vk-candle-name">Jūsų vardas</label>
          <input
            id="vk-candle-name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Pvz. Marija"
          />
        </div>
        <div className="ae-field">
          <label htmlFor="vk-candle-amount">Aukos suma (€)</label>
          <select id="vk-candle-amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
            <option value={5}>5 €</option>
            <option value={10}>10 €</option>
            <option value={20}>20 €</option>
          </select>
        </div>
        {err && <p className="ae-error">{err}</p>}
        {ok && <p style={{ color: "#166534", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>Žvakutė uždegta. Ačiū.</p>}
        <button type="submit" className="ae-btn" disabled={busy}>
          {busy ? "Uždegiama…" : "Uždegti žvakutę"}
        </button>
      </form>
    </div>
  );
}
