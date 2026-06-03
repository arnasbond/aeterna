"use client";

import { Suspense, use, useEffect, useState } from "react";
import { MemorialProfile } from "@/components/MemorialProfile";
import { fetchMemorial, fetchUserMemorial, getUserToken, type MemorialPublic } from "@/lib/api";

function MemorialInner({ slug }: { slug: string }) {
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
    return (
      <section className="ae-section" style={{ textAlign: "center" }}>
        Kraunama…
      </section>
    );
  }

  return (
    <MemorialProfile
      memorial={memorial}
      slug={slug}
      geo={geo ?? memorial.geoLocation}
      canEdit={canEdit}
    />
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
