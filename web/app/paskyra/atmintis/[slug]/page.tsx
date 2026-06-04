"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearUserToken,
  fetchOwnerGuestbook,
  fetchUserMemorial,
  getUserToken,
  moderateGuestbookEntry,
  updateUserMemorial,
  uploadMemorialFile,
  type GuestbookEntry,
  type OwnedMemorialDetail,
} from "@/lib/api";

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
      setErr(msg === "Failed to fetch" ? "Serveris nepasiekiamas — paleiskite PALESTI-SERVERIUS.bat." : msg);
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleGalleryFiles(files: FileList | null) {
    if (!files?.length) return;
    setMediaBusy(true);
    setErr(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadMemorialFile(file));
      }
      setGalleryUrls((prev) => [...prev, ...uploaded]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko įkelti nuotraukų";
      setErr(msg === "Failed to fetch" ? "Serveris nepasiekiamas — paleiskite PALESTI-SERVERIUS.bat." : msg);
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleVideoFile(file: File | null) {
    if (!file) return;
    setMediaBusy(true);
    setErr(null);
    try {
      setVideoUrl(await uploadMemorialFile(file));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko įkelti vaizdo įrašo";
      setErr(msg === "Failed to fetch" ? "Serveris nepasiekiamas — paleiskite PALESTI-SERVERIUS.bat." : msg);
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
      await updateUserMemorial(slug, {
        fullName,
        birthDate: birthDate || null,
        deathDate: deathDate || null,
        biography,
        farewellMessage: farewellMessage || null,
        videoUrl: videoUrl || null,
        portraitUrl: portraitUrl || null,
        mediaGallery: galleryUrls,
      });
      setMsg("Pakeitimai išsaugoti.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nepavyko išsaugoti";
      setErr(
        msg === "Failed to fetch"
          ? "Nepavyko susisiekti su serveriu. Paleiskite PALESTI-SERVERIUS.bat."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  if (!memorial && !err) {
    return (
      <section className="ae-section">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </section>
    );
  }

  if (err && !memorial) {
    return (
      <section className="ae-section">
        <p className="ae-error" style={{ textAlign: "center" }}>
          {err}
        </p>
        <p style={{ textAlign: "center" }}>
          <Link href="/paskyra">← Mano paskyra</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="ae-section ae-wizard">
      <h1 className="ae-section-title">Redaguoti atmintį</h1>
      <p className="ae-hint" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <Link href={`/m/${slug}`}>Peržiūrėti viešą profilį →</Link>
        {" · "}
        <Link href="/paskyra">Mano paskyra</Link>
      </p>

      <form onSubmit={save}>
        <div className="ae-field">
          <label>Vardas, pavardė *</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
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
          <label>Vaizdo įrašas</label>
          <label className="ae-wizard-upload__btn">
            📁 Įkelti vaizdo įrašą
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*,.mov"
              hidden
              disabled={mediaBusy}
              onChange={(e) => {
                void handleVideoFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
          {videoUrl && <p className="ae-wizard-upload__ok">✓ Vaizdo įrašas įkeltas</p>}
        </div>
        {mediaBusy && <p className="ae-hint">Įkeliama…</p>}
        {err && <p className="ae-error">{err}</p>}
        {msg && <p className="ae-hint" style={{ color: "var(--ae-primary)" }}>{msg}</p>}
        <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy || mediaBusy}>
          {busy ? "Saugoma…" : "Išsaugoti pakeitimus"}
        </button>
      </form>

      {guestbook.some((g) => g.status === "pending") && (
        <div className="ae-card" style={{ marginTop: "2rem", padding: "1.25rem" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>Užuojautų moderavimas</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {guestbook
              .filter((g) => g.status === "pending")
              .map((g) => (
                <li key={g.id} style={{ borderTop: "1px solid #eee", padding: "0.75rem 0" }}>
                  <strong>{g.authorName}</strong>
                  <p style={{ margin: "0.35rem 0", whiteSpace: "pre-wrap", fontSize: "0.92rem" }}>{g.message}</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="ae-btn ae-btn--primary"
                      disabled={modBusy === g.id}
                      onClick={async () => {
                        setModBusy(g.id);
                        try {
                          await moderateGuestbookEntry(slug, g.id, "approved");
                          setGuestbook(await fetchOwnerGuestbook(slug));
                        } finally {
                          setModBusy(null);
                        }
                      }}
                    >
                      Patvirtinti
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
  );
}
