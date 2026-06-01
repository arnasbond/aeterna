"use client";

import { useEffect, useState } from "react";
import { bookMass, fetchAvailableMasses, fetchParishes, type MassSlot, type Parish } from "@/lib/api";

function formatSlot(dt: string) {
  const d = new Date(dt);
  return d.toLocaleString("lt-LT", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MassBookingProps = {
  initialParishId?: string;
  lockParish?: boolean;
};

export function MassBookingSection({ initialParishId, lockParish }: MassBookingProps = {}) {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState("");
  const [slots, setSlots] = useState<MassSlot[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [intentions, setIntentions] = useState("");
  const [donorName, setDonorName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchParishes().then((p) => {
      setParishes(p);
      const preferred =
        initialParishId && p.some((x) => x.id === initialParishId) ? initialParishId : p[0]?.id;
      if (preferred) setParishId(preferred);
    });
  }, [initialParishId]);

  useEffect(() => {
    if (!parishId) return;
    fetchAvailableMasses(parishId)
      .then((s) => {
        setSlots(s);
        setSelectedId(s[0]?.id ?? "");
      })
      .catch(() => setSlots([]));
  }, [parishId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await bookMass({ massId: selectedId, intentions, donorName, amountCents: 1500 });
      setMsg("Mišios užsakytos. Klebonas patvirtins intenciją liturgijoje.");
      setIntentions("");
      const next = await fetchAvailableMasses(parishId);
      setSlots(next);
      setSelectedId(next[0]?.id ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Užsakymas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="misios" className="ae-section ae-section--gray">
      <h2 className="ae-section-title">Šv. Mišių užsakymas nuotoliu</h2>
      <p className="ae-section-lead">Pasirinkite klebono patvirtintą laisvą laiką liturgijai.</p>
      <div className="ae-mass-card">
        <form onSubmit={submit}>
          <div className="ae-field">
            <label>Parapija</label>
            <select
              value={parishId}
              onChange={(e) => setParishId(e.target.value)}
              disabled={lockParish}
            >
              {parishes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="ae-field">
            <label>Laisvas laikas</label>
            {slots.length === 0 ? (
              <p className="ae-hint">Šiuo metu nėra laisvų laikų — klebonas gali pridėti skydelyje.</p>
            ) : (
              <div className="ae-mass-slots">
                {slots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`ae-mass-slot${selectedId === s.id ? " ae-mass-slot--on" : ""}`}
                    onClick={() => setSelectedId(s.id)}
                  >
                    {formatSlot(s.dateTime)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ae-field">
            <label>Mišių intencija</label>
            <textarea
              rows={3}
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder="Meldžiamės už a.a. Joną…"
              required
            />
          </div>
          <div className="ae-field">
            <label>Jūsų vardas</label>
            <input value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
          </div>
          {err && <p className="ae-error">{err}</p>}
          {msg && <p className="ae-ok">{msg}</p>}
          <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy || !selectedId}>
            {busy ? "Užsakoma…" : "Užsakyti Mišias ir paaukoti (15 €)"}
          </button>
        </form>
      </div>
    </section>
  );
}
