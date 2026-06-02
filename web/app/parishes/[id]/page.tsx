"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareBar } from "@/components/ShareBar";
import { getSiteOrigin } from "@/lib/site";
import { useParams } from "next/navigation";
import { CandleSection } from "@/components/CandleSection";
import { MassBookingSection } from "@/components/MassBookingSection";
import { ParishProfilePublic, parishHeroImage } from "@/components/parish/ParishProfilePublic";
import { fetchParish, mapsDirectionsUrl, type ParishDetail } from "@/lib/api";

export default function ParishHubPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [parish, setParish] = useState<ParishDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchParish(id)
      .then((p) => {
        setParish(p);
        if (!p) setErr("Parapija nerasta");
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Klaida"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="ae-section">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </section>
    );
  }

  if (!parish || err) {
    return (
      <section className="ae-section">
        <h1 className="ae-section-title">Parapija nerasta</h1>
        <p style={{ textAlign: "center" }}>
          <Link href="/map" className="ae-btn ae-btn--outline">
            Grįžti į žemėlapį
          </Link>
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="ae-parish-hero">
        <div className="ae-parish-hero__media">
          <img src={parishHeroImage(parish)} alt={parish.title} />
        </div>
        <div className="ae-parish-hero__body">
          <span className="ae-badge">{parish.diocese}</span>
          <h1>{parish.title}</h1>
          <p className="ae-parish-hero__meta">
            {parish.city && <span>{parish.city} · </span>}
            {parish.deaneryName}
          </p>
          <p style={{ color: "var(--ae-muted)", marginBottom: "1.25rem" }}>{parish.supportGoal}</p>
          {parish.websiteUrl && (
            <p style={{ marginBottom: "1rem" }}>
              <a href={parish.websiteUrl} target="_blank" rel="noreferrer" className="ae-map-popup-link">
                Oficiali parapijos svetainė (katalikai.lt) →
              </a>
            </p>
          )}
          <div className="ae-parish-hero__actions">
            <Link href={`/wizard?parish=${encodeURIComponent(parish.id)}`} className="ae-btn ae-btn--primary">
              Sukurti atmintį
            </Link>
            <a
              href={mapsDirectionsUrl(parish.lat, parish.lng)}
              target="_blank"
              rel="noreferrer"
              className="ae-btn ae-btn--outline"
            >
              Maršrutas
            </a>
            <Link href="/map" className="ae-btn ae-btn--outline">
              Žemėlapis
            </Link>
            <Link
              href={`/priest/login?parish=${encodeURIComponent(parish.id)}`}
              className="ae-btn ae-btn--gold"
            >
              Klebono prisijungimas
            </Link>
            <Link
              href={`/priest/request?parish=${encodeURIComponent(parish.id)}`}
              className="ae-btn ae-btn--outline"
            >
              Prieigos užklausa
            </Link>
          </div>
          <ShareBar
            className="ae-parish-hero__share"
            url={`${getSiteOrigin()}/parishes/${parish.id}`}
            title={`${parish.title} — AETERNA`}
            text={`${parish.title} — skaitmeninis atminimas ir parama parapijai.`}
          />
        </div>
      </section>

      <section className="ae-section ae-section--white" id="profilis">
        <h2 className="ae-section-title">Parapijos informacija</h2>
        <div className="ae-divider" />
        <ParishProfilePublic parish={parish} />
      </section>

      <section className="ae-section ae-section--white">
        <h2 className="ae-section-title">Parapijos paslaugos</h2>
        <div className="ae-divider" />
        <div className="ae-parish-hub-grid">
          <Link href={`/wizard?parish=${encodeURIComponent(parish.id)}`} className="ae-card ae-parish-hub-card">
            <span className="ae-parish-hub-icon">✎</span>
            <h3>Skaitmeninė atmintis</h3>
            <p>Sukurkite memorialinį puslapį su QR ant paminklo. Parama skiriama šiai parapijai.</p>
          </Link>
          <a href="#misios" className="ae-card ae-parish-hub-card">
            <span className="ae-parish-hub-icon">✝</span>
            <h3>Šv. Mišios</h3>
            <p>Užsakykite intenciją ir paaukokite už liturgiją šioje parapijoje.</p>
          </a>
          <a href="#zvakute" className="ae-card ae-parish-hub-card">
            <span className="ae-parish-hub-icon">🕯</span>
            <h3>Virtuali žvakutė</h3>
            <p>Prisiminkite artimąjį — suraskite memorialą ir uždegkite žvakutę.</p>
          </a>
          <Link href="/m/ona-demo" className="ae-card ae-parish-hub-card">
            <span className="ae-parish-hub-icon">▣</span>
            <h3>Demo memorialas</h3>
            <p>Šiltas demo profilis — močiutės Stasės atmintis su nuotraukomis ir žvakutėmis.</p>
          </Link>
        </div>
      </section>

      <MassBookingSection initialParishId={parish.id} lockParish />
      <CandleSection />
    </>
  );
}
