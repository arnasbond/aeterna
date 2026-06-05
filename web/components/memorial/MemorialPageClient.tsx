"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MemorialProfile } from "@/components/MemorialProfile";
import {
  claimUserMemorial,
  fetchMemorial,
  fetchParish,
  fetchUserMemorial,
  getUserToken,
  type MemorialPublic,
  type OwnedMemorialDetail,
} from "@/lib/api";
import { getDemoMemorialPublic } from "@/lib/memorial-demo-public";

function toPublicMemorial(
  owned: OwnedMemorialDetail,
  parish: {
    id: string;
    title: string;
    diocese: string;
    supportGoal: string;
    image: string;
  }
): MemorialPublic {
  return {
    id: owned.id,
    slug: owned.slug,
    parishId: owned.parishId,
    fullName: owned.fullName,
    birthDate: owned.birthDate,
    deathDate: owned.deathDate,
    biography: owned.biography,
    isPremium: owned.isPremium,
    familyTree: owned.familyTree,
    anniversaryRemindersEnabled: owned.anniversaryRemindersEnabled,
    portraitUrl: owned.portraitUrl,
    farewellMessage: owned.farewellMessage ?? null,
    mediaGallery: owned.mediaGallery ?? [],
    videoUrl: owned.videoUrl,
    geoLocation: owned.geoLocation,
    privacyStatus: owned.privacyStatus,
    qrCodeUrl: owned.qrCodeUrl,
    profileUrl: owned.profileUrl,
    linkedToAccount: true,
    parish,
  };
}

type Props = { slug: string };

export function MemorialPageClient({ slug }: Props) {
  const [memorial, setMemorial] = useState<MemorialPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [ownerOnly, setOwnerOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setError("Neteisingas adresas");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setOwnerOnly(false);
      setCanClaim(false);
      setCanEdit(false);

      const demo = getDemoMemorialPublic(slug);
      if (demo) {
        setMemorial(demo);
        if (demo.geoLocation) setGeo(demo.geoLocation);
        setLoading(false);
        return;
      }

      try {
        const pub = await fetchMemorial(slug);
        if (cancelled) return;

        if (pub) {
          setMemorial(pub);
          if (pub.geoLocation) setGeo(pub.geoLocation);
          if (getUserToken()) {
            try {
              const owned = await fetchUserMemorial(slug);
              if (cancelled) return;
              if (owned) {
                setCanEdit(true);
                setCanClaim(false);
              } else if (!pub.linkedToAccount) {
                setCanClaim(true);
              }
            } catch {
              /* API nepasiekiamas — rodomas viešas profilis */
            }
          }
          return;
        }

        if (getUserToken()) {
          try {
            const owned = await fetchUserMemorial(slug);
            if (cancelled) return;
            if (owned) {
              const parishDetail = await fetchParish(owned.parishId);
              if (cancelled) return;
              if (parishDetail) {
                setMemorial(
                  toPublicMemorial(owned, {
                    id: parishDetail.id,
                    title: parishDetail.title,
                    diocese: parishDetail.diocese,
                    supportGoal: parishDetail.supportGoal,
                    image: parishDetail.image,
                  })
                );
                setCanEdit(true);
                setOwnerOnly(true);
                if (owned.geoLocation) setGeo(owned.geoLocation);
                return;
              }
            }
          } catch {
            /* ignore */
          }
        }

        setMemorial(null);
        setError("Atminimo puslapis nerastas");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Nepavyko įkelti");
          setMemorial(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
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
        {getUserToken() && (
          <p style={{ marginTop: "1rem" }}>
            <Link href="/paskyra">← Mano paskyra</Link>
          </p>
        )}
      </section>
    );
  }

  async function handleClaim() {
    if (!getUserToken()) {
      window.location.assign(`/prisijungti?next=${encodeURIComponent(`/m/${slug}`)}`);
      return;
    }
    setClaimBusy(true);
    setError(null);
    try {
      await claimUserMemorial(slug);
      setCanClaim(false);
      setCanEdit(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepavyko pririšti profilio");
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <>
      {ownerOnly && (
        <section className="ae-section" style={{ paddingBottom: 0 }}>
          <p className="ae-hint" style={{ textAlign: "center", color: "var(--ae-primary)" }}>
            Peržiūrite savo profilį (anksčiau sukurti profiliai gali būti tik jums matomi, kol bus
            patvirtinti).
          </p>
        </section>
      )}
      {!getUserToken() && memorial && !memorial.linkedToAccount && (
        <section className="ae-section" style={{ paddingBottom: 0 }}>
          <p className="ae-hint" style={{ textAlign: "center" }}>
            Redaguoti gali tik profilio savininkas.{" "}
            <Link href={`/prisijungti?next=${encodeURIComponent(`/m/${slug}`)}`}>Prisijungite</Link> ir
            pririškite šį profilį prie savo paskyros.
          </p>
        </section>
      )}
      {canClaim && !canEdit && (
        <section className="ae-section" style={{ paddingBottom: 0 }}>
          <p className="ae-hint" style={{ textAlign: "center", marginBottom: "0.75rem" }}>
            Šis profilis sukurtas be paskyros. Jei tai jūsų atmintis — pririškite prie savo paskyros.
          </p>
          <button
            type="button"
            className="ae-btn ae-btn--gold ae-btn--wide"
            disabled={claimBusy}
            onClick={() => void handleClaim()}
          >
            {claimBusy ? "Pririšiama…" : "Pririšti prie mano paskyros"}
          </button>
        </section>
      )}
      <MemorialProfile
        memorial={memorial}
        slug={slug}
        geo={geo ?? memorial.geoLocation}
        canEdit={canEdit}
        canClaim={canClaim}
        onGeoUpdated={(lat, lng) => setGeo({ lat, lng })}
      />
    </>
  );
}
