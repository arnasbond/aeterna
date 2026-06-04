"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MemorialProfile } from "@/components/MemorialProfile";
import { fetchMemorial, fetchUserMemorial, getUserToken, type MemorialPublic } from "@/lib/api";

export default function MemorialPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [memorial, setMemorial] = useState<MemorialPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setError("Neteisingas adresas");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMemorial(slug)
      .then((m) => {
        if (cancelled) return;
        if (!m) {
          setError("Atminimo puslapis nerastas");
          setMemorial(null);
          return;
        }
        setMemorial(m);
        if (m.geoLocation) setGeo(m.geoLocation);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Nepavyko įkelti");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    if (getUserToken()) {
      fetchUserMemorial(slug)
        .then((m) => {
          if (!cancelled) setCanEdit(!!m);
        })
        .catch(() => {
          if (!cancelled) setCanEdit(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="ae-section" style={{ textAlign: "center" }}>
        Kraunama…
      </section>
    );
  }

  if (error || !memorial) {
    return (
      <section className="ae-section" style={{ textAlign: "center" }}>
        <p style={{ color: "#b91c1c" }}>{error ?? "Atminimo puslapis nerastas"}</p>
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
