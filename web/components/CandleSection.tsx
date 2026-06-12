"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchParishes,
  findMemorialForCandle,
  getUserToken,
  lightCandle,
  type Parish,
} from "@/lib/api";
import { saveCandleIntent } from "@/lib/candle-intent";
import { buildWizardReturnPath } from "@/lib/wizard-return-path";
import { saveWizardDraft } from "@/lib/wizard-draft";
import { HOME_ACTION_PILL } from "@/lib/glass-card";

type Props = {
  initialParishId?: string;
  lockParish?: boolean;
  /** Tituliniame puslapyje — tik mygtukas, forma modale */
  presentation?: "full" | "sheet";
};

export function CandleSection({ initialParishId, lockParish, presentation = "full" }: Props = {}) {
  const router = useRouter();
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState(initialParishId ?? "");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchParishes().then((p) => {
      setParishes(p);
      setParishId((current) => {
        if (current) return current;
        const preferred =
          initialParishId && p.some((x) => x.id === initialParishId) ? initialParishId : p[0]?.id;
        return preferred ?? "";
      });
    });
  }, [initialParishId]);

  useEffect(() => {
    if (!createModalOpen && !sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (createModalOpen) setCreateModalOpen(false);
      else setSheetOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [createModalOpen, sheetOpen]);

  useEffect(() => {
    if (presentation !== "sheet" || typeof window === "undefined") return;
    if (window.location.hash !== "#zvakute") return;
    setSheetOpen(true);
  }, [presentation]);

  function startMembershipFlow() {
    if (!parishId) {
      setErr("Pasirinkite parapiją.");
      return;
    }
    saveCandleIntent({
      fullName: fullName.trim(),
      birthDate,
      deathDate,
      parishId,
      donorName: donorName.trim(),
      amountCents: amount * 100,
    });
    saveWizardDraft({
      fullName: fullName.trim(),
      birthDate,
      deathDate,
      biography: "",
      portraitUrl: "",
      galleryUrls: [],
      videoUrl: "",
      parishId,
      privacyStatus: "",
      consentTerms: false,
      consentPrivacy: false,
      consentMapLocation: false,
      step: 1,
      maxStep: 5,
    });
    setCreateModalOpen(false);
    const wizardNext = buildWizardReturnPath(new URLSearchParams("from=candle"));
    if (getUserToken()) {
      router.push(wizardNext);
      return;
    }
    router.push(`/prisijungti?tab=register&next=${encodeURIComponent(wizardNext)}`);
  }

  async function lightForSlug(slug: string) {
    await lightCandle({
      memorialSlug: slug,
      donorName: donorName.trim() || "Anonimas",
      amountCents: amount * 100,
    });
    router.push(`/m/${slug}?candle=1`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!parishId) {
      setErr("Pasirinkite parapiją.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const found = await findMemorialForCandle(fullName, birthDate, deathDate);
      if (found.status === "not_found") {
        setCreateModalOpen(true);
        return;
      }
      await lightForSlug(found.slug);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko uždegti žvakutės");
    } finally {
      setBusy(false);
    }
  }

  const parishTitle = parishes.find((p) => p.id === parishId)?.title;

  const form = (
    <form className="ae-candle-form" onSubmit={submit}>
      <div className="ae-field">
        <label>Parapija *</label>
        <select
          value={parishId}
          onChange={(e) => setParishId(e.target.value)}
          disabled={lockParish}
          required
        >
          {parishes.length === 0 ? (
            <option value="">Kraunama…</option>
          ) : (
            parishes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))
          )}
        </select>
      </div>
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
        {busy ? "Tikrinama…" : "Uždegti žvakutę"}
      </button>
      <p className="ae-hint">
        Pavyzdys: <strong>Stasė</strong>, 1936-05-12 — 2024-12-24
      </p>
    </form>
  );

  return (
    <>
      {presentation === "sheet" ? (
        <div id="zvakute" className="vk-home-action p-1">
          <button type="button" className={`vk-home-action__btn ${HOME_ACTION_PILL}`} onClick={() => setSheetOpen(true)}>
            <span aria-hidden>🕯️</span> Uždegti žvakutę
          </button>
        </div>
      ) : (
        <section id="zvakute" className="ae-section ae-candle-section">
          <div className="ae-candle-card">
            <div className="ae-candle-card__head">
              <span className="ae-candle-icon" aria-hidden>
                🔥
              </span>
              <h2>Uždekite virtualią žvakutę</h2>
              <p>Auka nukeliaus tiesiai į velionio parapiją.</p>
            </div>
            {form}
          </div>
        </section>
      )}

      {sheetOpen && (
        <div className="ae-modal-backdrop" role="presentation" onClick={() => setSheetOpen(false)}>
          <div
            className="ae-modal ae-modal--sheet"
            role="dialog"
            aria-modal
            aria-labelledby="candle-sheet-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ae-modal__close"
              onClick={() => setSheetOpen(false)}
              aria-label="Uždaryti"
            >
              ×
            </button>
            <div className="ae-candle-card__head">
              <span className="ae-candle-icon" aria-hidden>
                🔥
              </span>
              <h2 id="candle-sheet-title">Uždekite virtualią žvakutę</h2>
              <p>Auka nukeliaus tiesiai į velionio parapiją.</p>
            </div>
            {form}
          </div>
        </div>
      )}

      {createModalOpen && (
        <div className="ae-modal-backdrop" role="presentation" onClick={() => setCreateModalOpen(false)}>
          <div
            className="ae-modal"
            role="dialog"
            aria-modal
            aria-labelledby="candle-create-memorial-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ae-modal__close"
              onClick={() => setCreateModalOpen(false)}
              aria-label="Uždaryti"
            >
              ×
            </button>
            <h2 id="candle-create-memorial-title" className="ae-modal__title">
              Memorialas dar nesukurtas
            </h2>
            <p className="ae-modal__lead">
              Šiam asmeniui ({fullName.trim()}) AETERNA dar nėra memorialinio puslapio. Norėdami uždegti žvakutę,
              pirmiausia užregistruokite paskyrą, apmokėkite skaitmeninę narystę (39 €) ir sukurkite memorialą
              parapijoje <strong>{parishTitle ?? "pasirinkta parapija"}</strong>. Baigę — galėsite tęsti žvakutės
              uždegimą.
            </p>
            <div className="ae-modal__actions">
              <button type="button" className="vk-btn vk-btn--primary" onClick={startMembershipFlow} disabled={!parishId}>
                Sukurti memorialą
              </button>
              <button type="button" className="vk-btn vk-btn--outline" onClick={() => setCreateModalOpen(false)}>
                Atšaukti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
