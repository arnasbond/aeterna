"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { GeoFixButton } from "@/components/GeoFixButton";
import { MemorialProfile } from "@/components/MemorialProfile";
import { NavigateToGrave } from "@/components/NavigateToGrave";
import { ShareBar } from "@/components/ShareBar";
import { fetchMemorial, fetchUserMemorial, getUserToken, type MemorialPublic } from "@/lib/api";
import { getSiteOrigin } from "@/lib/site";

function MemorialInner({ slug }: { slug: string }) {
  const search = useSearchParams();
  const showFix = search.get("fix") === "1";

  const [memorial, setMemorial] = useState<MemorialPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    fetchMemorial(slug)
      .then((m) => {
        setMemorial(m);
        if (m?.geoLocation) setGeo(m.geoLocation);
      })
      .catch((e) => setError(e.message));
    if (getUserToken()) {
      fetchUserMemorial(slug)
        .then((m) => setCanEdit(!!m))
        .catch(() => setCanEdit(false));
    }
  }, [slug]);

  if (error) {
    return (
      <section className="ae-section" style={{ textAlign: "center" }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </section>
    );
  }

  if (!memorial) {
    return <section className="ae-section" style={{ textAlign: "center" }}>Kraunama…</section>;
  }

  const location = geo ?? memorial.geoLocation;

  return (
    <MemorialProfile memorial={memorial} slug={slug}>
        {canEdit && (
          <Link href={`/paskyra/atmintis/${slug}`} className="ae-btn ae-btn--gold" style={{ width: "100%" }}>
            Redaguoti mano paskyroje
          </Link>
        )}
        <ShareBar
          url={`${getSiteOrigin()}/m/${slug}`}
          title={`${memorial.fullName} — AETERNA`}
          text={`Amžina atmintis: ${memorial.fullName}. ${memorial.parish.title}.`}
        />
        {location ? (
          <NavigateToGrave lat={location.lat} lng={location.lng} />
        ) : (
          <p className="ae-hint" style={{ textAlign: "center" }}>
            Kapo vieta dar nepažymėta.
          </p>
        )}
        {(showFix || !location) && (
          <GeoFixButton slug={slug} onFixed={(lat, lng) => setGeo({ lat, lng })} />
        )}
        <DownloadAppButton showHint />
    </MemorialProfile>
  );
}

export default function MemorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<section className="ae-section">Kraunama…</section>}>
      <MemorialInner slug={slug} />
    </Suspense>
  );
}
