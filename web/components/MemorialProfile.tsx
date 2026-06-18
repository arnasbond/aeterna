"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MemorialCandleSheet } from "@/components/memorial/MemorialCandleSheet";
import { MemorialMassCalendar } from "@/components/memorial/MemorialMassCalendar";
import { MemorialVideoPlayer } from "@/components/memorial/MemorialVideoPlayer";
import { MemorialGuestbook } from "@/components/MemorialGuestbook";
import { VirtualCandles } from "@/components/VirtualCandles";
import { GraveLocationSet } from "@/components/GraveLocationSet";
import { MemorialLocationShare } from "@/components/MemorialLocationShare";
import { MemorialQrHub } from "@/components/memorial/MemorialQrHub";
import { FamilyTreeDisplay } from "@/components/memorial/FamilyTreeDisplay";
import { MemorialGalleryMasonry } from "@/components/memorial/MemorialGalleryMasonry";
import { MemorialGalleryStrip } from "@/components/memorial/MemorialGalleryStrip";
import { MemorialSectionTabs } from "@/components/memorial/MemorialSectionTabs";
import { MemorialSubNav } from "@/components/memorial/MemorialSubNav";
import { parishCardImage } from "@/lib/parish-image";
import { MapsOpenLink } from "@/components/MapsOpenLink";
import { googleMapsDirectionsUrl, googleMapsSearchUrl } from "@/lib/open-maps";
import { MEMORIAL_CHRONICLE_CARD, MEMORIAL_PILL_BTN } from "@/lib/glass-card";
import { MEMORIAL_EYEBROW } from "@/lib/memorial-theme";
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

function MemorialArchPortrait({ src, alt, large }: { src: string; alt: string; large?: boolean }) {
  return (
    <div
      className={`ch-memorial-arch ch-memorial-arch--viz mx-auto mb-4 ${
        large ? "w-52 sm:w-56 lg:w-full lg:max-w-[15rem]" : "w-44"
      }`}
    >
      <div className="ch-memorial-arch__leaf ch-memorial-arch__leaf--left" aria-hidden />
      <div className="ch-memorial-arch__ring">
        <div
          className={`ch-memorial-arch__frame overflow-hidden ${
            large ? "h-[14.5rem] sm:h-[15.5rem] lg:h-[17rem]" : "h-[13rem]"
          }`}
        >
          <img
            src={src}
            alt={alt}
            className="ch-memorial-arch__img h-full w-full object-cover object-[center_15%]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      <div className="ch-memorial-arch__leaf ch-memorial-arch__leaf--right" aria-hidden />
    </div>
  );
}

type Props = {
  memorial: MemorialPublic;
  slug: string;
  geo?: { lat: number; lng: number } | null;
  canEdit?: boolean;
  canClaim?: boolean;
  onGeoUpdated?: (lat: number, lng: number) => void;
};

export function MemorialProfile({ memorial, slug, geo, canEdit, canClaim, onGeoUpdated }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [candleOpen, setCandleOpen] = useState(false);
  const [massOpen, setMassOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);

  const portrait =
    memorial.portraitUrl ??
    memorial.mediaGallery?.[0] ??
    parishCardImage(memorial.parish?.image ?? "", memorial.mediaGallery ?? []);
  const gallery = memorial.isPremium
    ? (memorial.mediaGallery ?? [])
    : (memorial.mediaGallery ?? []).slice(0, 10);
  const showVideo = memorial.isPremium && !!memorial.videoUrl;
  const firstName = memorial.fullName.split(" ")[0];
  const epitaph = epitaphFromBio(memorial.biography ?? "");
  const bioParagraphs = memorial.biography
    ? memorial.biography.split("\n\n").map((p) => p.trim()).filter(Boolean)
    : [];
  const parishImg = parishCardImage(
    memorial.parish?.image ?? "",
    undefined,
    memorial.parish?.diocese
  );
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
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("pilna") === "1" || q.get("pilnas") === "1" || q.get("full") === "1") setExpanded(true);
    if (q.get("candle") === "1") {
      setExpanded(true);
      setCandleOpen(true);
    }
    if (q.get("nurodyti-vieta") === "1" || q.get("fix") === "1" || q.get("vieta") === "1") {
      if (canEdit) {
        setExpanded(true);
        setLocationPanelOpen(true);
        setTimeout(() => document.getElementById("grave-location-set")?.scrollIntoView({ behavior: "smooth" }), 300);
      }
    }
  }, [canEdit]);

  function scrollToLocationSet() {
    setLocationPanelOpen(true);
    setTimeout(() => document.getElementById("grave-location-set")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function scrollToLocationHelp() {
    setTimeout(() => document.getElementById("grave-location-help")?.scrollIntoView({ behavior: "smooth" }), 400);
  }

  function ensureExpanded() {
    setExpanded(true);
  }

  function openCandle() {
    ensureExpanded();
    setCandleOpen(true);
  }

  function openMass() {
    ensureExpanded();
    setMassOpen(true);
    setTimeout(() => document.getElementById("memorial-mass")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }

  function openGuestbook() {
    ensureExpanded();
    setTimeout(() => document.getElementById("memorial-guestbook")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }

  function scrollToGallery() {
    document.getElementById("memorial-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const memorialActions = (
    <div className="ch-memorial-actions ch-memorial-actions--sanctuary">
      <button type="button" className="ch-memorial-candle-bridge" onClick={openCandle}>
        <span className="ch-memorial-candle-bridge__orb" aria-hidden>
          🕯️
        </span>
        <span className="ch-memorial-candle-bridge__label">Uždegti žvakutę</span>
      </button>
      <div className="ch-memorial-actions--duo">
        <button type="button" className={`ch-btn ch-btn--sanctuary ${MEMORIAL_PILL_BTN}`} onClick={openMass}>
          ✝ Mišios
        </button>
        <button type="button" className={`ch-btn ch-btn--sanctuary ${MEMORIAL_PILL_BTN}`} onClick={openGuestbook}>
          💐 Užuojauta
        </button>
      </div>
    </div>
  );

  const mapsSearchQuery = `${memorial.fullName} kapinės ${parishTitle}`;

  const locationAction = (
    <div className="ch-memorial-actions ch-memorial-actions--solo">
      {location ? (
        <MapsOpenLink
          href={googleMapsDirectionsUrl(location.lat, location.lng)}
          className={`ch-btn ch-btn--sanctuary ch-btn--block ${MEMORIAL_PILL_BTN}`}
          title="Atidaryti GPS maršrutą"
        >
          📍 Rasti kapavietę
        </MapsOpenLink>
      ) : canEdit ? (
        <button
          type="button"
          className={`ch-btn ch-btn--sanctuary ch-btn--block ${MEMORIAL_PILL_BTN}`}
          onClick={scrollToLocationSet}
        >
          📍 Nurodyti kapavietę
        </button>
      ) : (
        <MapsOpenLink
          href={googleMapsSearchUrl(mapsSearchQuery)}
          className={`ch-btn ch-btn--sanctuary ch-btn--block ${MEMORIAL_PILL_BTN}`}
          onAfterClick={scrollToLocationHelp}
        >
          📍 Rasti kapavietę
        </MapsOpenLink>
      )}
    </div>
  );

  const anchorColumn = (
    <aside className="ch-memorial-anchor ch-memorial-sanctuary lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
      <div className="ch-memorial-sanctuary__inner">
        <p className="ch-memorial-sanctuary__eyebrow">{MEMORIAL_EYEBROW}</p>
        <section className="ch-memorial-hero">
          <MemorialArchPortrait src={portrait} alt={memorial.fullName} large />
          <h1 className="ch-memorial-name chronicle-serif">{memorial.fullName}</h1>
          <p className="ch-memorial-years">{formatYears(memorial.birthDate, memorial.deathDate)}</p>
          <div className="ch-memorial-sanctuary__divider" aria-hidden />
          {(expanded && epitaph) || memorial.farewellMessage ? (
            <p className="ch-memorial-epitaph">
              {epitaph ?? (memorial.farewellMessage ? `„${memorial.farewellMessage}"` : null)}
            </p>
          ) : (
            <p className="ch-memorial-epitaph ch-memorial-epitaph--soft">Amžinai širdyse</p>
          )}
        </section>

        {memorialActions}
        {locationAction}
      </div>

      {expanded ? (
        <button
          type="button"
          className={`ch-memorial-collapse ch-btn ch-btn--sanctuary ch-btn--block mt-4 ${MEMORIAL_PILL_BTN}`}
          onClick={() => setExpanded(false)}
        >
          ← Suskleisti (QR vaizdas)
        </button>
      ) : null}

      <MemorialSubNav visible={expanded} />

      {canEdit ? (
        <p className="ch-memorial-edit-link mt-4">
          <Link href={`/paskyra/atmintis/${slug}`} className={`ch-btn ch-btn--gold ch-btn--block ${MEMORIAL_PILL_BTN}`}>
            Redaguoti biografiją ir nuotraukas
          </Link>
        </p>
      ) : null}

      {!expanded ? (
        <div className="ch-memorial-sanctuary__qr mt-6 lg:mt-8">
          <MemorialQrHub
            slug={slug}
            fullName={memorial.fullName}
            qrCodeUrl={memorial.qrCodeUrl}
            profileUrl={memorial.profileUrl}
            expandable={!expanded}
            onExpand={() => setExpanded(true)}
            showPlateLink={!expanded}
            showName={false}
          />
        </div>
      ) : null}
    </aside>
  );

  const chronicleColumn = (
    <div className="ch-memorial-chronicle ch-memorial-chronicle--cream lg:col-span-7 space-y-6 sm:space-y-8 lg:space-y-10">
      {gallery.length > 0 ? (
        <MemorialGalleryStrip urls={gallery} onSelect={setLightbox} onViewAll={scrollToGallery} />
      ) : null}
      {expanded && location ? (
        <div className={MEMORIAL_CHRONICLE_CARD}>
          <MemorialLocationShare
            slug={slug}
            lat={location.lat}
            lng={location.lng}
            fullName={memorial.fullName}
          />
        </div>
      ) : null}

      {expanded && !location && canEdit ? (
        <div id="grave-location-set" className={MEMORIAL_CHRONICLE_CARD}>
          <GraveLocationSet
            slug={slug}
            memorialName={memorial.fullName}
            parishTitle={parishTitle}
            onSaved={onGeoUpdated}
            defaultOpen={locationPanelOpen}
          />
        </div>
      ) : null}

      {expanded && !location && !canEdit ? (
        <div id="grave-location-help" className={`grave-loc-help-banner ${MEMORIAL_CHRONICLE_CARD}`}>
          <h3 className="chronicle-serif text-lg mb-2">Kaip pririšti kapą prie šios atminties?</h3>
          <p className="ae-hint mb-3">
            Google Maps vieta <strong>automatiškai neišsaugoma</strong> — reikia nukopijuoti nuorodą ir įklijuoti čia
            AETERNA puslapyje.
          </p>
          <ol className="grave-loc-steps mb-3">
            <li>
              {canClaim ? (
                <>
                  <Link href={`/prisijungti?next=${encodeURIComponent(`/m/${slug}`)}`}>Prisijunkite</Link> ir
                  paspauskite <strong>„Pririšti prie mano paskyros“</strong> viršuje.
                </>
              ) : (
                <>
                  <Link href={`/prisijungti?next=${encodeURIComponent(`/m/${slug}?nurodyti-vieta=1`)}`}>
                    Prisijunkite
                  </Link>{" "}
                  kaip profilio savininkas (arba susikurkite paskyrą).
                </>
              )}
            </li>
            <li>
              Atsidarykite skiltį <strong>„Nurodyti kapavietę“</strong> → Maps → <em>Dalintis</em> → nukopijuokite
              nuorodą.
            </li>
            <li>
              Įklijuokite ir <strong>„Išsaugoti ir pririšti prie atminties“</strong> — tada galėsite dalintis puslapio
              nuoroda su maršrutu.
            </li>
          </ol>
          <MapsOpenLink href={googleMapsSearchUrl(mapsSearchQuery)} className="ch-btn ch-btn--outline">
            Atidaryti Maps paiešką
          </MapsOpenLink>
        </div>
      ) : null}

      {bioParagraphs.length > 0 ? (
        <section id="memorial-bio" className={`ch-memorial-panel ch-memorial-bio ${MEMORIAL_CHRONICLE_CARD}`}>
          <h2 className="chronicle-serif ch-memorial-panel__title">Gyvenimo istorija</h2>
          {bioParagraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </section>
      ) : null}

      {memorial.farewellMessage ? (
        <blockquote className={`ch-memorial-panel ch-memorial-quote ${MEMORIAL_CHRONICLE_CARD}`}>
          <p>„{memorial.farewellMessage}"</p>
        </blockquote>
      ) : null}

      {showVideo ? (
        <div className={`ch-memorial-panel ${MEMORIAL_CHRONICLE_CARD}`}>
          <MemorialVideoPlayer videoUrl={memorial.videoUrl!} fullName={memorial.fullName} />
        </div>
      ) : null}

      {gallery.length > 0 ? (
        <section id="memorial-gallery" className={`ch-memorial-panel ch-memorial-gallery ${MEMORIAL_CHRONICLE_CARD}`}>
          <h2 className="chronicle-serif ch-memorial-panel__title">Nuotraukos</h2>
          <MemorialGalleryMasonry urls={gallery} onSelect={setLightbox} />
        </section>
      ) : null}

      {expanded && memorial.isPremium && (memorial.familyTree?.length ?? 0) > 0 ? (
        <div className={MEMORIAL_CHRONICLE_CARD}>
          <FamilyTreeDisplay nodes={memorial.familyTree!} memorialName={memorial.fullName} />
        </div>
      ) : null}

      {expanded ? (
        <MemorialQrHub
          slug={slug}
          fullName={memorial.fullName}
          qrCodeUrl={memorial.qrCodeUrl}
          profileUrl={memorial.profileUrl}
          expandable={false}
          showPlateLink
        />
      ) : null}

      {expanded ? (
        <section id="memorial-mass" className={`ch-parish-card ${MEMORIAL_CHRONICLE_CARD}`}>
          <div className="ch-parish-card__row">
            <img src={parishImg} alt="" className="ch-parish-card__img rounded-xl" referrerPolicy="no-referrer" />
            <div>
              <p className="m-0 leading-relaxed">
                <strong>{firstName}</strong> priklausė <strong>{parishTitle}</strong> parapijai. Šv. Mišias už
                velionę galite užsakyti čia.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`ch-btn ch-btn--primary ch-btn--block mt-4 ${MEMORIAL_PILL_BTN}`}
            onClick={() => setMassOpen((v) => !v)}
          >
            {massOpen ? "Slėpti kalendorių" : "Užsakyti Šv. Mišias"}
          </button>
          {massOpen && parishId ? (
            <MemorialMassCalendar
              parishId={parishId}
              parishTitle={parishTitle}
              deceasedName={memorial.fullName}
            />
          ) : null}
        </section>
      ) : null}

      {expanded ? (
        <section className={`ch-memorial-board ${MEMORIAL_CHRONICLE_CARD}`}>
          <h2 className="chronicle-serif ch-memorial-panel__title" id="memorial-candles">
            Uždegtos žvakutės
          </h2>
          <VirtualCandles slug={slug} parishTitle={parishTitle} />

          <h2 className="chronicle-serif ch-memorial-panel__title mt-8" id="memorial-guestbook">
            Užuojauta ir intencijos
          </h2>
          <MemorialGuestbook slug={slug} />
        </section>
      ) : null}
    </div>
  );

  return (
    <article className={`ch-memorial ch-memorial--viz ch-memorial--editorial${expanded ? "" : " ch-memorial--compact"}`}>
      {parishId ? (
        <p className="hercules-memorial__back">
          <Link href={`/parishes/${parishId}`}>← {parishTitle}</Link>
        </p>
      ) : null}

      <div className="ch-memorial-layout ch-memorial-viz-shell lg:grid lg:grid-cols-12 lg:gap-8 lg:max-w-6xl lg:mx-auto">
        {anchorColumn}
        {chronicleColumn}
      </div>

      <MemorialSectionTabs visible={expanded} />

      {lightbox ? (
        <div className="vk-memorial-lightbox" role="dialog" aria-modal onClick={() => setLightbox(null)}>
          <button type="button" className="vk-memorial-lightbox__close" aria-label="Uždaryti" onClick={() => setLightbox(null)}>
            ×
          </button>
          <img src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}

      <MemorialCandleSheet
        slug={slug}
        parishTitle={parishTitle}
        isPremium={memorial.isPremium}
        open={candleOpen}
        onClose={() => setCandleOpen(false)}
        onSuccess={() => {}}
      />
    </article>
  );
}
