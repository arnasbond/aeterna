"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { checkout, createMemorial, fetchParishes, type Parish } from "@/lib/api";
import { formatPrice, getPlateTier, MEMORIAL_PACKAGE_CENTS, packageTotalCents, type PlateTierId } from "@/lib/qr-plates";

const WIZARD_STEPS = [
  { n: 1, label: "Duomenys" },
  { n: 2, label: "Media" },
  { n: 3, label: "Parapija" },
  { n: 4, label: "Apmokėjimas" },
] as const;

function WizardInner() {
  const params = useSearchParams();
  const preParish = params.get("parish") ?? "";
  const prePlate = params.get("plate") as PlateTierId | null;
  const plateTier = getPlateTier(prePlate);
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
  const [videoUrl, setVideoUrl] = useState("");
  const [parishId, setParishId] = useState(preParish);

  useEffect(() => {
    fetchParishes().then(setParishes).catch(() => {});
  }, []);

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

  async function finish() {
    setBusy(true);
    setErr(null);
    try {
      const memorial = await createMemorial({
        parishId,
        fullName,
        birthDate: birthDate || undefined,
        deathDate: deathDate || undefined,
        biography,
        videoUrl: videoUrl || undefined,
      });
      const pay = await checkout(parishId, packageTotalCents(plateTier?.id ?? null));
      setResult({
        slug: memorial.slug,
        profileUrl: memorial.profileUrl,
        qrCodeUrl: memorial.qrCodeUrl,
        checkout: { message: pay.message },
      });
      setStep(5);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Klaida");
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
      {plateTier && (
        <p className="ae-wizard-plate-hint">
          QR plokštelė: <strong>{plateTier.name}</strong> ({formatPrice(plateTier.priceCents)}) ·{" "}
          <Link href="/qr-ploksteles">Keisti variantą</Link>
        </p>
      )}
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
              Video nuoroda (YouTube / Vimeo). Nuotraukų įkėlimas — netrukus.
            </p>
            <div className="ae-field">
              <label>Video nuoroda</label>
              <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </div>
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(1)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
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
                <strong>Skaitmeninis memorialas:</strong> {formatPrice(MEMORIAL_PACKAGE_CENTS)}
              </p>
              {plateTier ? (
                <p>
                  <strong>QR plokštelė ({plateTier.name}):</strong> {formatPrice(plateTier.priceCents)}
                </p>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--ae-muted)" }}>
                  Be fizinės plokštelės.{" "}
                  <Link href="/qr-ploksteles">Pasirinkti plokštelę →</Link>
                </p>
              )}
              <p style={{ marginTop: "0.75rem", fontSize: "1.1rem" }}>
                <strong>Iš viso:</strong> {formatPrice(packageTotalCents(plateTier?.id ?? null))}
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--ae-muted)" }}>
                20% parapijai · likutis platformai ir saugojimui
              </p>
            </div>
            <button type="button" className="ae-btn ae-btn--outline" onClick={() => goToStep(3)}>
              Atgal
            </button>
            <button
              type="button"
              className="ae-btn ae-btn--gold"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={busy}
              onClick={finish}
            >
              {busy ? "Kuriama…" : "Apmokėti ir sukurti (MVP)"}
            </button>
          </>
        )}

        {step === 5 && result && (
          <>
            <h2 style={{ fontSize: "1.2rem" }}>Paruošta</h2>
            {result.qrCodeUrl && (
              <img
                src={result.qrCodeUrl}
                alt="QR kodas"
                width={200}
                height={200}
                style={{ display: "block", margin: "1rem auto" }}
              />
            )}
            <Link href={`/m/${result.slug}`} className="ae-btn ae-btn--primary" style={{ width: "100%" }}>
              Atidaryti profilį
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
