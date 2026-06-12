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
import { parishCardImage } from "@/lib/parish-image";
import { MapsOpenLink } from "@/components/MapsOpenLink";
import { googleMapsDirectionsUrl, googleMapsSearchUrl } from "@/lib/open-maps";
import { GLASS_CARD, MEMORIAL_PILL_BTN } from "@/lib/glass-card";
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

function MemorialArchPortrait({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="ch-memorial-arch mx-auto mb-4 w-44 rounded-t-full bg-gradient-to-b from-[#D4AF37]/30 to-transparent p-[1px]">
      <div className="h-[13rem] overflow-hidden rounded-t-full border border-white bg-[#FCFBF7] shadow-[0_8px_28px_rgba(15,37,25,0.08)]">
        <img
          src={src}
          alt={alt}
          className="ch-memorial-arch__img h-full w-full object-cover object-[center_15%]"
          referrerPolicy="no-referrer"
        />
      </div>
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

  const mapsSearchQuery = `${memorial.fullName} kapinės ${parishTitle}`;

  const compactCore = (
    <>
      <section className="ch-memorial-hero">
        <MemorialArchPortrait src={portrait} alt={memorial.fullName} />
        <h1 className="ch-memorial-name chronicle-serif text-stone-900">{memorial.fullName}</h1>
        <p className="ch-memorial-years">{formatYears(memorial.birthDate, memorial.deathDate)}</p>
        {!expanded && epitaph && <p className="ch-memorial-epitaph">{epitaph}</p>}
      </section>

      {canEdit && (
        <p style={{ textAlign: "center", margin: "0 1rem 0.5rem" }}>
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

      <MemorialQrHub
        slug={slug}
        fullName={memorial.fullName}
        qrCodeUrl={memorial.qrCodeUrl}
        profileUrl={memorial.profileUrl}
        expandable={!expanded}
        onExpand={() => setExpanded(true)}
        showPlateLink={!expanded}
      />
    </>
  );

  return (
    <article className={`ch-memorial${expanded ? "" : " ch-memorial--compact"}`}>
      <header className="ch-memorial-top">
        <Link href="/" className="ch-logo chronicle-serif">
          <strong>AETERNA</strong>
        </Link>
        <Link href={`/parishes/${parishId}`} className="ch-memorial-top__parish">
          ← {parishTitle}
        </Link>
      </header>

      {!expanded ? (
        compactCore
      ) : (
        <>
      <section className="ch-memorial-hero">
        <MemorialArchPortrait src={portrait} alt={memorial.fullName} />
        <h1 className="ch-memorial-name chronicle-serif text-stone-900">{memorial.fullName}</h1>
        <p className="ch-memorial-years">{formatYears(memorial.birthDate, memorial.deathDate)}</p>
        {epitaph && <p className="ch-memorial-epitaph">{epitaph}</p>}
      </section>

      <p style={{ textAlign: "center", margin: "0 1rem 0.75rem" }}>
        <button type="button" className="ch-btn ch-btn--outline ch-btn--block" onClick={() => setExpanded(false)}>
          ← Suskleisti (QR vaizdas)
        </button>
      </p>

      <div className="ch-memorial-actions ch-btn-row">
        <button
          type="button"
          className={`ch-btn ch-btn--primary ${MEMORIAL_PILL_BTN} !bg-[#0F2519] !border-[#0F2519] hover:!bg-[#0A1A10]`}
          onClick={() => setCandleOpen(true)}
        >
          🕯️ Uždegti žvakutę
        </button>
        {location ? (
          <MapsOpenLink
            href={googleMapsDirectionsUrl(location.lat, location.lng)}
            className={`ch-btn ch-btn--outline ${MEMORIAL_PILL_BTN} !text-[#0A1A10] !border-[#D4AF37]/40`}
            title="Atidaryti GPS maršrutą"
          >
            📍 Rasti kapavietę
          </MapsOpenLink>
        ) : canEdit ? (
          <button
            type="button"
            className={`ch-btn ch-btn--outline ${MEMORIAL_PILL_BTN} !text-[#0A1A10] !border-[#D4AF37]/40`}
            onClick={scrollToLocationSet}
          >
            📍 Nurodyti kapavietę
          </button>
        ) : (
          <MapsOpenLink
            href={googleMapsSearchUrl(mapsSearchQuery)}
            className={`ch-btn ch-btn--outline ${MEMORIAL_PILL_BTN} !text-[#0A1A10] !border-[#D4AF37]/40`}
            onAfterClick={scrollToLocationHelp}
          >
            📍 Rasti kapavietę
          </MapsOpenLink>
        )}
      </div>

      {location && (
        <div style={{ margin: "0 1rem 1.25rem", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          <MemorialLocationShare
            slug={slug}
            lat={location.lat}
            lng={location.lng}
            fullName={memorial.fullName}
          />
        </div>
      )}

      {!location && canEdit && (
        <div
          id="grave-location-set"
          style={{ margin: "0 1rem 1rem", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}
        >
          <GraveLocationSet
            slug={slug}
            memorialName={memorial.fullName}
            parishTitle={parishTitle}
            onSaved={onGeoUpdated}
            defaultOpen={locationPanelOpen}
          />
        </div>
      )}

      {!location && !canEdit && (
        <div
          id="grave-location-help"
          className="grave-loc-help-banner ae-card"
          style={{ margin: "0 1rem 1rem", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}
        >
          <h3 className="chronicle-serif" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Kaip pririšti kapą prie šios atminties?
          </h3>
          <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
            Google Maps vieta <strong>automatiškai neišsaugoma</strong> — reikia nukopijuoti nuorodą ir įklijuoti čia
            AETERNA puslapyje.
          </p>
          <ol className="grave-loc-steps" style={{ marginBottom: "0.75rem" }}>
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
      )}

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

      {memorial.isPremium && (memorial.familyTree?.length ?? 0) > 0 && (
        <FamilyTreeDisplay nodes={memorial.familyTree!} memorialName={memorial.fullName} />
      )}

      <MemorialQrHub
        slug={slug}
        fullName={memorial.fullName}
        qrCodeUrl={memorial.qrCodeUrl}
        profileUrl={memorial.profileUrl}
        expandable={false}
        showPlateLink
      />

      <section className={`ch-parish-card ${GLASS_CARD} !p-5`}>
        <div className="ch-parish-card__row">
          <img src={parishImg} alt="" className="ch-parish-card__img rounded-xl" referrerPolicy="no-referrer" />
          <div>
            <p style={{ margin: 0, lineHeight: 1.55 }} className="text-[#0A1A10]">
              <strong>{firstName}</strong> priklausė <strong>{parishTitle}</strong> parapijai. Šv. Mišias už
              velionę galite užsakyti čia.
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`ch-btn ch-btn--primary ch-btn--block ${MEMORIAL_PILL_BTN} !bg-[#0F2519] !border-[#0F2519] hover:!bg-[#0A1A10]`}
          onClick={() => setMassOpen((v) => !v)}
        >
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

      <section className={`ch-memorial-board ${GLASS_CARD} !p-5 !mt-8 !border-t-0`}>
        <h2 className="chronicle-serif">Uždegtos žvakutės</h2>
        <VirtualCandles slug={slug} parishTitle={parishTitle} />

        <h2 className="chronicle-serif" style={{ marginTop: "1.5rem" }}>
          Užuojautos ir sveikinimai
        </h2>
        <MemorialGuestbook slug={slug} />
      </section>

        </>
      )}

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
        isPremium={memorial.isPremium}
        open={candleOpen}
        onClose={() => setCandleOpen(false)}
        onSuccess={() => {}}
      />
    </article>
  );
}
