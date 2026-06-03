"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchParishes,
  getPriestToken,
  priestLogin,
  priestRequestOtp,
  priestVerifyOtp,
  redirectToPriestDashboard,
  setPriestToken,
  validatePriestSession,
  type Parish,
} from "@/lib/api";
import { requirePasswords } from "@/lib/auth-config";

type Step = "form" | "code";
type View = "loading" | "ready";

function parishFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("parish");
}

export default function PriestLoginPage() {
  const [view, setView] = useState<View>("loading");
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [usePassword, setUsePassword] = useState(false);
  const [devHint, setDevHint] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (getPriestToken()) {
        const ok = await validatePriestSession();
        if (cancelled) return;
        if (ok) {
          redirectToPriestDashboard();
          return;
        }
      }

      try {
        const p = await fetchParishes();
        if (cancelled) return;
        setParishes(p);
        const fromUrl = parishFromLocation();
        const preferred = fromUrl && p.some((x) => x.id === fromUrl) ? fromUrl : p[0]?.id;
        if (preferred) setParishId(preferred);
        setView("ready");
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Nepavyko įkelti parapijų");
          setView("ready");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function afterLogin(token: string) {
    setPriestToken(token);
    const ok = await validatePriestSession();
    if (ok) {
      redirectToPriestDashboard();
      return;
    }
    throw new Error("Sesija nepatvirtinta — bandykite dar kartą");
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const session = await priestLogin(parishId, password);
      await afterLogin(session.token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prisijungimas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setDevHint(null);
    setBusy(true);
    try {
      const res = await priestRequestOtp(parishId, email);
      if (res.devCode) setDevHint(res.devCode);
      setStep("code");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsiųsti kodo");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const session = await priestVerifyOtp(parishId, email, code);
      await afterLogin(session.token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Neteisingas kodas");
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const session = await priestLogin(parishId, "");
      await afterLogin(session.token);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prisijungimas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  if (view === "loading") {
    return (
      <section className="ae-section ae-auth-gate">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </section>
    );
  }

  const otpMode = requirePasswords && !usePassword;

  return (
    <section className="ae-section ae-wizard ae-auth-gate">
      <h1 className="ae-section-title">Parapijos administratoriaus prisijungimas</h1>
      <p className="ae-hint" style={{ textAlign: "center", marginBottom: "1.5rem", maxWidth: "30rem", marginInline: "auto" }}>
        {requirePasswords
          ? otpMode
            ? "Įveskite patvirtintą el. paštą — gausite vienkartinį prisijungimo kodą (MVP: rodomas testavimo režime)."
            : "Prisijunkite laikinu slaptažodžiu, kurį gavote iš svetainės administratoriaus."
          : "Testavimo režimas: pasirinkite parapiją ir prisijunkite be slaptažodžio."}
      </p>

      {!requirePasswords ? (
        <form onSubmit={quickLogin}>
          <div className="ae-field">
            <label>Parapija</label>
            <select value={parishId} onChange={(e) => setParishId(e.target.value)}>
              {parishes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          {err && <p className="ae-error">{err}</p>}
          <button type="submit" className="ae-btn ae-btn--gold ae-btn--wide" disabled={busy}>
            {busy ? "Jungiamasi…" : "Prisijungti"}
          </button>
        </form>
      ) : otpMode && step === "form" ? (
        <form onSubmit={requestCode}>
          <div className="ae-field">
            <label>Parapija</label>
            <select value={parishId} onChange={(e) => setParishId(e.target.value)} required>
              {parishes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="ae-field">
            <label>El. paštas</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="klebonas@parapija.lt"
              required
              autoComplete="email"
            />
          </div>
          {err && <p className="ae-error">{err}</p>}
          <button type="submit" className="ae-btn ae-btn--gold ae-btn--wide" disabled={busy}>
            {busy ? "Siunčiama…" : "Gauti prisijungimo kodą"}
          </button>
          <button
            type="button"
            className="ae-btn ae-btn--outline ae-btn--wide"
            style={{ marginTop: "0.5rem" }}
            onClick={() => setUsePassword(true)}
          >
            Turiu laikiną slaptažodį
          </button>
        </form>
      ) : otpMode && step === "code" ? (
        <form onSubmit={verifyCode}>
          {devHint && (
            <p className="ae-auth-test-banner" role="status">
              Testavimo kodas: <strong>{devHint}</strong>
            </p>
          )}
          <div className="ae-field">
            <label>6 skaitmenų kodas</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              required
              autoComplete="one-time-code"
            />
          </div>
          {err && <p className="ae-error">{err}</p>}
          <button type="submit" className="ae-btn ae-btn--gold ae-btn--wide" disabled={busy || code.length < 6}>
            {busy ? "Tikrinama…" : "Prisijungti"}
          </button>
          <button
            type="button"
            className="ae-btn ae-btn--outline ae-btn--wide"
            style={{ marginTop: "0.5rem" }}
            onClick={() => {
              setStep("form");
              setCode("");
              setErr(null);
            }}
          >
            ← Kitas el. paštas
          </button>
        </form>
      ) : (
        <form onSubmit={submitPassword}>
          <div className="ae-field">
            <label>Parapija</label>
            <select value={parishId} onChange={(e) => setParishId(e.target.value)}>
              {parishes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="ae-field">
            <label>Laikinas slaptažodis</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="XXXX-XXXX-XXXX"
              required
              autoComplete="one-time-code"
            />
          </div>
          {err && <p className="ae-error">{err}</p>}
          <button type="submit" className="ae-btn ae-btn--gold ae-btn--wide" disabled={busy}>
            {busy ? "Jungiamasi…" : "Prisijungti"}
          </button>
          <button
            type="button"
            className="ae-btn ae-btn--outline ae-btn--wide"
            style={{ marginTop: "0.5rem" }}
            onClick={() => {
              setUsePassword(false);
              setStep("form");
              setErr(null);
            }}
          >
            Prisijungti el. paštu (OTP)
          </button>
        </form>
      )}

      <p style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <Link href={`/priest/request${parishId ? `?parish=${encodeURIComponent(parishId)}` : ""}`}>
          Pateikti prieigos užklausą administratoriui
        </Link>
      </p>
      <p className="ae-hint" style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem" }}>
        Svetainės valdytojas:{" "}
        <Link href="/admin/login" className="ae-footer-links__admin">
          Administratoriaus prisijungimas →
        </Link>
      </p>
    </section>
  );
}
