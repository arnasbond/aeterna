"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminLogin, getAdminToken, setAdminToken } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (getAdminToken()) router.replace("/admin");
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      router.push("/admin");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prisijungimas nepavyko");
    }
  }

  return (
    <section className="ae-section">
      <div className="ae-admin-login-card">
        <span className="ae-badge">Tik svetainės valdytojui</span>
        <h1 className="ae-section-title">Administratoriaus prisijungimas</h1>
        <p className="ae-admin-login-lead">
          Čia patvirtinate parapijos administratorių prieigos užklausas ir sugeneruojate jiems laikiną
          slaptažodį.
        </p>
        <form onSubmit={submit}>
          <div className="ae-field">
            <label htmlFor="admin-password">Jūsų administratoriaus slaptažodis</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Nustatytas api/.env faile"
            />
          </div>
          {err && <p className="ae-error">{err}</p>}
          {process.env.NODE_ENV === "development" && (
            <p className="ae-test-login-hint">
              Testavimui (laikina): slaptažodis <strong>12345678</strong>
            </p>
          )}
          <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide">
            Į administratoriaus skydelį
          </button>
        </form>
        <p className="ae-hint ae-admin-login-url">
          Tiesioginis adresas: <strong>/admin/login</strong>
        </p>
      </div>
      <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link href="/priest/login">Parapijos administratoriaus prisijungimas</Link>
        {" · "}
        <Link href="/">Pradžia</Link>
      </p>
    </section>
  );
}
