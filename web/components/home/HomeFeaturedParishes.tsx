"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchParishes, type Parish } from "@/lib/api";
import { GLASS_CARD } from "@/lib/glass-card";

const DEMO_MEMORIALS = [
  { slug: "ona-demo", name: "Stasė", years: "1936 – 2024" },
  { slug: "vardenis-pavardenis", name: "Vardenis Pavardenis", years: "1940 – 2020" },
] as const;

export function HomeFeaturedParishes() {
  const [parishes, setParishes] = useState<Parish[]>([]);

  useEffect(() => {
    fetchParishes()
      .then((list) => setParishes(list.slice(0, 8)))
      .catch(() => setParishes([]));
  }, []);

  return (
    <section className="vk-section vk-section--airy" id="parapijos">
      <div className="vk-container">
        {parishes.length > 0 && (
          <>
            <div className="vk-section-head vk-section-head--center">
              <span className="vk-badge">Parapijos</span>
              <h2 className="vk-title vk-title--center text-stone-900">Pasirinkite gimtąją parapiją</h2>
            </div>
            <div className="vk-hscroll" role="list">
              {parishes.map((p) => (
                <Link
                  key={p.id}
                  href={`/parishes/${encodeURIComponent(p.id)}`}
                  className={`vk-hscroll-card vk-hscroll-card--parish ${GLASS_CARD}`}
                  role="listitem"
                >
                  <img src={p.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="rounded-xl" />
                  <span className="vk-hscroll-card__badge text-[#0F2519]">{p.diocese}</span>
                  <h3 className="text-stone-900">{p.title}</h3>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="vk-section-head vk-section-head--center" style={{ marginTop: parishes.length > 0 ? "3rem" : 0 }}>
          <span className="vk-badge">Metraščiai</span>
          <h2 className="vk-title vk-title--center text-stone-900">Pavyzdiniai atminimo puslapiai</h2>
        </div>
        <div className="vk-hscroll" role="list">
          {DEMO_MEMORIALS.map((m) => (
            <Link
              key={m.slug}
              href={`/m/${m.slug}`}
              className={`vk-hscroll-card vk-hscroll-card--memorial ${GLASS_CARD}`}
              role="listitem"
            >
              <span className="vk-hscroll-card__icon text-[#D4AF37]" aria-hidden>
                ✦
              </span>
              <h3 className="text-stone-900">{m.name}</h3>
              <p className="text-[#0A1A10]/70">{m.years}</p>
            </Link>
          ))}
          <Link href="/paieska" className={`vk-hscroll-card vk-hscroll-card--more ${GLASS_CARD}`} role="listitem">
            <span className="vk-hscroll-card__icon text-[#D4AF37]" aria-hidden>
              →
            </span>
            <h3 className="text-stone-900">Ieškoti atminties</h3>
            <p className="text-[#0A1A10]/70">Visi vieši metraščiai</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
