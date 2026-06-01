"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  approvePriestRequest,
  clearAdminToken,
  fetchPriestAccessRequests,
  getAdminToken,
  rejectPriestRequest,
  type PriestAccessRequest,
} from "@/lib/api";

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("lt-LT");
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [list, setList] = useState<PriestAccessRequest[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [issued, setIssued] = useState<{
    priestName: string;
    parishTitle: string;
    password: string;
    expiresAt: string;
  } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const data = await fetchPriestAccessRequests();
    setList(data);
  }

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => router.replace("/admin/login"));
  }, [router]);

  async function approve(id: string) {
    setBusyId(id);
    setErr(null);
    try {
      const res = await approvePriestRequest(id);
      setIssued({
        priestName: res.request.priestName,
        parishTitle: res.request.parishTitle,
        password: res.temporaryPassword,
        expiresAt: res.expiresAt,
      });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko patvirtinti");
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    if (!confirm("Atmesti šią užklausą?")) return;
    setBusyId(id);
    setErr(null);
    try {
      await rejectPriestRequest(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko atmesti");
    } finally {
      setBusyId(null);
    }
  }

  function logout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  const pending = list.filter((r) => r.status === "pending");

  return (
    <section className="ae-section">
      <div className="ae-priest-header">
        <div>
          <h1 className="ae-section-title" style={{ marginBottom: "0.25rem" }}>
            Klebonų prieiga
          </h1>
          <p className="ae-hint">Laukia: {pending.length}</p>
        </div>
        <button type="button" className="ae-btn ae-btn--outline" onClick={logout}>
          Atsijungti
        </button>
      </div>

      {issued && (
        <div className="ae-card ae-card--accent" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>Laikinas slaptažodis (rodomas vieną kartą)</h3>
          <p style={{ margin: "0 0 0.5rem" }}>
            <strong>{issued.priestName}</strong> — {issued.parishTitle}
          </p>
          <p
            className="ae-admin-temp-pass"
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              margin: "0.75rem 0",
              fontFamily: "monospace",
            }}
          >
            {issued.password}
          </p>
          <p className="ae-hint" style={{ margin: 0 }}>
            Galioja iki {formatDt(issued.expiresAt)}. Perduokite klebonui saugiai. Po pirmo prisijungimo
            slaptažodis nebegalios.
          </p>
          <button type="button" className="ae-btn ae-btn--outline" style={{ marginTop: "1rem" }} onClick={() => setIssued(null)}>
            Uždaryti
          </button>
        </div>
      )}

      {err && <p className="ae-error">{err}</p>}

      {pending.length === 0 ? (
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Nėra laukiančių užklausų.
        </p>
      ) : (
        <ul className="ae-admin-request-list">
          {pending.map((r) => (
            <li key={r.id} className="ae-card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
              <p style={{ margin: "0 0 0.25rem", fontWeight: 700 }}>{r.priestName}</p>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--ae-muted)" }}>{r.parishTitle}</p>
              <p style={{ margin: "0 0 0.25rem", fontSize: "0.85rem" }}>
                {r.email}
                {r.phone ? ` · ${r.phone}` : ""}
              </p>
              {r.note && <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem" }}>{r.note}</p>}
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", color: "var(--ae-muted)" }}>
                Pateikta {formatDt(r.createdAt)}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="ae-btn ae-btn--primary"
                  disabled={busyId === r.id}
                  onClick={() => approve(r.id)}
                >
                  Patvirtinti ir sugeneruoti slaptažodį
                </button>
                <button
                  type="button"
                  className="ae-btn ae-btn--outline"
                  disabled={busyId === r.id}
                  onClick={() => reject(r.id)}
                >
                  Atmesti
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {list.some((r) => r.status !== "pending") && (
        <>
          <h2 className="ae-section-title" style={{ fontSize: "1rem", marginTop: "2rem" }}>
            Archyvas
          </h2>
          <ul className="ae-admin-request-list" style={{ opacity: 0.85 }}>
            {list
              .filter((r) => r.status !== "pending")
              .map((r) => (
                <li key={r.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #eee", fontSize: "0.85rem" }}>
                  {r.priestName} — {r.parishTitle}{" "}
                  <span className={`ae-status ae-status--${r.status === "approved" ? "confirmed" : "pending"}`}>
                    {r.status === "approved" ? "patvirtinta" : "atmesta"}
                  </span>
                </li>
              ))}
          </ul>
        </>
      )}

      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link href="/">← Pradžia</Link>
      </p>
    </section>
  );
}
