"use client";

import { useEffect, useState } from "react";
import {
  fetchMemorialCandles,
  fetchMemorialGuestbook,
  formatEuro,
  lightCandle,
  postMemorialGuestbook,
  type GuestbookEntry,
  type VirtualCandle,
} from "@/lib/api";

export function MemorialGuestbook({ slug }: { slug: string }) {
  const [candles, setCandles] = useState<VirtualCandle[]>([]);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState(10);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgBusy, setMsgBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [msgOk, setMsgOk] = useState<string | null>(null);

  function reload() {
    fetchMemorialCandles(slug).then(setCandles).catch(() => setCandles([]));
    fetchMemorialGuestbook(slug).then(setEntries).catch(() => setEntries([]));
  }

  useEffect(() => {
    reload();
  }, [slug]);

  async function submitCandle(e: React.FormEvent) {
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

  async function submitMessage(e: React.FormEvent) {
    e.preventDefault();
    setMsgBusy(true);
    setMsgErr(null);
    setMsgOk(null);
    try {
      const res = await postMemorialGuestbook(slug, {
        authorName: authorName.trim() || "Anonimas",
        message: message.trim(),
      });
      setMessage("");
      setMsgOk(res.message);
      reload();
    } catch (e) {
      setMsgErr(e instanceof Error ? e.message : "Nepavyko išsaugoti");
    } finally {
      setMsgBusy(false);
    }
  }

  return (
    <div className="vk-memorial-guestbook">
      {entries.length > 0 && (
        <section className="ae-candles-list" style={{ marginBottom: "1.25rem" }}>
          <h2 className="ae-candles-list__title">Užuojautos</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {entries.map((e) => (
              <li key={e.id} className="ae-candle-item" style={{ alignItems: "flex-start" }}>
                <span aria-hidden style={{ marginTop: "0.15rem" }}>
                  💐
                </span>
                <div>
                  <strong>{e.authorName}</strong>
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.92rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {e.message}
                  </p>
                  <span className="ae-candle-item__meta">{new Date(e.createdAt).toLocaleString("lt-LT")}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                    {new Date(c.litAt).toLocaleString("lt-LT")} · {formatEuro(c.donationAmountCents)} parapijai
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : entries.length === 0 ? (
        <p className="vk-memorial-empty">Dar niekas nepaliko užuojautos. Būkite pirmieji.</p>
      ) : null}

      <form className="vk-memorial-candle-form" onSubmit={submitMessage} style={{ marginTop: "1.5rem" }}>
        <h3>Palikite užuojautą</h3>
        <p>Žinutė bus rodoma po šeimos patvirtinimo.</p>
        <div className="ae-field">
          <label htmlFor="vk-guest-name">Jūsų vardas</label>
          <input
            id="vk-guest-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Pvz. Marija"
          />
        </div>
        <div className="ae-field">
          <label htmlFor="vk-guest-msg">Užuojauta</label>
          <textarea
            id="vk-guest-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Kelios šiltos eilutės artimiesiems…"
            rows={4}
            required
            minLength={3}
          />
        </div>
        {msgErr && <p className="ae-error">{msgErr}</p>}
        {msgOk && <p style={{ color: "#166534", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{msgOk}</p>}
        <button type="submit" className="ae-btn ae-btn--outline" disabled={msgBusy}>
          {msgBusy ? "Siunčiama…" : "Siųsti užuojautą"}
        </button>
      </form>

      <form className="vk-memorial-candle-form" onSubmit={submitCandle} style={{ marginTop: "1.5rem" }}>
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
