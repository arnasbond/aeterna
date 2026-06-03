"use client";

import { useEffect, useState } from "react";
import {
  fetchMemorialGuestbook,
  postMemorialGuestbook,
  type GuestbookEntry,
} from "@/lib/api";

export function MemorialGuestbook({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [msgBusy, setMsgBusy] = useState(false);
  const [msgErr, setMsgErr] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState<string | null>(null);

  function reload() {
    fetchMemorialGuestbook(slug).then(setEntries).catch(() => setEntries([]));
  }

  useEffect(() => {
    reload();
  }, [slug]);

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
      {entries.length > 0 ? (
        <section className="ae-candles-list">
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
      ) : (
        <p className="vk-memorial-empty">Dar niekas nepaliko užuojautos. Būkite pirmieji.</p>
      )}

      <form className="vk-memorial-candle-form" onSubmit={submitMessage} style={{ marginTop: "1rem" }}>
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
        <button type="submit" className="ch-btn ch-btn--outline ch-btn--block" disabled={msgBusy}>
          {msgBusy ? "Siunčiama…" : "Siųsti užuojautą"}
        </button>
      </form>
    </div>
  );
}
