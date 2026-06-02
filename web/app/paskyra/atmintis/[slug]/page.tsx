"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearUserToken,
  fetchUserMemorial,
  getUserToken,
  updateUserMemorial,
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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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
      })
      .catch((e) => {
        if (!getUserToken()) {
          router.replace(`/prisijungti?next=${encodeURIComponent(`/paskyra/atmintis/${slug}`)}`);
        } else {
          setErr(e instanceof Error ? e.message : "Klaida");
        }
      });
  }, [slug, router]);

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
      });
      setMsg("Pakeitimai išsaugoti.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsaugoti");
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
        <div className="ae-field">
          <label>Portreto nuotraukos nuoroda</label>
          <input value={portraitUrl} onChange={(e) => setPortraitUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="ae-field">
          <label>Palinkėjimas artimiesiems</label>
          <textarea rows={4} value={farewellMessage} onChange={(e) => setFarewellMessage(e.target.value)} />
        </div>
        <div className="ae-field">
          <label>Biografija</label>
          <textarea rows={6} value={biography} onChange={(e) => setBiography(e.target.value)} />
        </div>
        <div className="ae-field">
          <label>Video nuoroda</label>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" />
        </div>
        {err && <p className="ae-error">{err}</p>}
        {msg && <p className="ae-hint" style={{ color: "var(--ae-primary)" }}>{msg}</p>}
        <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy}>
          {busy ? "Saugoma…" : "Išsaugoti pakeitimus"}
        </button>
      </form>

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
