"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchParishes, type Parish } from "@/lib/api";
import { GLASS_CARD } from "@/lib/glass-card";

export default function ParishesPage() {
  const [list, setList] = useState<Parish[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchParishes()
      .then(setList)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <section className="ae-section relative px-6 py-12">
      <h1 className="ae-section-title font-serif text-stone-900">Parapijos</h1>
      <div className="ae-divider" />
      <p className="mx-auto mb-4 max-w-lg text-center text-[#0A1A10]/75">
        Pasirinkite parapiją, kuriai skiriama parama nuo Jūsų atminimo puslapio užsakymo.
      </p>
      <p className="mb-8 text-center">
        <Link href="/map" className="ae-btn ae-btn--outline !rounded-full !border-[#D4AF37]/40">
          Atidaryti interaktyvų žemėlapį
        </Link>
      </p>
      {err && <p style={{ color: "#b91c1c", textAlign: "center" }}>{err}</p>}
      <div className="ae-parish-grid">
        {list.map((p) => (
          <article key={p.id} className={`ae-card ae-parish-card ${GLASS_CARD}`}>
            <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="rounded-xl" />
            <span className="ae-badge text-[#0F2519]">{p.diocese}</span>
            <h3 className="font-serif text-stone-900" style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
              {p.title}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--ae-muted)", margin: "0 0 1rem" }}>
              {p.supportGoal}
            </p>
            <Link
              href={`/parishes/${encodeURIComponent(p.id)}`}
              className="ae-btn ae-btn--primary !rounded-full"
              style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}
            >
              Parapijos puslapis
            </Link>
            <Link
              href={`/wizard?parish=${encodeURIComponent(p.id)}`}
              className="ae-btn ae-btn--outline !rounded-full !border-[#D4AF37]/40"
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
