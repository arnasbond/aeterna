"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { MemorialPublic } from "@/lib/api";

function formatDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("lt-LT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

type Props = {
  memorial: MemorialPublic;
  children?: ReactNode;
};

export function MemorialProfile({ memorial, children }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);
  const portrait =
    memorial.portraitUrl ?? memorial.mediaGallery[0] ?? memorial.parish.image;
  const gallery = memorial.mediaGallery;

  return (
    <article className="ae-memorial">
      <section
        className="ae-memorial-banner"
        style={{ backgroundImage: `url(${portrait})` }}
        aria-hidden
      />
      <header className="ae-memorial-head">
        <div className="ae-memorial-portrait-wrap">
          <img src={portrait} alt="" className="ae-memorial-portrait" referrerPolicy="no-referrer" />
        </div>
        <span className="ae-badge">{memorial.parish.diocese}</span>
        <p className="ae-memorial-parish">{memorial.parish.title}</p>
        <h1 className="ae-memorial-name">{memorial.fullName}</h1>
        <p className="ae-memorial-dates">
          <time dateTime={memorial.birthDate ?? undefined}>{formatDate(memorial.birthDate)}</time>
          <span className="ae-memorial-dates__sep" aria-hidden>
            —
          </span>
          <time dateTime={memorial.deathDate ?? undefined}>{formatDate(memorial.deathDate)}</time>
        </p>
        <p className="ae-memorial-tagline">Amžina atmintis ir šviesi palaima</p>
      </header>

      {memorial.farewellMessage && (
        <blockquote className="ae-memorial-quote">
          <p className="ae-memorial-quote__text">„{memorial.farewellMessage}"</p>
          <footer className="ae-memorial-quote__sign">— palikta jums, {memorial.fullName.split(" ")[0]}</footer>
        </blockquote>
      )}

      {memorial.videoUrl && (
        <section className="ae-memorial-video" aria-label="Atminimo video">
          <h2 className="ae-memorial-section-title">Šviesos akimirka</h2>
          <div className="ae-memorial-video__frame">
            {!videoFailed ? (
              <video
                key={memorial.videoUrl}
                src={memorial.videoUrl}
                poster={portrait}
                controls
                playsInline
                preload="metadata"
                className="ae-memorial-video__el"
                onError={() => setVideoFailed(true)}
              >
                Jūsų naršyklė nepalaiko video.
              </video>
            ) : (
              <p className="ae-memorial-video__fallback">
                Video nepavyko įkelti.{" "}
                <a href={memorial.videoUrl} target="_blank" rel="noopener noreferrer">
                  Atidaryti vaizdo įrašą →
                </a>
              </p>
            )}
          </div>
        </section>
      )}

      {memorial.biography && (
        <section className="ae-memorial-bio">
          <h2 className="ae-memorial-section-title">Gyvenimo istorija</h2>
          {memorial.biography.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      )}

      {gallery.length > 0 && (
        <section className="ae-memorial-photos" aria-label="Nuotraukų galerija">
          <h2 className="ae-memorial-section-title">Prisiminimai</h2>
          <div className="ae-memorial-photos__grid">
            {gallery.map((url, i) => (
              <button
                key={i}
                type="button"
                className="ae-memorial-photos__item"
                onClick={() => setLightbox(url)}
              >
                <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </section>
      )}

      {lightbox && (
        <div
          className="ae-memorial-lightbox"
          role="dialog"
          aria-modal
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button type="button" className="ae-memorial-lightbox__close" aria-label="Uždaryti">
            ×
          </button>
          <img src={lightbox} alt="" />
        </div>
      )}

      {children}
    </article>
  );
}
