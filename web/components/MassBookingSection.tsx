"use client";

import { useEffect, useState } from "react";
import {
  DonationAmountPicker,
  donationAmountCents,
  DONATION_MIN_EUR,
} from "@/components/DonationAmountPicker";
import { RequestMassSlotsButton } from "@/components/mass/RequestMassSlotsButton";
import { bookMass, fetchAvailableMasses, fetchParishes, type MassSlot, type Parish } from "@/lib/api";

const SERVICE_FEE_EUR = 0.5;

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
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [amountEur, setAmountEur] = useState(15);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

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
    setSlotsLoading(true);
    setErr(null);
    fetchAvailableMasses(parishId)
      .then((s) => {
        setSlots(s);
        setSelectedId(s[0]?.id ?? "");
      })
      .catch(() => {
        setSlots([]);
        setSelectedId("");
        setErr("Nepavyko įkelti laikų. Patikrinkite, ar veikia serveriai (API).");
      })
      .finally(() => setSlotsLoading(false));
  }, [parishId]);

  const parishTitle = parishes.find((p) => p.id === parishId)?.title;
  const amountCents = donationAmountCents(amountEur, customMode, customInput);
  const amountLabel =
    amountCents != null ? `${(amountCents / 100).toFixed(2).replace(/\.00$/, "")} €` : null;
  const totalCents = amountCents != null ? amountCents + SERVICE_FEE_EUR * 100 : null;
  const totalLabel =
    totalCents != null ? `${(totalCents / 100).toFixed(2).replace(/\.00$/, "")} €` : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) {
      setErr("Pasirinkite laisvą laiką iš sąrašo (arba paprašykite kunigo pridėti laikus skydelyje).");
      return;
    }
    if (amountCents == null) {
      setErr(`Pasirinkite sumą nuo ${DONATION_MIN_EUR} € arba įveskite kitą sumą.`);
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await bookMass({ massId: selectedId, intentions, donorName, amountCents });
      setMsg("Mišios užsakytos. Parapijos administratorius patvirtins intenciją liturgijoje.");
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
      <header className="ae-section-header">
        <h2 className="ae-section-title">Šv. Mišių užsakymas nuotoliu</h2>
        <p className="ae-section-lead">
          Pasirinkite parapijos administratoriaus patvirtintą laisvą laiką liturgijai.
        </p>
      </header>
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
            {slotsLoading ? (
              <p className="ae-hint">Kraunami laikai…</p>
            ) : slots.length === 0 ? (
              <div className="ae-mass-empty" role="status">
                <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
                  Šiai parapijai dabar nėra laisvų laikų. Galite išsiųsti prašymą kunigui — jis gaus pranešimą
                  telefone ir skydelyje.
                </p>
                <RequestMassSlotsButton
                  parishId={parishId}
                  parishTitle={parishTitle}
                  source={lockParish ? "parish_hub" : "home"}
                />
              </div>
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
          <p className="ch-fee-note">
            Mokėjimas (mock): {SERVICE_FEE_EUR.toFixed(2).replace(/\\.00$/, "")} € aptarnavimo mokestis atskiriamas
            nuo parapijai skiriamos sumos.
          </p>

          {err && <p className="ae-error">{err}</p>}
          {msg && <p className="ae-ok">{msg}</p>}
          <button
            type="submit"
            className="ae-btn ae-btn--primary ae-btn--wide"
            disabled={busy || slotsLoading}
          >
            {busy
              ? "Užsakoma…"
              : amountLabel
                ? `Užsakyti Mišias ir paaukoti (${amountLabel}) — viso ${totalLabel}`
                : "Pasirinkite sumą"}
          </button>
        </form>
      </div>
    </section>
  );
}
