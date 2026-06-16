"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchParishes, type Parish } from "@/lib/api";
import { HERCULES_FLOAT } from "@/lib/hercules-theme";
import { parishCardImage } from "@/lib/parish-image";

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
              <h2 className="vk-title vk-title--center">Pasirinkite gimtąją parapiją</h2>
            </div>
            <div className="vk-hscroll" role="list">
              {parishes.map((p) => (
                <Link
                  key={p.id}
                  href={`/parishes/${encodeURIComponent(p.id)}`}
                  className={`vk-hscroll-card vk-hscroll-card--parish ${HERCULES_FLOAT}`}
                  role="listitem"
                >
                  <img
                    src={parishCardImage(p.image, undefined, p.diocese)}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="hercules-parish-card__img"
                  />
                  <span className="vk-hscroll-card__badge">{p.diocese}</span>
                  <h3>{p.title}</h3>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="vk-section-head vk-section-head--center" style={{ marginTop: parishes.length > 0 ? "3rem" : 0 }}>
          <span className="vk-badge">Metraščiai</span>
          <h2 className="vk-title vk-title--center">Pavyzdiniai atminimo puslapiai</h2>
        </div>
        <div className="vk-hscroll" role="list">
          {DEMO_MEMORIALS.map((m) => (
            <Link
              key={m.slug}
              href={`/m/${m.slug}`}
              className={`vk-hscroll-card vk-hscroll-card--memorial ${HERCULES_FLOAT}`}
              role="listitem"
            >
              <span className="vk-hscroll-card__icon" aria-hidden>
                ✦
              </span>
              <h3>{m.name}</h3>
              <p>{m.years}</p>
            </Link>
          ))}
          <Link href="/paieska" className={`vk-hscroll-card vk-hscroll-card--more ${HERCULES_FLOAT}`} role="listitem">
            <span className="vk-hscroll-card__icon" aria-hidden>
              →
            </span>
            <h3>Ieškoti atminties</h3>
            <p>Visi vieši metraščiai</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
