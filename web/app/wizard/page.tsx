"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  checkout,
  createMemorial,
  createUserMemorial,
  fetchParishes,
  fetchUserMe,
  getUserToken,
  uploadMemorialFile,
  type Parish,
} from "@/lib/api";
import { MemorialQrHub } from "@/components/memorial/MemorialQrHub";
import { formatPrice } from "@/lib/qr-plates";
import { downloadQrPdf } from "@/lib/qr-pdf";
import { clearWizardDraft, loadWizardDraft, saveWizardDraft } from "@/lib/wizard-draft";

const WIZARD_STEPS = [
  { n: 1, label: "Duomenys" },
  { n: 2, label: "Media" },
  { n: 3, label: "Parapija" },
  { n: 4, label: "Apmokėjimas" },
] as const;

function WizardInner() {
  const params = useSearchParams();
  const preParish = params.get("parish") ?? "";
  const freshWizard = params.get("naujas") === "1";
  const doneOrder = params.get("order");

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);

  function goToStep(next: number) {
    if (step === 5 || next < 1 || next > 4 || next > maxStep) return;
    setStep(next);
    setErr(null);
  }

  function advance(next: number) {
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    setErr(null);
  }
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{
    slug: string;
    profileUrl: string;
    qrCodeUrl: string | null;
    checkout?: { message: string };
  } | null>(null);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaBusy, setMediaBusy] = useState(false);
  const [parishId, setParishId] = useState(preParish);
  const [plateAddOn, setPlateAddOn] = useState(false);
  const BASE_MEMBERSHIP_CENTS = 3900; // 39 €
  const PLATE_ADDON_CENTS = 2500; // +25 €
  const totalCents = BASE_MEMBERSHIP_CENTS + (plateAddOn ? PLATE_ADDON_CENTS : 0);
  const MAX_GALLERY_PHOTOS = 10;
  const [loggedIn, setLoggedIn] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    fetchParishes().then(setParishes).catch(() => {});
    if (getUserToken()) {
      fetchUserMe()
        .then(() => setLoggedIn(true))
        .catch(() => setLoggedIn(false));
    }
  }, []);

  useEffect(() => {
    if (!freshWizard) {
      const draft = loadWizardDraft();
      if (draft) {
        setFullName(draft.fullName);
        setBirthDate(draft.birthDate);
        setDeathDate(draft.deathDate);
        setBiography(draft.biography);
        setPortraitUrl(draft.portraitUrl);
        setGalleryUrls(draft.galleryUrls);
        setVideoUrl(draft.videoUrl);
        if (draft.parishId) setParishId(draft.parishId);
        setStep(draft.step);
        setMaxStep(draft.maxStep);
      }
      return;
    }
    clearWizardDraft();
    setStep(1);
    setMaxStep(1);
    setErr(null);
    setResult(null);
    setFullName("");
    setBirthDate("");
    setDeathDate("");
    setBiography("");
    setPortraitUrl("");
    setGalleryUrls([]);
    setVideoUrl("");
    setMediaBusy(false);
    setBusy(false);
    setPlateAddOn(false);
    setPdfBusy(false);
  }, [freshWizard]);

  useEffect(() => {
    if (result || step === 5) return;
    saveWizardDraft({
      fullName,
      birthDate,
      deathDate,
      biography,
      portraitUrl,
      galleryUrls,
      videoUrl,
      parishId,
      step,
      maxStep,
    });
  }, [fullName, birthDate, deathDate, biography, portraitUrl, galleryUrls, videoUrl, parishId, step, maxStep, result]);

  useEffect(() => {
    if (preParish) setParishId(preParish);
  }, [preParish]);

  if (doneOrder) {
    return (
      <section className="ae-section ae-wizard">
        <h2>Apmokėjimas gautas (MVP)</h2>
        <p style={{ color: "var(--ae-muted)" }}>Užsakymo ID: {doneOrder}</p>
        <Link href="/wizard" className="ae-btn ae-btn--primary" style={{ marginTop: "1rem" }}>
          Naujas profilis
        </Link>
      </section>
    );
  }

  async function handlePortraitFile(file: File | null) {
    if (!file) return;
    setMediaBusy(true);
    setErr(null);
    try {
      const url = await uploadMemorialFile(file);
      setPortraitUrl(url);
    } catch (e) {
      setErr(uploadErrorMessage(e, "Nepavyko įkelti portreto"));
    } finally {
      setMediaBusy(false);
    }
  }

  function uploadErrorMessage(e: unknown, fallback: string): string {
    const msg = e instanceof Error ? e.message : fallback;
    if (msg === "Failed to fetch") {
      return "Nepavyko įkelti failo (tinklas arba serveris). Bandykite dar kartą arba mažesnę JPG nuotrauką.";
    }
    return msg;
  }

  async function handleGalleryFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = Math.max(0, MAX_GALLERY_PHOTOS - galleryUrls.length);
    const filesArr = Array.from(files).slice(0, remaining);
    if (filesArr.length === 0) {
      setErr("Pagrindinė narystė leidžia iki 10 nuotraukų. Premium suteikia neribotą galeriją.");
      return;
    }
    setMediaBusy(true);
    setErr(null);
    try {
      const uploaded: string[] = [];
      for (const file of filesArr) {
        uploaded.push(await uploadMemorialFile(file));
      }
      setGalleryUrls((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setErr(uploadErrorMessage(e, "Nepavyko įkelti nuotraukų"));
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleVideoFile(file: File | null) {
    if (!file) return;
    setMediaBusy(true);
    setErr(null);
    try {
      const url = await uploadMemorialFile(file);
      setVideoUrl(url);
    } catch (e) {
      setErr(uploadErrorMessage(e, "Nepavyko įkelti vaizdo įrašo"));
    } finally {
      setMediaBusy(false);
    }
  }

  const memorialPayload = () => ({
    parishId,
    fullName,
    birthDate: birthDate || undefined,
    deathDate: deathDate || undefined,
    biography,
    portraitUrl: portraitUrl || undefined,
    mediaGallery: galleryUrls.length ? galleryUrls : undefined,
    videoUrl: videoUrl || undefined,
  });

  async function finish(skipCheckout = false) {
    setBusy(true);
    setErr(null);
    try {
      const memorial = loggedIn
        ? await createUserMemorial(memorialPayload())
        : await createMemorial(memorialPayload());
      const checkoutMsg = skipCheckout
        ? "Profilis išsaugotas (be apmokėjimo simuliacijos)."
        : (await checkout(parishId, totalCents, memorial.slug)).message;
      clearWizardDraft();
      setResult({
        slug: memorial.slug,
        profileUrl: memorial.profileUrl,
        qrCodeUrl: memorial.qrCodeUrl,
        checkout: { message: checkoutMsg },
      });
      setStep(5);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Klaida";
      setErr(
        msg === "Failed to fetch"
          ? "Nepavyko susisiekti su serveriu. Paleiskite PALESTI-SERVERIUS.bat ir atidarykite svetainę per http://…:3000 (ne :4000)."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ae-section">
      <h1 className="ae-section-title" style={{ fontSize: "1.75rem" }}>
        Kūrimo vedlys
      </h1>
      <p className="ae-wizard-lead">
        Paspauskite žingsnio juostą, jei norite grįžti ir pataisyti įvestus duomenis.
      </p>
      <div className="ae-wizard">
        <nav className="ae-wizard-steps" aria-label="Kūrimo žingsniai">
          {WIZARD_STEPS.map(({ n, label }) => {
            const reachable = step !== 5 && n <= maxStep;
            const isCurrent = step === n;
            const isDone = step !== 5 && n < step;
            return (
              <button
                key={n}
                type="button"
                className={[
                  "ae-wizard-step",
                  isCurrent ? "ae-wizard-step--current" : "",
                  isDone ? "ae-wizard-step--done" : "",
                  reachable ? "ae-wizard-step--reachable" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!reachable}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${n} žingsnis: ${label}${reachable ? "" : " (dar nepasiekta)"}`}
                onClick={() => goToStep(n)}
              >
                <span className="ae-wizard-step__bar" aria-hidden />
                <span className="ae-wizard-step__label">{label}</span>
              </button>
            );
          })}
        </nav>
        {err && <p style={{ color: "#b91c1c", marginBottom: "1rem" }}>{err}</p>}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>1. Duomenys</h2>
            <div className="ae-field">
              <label>Vardas, pavardė *</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="ae-field">
              <label>Gimimo data</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="ae-field">
              <label>Mirties data</label>
              <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} />
            </div>
            <div className="ae-field">
              <label>Biografija</label>
              <textarea rows={5} value={biography} onChange={(e) => setBiography(e.target.value)} />
            </div>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%" }}
              disabled={!fullName.trim()}
              onClick={() => advance(2)}
            >
              Toliau
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>2. Media</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--ae-muted)", marginBottom: "1rem" }}>
              Įkelkite nuotraukas ir vaizdo įrašą tiesiai iš telefono galerijos. Failai saugomi saugioje debesų
              saugykloje.
            </p>

            <div className="ae-field ae-wizard-upload">
              <label>Portreto nuotrauka</label>
              <label className="ae-wizard-upload__btn">
                📁 Įkelti nuotrauką iš telefono galerijos
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*,.heic,.heif"
                  capture={undefined}
                  hidden
                  disabled={mediaBusy}
                  onChange={(e) => {
                    void handlePortraitFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
              {portraitUrl && (
                <p className="ae-wizard-upload__ok">✓ Portretas įkeltas</p>
              )}
            </div>

            <div className="ae-field ae-wizard-upload">
              <label>Albumo nuotraukos</label>
              <label className="ae-wizard-upload__btn">
                📁 Įkelti nuotrauką iš telefono galerijos
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*,.heic,.heif"
                  capture={undefined}
                  multiple
                  hidden
                  disabled={mediaBusy}
                  onChange={(e) => {
                    void handleGalleryFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              {galleryUrls.length > 0 && (
                <p className="ae-wizard-upload__ok">✓ Įkelta nuotraukų: {galleryUrls.length}</p>
              )}
            </div>

            <div className="ae-field ae-wizard-upload">
              <label>Vaizdo įrašas (Premium)</label>
              <label className="ae-wizard-upload__btn">
                📁 Įkelti vaizdo įrašą iš telefono galerijos
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*,.mov"
                  hidden
                  disabled
                  onChange={(e) => {
                    void handleVideoFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
              {videoUrl && <p className="ae-wizard-upload__ok">✓ Vaizdo įrašas įkeltas</p>}
              {!videoUrl && (
                <p className="ae-hint" style={{ marginTop: "0.5rem" }}>
                  Premium narystė suteikia galimybę įkelti vaizdo įrašą.
                </p>
              )}
            </div>

            {mediaBusy && <p className="ae-hint">Įkeliama…</p>}

            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(1)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={mediaBusy}
              onClick={() => advance(3)}
            >
              Toliau
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>3. Parapija</h2>
            <div className="ae-field">
              <label>Parapija *</label>
              <select value={parishId} onChange={(e) => setParishId(e.target.value)} required>
                <option value="">— Pasirinkite —</option>
                {parishes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(2)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={!parishId}
              onClick={() => advance(4)}
            >
              Toliau
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>4. Apmokėjimas</h2>
            <div className="ae-card" style={{ marginBottom: "1rem" }}>
              <p>
                <strong>Vienkartinis skaitmeninis narystės mokestis:</strong> {formatPrice(BASE_MEMBERSHIP_CENTS)}
              </p>

              <label style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", marginTop: "0.75rem" }}>
                <input type="checkbox" checked={plateAddOn} onChange={(e) => setPlateAddOn(e.target.checked)} />
                <span style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>
                  Pageidauju užsakyti gamyklinę nerūdijančio plieno plokštelę į paštomatą (+25 €)
                </span>
              </label>

              <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
                <strong>Iš viso:</strong> {formatPrice(totalCents)}
              </p>

              <p style={{ fontSize: "0.85rem", color: "var(--ae-muted)" }}>
                Skaitmeninio memorialo išsaugojimas platformoje ir QR generation.
              </p>
            </div>
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(3)}>
              Atgal
            </button>
            {loggedIn && (
              <button
                type="button"
                className="ae-btn ae-btn--primary"
                style={{ width: "100%", marginTop: "0.5rem" }}
                disabled={busy}
                onClick={() => finish(true)}
              >
                {busy ? "Saugoma…" : "Išsaugoti profilį (demo, be apmokėjimo)"}
              </button>
            )}
            <button
              type="button"
              className="ae-btn ae-btn--gold"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={busy}
              onClick={() => finish(false)}
            >
              {busy ? "Kuriama…" : `Apmokėti ${formatPrice(totalCents)} ir sukurti`}
            </button>
          </>
        )}

        {step === 5 && result && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>Paruošta — atmintis ir QR</h2>
            <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
              Išsaugota visa informacija. Viešame puslapyje lankytojai mato tekstą ir nuotraukas, po jų — QR (paspaudus
              atsidaro pilnas meniu).
            </p>
            <MemorialQrHub
              slug={result.slug}
              fullName={fullName}
              qrCodeUrl={result.qrCodeUrl}
              profileUrl={result.profileUrl}
              showPlateLink={plateAddOn}
            />

            <button
              type="button"
              className="ae-btn ae-btn--outline ae-btn--wide"
              style={{ marginTop: "0.75rem" }}
              disabled={pdfBusy}
              onClick={() =>
                void (async () => {
                  try {
                    setPdfBusy(true);
                    await downloadQrPdf({
                      slug: result.slug,
                      fullName,
                      qrCodeUrl: result.qrCodeUrl,
                      profileUrl: result.profileUrl,
                    });
                  } catch (e) {
                    setErr(e instanceof Error ? e.message : "Nepavyko atsisiųsti QR PDF");
                  } finally {
                    setPdfBusy(false);
                  }
                })()
              }
            >
              {pdfBusy ? "Generuojama PDF…" : "Atsisiųsti QR PDF"}
            </button>
            <Link href={`/m/${result.slug}`} className="ae-btn ae-btn--primary" style={{ width: "100%", marginTop: "1rem" }}>
              Peržiūrėti suskleistą profilį
            </Link>
            <p style={{ fontSize: "0.8rem", color: "var(--ae-muted)", marginTop: "1rem" }}>
              {result.checkout?.message}
            </p>
            <Link
              href={`/m/${result.slug}?fix=1`}
              className="ae-btn ae-btn--outline"
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              Fiksuoti kapo vietą (GPS)
            </Link>
            {loggedIn && (
              <Link href="/paskyra" className="ae-btn ae-btn--outline" style={{ width: "100%", marginTop: "0.5rem" }}>
                Mano paskyra — redaguoti atmintis
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<section className="ae-section">Kraunama…</section>}>
      <WizardInner />
    </Suspense>
  );
}
