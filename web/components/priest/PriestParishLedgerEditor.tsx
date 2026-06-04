"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  clearPriestToken,
  fetchPriestParishProfile,
  getPriestToken,
  savePriestParishProfile,
  uploadMemorialFile,
  type ParishDetail,
  type ParishProfile,
  type ParishProfileInput,
} from "@/lib/api";

function profileToInput(p: ParishProfile): ParishProfileInput {
  return {
    shortDescription: p.shortDescription,
    about: p.about,
    address: p.address,
    phone: p.phone,
    email: p.email,
    priestName: p.priestName,
    deputyPriestName: p.deputyPriestName,
    massSchedule: p.massSchedule,
    confessionTimes: p.confessionTimes,
    officeHours: p.officeHours,
    sacraments: p.sacraments,
    announcements: p.announcements,
    bankDetails: p.bankDetails,
    galleryUrls: p.galleryUrls,
    extraSections: p.extraSections,
  };
}

export function PriestParishLedgerEditor() {
  const [detail, setDetail] = useState<ParishDetail | null>(null);
  const [form, setForm] = useState<ParishProfileInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (): Promise<ParishDetail> => {
    const d = await fetchPriestParishProfile();
    setDetail(d);
    setForm(profileToInput(d.profile));
    return d;
  }, []);

  useEffect(() => {
    if (!getPriestToken()) return;
    load().catch(() => setErr("Nepavyko užkrauti informacijos"));
  }, [load]);

  function setField<K extends keyof ParishProfileInput>(key: K, value: ParishProfileInput[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handlePhoto(file: File | null) {
    if (!file) return;
    setMediaBusy(true);
    setErr(null);
    try {
      const url = await uploadMemorialFile(file);
      setField("galleryUrls", [url, ...(form?.galleryUrls ?? []).filter((u) => u !== url)].slice(0, 8));
      setMsg("Nuotrauka įkelta. Nepamirškite išsaugoti apačioje.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko įkelti nuotraukos");
    } finally {
      setMediaBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await savePriestParishProfile(form);
      setMsg("✓ Pakeitimai išsaugoti.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsaugoti");
    } finally {
      setBusy(false);
    }
  }

  if (!getPriestToken()) {
    return (
      <div className="priest-ledger max-w-xl mx-auto px-4">
        <p className="pl-caption" style={{ textAlign: "center" }}>
          <Link href="/priest/login">Prisijunkite kaip parapijos administratorius</Link>
        </p>
      </div>
    );
  }

  if (!detail || !form) {
    return (
      <div className="priest-ledger max-w-xl mx-auto px-4">
        <p className="pl-caption" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </div>
    );
  }

  const photoUrl = form.galleryUrls?.[0] ?? detail.image;

  return (
    <div className="priest-ledger max-w-xl mx-auto px-4">
      <header className="pl-header">
        <div>
          <h1>⛪ Bažnyčios puslapio informacija</h1>
          <p className="pl-caption">{detail.title}</p>
        </div>
        <Link href="/priest/dashboard" className="pl-btn-exit" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          ← Skydas
        </Link>
      </header>

      {msg && <p className="pl-success pl-card">{msg}</p>}
      {err && <p className="pl-error pl-card">{err}</p>}

      <form onSubmit={save}>
        <section className="pl-card">
          <h2>Bažnyčios nuotrauka</h2>
          {photoUrl && (
            <img src={photoUrl} alt="" className="pl-photo-preview" referrerPolicy="no-referrer" />
          )}
          <label className="pl-photo-btn">
            📸 Spausti čia ir įkelti naują bažnyčios nuotrauką
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*,.heic,.heif"
              capture="environment"
              hidden
              disabled={mediaBusy}
              onChange={(e) => {
                void handlePhoto(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
          {mediaBusy && <p className="pl-caption">Įkeliama…</p>}
        </section>

        <section className="pl-card pl-field">
          <label>Trumpas aprašymas (vienas sakinys)</label>
          <textarea
            rows={2}
            value={form.shortDescription ?? ""}
            onChange={(e) => setField("shortDescription", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>Apie parapiją</label>
          <textarea rows={5} value={form.about ?? ""} onChange={(e) => setField("about", e.target.value)} />
        </section>

        <section className="pl-card pl-field">
          <label>Klebonas</label>
          <input value={form.priestName ?? ""} onChange={(e) => setField("priestName", e.target.value)} />
        </section>

        <section className="pl-card pl-field">
          <label>Vikaras / pagalbininkas</label>
          <input
            value={form.deputyPriestName ?? ""}
            onChange={(e) => setField("deputyPriestName", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>Adresas</label>
          <textarea rows={2} value={form.address ?? ""} onChange={(e) => setField("address", e.target.value)} />
        </section>

        <section className="pl-card pl-field">
          <label>Telefonas</label>
          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>El. paštas</label>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setField("email", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>Darbo laikas</label>
          <textarea rows={3} value={form.officeHours ?? ""} onChange={(e) => setField("officeHours", e.target.value)} />
        </section>

        <section className="pl-card pl-field">
          <label>📅 Šv. Mišių tvarkaraštis (tekstas skelbimui)</label>
          <textarea
            rows={5}
            value={form.massSchedule ?? ""}
            onChange={(e) => setField("massSchedule", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>Išpažintis</label>
          <textarea
            rows={3}
            value={form.confessionTimes ?? ""}
            onChange={(e) => setField("confessionTimes", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>Sakramentai, katechezė</label>
          <textarea rows={4} value={form.sacraments ?? ""} onChange={(e) => setField("sacraments", e.target.value)} />
        </section>

        <section className="pl-card pl-field">
          <label>Naujienos ir skelbimai</label>
          <textarea
            rows={4}
            value={form.announcements ?? ""}
            onChange={(e) => setField("announcements", e.target.value)}
          />
        </section>

        <section className="pl-card pl-field">
          <label>Parama / banko rekvizitai</label>
          <textarea rows={3} value={form.bankDetails ?? ""} onChange={(e) => setField("bankDetails", e.target.value)} />
        </section>

        <button type="submit" className="pl-save-giant" disabled={busy || mediaBusy}>
          {busy ? "Saugoma…" : "💾 IŠSAUGOTI PAKEITIMUS"}
        </button>
      </form>

      <p className="pl-link-row">
        <Link href={`/parishes/${encodeURIComponent(detail.id)}`} target="_blank">
          Peržiūrėti viešai →
        </Link>
      </p>
    </div>
  );
}
