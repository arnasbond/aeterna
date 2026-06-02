"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  clearPriestToken,
  fetchPriestParishProfile,
  getPriestToken,
  importPriestParishFromWebsite,
  savePriestParishProfile,
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

export function PriestParishProfileEditor() {
  const [detail, setDetail] = useState<ParishDetail | null>(null);
  const [form, setForm] = useState<ParishProfileInput | null>(null);
  const [busy, setBusy] = useState(false);
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
    load()
      .then(async (d) => {
        const p = d.profile;
        const empty =
          !p.about?.trim() &&
          !p.massSchedule?.trim() &&
          !p.phone?.trim() &&
          !p.importedAt;
        if (empty && d.websiteUrl) {
          try {
            const res = await importPriestParishFromWebsite();
            setMsg(res.message);
            await load();
          } catch {
            /* parapijos administratorius gali importuoti rankiniu būdu */
          }
        }
      })
      .catch(() => setErr("Nepavyko užkrauti profilio"));
  }, [load]);

  function setField<K extends keyof ParishProfileInput>(key: K, value: ParishProfileInput[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await savePriestParishProfile(form);
      setMsg("Parapijos profilis išsaugotas.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsaugoti");
    } finally {
      setBusy(false);
    }
  }

  async function importWebsite() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await importPriestParishFromWebsite();
      setMsg(res.message);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Importas nepavyko");
    } finally {
      setBusy(false);
    }
  }

  if (!getPriestToken()) {
    return (
      <section className="ae-section">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          <Link href="/priest/login">Prisijunkite kaip parapijos administratorius</Link>
        </p>
      </section>
    );
  }

  if (!detail || !form) {
    return (
      <section className="ae-section">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </section>
    );
  }

  return (
    <section className="ae-section">
      <div className="ae-priest-header">
        <div>
          <h1>Parapijos profilis</h1>
          <p className="ae-hint">{detail.title}</p>
        </div>
        <div className="ae-priest-header__actions">
          <Link href="/priest/dashboard" className="ae-btn ae-btn--outline">
            ← Skydas
          </Link>
          <button
            type="button"
            className="ae-btn ae-btn--outline"
            onClick={() => {
              clearPriestToken();
              window.location.href = "/priest/login";
            }}
          >
            Atsijungti
          </button>
        </div>
      </div>

      <div className="ae-card ae-parish-editor-intro">
        <p>
          Užpildykite informaciją kaip oficialioje parapijos svetainėje. Galite{" "}
          <strong>perkelti duomenis automatiškai</strong> ir vėliau patikslinti.
        </p>
        {detail.websiteUrl && (
          <p className="ae-hint">
            Oficiali svetainė:{" "}
            <a href={detail.websiteUrl} target="_blank" rel="noreferrer">
              {detail.websiteUrl}
            </a>
          </p>
        )}
        <div className="ae-parish-editor-actions">
          {detail.websiteUrl && (
            <button
              type="button"
              className="ae-btn ae-btn--gold"
              disabled={busy}
              onClick={importWebsite}
            >
              Perkelti iš oficialios svetainės
            </button>
          )}
          <Link
            href={`/parishes/${encodeURIComponent(detail.id)}`}
            className="ae-btn ae-btn--outline"
            target="_blank"
          >
            Peržiūrėti viešai
          </Link>
        </div>
      </div>

      {msg && <p className="ae-success">{msg}</p>}
      {err && <p className="ae-error">{err}</p>}

      <form className="ae-parish-editor-form" onSubmit={save}>
        <div className="ae-field">
          <label>Trumpas aprašymas</label>
          <textarea
            rows={2}
            value={form.shortDescription ?? ""}
            onChange={(e) => setField("shortDescription", e.target.value)}
            placeholder="Vienu ar dviem sakiniais — matoma profilio viršuje"
          />
        </div>

        <div className="ae-field">
          <label>Apie parapiją</label>
          <textarea
            rows={6}
            value={form.about ?? ""}
            onChange={(e) => setField("about", e.target.value)}
          />
        </div>

        <div className="ae-parish-editor-row">
          <div className="ae-field">
            <label>Parapijos administratorius</label>
            <input
              value={form.priestName ?? ""}
              onChange={(e) => setField("priestName", e.target.value)}
            />
          </div>
          <div className="ae-field">
            <label>Vikaras / kun. pagalbininkas</label>
            <input
              value={form.deputyPriestName ?? ""}
              onChange={(e) => setField("deputyPriestName", e.target.value)}
            />
          </div>
        </div>

        <div className="ae-field">
          <label>Adresas</label>
          <textarea
            rows={2}
            value={form.address ?? ""}
            onChange={(e) => setField("address", e.target.value)}
          />
        </div>

        <div className="ae-parish-editor-row">
          <div className="ae-field">
            <label>Telefonas</label>
            <input value={form.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div className="ae-field">
            <label>El. paštas</label>
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setField("email", e.target.value)}
            />
          </div>
        </div>

        <div className="ae-field">
          <label>Darbo laikas / kontaktai</label>
          <textarea
            rows={3}
            value={form.officeHours ?? ""}
            onChange={(e) => setField("officeHours", e.target.value)}
          />
        </div>

        <div className="ae-field">
          <label>Šv. Mišios (tvarkaraštis)</label>
          <textarea
            rows={5}
            value={form.massSchedule ?? ""}
            onChange={(e) => setField("massSchedule", e.target.value)}
          />
        </div>

        <div className="ae-field">
          <label>Išpažintis</label>
          <textarea
            rows={3}
            value={form.confessionTimes ?? ""}
            onChange={(e) => setField("confessionTimes", e.target.value)}
          />
        </div>

        <div className="ae-field">
          <label>Sakramentai, katechezė</label>
          <textarea
            rows={4}
            value={form.sacraments ?? ""}
            onChange={(e) => setField("sacraments", e.target.value)}
          />
        </div>

        <div className="ae-field">
          <label>Naujienos ir skelbimai</label>
          <textarea
            rows={4}
            value={form.announcements ?? ""}
            onChange={(e) => setField("announcements", e.target.value)}
          />
        </div>

        <div className="ae-field">
          <label>Parama / banko rekvizitai</label>
          <textarea
            rows={3}
            value={form.bankDetails ?? ""}
            onChange={(e) => setField("bankDetails", e.target.value)}
          />
        </div>

        <div className="ae-field">
          <label>Nuotraukų nuorodos (viena eilutėje)</label>
          <textarea
            rows={4}
            value={(form.galleryUrls ?? []).join("\n")}
            onChange={(e) =>
              setField(
                "galleryUrls",
                e.target.value
                  .split(/\n/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="https://…/bažnyčia.jpg"
          />
          {(form.galleryUrls?.length ?? 0) > 0 && (
            <div className="ae-parish-editor-preview">
              {form.galleryUrls!.slice(0, 4).map((src) => (
                <img key={src} src={src} alt="" loading="lazy" />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy}>
          {busy ? "Saugoma…" : "Išsaugoti profilį"}
        </button>
      </form>
    </section>
  );
}
