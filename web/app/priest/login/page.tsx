"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchParishes, getPriestToken, priestLogin, setPriestToken, type Parish } from "@/lib/api";

function PriestLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (getPriestToken()) router.replace("/priest/dashboard");
    fetchParishes().then((p) => {
      setParishes(p);
      const fromUrl = searchParams.get("parish");
      const preferred = fromUrl && p.some((x) => x.id === fromUrl) ? fromUrl : p[0]?.id;
      if (preferred) setParishId(preferred);
    });
  }, [router, searchParams]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const session = await priestLogin(parishId, password);
      setPriestToken(session.token);
      router.push("/priest/dashboard");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Prisijungimas nepavyko");
    }
  }

  return (
    <section className="ae-section ae-wizard">
      <h1 className="ae-section-title">Klebono prisijungimas</h1>
      <p className="ae-hint" style={{ textAlign: "center", marginBottom: "1.5rem", maxWidth: "30rem", marginInline: "auto" }}>
        Prisijunkite tik su administratoriaus patvirtintu laikinu slaptažodžiu. Jei jo neturite — pateikite
        prieigos užklausą.
      </p>
      <form onSubmit={submit}>
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
        {process.env.NODE_ENV === "development" && (
          <p className="ae-test-login-hint">
            Testavimui (laikina): bet kuri parapija + slaptažodis <strong>12345678</strong>
          </p>
        )}
        <button type="submit" className="ae-btn ae-btn--gold ae-btn--wide">
          Prisijungti
        </button>
      </form>
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

export default function PriestLoginPage() {
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
      <PriestLoginForm />
    </Suspense>
  );
}
