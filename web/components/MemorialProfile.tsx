"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { MemorialGuestbook } from "@/components/MemorialGuestbook";
import type { MemorialPublic } from "@/lib/api";

type Tab = "photos" | "video" | "life" | "guestbook";

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

function splitBioForHero(biography: string, fullName: string) {
  const paragraphs = biography.split("\n\n").map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) {
    return { lead: `Gyvenimo kelias — ${fullName}`, heroParagraphs: [] as string[] };
  }
  const first = paragraphs[0];
  const dot = first.indexOf(". ");
  if (dot > 0 && dot <= 120) {
    const lead = first.slice(0, dot + 1);
    const rest = first.slice(dot + 1).trim();
    const heroParagraphs = rest ? [rest, ...paragraphs.slice(1)] : paragraphs.slice(1);
    return { lead, heroParagraphs };
  }
  if (first.length <= 100) {
    return { lead: first, heroParagraphs: paragraphs.slice(1) };
  }
  return {
    lead: `Gyvenimo kelias — ${fullName}`,
    heroParagraphs: paragraphs,
  };
}

type Props = {
  memorial: MemorialPublic;
  slug: string;
  children?: ReactNode;
};

export function MemorialProfile({ memorial, slug, children }: Props) {
  const [tab, setTab] = useState<Tab>("photos");
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
  const { lead, heroParagraphs } = splitBioForHero(memorial.biography ?? "", memorial.fullName);
  const bioParagraphs = memorial.biography
    ? memorial.biography.split("\n\n").map((p) => p.trim()).filter(Boolean)
    : [];
  const firstName = memorial.fullName.split(" ")[0];

  const tabs: { id: Tab; label: string }[] = [
    { id: "photos", label: "Nuotraukos" },
    { id: "video", label: "Video" },
    { id: "life", label: "Gyvenimo įvykiai" },
    { id: "guestbook", label: "Svečių knyga" },
  ];

  return (
    <article className="vk-memorial">
      <section className="vk-memorial-hero">
        <div className="vk-memorial-hero__inner vk-container">
          <Link href={`/parishes/${memorial.parish.id}`} className="vk-memorial-back">
            ← Atgal į kapavietę
          </Link>

          <div className="vk-memorial-frame">
            <img
              src={portrait}
              alt=""
              className="vk-memorial-portrait"
              referrerPolicy="no-referrer"
            />
            <h1 className="vk-memorial-name">{memorial.fullName}</h1>
            <p className="vk-memorial-years">{formatYears(memorial.birthDate, memorial.deathDate)}</p>
            {lead && <p className="vk-memorial-lead">{lead}</p>}
            {heroParagraphs.length > 0 && (
              <div className="vk-memorial-bio">
                {heroParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
            <p className="vk-memorial-parish">{memorial.parish.title}</p>
          </div>
        </div>
      </section>

      <div className="vk-container" style={{ padding: 0 }}>
        <div className="vk-memorial-tabs" role="tablist" aria-label="Memorialo skiltys">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`vk-memorial-tab${tab === t.id ? " vk-memorial-tab--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="vk-memorial-panel" role="tabpanel">
        <div className="vk-memorial-panel__inner">
          {tab === "photos" && (
            <>
              <h2 className="vk-memorial-panel__title">Nuotraukų galerija</h2>
              {gallery.length > 0 ? (
                <div className="vk-memorial-gallery">
                  {gallery.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      className="vk-memorial-gallery__item"
                      onClick={() => setLightbox(url)}
                    >
                      <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="vk-memorial-empty">Nuotraukų dar nėra.</p>
              )}
            </>
          )}

          {tab === "video" && (
            <>
              <h2 className="vk-memorial-panel__title">Video</h2>
              {memorial.videoUrl ? (
                <div className="vk-memorial-video">
                  {!videoFailed ? (
                    <video
                      key={memorial.videoUrl}
                      src={memorial.videoUrl}
                      poster={portrait}
                      controls
                      playsInline
                      preload="metadata"
                      className="vk-memorial-video__el"
                      onError={() => setVideoFailed(true)}
                    >
                      Jūsų naršyklė nepalaiko video.
                    </video>
                  ) : (
                    <p className="vk-memorial-video__fallback">
                      Video nepavyko įkelti.{" "}
                      <a href={memorial.videoUrl} target="_blank" rel="noopener noreferrer">
                        Atidaryti vaizdo įrašą →
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <p className="vk-memorial-empty">Video įrašo nėra.</p>
              )}
            </>
          )}

          {tab === "life" && (
            <>
              <h2 className="vk-memorial-panel__title">Gyvenimo įvykiai</h2>
              {memorial.farewellMessage && (
                <blockquote className="vk-memorial-quote">
                  <p>„{memorial.farewellMessage}"</p>
                  <footer>— palikta jums, {firstName}</footer>
                </blockquote>
              )}
              {bioParagraphs.length > 0 ? (
                <ol className="vk-memorial-timeline">
                  {bioParagraphs.map((para, i) => (
                    <li key={i}>
                      <p>{para}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="vk-memorial-empty">Gyvenimo istorija dar neužpildyta.</p>
              )}
            </>
          )}

          {tab === "guestbook" && (
            <>
              <h2 className="vk-memorial-panel__title">Svečių knyga</h2>
              <MemorialGuestbook slug={slug} />
            </>
          )}
        </div>
      </section>

      {lightbox && (
        <div
          className="vk-memorial-lightbox"
          role="dialog"
          aria-modal
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="vk-memorial-lightbox__close"
            aria-label="Uždaryti"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {children && (
        <section className="vk-memorial-tools">
          <div className="vk-memorial-tools__inner">{children}</div>
        </section>
      )}

      <p className="vk-memorial-support">Parama: {memorial.parish.supportGoal}</p>
    </article>
  );
}
