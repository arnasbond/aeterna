"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearPriestToken,
  confirmPriestMass,
  createPriestMassSlot,
  fetchPriestDashboard,
  fetchPriestMasses,
  formatEuro,
  getPriestToken,
  type MassSlot,
  type PriestDashboard,
} from "@/lib/api";

function formatDt(dt: string) {
  return new Date(dt).toLocaleString("lt-LT");
}

export default function PriestDashboardPage() {
  const router = useRouter();
  const [dash, setDash] = useState<PriestDashboard | null>(null);
  const [masses, setMasses] = useState<MassSlot[]>([]);
  const [newDt, setNewDt] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const [d, m] = await Promise.all([fetchPriestDashboard(), fetchPriestMasses()]);
    setDash(d);
    setMasses(m);
  }

  useEffect(() => {
    if (!getPriestToken()) {
      router.replace("/priest/login");
      return;
    }
    refresh().catch(() => router.replace("/priest/login"));
  }, [router]);

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!newDt) return;
    try {
      await createPriestMassSlot(new Date(newDt).toISOString());
      setNewDt("");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko pridėti");
    }
  }

  async function confirm(id: string) {
    await confirmPriestMass(id);
    await refresh();
  }

  function logout() {
    clearPriestToken();
    router.push("/priest/login");
  }

  if (!dash) return <section className="ae-section">Kraunama…</section>;

  return (
    <section className="ae-section">
      <div className="ae-priest-header">
        <div>
          <h1>Klebono skydas</h1>
          <p className="ae-hint">{dash.parish.title}</p>
        </div>
        <button type="button" className="ae-btn ae-btn--outline" onClick={logout}>
          Atsijungti
        </button>
      </div>

      <div className="ae-finance-grid">
        <article className="ae-card">
          <h3>Žvakutės</h3>
          <p className="ae-finance-value">{formatEuro(dash.finances.candlesTotalCents)}</p>
        </article>
        <article className="ae-card">
          <h3>Šv. Mišios</h3>
          <p className="ae-finance-value">{formatEuro(dash.finances.massesTotalCents)}</p>
        </article>
        <article className="ae-card">
          <h3>Memorialai</h3>
          <p className="ae-finance-value">{formatEuro(dash.finances.memorialsTotalCents)}</p>
        </article>
        <article className="ae-card ae-card--accent">
          <h3>Iš viso parapijai</h3>
          <p className="ae-finance-value">{formatEuro(dash.finances.totalCents)}</p>
        </article>
      </div>

      <p className="ae-hint">
        Laukia patvirtinimo: <strong>{dash.pendingMasses}</strong> · Laisvi laikai:{" "}
        <strong>{dash.upcomingSlots}</strong>
      </p>

      <div className="ae-card ae-priest-profile-cta" style={{ marginTop: "1.5rem" }}>
        <h3>Parapijos profilis</h3>
        <p className="ae-hint">
          Užpildykite kontaktus, mišių laikus ir naujienas — matoma viešame parapijos puslapyje. Galite
          perkelti informaciją iš oficialios svetainės.
        </p>
        <Link href="/priest/profile" className="ae-btn ae-btn--gold">
          Redaguoti parapijos profilį
        </Link>
      </div>

      <div className="ae-card" style={{ marginTop: "2rem" }}>
        <h3>Mišių kalendorius</h3>
        <form className="ae-priest-add-slot" onSubmit={addSlot}>
          <input type="datetime-local" value={newDt} onChange={(e) => setNewDt(e.target.value)} required />
          <button type="submit" className="ae-btn ae-btn--primary">
            Pridėti laiką
          </button>
        </form>
        {err && <p className="ae-error">{err}</p>}

        <ul className="ae-priest-mass-list">
          {masses.map((m) => (
            <li key={m.id}>
              <div>
                <strong>{formatDt(m.dateTime)}</strong>
                <span className={`ae-status ae-status--${m.status}`}>{m.status}</span>
                {m.intentions && <p className="ae-hint">Intencija: {m.intentions}</p>}
                {m.bookedBy && <p className="ae-hint">Užsakovas: {m.bookedBy}</p>}
              </div>
              {m.status === "pending" && (
                <button type="button" className="ae-btn ae-btn--outline" onClick={() => confirm(m.id)}>
                  Patvirtinti
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link href="/">← Atgal į svetainę</Link>
      </p>
    </section>
  );
}
