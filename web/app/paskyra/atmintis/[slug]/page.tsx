"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GraveLocationSet } from "@/components/GraveLocationSet";
import { MemorialLocationShare } from "@/components/MemorialLocationShare";
import { MemorialQrHub } from "@/components/memorial/MemorialQrHub";
import { PremiumUpgradePanel } from "@/components/memorial/PremiumUpgradePanel";
import { FamilyTreeEditor } from "@/components/memorial/FamilyTreeEditor";
import type { FamilyTreeNode } from "@/lib/api";
import { ParishSearchPicker } from "@/components/ParishSearchPicker";
import {
  clearUserToken,
  fetchOwnerGuestbook,
  fetchParish,
  fetchUserMemorial,
  getUserToken,
  approveGuestbookEntry,
  moderateGuestbookEntry,
  updateUserMemorial,
  uploadMemorialFile,
  type GuestbookEntry,
  type OwnedMemorialDetail,
} from "@/lib/api";
import { HerculesPageShell } from "@/components/layout/HerculesPageShell";

export default function EditMemorialPage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [memorial, setMemorial] = useState<OwnedMemorialDetail | null>(null);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [farewellMessage, setFarewellMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [modBusy, setModBusy] = useState<string | null>(null);
  const [parishId, setParishId] = useState("");
  const [parishTitle, setParishTitle] = useState("");
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [familyTree, setFamilyTree] = useState<FamilyTreeNode[]>([]);
  const [anniversaryReminders, setAnniversaryReminders] = useState(false);

  useEffect(() => {
    if (!slug || !getUserToken()) {
      router.replace(`/prisijungti?next=${encodeURIComponent(`/paskyra/atmintis/${slug}`)}`);
      return;
    }
    fetchUserMemorial(slug)
      .then((m) => {
        if (!m) throw new Error("Profilis nerastas");
        setMemorial(m);
        setFullName(m.fullName);
        setBirthDate(m.birthDate ?? "");
        setDeathDate(m.deathDate ?? "");
        setBiography(m.biography ?? "");
        setFarewellMessage(m.farewellMessage ?? "");
        setVideoUrl(m.videoUrl ?? "");
        setPortraitUrl(m.portraitUrl ?? "");
        setGalleryUrls(m.mediaGallery ?? []);
        if (m.geoLocation) setGeo(m.geoLocation);
        setFamilyTree(m.familyTree ?? []);
        setAnniversaryReminders(m.anniversaryRemindersEnabled ?? false);
        setParishId(m.parishId);
        void fetchParish(m.parishId).then((p) => setParishTitle(p?.title ?? m.parishId));
        return fetchOwnerGuestbook(slug);
      })
      .then((gb) => setGuestbook(gb))
      .catch((e) => {
        if (!getUserToken()) {
          router.replace(`/prisijungti?next=${encodeURIComponent(`/paskyra/atmintis/${slug}`)}`);
        } else {
          setErr(e instanceof Error ? e.message : "Klaida");
        }
      });
  }, [slug, router]);

  async function handlePortraitFile(file: File | null) {
    if (!file) return;
    setMediaBusy(true);
    setErr(null);
    try {
      setPortraitUrl(await uploadMemorialFile(file));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko įkelti portreto";
      setErr(msg === "Failed to fetch" ? "Nepavyko įkelti failo — patikrinkite internetą ir bandykite dar kartą." : msg);
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleGalleryFiles(files: FileList | null) {
    if (!files?.length) return;
    const isPremium = memorial?.isPremium ?? false;
    const maxPhotos = isPremium ? Number.POSITIVE_INFINITY : 10;
    const remaining = Math.max(0, maxPhotos - galleryUrls.length);
    const filesArr = Array.from(files).slice(0, remaining);
    if (filesArr.length === 0) {
      setErr("Pagrindinė narystė leidžia iki 10 nuotraukų. Neribotai galerijai reikia Premium narystės.");
      return;
    }
    setMediaBusy(true);
    setErr(null);
    try {
      const uploaded: string[] = [];
      for (const file of filesArr) {
        uploaded.push(await uploadMemorialFile(file));
      }
      setGalleryUrls((prev) => [...prev, ...uploaded]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko įkelti nuotraukų";
      setErr(msg === "Failed to fetch" ? "Nepavyko įkelti failo — patikrinkite internetą ir bandykite dar kartą." : msg);
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleVideoFile(file: File | null) {
    if (!file) return;
    const isPremium = memorial?.isPremium ?? false;
    if (!isPremium) {
      setErr("Premium narystė suteikia galimybę įkelti vaizdo įrašą.");
      return;
    }
    setMediaBusy(true);
    setErr(null);
    try {
      setVideoUrl(await uploadMemorialFile(file));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko įkelti vaizdo įrašo";
      setErr(msg === "Failed to fetch" ? "Nepavyko įkelti failo — patikrinkite internetą ir bandykite dar kartą." : msg);
    } finally {
      setMediaBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const patch: Parameters<typeof updateUserMemorial>[1] = {
        fullName,
        birthDate: birthDate || null,
        deathDate: deathDate || null,
        biography,
        farewellMessage: farewellMessage || null,
        videoUrl: videoUrl || null,
      };
      if (portraitUrl.trim()) patch.portraitUrl = portraitUrl.trim();
      if (galleryUrls.length > 0) patch.mediaGallery = galleryUrls;
      if (parishId.trim()) patch.parishId = parishId.trim();
      if (memorial?.isPremium) {
        patch.familyTree = familyTree;
        patch.anniversaryRemindersEnabled = anniversaryReminders;
      }
      const updated = await updateUserMemorial(slug, patch);
      if (updated) {
        setMemorial(updated);
      }
      setMsg("Pakeitimai išsaugoti. QR kodas žemiau — kopijuokite nuorodą ar atsisiųskite paveikslą plokštelei.");
      setTimeout(() => document.getElementById("memorial-qr-after-save")?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko išsaugoti";
      setErr(
        msg === "Failed to fetch"
          ? "Nepavyko išsaugoti — patikrinkite internetą. Jei klaida kartojasi, API gali neturėti KV/Blob saugyklos."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  if (!memorial && !err) {
    return (
      <HerculesPageShell narrow center>
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </HerculesPageShell>
    );
  }

  if (err && !memorial) {
    return (
      <HerculesPageShell narrow center>
        <p className="ae-error" style={{ textAlign: "center" }}>
          {err}
        </p>
        <p style={{ textAlign: "center" }}>
          <Link href="/paskyra">← Mano paskyra</Link>
        </p>
      </HerculesPageShell>
    );
  }

  return (
    <HerculesPageShell narrow>
      <section className="ae-wizard ae-edit-memorial-page">
      <h1 className="hercules-page__title chronicle-serif">Redaguoti atmintį</h1>
      <p className="ae-hint text-center" style={{ marginBottom: "1.25rem" }}>
        <Link href={`/m/${slug}`}>Peržiūrėti viešą profilį →</Link>
        {" · "}
        <Link href="/paskyra">Mano paskyra</Link>
      </p>

      {memorial && (
        <PremiumUpgradePanel
          slug={slug}
          isPremium={memorial.isPremium}
          parishTitle={parishTitle}
          videoUrl={memorial.videoUrl}
          familyTree={memorial.familyTree}
          mediaGallery={memorial.mediaGallery}
          onUpgraded={() => {
            void fetchUserMemorial(slug).then((m) => {
              if (m) setMemorial(m);
            });
          }}
        />
      )}

      {geo ? (
        <div className="ae-card mb-4 p-4">
          <MemorialLocationShare slug={slug} lat={geo.lat} lng={geo.lng} fullName={fullName} />
        </div>
      ) : (
        <GraveLocationSet
          slug={slug}
          memorialName={fullName}
          parishTitle={parishTitle}
          defaultOpen
          onSaved={(lat, lng) => setGeo({ lat, lng })}
        />
      )}

      <form onSubmit={save}>
        <div className="ae-field">
          <label>Vardas, pavardė *</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="ae-field ae-card" style={{ padding: "1rem" }}>
          <label className="font-semibold" style={{ marginBottom: "0.5rem", display: "block" }}>
            Parapija
          </label>
          <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
            Jei pasirinkta neteisinga parapija (pvz. po sistemos atnaujinimo), suraskite teisingą ir
            išsaugokite pakeitimus.
          </p>
          <ParishSearchPicker
            value={parishId}
            selectedTitle={parishTitle}
            onChange={(id, p) => {
              setParishId(id);
              if (p?.title) setParishTitle(p.title);
            }}
          />
        </div>
        <div className="ae-field">
          <label>Gimimo data</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
        <div className="ae-field">
          <label>Mirties data</label>
          <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} />
        </div>
        <div className="ae-field ae-wizard-upload">
          <label>Portreto nuotrauka</label>
          <label className="ae-wizard-upload__btn">
            📁 Įkelti nuotrauką
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*,.heic,.heif"
              hidden
              disabled={mediaBusy}
              onChange={(e) => {
                void handlePortraitFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
          {portraitUrl && <p className="ae-wizard-upload__ok">✓ Portretas įkeltas</p>}
        </div>
        <div className="ae-field ae-wizard-upload">
          <label>Albumo nuotraukos</label>
          <label className="ae-wizard-upload__btn">
            📁 Įkelti nuotraukas
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*,.heic,.heif"
              multiple
              hidden
              disabled={mediaBusy}
              onChange={(e) => {
                void handleGalleryFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {galleryUrls.length > 0 && (
            <p className="ae-wizard-upload__ok">✓ Įkelta nuotraukų: {galleryUrls.length}</p>
          )}
        </div>
        <div className="ae-field">
          <label>Palinkėjimas artimiesiems</label>
          <textarea rows={4} value={farewellMessage} onChange={(e) => setFarewellMessage(e.target.value)} />
        </div>
        <div className="ae-field">
          <label>Biografija</label>
          <textarea rows={6} value={biography} onChange={(e) => setBiography(e.target.value)} />
        </div>
        <div className="ae-field ae-wizard-upload">
          <label>Vaizdo įrašas {memorial?.isPremium ? "" : "(Premium)"}</label>
          <label className="ae-wizard-upload__btn">
            📁 Įkelti vaizdo įrašą
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*,.mov"
              hidden
              disabled={mediaBusy || !memorial?.isPremium}
              onChange={(e) => {
                void handleVideoFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
          {videoUrl && <p className="ae-wizard-upload__ok">✓ Vaizdo įrašas įkeltas</p>}
          {!videoUrl && !memorial?.isPremium && (
            <p className="ae-hint" style={{ marginTop: "0.5rem" }}>
              Vaizdo įrašas pasiekiamas tik Premium narystės turintiems profiliams.
            </p>
          )}
        </div>
        {mediaBusy && <p className="ae-hint">Įkeliama…</p>}
        {err && <p className="ae-error">{err}</p>}
        {msg && <p className="ae-hint">{msg}</p>}
        <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy || mediaBusy}>
          {busy ? "Saugoma…" : "Išsaugoti"}
        </button>
      </form>

      {memorial?.isPremium && (
        <>
          <div className="ae-card" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
            <h2 className="chronicle-serif" style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>
              Giminės medis
            </h2>
            <FamilyTreeEditor nodes={familyTree} onChange={setFamilyTree} />
            <p className="ae-hint" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
              Išsaugokite formą apačioje, kad giminės medis atsirastų viešame puslapyje.
            </p>
          </div>
          <div className="ae-card" style={{ marginTop: "1rem", padding: "1.25rem" }}>
            <h2 className="chronicle-serif" style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
              Metinių priminimai
            </h2>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={anniversaryReminders}
                onChange={(e) => setAnniversaryReminders(e.target.checked)}
                style={{ marginTop: "0.2rem" }}
              />
              <span>
                Siųsti priminimą el. paštu prieš mirties metines
                {deathDate ? ` (${deathDate})` : " — nurodykite mirties datą aukščiau"}
              </span>
            </label>
          </div>
        </>
      )}

      {!memorial?.isPremium && (familyTree.length > 0 || videoUrl) && (
        <div className="ae-card ae-membership-inactive" style={{ marginTop: "1.5rem", padding: "1.25rem" }}>
          <h2 className="chronicle-serif" style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
            Išsaugotas Premium turinys (neaktyvus)
          </h2>
          <p className="ae-hint" style={{ margin: "0 0 0.75rem" }}>
            Šie duomenys saugomi 3 mėn. ir vėl pasirodys viešame puslapyje, kai atnaujinsite Premium prenumeratą.
          </p>
          {familyTree.length > 0 && (
            <p className="ae-hint" style={{ margin: 0 }}>
              · Giminės medis — {familyTree.length} asm.
            </p>
          )}
          {videoUrl && (
            <p className="ae-hint" style={{ margin: familyTree.length > 0 ? "0.35rem 0 0" : 0 }}>
              · Vaizdo įrašas įkeltas
            </p>
          )}
          {(memorial?.mediaGallery?.length ?? 0) > 10 && (
            <p className="ae-hint" style={{ margin: "0.35rem 0 0" }}>
              · Papildomos nuotraukos — {memorial!.mediaGallery!.length} iš jų
            </p>
          )}
        </div>
      )}

      {memorial && (
        <div id="memorial-qr-after-save" className="ae-card" style={{ marginTop: "1.5rem", padding: "1rem" }}>
          <MemorialQrHub
            slug={slug}
            fullName={fullName}
            qrCodeUrl={memorial.qrCodeUrl}
            profileUrl={memorial.profileUrl}
            showPlateLink
          />
        </div>
      )}

      {guestbook.some((g) => !g.isApproved && g.status !== "rejected") && (
        <div className="ae-card" style={{ marginTop: "2rem", padding: "1.25rem" }}>
          <h2 className="chronicle-serif" style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>
            Užuojautų moderavimas
          </h2>
          <p className="ae-hint" style={{ margin: "0 0 1rem" }}>
            Naujos žinutės laukia patvirtinimo — spauskite „Rodyti viešai“, kad jos pasirodytų memorialiniame
            puslapyje.
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {guestbook
              .filter((g) => !g.isApproved && g.status !== "rejected")
              .map((g) => (
                <li
                  key={g.id}
                  style={{ borderTop: "1px solid rgba(212, 175, 55, 0.2)", padding: "0.75rem 0" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 12rem", minWidth: 0 }}>
                      <strong>{g.authorName}</strong>
                      <p style={{ margin: "0.35rem 0", whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>{g.message}</p>
                      <span className="ae-hint" style={{ fontSize: "0.8rem" }}>
                        {new Date(g.createdAt).toLocaleString("lt-LT")}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                      <button
                        type="button"
                        className="ae-btn ae-btn--primary"
                        disabled={modBusy === g.id}
                        title="Patvirtinti ir rodyti viešai memorialiniame puslapyje"
                        onClick={async () => {
                          setModBusy(g.id);
                          try {
                            await approveGuestbookEntry(slug, g.id);
                            setGuestbook(await fetchOwnerGuestbook(slug));
                          } finally {
                            setModBusy(null);
                          }
                        }}
                      >
                        {modBusy === g.id ? "…" : "✓ Rodyti viešai"}
                      </button>
                      <button
                        type="button"
                        className="ae-btn ae-btn--outline"
                        disabled={modBusy === g.id}
                        onClick={async () => {
                          setModBusy(g.id);
                          try {
                            await moderateGuestbookEntry(slug, g.id, "rejected");
                            setGuestbook(await fetchOwnerGuestbook(slug));
                          } finally {
                            setModBusy(null);
                          }
                        }}
                      >
                        Atmesti
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      <p className="ae-hint" style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button
          type="button"
          className="ae-btn ae-btn--outline ae-btn--wide"
          onClick={() => {
            clearUserToken();
            router.push("/prisijungti");
          }}
        >
          Atsijungti
        </button>
      </p>
    </section>
    </HerculesPageShell>
  );
}
