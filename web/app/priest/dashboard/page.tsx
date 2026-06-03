"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SupportInbox } from "@/components/support/SupportInbox";
import {
  clearPriestToken,
  confirmPriestMass,
  createPriestMassSlot,
  fetchPriestDashboard,
  fetchPriestMasses,
  formatEuro,
  redirectToPriestLogin,
  type MassSlot,
  type PriestDashboard,
  validatePriestSession,
} from "@/lib/api";

type Tab = "masses" | "intentions" | "finance";

function formatDt(dt: string) {
  return new Date(dt).toLocaleString("lt-LT", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PriestDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("masses");
  const [dash, setDash] = useState<PriestDashboard | null>(null);
  const [masses, setMasses] = useState<MassSlot[]>([]);
  const [newDt, setNewDt] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  async function refresh() {
    const [d, m] = await Promise.all([fetchPriestDashboard(), fetchPriestMasses()]);
    setDash(d);
    setMasses(m);
  }

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const ok = await validatePriestSession();
      if (cancelled) return;
      if (!ok) {
        redirectToPriestLogin();
        return;
      }
      try {
        await refresh();
        if (!cancelled) setBooting(false);
      } catch {
        if (!cancelled) {
          clearPriestToken();
          redirectToPriestLogin();
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

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
    router.replace("/priest/login");
  }

  if (booting || !dash) {
    return (
      <section className="ae-section ae-auth-gate">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </section>
    );
  }

  const booked = masses.filter((m) => m.status === "booked" || m.status === "pending");
  const available = masses.filter((m) => m.status === "available");

  const tabs: { id: Tab; label: string }[] = [
    { id: "masses", label: "Šv. Mišios" },
    { id: "intentions", label: "Intencijos" },
    { id: "finance", label: "Finansai" },
  ];

  return (
    <section className="ae-section ch-priest-dash">
      <div className="ae-priest-header">
        <div>
          <h1 className="chronicle-serif">Parapijos skydas</h1>
          <p className="ae-hint">{dash.parish.title}</p>
        </div>
        <button type="button" className="ch-btn ch-btn--outline" onClick={logout}>
          Išeiti
        </button>
      </div>

      <nav className="ch-priest-tabs" aria-label="Skydo skiltys">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ch-priest-tab${tab === t.id ? " ch-priest-tab--on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "masses" && (
        <div className="ae-card">
          <h3>Šv. Mišių valdymas</h3>
          <p className="ae-hint">Pažymėkite laikus kaip laisvus arba užimtus — matomi memorialų kalendoriuje.</p>
          <form className="ae-priest-add-slot" onSubmit={addSlot} style={{ marginBottom: "1rem" }}>
            <input type="datetime-local" value={newDt} onChange={(e) => setNewDt(e.target.value)} required />
            <button type="submit" className="ch-btn ch-btn--primary">
              + Laisvas laikas
            </button>
          </form>
          {err && <p className="ae-error">{err}</p>}

          <ul className="ch-priest-checklist">
            {masses.map((m) => (
              <li key={m.id} className={`ch-priest-checklist__item ch-priest-checklist__item--${m.status}`}>
                <span>{formatDt(m.dateTime)}</span>
                <span className={`ae-status ae-status--${m.status === "available" ? "confirmed" : "pending"}`}>
                  {m.status === "available" ? "Laisva" : m.status === "pending" ? "Laukia" : "Užimta"}
                </span>
                {m.status === "pending" && (
                  <button type="button" className="ch-btn ch-btn--outline" style={{ padding: "0.35rem 0.6rem", fontSize: "0.72rem" }} onClick={() => confirm(m.id)}>
                    Patvirtinti
                  </button>
                )}
              </li>
            ))}
          </ul>
          <p className="ae-hint" style={{ marginTop: "0.75rem" }}>
            Laisvų: {available.length} · Užsakytų / laukiančių: {booked.length}
          </p>
        </div>
      )}

      {tab === "intentions" && (
        <div className="ae-card">
          <h3>Intencijų sąrašas</h3>
          <p className="ae-hint">Tiesioginis srautas — velionės vardas, intencija, mokėjimo būsena.</p>
          {booked.length === 0 ? (
            <p className="ae-hint">Kol kas nėra užsakytų mišių.</p>
          ) : (
            <ul className="ch-intentions-feed">
              {booked.map((m) => (
                <li key={m.id} className="ch-intentions-feed__item">
                  <div className="ch-intentions-feed__badge">✓ Apmokėta</div>
                  <p style={{ margin: "0.25rem 0", fontWeight: 700 }}>{formatDt(m.dateTime)}</p>
                  {m.intentions && <p style={{ margin: 0, fontSize: "0.9rem" }}>{m.intentions}</p>}
                  {m.bookedBy && (
                    <p className="ae-hint" style={{ margin: "0.25rem 0 0" }}>
                      Užsakovas: {m.bookedBy}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "finance" && (
        <div className="ae-card">
          <h3>Finansai — skaidrumas</h3>
          <p className="ae-hint">Visos sumos, gautos tiesiogiai į parapijos banko sąskaitą per AETERNA.</p>
          <div className="ae-finance-grid">
            <article className="ae-card">
              <h4>Žvakutės</h4>
              <p className="ae-finance-value">{formatEuro(dash.finances.candlesTotalCents)}</p>
            </article>
            <article className="ae-card">
              <h4>Šv. Mišios</h4>
              <p className="ae-finance-value">{formatEuro(dash.finances.massesTotalCents)}</p>
            </article>
            <article className="ae-card ae-card--accent">
              <h4>Iš viso</h4>
              <p className="ae-finance-value">{formatEuro(dash.finances.totalCents)}</p>
            </article>
          </div>
        </div>
      )}

      <div className="ae-card" style={{ marginTop: "1rem" }}>
        <SupportInbox mode="priest" parishId={dash.parish.id} authorName={dash.parish.title} />
      </div>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        <Link href="/priest/profile" className="ae-hint">
          Redaguoti parapijos profilį
        </Link>
        {" · "}
        <Link href="/">Pradžia</Link>
      </p>
    </section>
  );
}
