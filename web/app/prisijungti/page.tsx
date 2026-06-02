"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearUserToken,
  fetchUserMe,
  getUserToken,
  setUserToken,
  userLogin,
  userRegister,
} from "@/lib/api";
import { requirePasswords } from "@/lib/auth-config";

type Tab = "login" | "register";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/paskyra";
  const [tab, setTab] = useState<Tab>("login");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    if (!getUserToken()) return;
    fetchUserMe()
      .then(() => router.replace(next))
      .catch(() => clearUserToken());
  }, [router, next]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { token } = await userLogin(email, password);
      setUserToken(token);
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prisijungimas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { token } = await userRegister({
        fullName,
        email,
        password,
        passwordConfirm,
      });
      setUserToken(token);
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registracija nepavyko");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ae-section ae-auth">
      <h1 className="ae-section-title">Prisijungimas ir registracija</h1>
      <p className="ae-auth__lead">
        Susikurkite nemokamą paskyrą el. paštu ir saugiu slaptažodžiu — taip apsaugosite savo
        virtualią kapavietę ir galėsite ją redaguoti bet kada.
      </p>

      {!requirePasswords && (
        <p className="ae-auth-test-banner" role="status">
          Testavimo režimas: galite spausti „Prisijungti“ be slaptažodžio. El. paštas neprivalomas.
        </p>
      )}

      <div className="ae-auth__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          className={tab === "login" ? "ae-auth__tab ae-auth__tab--active" : "ae-auth__tab"}
          onClick={() => {
            setTab("login");
            setErr(null);
          }}
        >
          Prisijungti
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          className={tab === "register" ? "ae-auth__tab ae-auth__tab--active" : "ae-auth__tab"}
          onClick={() => {
            setTab("register");
            setErr(null);
          }}
        >
          Registruotis
        </button>
      </div>

      <div className="ae-wizard ae-auth__card">
        {tab === "login" ? (
          <form onSubmit={onLogin}>
            <div className="ae-field">
              <label htmlFor="login-email">El. paštas{!requirePasswords ? " (neprivaloma)" : ""}</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={requirePasswords ? "Įrašykite savo el. paštą" : "Palikite tuščią — bus test@aeterna.local"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={requirePasswords}
              />
            </div>
            {requirePasswords && (
              <div className="ae-field">
                <label htmlFor="login-password">Slaptažodis</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Įveskite slaptažodį"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {err && <p className="ae-error">{err}</p>}
            <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy}>
              {busy ? "Jungiama…" : "Prisijungti"}
            </button>
            <p className="ae-hint ae-auth__hint">
              Pamiršote slaptažodį?{" "}
              <Link href="mailto:info@aeterna.lt?subject=Slaptažodžio%20atkūrimas">Susisiekite su mumis</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={onRegister}>
            <div className="ae-field">
              <label htmlFor="reg-name">Vardas, pavardė</label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Vardas Pavardė"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="ae-field">
              <label htmlFor="reg-email">El. paštas</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="Įrašykite savo el. paštą"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {requirePasswords && (
              <>
                <div className="ae-field">
                  <label htmlFor="reg-password">Naujas slaptažodis</label>
                  <input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Bent 8 simboliai"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="ae-field">
                  <label htmlFor="reg-password2">Pakartokite slaptažodį</label>
                  <input
                    id="reg-password2"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Pakartokite naują slaptažodį"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </>
            )}
            {err && <p className="ae-error">{err}</p>}
            <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy}>
              {busy ? "Kuriama paskyra…" : "Registruotis nemokamai"}
            </button>
          </form>
        )}
      </div>

      <p className="ae-hint" style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link href="/wizard">Sukurti atmintį be paskyros</Link>
        {" · "}
        <Link href="/">Grįžti į pradžią</Link>
      </p>
    </section>
  );
}

export default function PrisijungtiPage() {
  return (
    <Suspense
      fallback={
        <section className="ae-section">
          <p className="ae-hint" style={{ textAlign: "center" }}>
            Kraunama…
          </p>
        </section>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
