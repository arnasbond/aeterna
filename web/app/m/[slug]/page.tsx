"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GeoFixButton } from "@/components/GeoFixButton";
import { MemorialProfile } from "@/components/MemorialProfile";
import { NavigateToGrave } from "@/components/NavigateToGrave";
import { VirtualCandles } from "@/components/VirtualCandles";
import { fetchMemorial, type MemorialPublic } from "@/lib/api";

function MemorialInner({ slug }: { slug: string }) {
  const search = useSearchParams();
  const showFix = search.get("fix") === "1";

  const [memorial, setMemorial] = useState<MemorialPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchMemorial(slug)
      .then((m) => {
        setMemorial(m);
        if (m?.geoLocation) setGeo(m.geoLocation);
      })
      .catch((e) => setError(e.message));
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
    <MemorialProfile memorial={memorial}>
      <VirtualCandles slug={slug} />

      <div className="ae-memorial-footer-actions">
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
      </div>

      <p className="ae-memorial-support">
        Parama: {memorial.parish.supportGoal}
      </p>
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
