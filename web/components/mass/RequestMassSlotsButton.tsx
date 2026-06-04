"use client";

import { useState } from "react";
import { requestMassSlots, type MassSlotRequestSource } from "@/lib/api";

type Props = {
  parishId: string;
  parishTitle?: string;
  source?: MassSlotRequestSource;
  className?: string;
};

export function RequestMassSlotsButton({ parishId, parishTitle, source = "home", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function send() {
    if (!parishId) return;
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await requestMassSlots({
        parishId,
        requesterName: name.trim() || undefined,
        message: note.trim() || undefined,
        source,
      });
      setOk(res.message);
      setOpen(false);
      setName("");
      setNote("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsiųsti");
    } finally {
      setBusy(false);
    }
  }

  if (!parishId) return null;

  return (
    <div className={`ae-mass-request ${className}`}>
      {ok ? (
        <p className="ae-ok" role="status">
          {ok}
        </p>
      ) : (
        <>
          <button
            type="button"
            className="ae-btn ae-btn--gold ae-btn--wide"
            onClick={() => {
              setOpen((v) => !v);
              setErr(null);
            }}
          >
            📣 Prašyti kunigui pridėti laikus
          </button>
          {open && (
            <div className="ae-mass-request__panel">
              <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
                Kunigas gaus <strong>garsinį pranešimą</strong> ir žinutę skydelyje
                {parishTitle ? ` (${parishTitle})` : ""}. Galėsite užsakyti mišias, kai atsiras laisvų laikų.
              </p>
              <div className="ae-field">
                <label>Jūsų vardas (neprivaloma)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pvz. Ona"
                />
              </div>
              <div className="ae-field">
                <label>Pastaba kunigui (neprivaloma)</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Pvz. reikia laikų sekmadieniui ar šventėms"
                />
              </div>
              {err && <p className="ae-error">{err}</p>}
              <button
                type="button"
                className="ae-btn ae-btn--primary ae-btn--wide"
                disabled={busy}
                onClick={() => void send()}
              >
                {busy ? "Siunčiama…" : "Siųsti prašymą kunigui"}
              </button>
              <button
                type="button"
                className="ae-btn ae-btn--outline ae-btn--wide"
                style={{ marginTop: "0.5rem" }}
                onClick={() => setOpen(false)}
              >
                Atšaukti
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
