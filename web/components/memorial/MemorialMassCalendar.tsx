"use client";

import { useEffect, useState } from "react";
import {
  DonationAmountPicker,
  donationAmountCents,
  DONATION_MIN_EUR,
} from "@/components/DonationAmountPicker";
import { RequestMassSlotsButton } from "@/components/mass/RequestMassSlotsButton";
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
  parishTitle?: string;
  deceasedName: string;
};

export function MemorialMassCalendar({ parishId, parishTitle, deceasedName }: Props) {
  const [slots, setSlots] = useState<MassSlot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [intentions, setIntentions] = useState("");
  const [donorName, setDonorName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [amountEur, setAmountEur] = useState(15);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    if (!parishId) return;
    fetchAvailableMasses(parishId)
      .then((s) => setSlots(s))
      .catch(() => setSlots([]));
  }, [parishId]);

  const selected = slots.find((s) => s.id === selectedId);

  const amountCents = donationAmountCents(amountEur, customMode, customInput);
  const amountLabel =
    amountCents != null ? `${(amountCents / 100).toFixed(2).replace(/\.00$/, "")} €` : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setErr("Pasirinkite laisvą laiką.");
      return;
    }
    if (amountCents == null) {
      setErr(`Pasirinkite sumą nuo ${DONATION_MIN_EUR} €.`);
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await bookMass({
        massId: selectedId,
        intentions: intentions || `Už ${deceasedName}`,
        donorName,
        amountCents,
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
        <div style={{ marginBottom: "1rem" }}>
          <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
            Šiuo metu nėra laisvų laikų. Paspauskite — kunigas gaus pranešimą ir galės pridėti laikus.
          </p>
          <RequestMassSlotsButton parishId={parishId} parishTitle={parishTitle} source="memorial" />
        </div>
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
          <DonationAmountPicker
            presetEur={amountEur}
            customMode={customMode}
            customInput={customInput}
            onPreset={(a) => {
              setCustomMode(false);
              setCustomInput("");
              setAmountEur(a);
              setErr(null);
            }}
            onCustomMode={() => {
              setCustomMode(true);
              setErr(null);
            }}
            onCustomInput={setCustomInput}
            label="Auka už Šv. Mišias (€)"
          />
          <p className="ch-fee-note">Mokėjimas (mock) — visa suma skiriama parapijos sąskaitai.</p>
          {err && <p className="ae-error">{err}</p>}
          {msg && <p className="ae-hint" style={{ color: "var(--ch-emerald)" }}>{msg}</p>}
          <button type="submit" className="ch-btn ch-btn--primary ch-btn--block" disabled={busy}>
            {busy
              ? "Užsakoma…"
              : amountLabel
                ? `Užsakyti ir paaukoti (${amountLabel})`
                : "Pasirinkite sumą"}
          </button>
        </form>
      )}
    </section>
  );
}
