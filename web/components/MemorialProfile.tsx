"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MemorialCandleSheet } from "@/components/memorial/MemorialCandleSheet";
import { MemorialMassCalendar } from "@/components/memorial/MemorialMassCalendar";
import { MemorialVideoPlayer } from "@/components/memorial/MemorialVideoPlayer";
import { MemorialGuestbook } from "@/components/MemorialGuestbook";
import { VirtualCandles } from "@/components/VirtualCandles";
import { parishCardImage } from "@/lib/parish-image";
import type { MemorialPublic } from "@/lib/api";

function formatYears(birth: string | null, death: string | null) {
  const year = (d: string | null) => {
    if (!d) return "—";
    try {
      return new Date(d).getFullYear();
    } catch {
      return d.slice(0, 4);
    }
  };
  return `${year(birth)} – ${year(death)}`;
}

function epitaphFromBio(biography: string): string | null {
  if (!biography?.trim()) return null;
  const first = biography.split("\n\n").map((p) => p.trim()).filter(Boolean)[0] ?? "";
  if (!first) return null;
  const dot = first.indexOf(". ");
  if (dot > 0 && dot <= 140) return first.slice(0, dot + 1);
  if (first.length <= 120) return first;
  return null;
}

type Props = {
  memorial: MemorialPublic;
  slug: string;
  geo?: { lat: number; lng: number } | null;
  canEdit?: boolean;
};

export function MemorialProfile({ memorial, slug, geo, canEdit }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [candleOpen, setCandleOpen] = useState(false);
  const [massOpen, setMassOpen] = useState(false);

  const portrait =
    memorial.portraitUrl ??
    memorial.mediaGallery?.[0] ??
    parishCardImage(memorial.parish?.image ?? "", memorial.mediaGallery ?? []);
  const gallery = memorial.mediaGallery ?? [];
  const firstName = memorial.fullName.split(" ")[0];
  const epitaph = epitaphFromBio(memorial.biography ?? "");
  const bioParagraphs = memorial.biography
    ? memorial.biography.split("\n\n").map((p) => p.trim()).filter(Boolean)
    : [];
  const parishImg = parishCardImage(memorial.parish?.image ?? "", []);
  const location = geo ?? memorial.geoLocation;
  const parishTitle = memorial.parish?.title ?? "parapija";
  const parishId = memorial.parish?.id ?? "";

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("candle") === "1") {
      setCandleOpen(true);
    }
  }, []);

  function openGps() {
    if (!location) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    const bridge = (window as Window & { AeternaApp?: { openMaps?: (u: string) => void } }).AeternaApp;
    if (bridge?.openMaps) {
      bridge.openMaps(url);
      return;
    }
    // WebView dažnai blokuoja window.open — tas pats skirtukas veikia patikimiau
    window.location.assign(url);
  }

  return (
    <article className="ch-memorial">
      <header className="ch-memorial-top">
        <Link href="/" className="ch-logo chronicle-serif">
          <strong>AETERNA</strong>
        </Link>
        <Link href={`/parishes/${parishId}`} className="ch-memorial-top__parish">
          ← {parishTitle}
        </Link>
      </header>

      <section className="ch-memorial-hero">
        <div className="ch-memorial-arch">
          <img src={portrait} alt={memorial.fullName} className="ch-memorial-arch__img" referrerPolicy="no-referrer" />
        </div>
        <h1 className="ch-memorial-name chronicle-serif">{memorial.fullName}</h1>
        <p className="ch-memorial-years">{formatYears(memorial.birthDate, memorial.deathDate)}</p>
        {epitaph && <p className="ch-memorial-epitaph">{epitaph}</p>}
      </section>

      <div className="ch-memorial-actions ch-btn-row">
        <button type="button" className="ch-btn ch-btn--primary" onClick={() => setCandleOpen(true)}>
          🕯️ Uždegti žvakutę
        </button>
        {location ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
            className="ch-btn ch-btn--outline"
            onClick={(e) => {
              e.preventDefault();
              openGps();
            }}
            title="Atidaryti GPS maršrutą"
          >
            📍 Rasti kapavietę
          </a>
        ) : (
          <button
            type="button"
            className="ch-btn ch-btn--outline"
            disabled
            title="Kapo vieta dar nepažymėta"
          >
            📍 Rasti kapavietę
          </button>
        )}
      </div>

      {canEdit && (
        <p style={{ textAlign: "center", margin: "0 1rem" }}>
          <Link href={`/paskyra/atmintis/${slug}`} className="ch-btn ch-btn--gold ch-btn--block">
            Redaguoti biografiją ir nuotraukas
          </Link>
        </p>
      )}

      {bioParagraphs.length > 0 && (
        <section className="ch-memorial-bio">
          <h2 className="chronicle-serif">Gyvenimo istorija</h2>
          {bioParagraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      )}

      {memorial.farewellMessage && (
        <blockquote className="ch-memorial-quote">
          <p>„{memorial.farewellMessage}"</p>
        </blockquote>
      )}

      {memorial.videoUrl && (
        <MemorialVideoPlayer videoUrl={memorial.videoUrl} fullName={memorial.fullName} />
      )}

      {gallery.length > 0 && (
        <section className="ch-memorial-gallery">
          <h2 className="chronicle-serif">Nuotraukos</h2>
          <div className="ch-memorial-gallery__grid">
            {gallery.map((url, i) => (
              <button key={i} type="button" className="ch-memorial-gallery__item" onClick={() => setLightbox(url)}>
                <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="ch-parish-card">
        <div className="ch-parish-card__row">
          <img src={parishImg} alt="" className="ch-parish-card__img" referrerPolicy="no-referrer" />
          <div>
            <p style={{ margin: 0, lineHeight: 1.55 }}>
              <strong>{firstName}</strong> priklausė <strong>{parishTitle}</strong> parapijai. Šv. Mišias už
              velionę galite užsakyti čia.
            </p>
          </div>
        </div>
        <button type="button" className="ch-btn ch-btn--primary ch-btn--block" onClick={() => setMassOpen((v) => !v)}>
          {massOpen ? "Slėpti kalendorių" : "Užsakyti Šv. Mišias"}
        </button>
        {massOpen && parishId && (
          <MemorialMassCalendar
            parishId={parishId}
            parishTitle={parishTitle}
            deceasedName={memorial.fullName}
          />
        )}
      </section>

      <section className="ch-memorial-board">
        <h2 className="chronicle-serif">Uždegtos žvakutės</h2>
        <VirtualCandles slug={slug} parishTitle={parishTitle} />

        <h2 className="chronicle-serif" style={{ marginTop: "1.5rem" }}>
          Užuojautos ir sveikinimai
        </h2>
        <MemorialGuestbook slug={slug} />
      </section>

      {lightbox && (
        <div className="vk-memorial-lightbox" role="dialog" aria-modal onClick={() => setLightbox(null)}>
          <button type="button" className="vk-memorial-lightbox__close" aria-label="Uždaryti" onClick={() => setLightbox(null)}>
            ×
          </button>
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <MemorialCandleSheet
        slug={slug}
        parishTitle={parishTitle}
        open={candleOpen}
        onClose={() => setCandleOpen(false)}
        onSuccess={() => {}}
      />
    </article>
  );
}
