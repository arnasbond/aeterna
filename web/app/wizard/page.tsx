"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  checkout,
  createUserMemorial,
  fetchParishes,
  fetchUserMe,
  getUserToken,
  uploadMemorialFile,
  type Parish,
} from "@/lib/api";
import { MemorialQrHub } from "@/components/memorial/MemorialQrHub";
import { WizardAuthGate } from "@/components/wizard/WizardAuthGate";
import { formatPrice } from "@/lib/qr-plates";
import { downloadQrPdf } from "@/lib/qr-pdf";
import { WizardPrivacyStep, isWizardPrivacyComplete } from "@/components/wizard/WizardPrivacyStep";
import { clearCandleIntent, loadCandleIntent } from "@/lib/candle-intent";
import { buildWizardReturnPath } from "@/lib/wizard-return-path";
import { clearWizardDraft, loadWizardDraft, saveWizardDraft } from "@/lib/wizard-draft";
import { HerculesPageShell } from "@/components/layout/HerculesPageShell";
import { MembershipPlanPicker } from "@/components/wizard/MembershipPlanPicker";
import { prepareUploadFile } from "@/lib/compress-upload";
import {
  membershipTotalCents,
  type MembershipPlanId,
  type PremiumPlan,
} from "@/lib/premium";

/** Client-side resize/compress before Vercel Blob — keeps storage and mobile loads lean. */
const WIZARD_IMAGE_COMPRESSION = { maxDimension: 1200, quality: 0.8 } as const;

async function prepareWizardImage(file: File): Promise<File> {
  return prepareUploadFile(file, WIZARD_IMAGE_COMPRESSION);
}

const WIZARD_STEPS = [
  { n: 1, label: "Velionis" },
  { n: 2, label: "Privatumas" },
  { n: 3, label: "Media" },
  { n: 4, label: "Parapija" },
  { n: 5, label: "Apmokėjimas" },
] as const;

const RESULT_STEP = 6;

function WizardInner() {
  const params = useSearchParams();
  const preParish = params.get("parish") ?? "";
  const freshWizard = params.get("naujas") === "1";
  const fromCandle = params.get("from") === "candle";
  const doneOrder = params.get("order");

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);

  function goToStep(next: number) {
    if (step === RESULT_STEP || next < 1 || next > 5) return;
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    setErr(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function advance(next: number) {
    goToStep(next);
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
  const [membershipPlanId, setMembershipPlanId] = useState<MembershipPlanId>("standard");
  const [premiumBilling, setPremiumBilling] = useState<PremiumPlan>("yearly");
  const PLATE_ADDON_CENTS = 2500; // +25 €
  const plateAddOnCents = plateAddOn ? PLATE_ADDON_CENTS : 0;
  const totalCents = membershipTotalCents(membershipPlanId, premiumBilling, plateAddOnCents);
  const MAX_GALLERY_PHOTOS = 10;
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pendingCandle, setPendingCandle] = useState(false);
  const [privacyStatus, setPrivacyStatus] = useState<"public" | "private" | "">("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMapLocation, setConsentMapLocation] = useState(false);

  const wizardReturnPath = buildWizardReturnPath(params);

  useEffect(() => {
    fetchParishes().then(setParishes).catch(() => {});
    if (!getUserToken()) {
      setLoggedIn(false);
      setUserDisplayName("");
      setAuthChecked(true);
      return;
    }
    fetchUserMe()
      .then((u) => {
        setLoggedIn(true);
        setUserDisplayName(u.fullName);
      })
      .catch(() => setLoggedIn(false))
      .finally(() => setAuthChecked(true));
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
        if (draft.membershipPlanId) setMembershipPlanId(draft.membershipPlanId);
        if (draft.premiumBilling) setPremiumBilling(draft.premiumBilling);
        if (draft.plateAddOn !== undefined) setPlateAddOn(draft.plateAddOn);
        if (draft.privacyStatus) setPrivacyStatus(draft.privacyStatus);
        setConsentTerms(draft.consentTerms ?? false);
        setConsentPrivacy(draft.consentPrivacy ?? false);
        setConsentMapLocation(draft.consentMapLocation ?? false);
        setStep(draft.step > 5 ? RESULT_STEP : draft.step);
        setMaxStep(Math.min(5, draft.maxStep));
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
    setMembershipPlanId("standard");
    setPremiumBilling("yearly");
    setPdfBusy(false);
    setPrivacyStatus("");
    setConsentTerms(false);
    setConsentPrivacy(false);
    setConsentMapLocation(false);
  }, [freshWizard]);

  useEffect(() => {
    if (result || step === RESULT_STEP) return;
    saveWizardDraft({
      fullName,
      birthDate,
      deathDate,
      biography,
      portraitUrl,
      galleryUrls,
      videoUrl,
      parishId,
      privacyStatus,
      consentTerms,
      consentPrivacy,
      consentMapLocation,
      membershipPlanId,
      premiumBilling,
      plateAddOn,
      step,
      maxStep,
    });
  }, [
    fullName,
    birthDate,
    deathDate,
    biography,
    portraitUrl,
    galleryUrls,
    videoUrl,
    parishId,
    privacyStatus,
    consentTerms,
    consentPrivacy,
    consentMapLocation,
    membershipPlanId,
    premiumBilling,
    plateAddOn,
    step,
    maxStep,
    result,
  ]);

  useEffect(() => {
    if (preParish) setParishId(preParish);
  }, [preParish]);

  useEffect(() => {
    if (!fromCandle) return;
    setPendingCandle(!!loadCandleIntent());
  }, [fromCandle]);

  if (doneOrder) {
    return (
      <HerculesPageShell narrow center>
        <div className="ae-wizard ae-card" style={{ padding: "1.5rem", textAlign: "center" }}>
          <h2 className="hercules-page__title" style={{ fontSize: "1.25rem" }}>
            Apmokėjimas gautas (MVP)
          </h2>
          <p className="ae-hint">Užsakymo ID: {doneOrder}</p>
          <Link href="/wizard" className="ae-btn ae-btn--primary" style={{ marginTop: "1rem" }}>
            Naujas profilis
          </Link>
        </div>
      </HerculesPageShell>
    );
  }

  async function handlePortraitFile(file: File | null) {
    if (!file) return;
    setMediaBusy(true);
    setErr(null);
    try {
      const prepared = await prepareWizardImage(file);
      const url = await uploadMemorialFile(prepared, { prepared: true });
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
    const isPremium = membershipPlanId === "premium";
    const maxPhotos = isPremium ? Number.POSITIVE_INFINITY : MAX_GALLERY_PHOTOS;
    const remaining = Math.max(0, maxPhotos - galleryUrls.length);
    const filesArr = Array.from(files).slice(0, remaining);
    if (filesArr.length === 0) {
      setErr(
        membershipPlanId === "premium"
          ? "Pasiektas įkėlimo limitas šiai sesijai."
          : "Pagrindinė narystė leidžia iki 10 nuotraukų. Premium suteikia neribotą galeriją."
      );
      return;
    }
    setMediaBusy(true);
    setErr(null);
    try {
      const uploaded: string[] = [];
      for (const file of filesArr) {
        const prepared = await prepareWizardImage(file);
        uploaded.push(await uploadMemorialFile(prepared, { prepared: true }));
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
    privacyStatus: privacyStatus === "private" ? "private" as const : "public" as const,
    isPremium: membershipPlanId === "premium",
  });

  const privacyValues = {
    privacyStatus,
    consentTerms,
    consentPrivacy,
    consentMapLocation,
  };

  function updatePrivacy(patch: Partial<typeof privacyValues>) {
    if (patch.privacyStatus !== undefined) setPrivacyStatus(patch.privacyStatus);
    if (patch.consentTerms !== undefined) setConsentTerms(patch.consentTerms);
    if (patch.consentPrivacy !== undefined) setConsentPrivacy(patch.consentPrivacy);
    if (patch.consentMapLocation !== undefined) setConsentMapLocation(patch.consentMapLocation);
  }

  async function finish(skipCheckout = false) {
    if (!loggedIn) {
      setErr("Norėdami sukurti memorialą, pirmiausia užsiregistruokite arba prisijunkite.");
      return;
    }
    if (!fullName.trim()) {
      setErr("Įrašykite velionio vardą ir pavardę.");
      goToStep(1);
      return;
    }
    if (!isWizardPrivacyComplete(privacyValues)) {
      setErr("Privatumo žingsnyje pasirinkite matomumą ir patvirtinkite privalomus sutikimus.");
      goToStep(2);
      return;
    }
    if (!parishId) {
      setErr("Pasirinkite parapiją, kuriai skiriama parama.");
      goToStep(4);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const memorial = await createUserMemorial(memorialPayload());
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
      setStep(RESULT_STEP);
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
    <HerculesPageShell narrow>
    <div className="ae-wizard-page">
      <h1 className="hercules-page__title chronicle-serif" style={{ fontSize: "1.75rem" }}>
        Kūrimo vedlys — memorialas artimajam
      </h1>
      {!loggedIn && authChecked ? (
        <p className="ae-wizard-lead">
          Du žingsniai: pirmiausia jūsų paskyra, paskui mirusiojo asmens memorialas.
        </p>
      ) : (
        <p className="ae-wizard-lead">
          Įrašote <strong>velionio</strong> duomenis. Jūsų paskyra ({userDisplayName || "prisijungęs"}) valdo
          memorialą — paspauskite bet kurį žingsnį juostoje, kad grįžtumėte arba redaguotumėte.
        </p>
      )}
      {fromCandle && loggedIn && step < RESULT_STEP && (
        <p
          className="ae-hint ae-card"
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            lineHeight: 1.55,
          }}
        >
          Norėdami uždegti žvakutę, užpildykite memorialą ir apmokėkite skaitmeninę narystę. Baigę kūrimą galėsite
          tęsti žvakutės uždegimą.
        </p>
      )}
      {!authChecked ? (
        <p className="ae-hint">Tikrinama paskyra…</p>
      ) : !loggedIn ? (
        <WizardAuthGate returnPath={wizardReturnPath} fromCandle={fromCandle} />
      ) : (
      <div className="ae-wizard">
        {userDisplayName && (
          <p className="ae-wizard-user-banner" role="status">
            Prisijungęs kaip <strong>{userDisplayName}</strong> (šeimos administratorius). Toliau įrašykite{" "}
            <strong>velionio</strong>, ne savo, duomenis.
          </p>
        )}
        <nav className="ae-wizard-steps" aria-label="Kūrimo žingsniai">
          {WIZARD_STEPS.map(({ n, label }) => {
            const isWizardActive = step !== RESULT_STEP;
            const isCurrent = step === n;
            const isVisited = maxStep >= n && !isCurrent;
            return (
              <button
                key={n}
                type="button"
                className={[
                  "ae-wizard-step",
                  isCurrent ? "ae-wizard-step--current" : "",
                  isVisited ? "ae-wizard-step--done" : "",
                  isWizardActive ? "ae-wizard-step--reachable" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!isWizardActive}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${n} žingsnis: ${label}${isCurrent ? " (dabartinis)" : isVisited ? " (redaguoti)" : ""}`}
                title={`${n}. ${label}`}
                onClick={() => goToStep(n)}
              >
                <span className="ae-wizard-step__bar" aria-hidden />
                <span className="ae-wizard-step__label">{label}</span>
              </button>
            );
          })}
        </nav>
        {err && <p className="ae-error" style={{ marginBottom: "1rem" }}>{err}</p>}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>1. Velionio duomenys</h2>
            <p className="ae-wizard-step-intro">
              Šiame žingsnyje — tik mirusiojo asmens informacija. Jūsų vardas ir el. paštas jau susieti su paskyra (
              {userDisplayName}).
            </p>
            <div className="ae-field">
              <label>Velionio vardas ir pavardė *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pvz. Ona Kazlauskienė"
                required
              />
            </div>
            <div className="ae-field">
              <label>Velionio gimimo data</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="ae-field">
              <label>Velionio mirties data</label>
              <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} />
            </div>
            <div className="ae-field">
              <label>Velionio biografija</label>
              <textarea
                rows={5}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Gyvenimo istorija, prisiminimai…"
              />
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
            <WizardPrivacyStep values={privacyValues} onChange={updatePrivacy} />
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(1)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={!isWizardPrivacyComplete(privacyValues)}
              onClick={() => advance(3)}
            >
              Toliau
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>3. Velionio nuotraukos</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--ae-muted)", marginBottom: "1rem" }}>
              Įkelkite mirusiojo asmens nuotraukas ir (su Premium) vaizdo įrašą. Failai saugomi saugioje debesų
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
              <label>Vaizdo įrašas {membershipPlanId === "premium" ? "" : "(Premium plane)"}</label>
              <label className="ae-wizard-upload__btn">
                📁 Įkelti vaizdo įrašą iš telefono galerijos
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*,.mov"
                  hidden
                  disabled={mediaBusy || membershipPlanId !== "premium"}
                  onChange={(e) => {
                    void handleVideoFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </label>
              {videoUrl && <p className="ae-wizard-upload__ok">✓ Vaizdo įrašas įkeltas</p>}
              {!videoUrl && membershipPlanId !== "premium" && (
                <p className="ae-hint" style={{ marginTop: "0.5rem" }}>
                  Pasirinkite Premium planą apmokėjimo žingsnyje arba vėliau atnaujinkite memorialo administravime.
                </p>
              )}
            </div>

            {mediaBusy && <p className="ae-hint">Įkeliama…</p>}

            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(2)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={mediaBusy}
              onClick={() => advance(4)}
            >
              Toliau
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>4. Parapija</h2>
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
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(3)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={!parishId}
              onClick={() => advance(5)}
            >
              Toliau
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>5. Apmokėjimas</h2>
            <MembershipPlanPicker
              planId={membershipPlanId}
              premiumBilling={premiumBilling}
              plateAddOnCents={plateAddOnCents}
              onPlanChange={setMembershipPlanId}
              onPremiumBillingChange={setPremiumBilling}
            />

            <div className="ae-card" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <input type="checkbox" checked={plateAddOn} onChange={(e) => setPlateAddOn(e.target.checked)} />
                <span style={{ fontSize: "0.95rem", lineHeight: 1.55 }}>
                  Pageidauju užsakyti gamyklinę nerūdijančio plieno plokštelę į paštomatą (+25 €)
                </span>
              </label>

              <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
                <strong>Iš viso:</strong> {formatPrice(totalCents)}
              </p>

              <p style={{ fontSize: "0.85rem", color: "var(--ae-muted)", marginBottom: 0 }}>
                {membershipPlanId === "premium"
                  ? "Premium plane įskaičiuotas memorialas, QR generavimas ir papildomos funkcijos."
                  : "Pagrindiniame plane — memorialo išsaugojimas platformoje ir QR generavimas."}
              </p>
            </div>
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(4)}>
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
              {busy ? "Kuriama…" : `Apmokėti ${formatPrice(totalCents)} ir sukurti memorialą`}
            </button>
          </>
        )}

        {step === RESULT_STEP && result && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>Paruošta — atmintis ir QR</h2>
            {pendingCandle && (
              <p className="ae-hint" style={{ marginBottom: "0.75rem", color: "var(--ch-emerald, #047857)" }}>
                Memorialas sukurtas. Dabar galite uždegti žvakutę už <strong>{fullName}</strong>.
              </p>
            )}
            <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
              Išsaugota visa informacija. Viešame puslapyje lankytojai mato tekstą ir nuotraukas, po jų — QR (paspaudus
              atsidaro pilnas meniu).
            </p>
            {pendingCandle && (
              <Link
                href={`/m/${result.slug}?candle=1`}
                className="ae-btn ae-btn--gold"
                style={{ width: "100%", marginBottom: "0.75rem" }}
                onClick={() => {
                  clearCandleIntent();
                  setPendingCandle(false);
                }}
              >
                Toliau — uždegti žvakutę
              </Link>
            )}
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
      )}
    </div>
    </HerculesPageShell>
  );
}

export default function WizardPage() {
  return (
    <Suspense
      fallback={
        <HerculesPageShell narrow center>
          <p className="ae-hint" style={{ textAlign: "center" }}>
            Kraunama…
          </p>
        </HerculesPageShell>
      }
    >
      <WizardInner />
    </Suspense>
  );
}
