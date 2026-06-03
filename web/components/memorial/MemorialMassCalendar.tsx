"use client";

import { useEffect, useState } from "react";
import { bookMass, fetchAvailableMasses, type MassSlot } from "@/lib/api";

function formatSlot(dt: string) {
  return new Date(dt).toLocaleString("lt-LT", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  parishId: string;
  deceasedName: string;
};

export function MemorialMassCalendar({ parishId, deceasedName }: Props) {
  const [slots, setSlots] = useState<MassSlot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [intentions, setIntentions] = useState("");
  const [donorName, setDonorName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!parishId) return;
    fetchAvailableMasses(parishId)
      .then((s) => setSlots(s))
      .catch(() => setSlots([]));
  }, [parishId]);

  const selected = slots.find((s) => s.id === selectedId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await bookMass({
        massId: selectedId,
        intentions: intentions || `Už ${deceasedName}`,
        donorName,
        amountCents: 1500,
      });
      setMsg("Mišios užsakytos. Laikas pažymėtas kaip užimtas — laukiama patvirtinimo.");
      setShowForm(false);
      const next = await fetchAvailableMasses(parishId);
      setSlots(next);
      setSelectedId(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Užsakymas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ch-mass-book" aria-label="Šv. Mišių kalendorius">
      <h3 className="chronicle-serif" style={{ fontSize: "1.1rem", margin: "0 0 0.5rem" }}>
        Laisvi Šv. Mišių laikai
      </h3>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", color: "var(--ch-muted)" }}>
        Žalia — laisva, pilka — užimta. Pasirinkite laiką ir užpildykite intenciją.
      </p>

      {slots.length === 0 ? (
        <p className="ae-hint">Šiuo metu nėra laisvų laikų — parapijos administratorius gali atidaryti skydelyje.</p>
      ) : (
        <div className="ch-mass-grid">
          {slots.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`ch-mass-slot ch-mass-slot--free${selectedId === s.id ? " ch-mass-slot--selected" : ""}`}
              onClick={() => {
                setSelectedId(s.id);
                setShowForm(true);
              }}
            >
              {formatSlot(s.dateTime)}
            </button>
          ))}
        </div>
      )}

      <div className="ch-mass-grid" style={{ marginTop: "0.5rem", opacity: 0.5 }} aria-hidden>
        {["09:00", "11:00", "18:00"].map((t) => (
          <div key={t} className="ch-mass-slot ch-mass-slot--busy">
            {t}
            <br />
            užimta
          </div>
        ))}
      </div>

      {showForm && selected && (
        <form onSubmit={submit} className="ch-mass-book-form">
          <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>{formatSlot(selected.dateTime)}</p>
          <div className="ae-field">
            <label>Maldos prašymas / intencija</label>
            <textarea
              rows={3}
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder={`Už ${deceasedName}…`}
              required
            />
          </div>
          <div className="ae-field">
            <label>Jūsų vardas</label>
            <input value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
          </div>
          <p className="ch-fee-note">Mokėjimas (mock) — 15 € tiesiai parapijos sąskaitai.</p>
          {err && <p className="ae-error">{err}</p>}
          {msg && <p className="ae-hint" style={{ color: "var(--ch-emerald)" }}>{msg}</p>}
          <button type="submit" className="ch-btn ch-btn--primary ch-btn--block" disabled={busy}>
            {busy ? "Užsakoma…" : "Užsakyti ir apmokėti"}
          </button>
        </form>
      )}
    </section>
  );
}
