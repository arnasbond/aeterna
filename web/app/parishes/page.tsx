"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchParishes, type Parish } from "@/lib/api";

export default function ParishesPage() {
  const [list, setList] = useState<Parish[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchParishes()
      .then(setList)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <section className="ae-section">
      <h1 className="ae-section-title">Parapijos</h1>
      <div className="ae-divider" />
      <p style={{ textAlign: "center", color: "var(--ae-muted)", marginBottom: "1rem" }}>
        Pasirinkite parapiją, kuriai skiriama parama nuo Jūsų atminimo puslapio užsakymo.
      </p>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link href="/map" className="ae-btn ae-btn--outline">
          Atidaryti interaktyvų žemėlapį
        </Link>
      </p>
      {err && <p style={{ color: "#b91c1c", textAlign: "center" }}>{err}</p>}
      <div className="ae-parish-grid">
        {list.map((p) => (
          <article key={p.id} className="ae-card ae-parish-card">
            <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
            <span className="ae-badge">{p.diocese}</span>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>{p.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--ae-muted)", margin: "0 0 1rem" }}>
              {p.supportGoal}
            </p>
            <Link
              href={`/parishes/${encodeURIComponent(p.id)}`}
              className="ae-btn ae-btn--primary"
              style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}
            >
              Parapijos puslapis
            </Link>
            <Link
              href={`/wizard?parish=${encodeURIComponent(p.id)}`}
              className="ae-btn ae-btn--outline"
              style={{ display: "block", width: "100%" }}
            >
              Sukurti atmintį
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
