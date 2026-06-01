"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { fetchParishes, submitPriestAccessRequest, type Parish } from "@/lib/api";

function RequestForm() {
  const searchParams = useSearchParams();
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [parishId, setParishId] = useState("");
  const [priestName, setPriestName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchParishes().then((p) => {
      setParishes(p);
      const fromUrl = searchParams.get("parish");
      const preferred = fromUrl && p.some((x) => x.id === fromUrl) ? fromUrl : p[0]?.id;
      if (preferred) setParishId(preferred);
    });
  }, [searchParams]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      const res = await submitPriestAccessRequest({
        parishId,
        priestName,
        email,
        phone: phone || undefined,
        note: note || undefined,
      });
      setOk(res.message);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko pateikti užklausos");
    } finally {
      setBusy(false);
    }
  }

  if (ok) {
    return (
      <section className="ae-section ae-wizard">
        <h1 className="ae-section-title">Užklausa priimta</h1>
        <p className="ae-ok" style={{ textAlign: "center", maxWidth: "28rem", margin: "0 auto 1.5rem" }}>
          {ok}
        </p>
        <p style={{ textAlign: "center" }}>
          <Link href="/priest/login" className="ae-btn ae-btn--outline">
            Į prisijungimą
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="ae-section ae-wizard">
      <h1 className="ae-section-title">Prieigos užklausa</h1>
      <p className="ae-hint" style={{ textAlign: "center", marginBottom: "1.5rem", maxWidth: "32rem", marginInline: "auto" }}>
        Klebonas gali prisijungti tik gavęs administratoriaus patvirtinimą ir laikiną slaptažodį el. paštu
        arba kitu saugiu kanalu.
      </p>
      <form onSubmit={submit}>
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
          <label>Klebono vardas ir pavardė</label>
          <input value={priestName} onChange={(e) => setPriestName(e.target.value)} required />
        </div>
        <div className="ae-field">
          <label>El. paštas</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="ae-field">
          <label>Telefonas (neprivaloma)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="ae-field">
          <label>Pastaba administratoriui</label>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pvz. naujas klebonas nuo 2026 m." />
        </div>
        {err && <p className="ae-error">{err}</p>}
        <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy}>
          {busy ? "Siunčiama…" : "Pateikti užklausą"}
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "1.25rem" }}>
        <Link href="/priest/login">Jau turite laikiną slaptažodį? Prisijungti</Link>
      </p>
    </section>
  );
}

export default function PriestRequestPage() {
  return (
    <Suspense fallback={<section className="ae-section"><p className="ae-hint" style={{ textAlign: "center" }}>Kraunama…</p></section>}>
      <RequestForm />
    </Suspense>
  );
}
