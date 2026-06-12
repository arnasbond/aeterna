"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapsOpenLink } from "@/components/MapsOpenLink";
import { googleMapsPickUrl, parseGoogleMapsCoords } from "@/lib/parse-google-maps";

type GeoLocation = { lat: number; lng: number };

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type Tab = "google" | "gps" | "osm";

type Props = {
  defaultCoords?: GeoLocation | null;
  onSave: (coords: GeoLocation) => Promise<void>;
  placeholder?: string;
  /** Google Maps paieškos užklausa (pvz. vardas + kapinės). */
  mapsSearchHint?: string;
};

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function ClickToPick({ onPick }: { onPick: (coords: GeoLocation) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  return null;
}

export function MapStep({ defaultCoords = null, onSave, placeholder, mapsSearchHint }: Props) {
  const LT_CENTER: GeoLocation = { lat: 54.687155, lng: 25.279651 };
  const [tab, setTab] = useState<Tab>("google");
  const [coords, setCoords] = useState<GeoLocation | null>(defaultCoords);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [googleInput, setGoogleInput] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [mapZoom, setMapZoom] = useState(4);

  const center = useMemo<[number, number]>(() => {
    if (coords) return [coords.lat, coords.lng];
    return [LT_CENTER.lat, LT_CENTER.lng];
  }, [coords]);

  function applyGoogleInput(raw?: string) {
    const text = (raw ?? googleInput).trim();
    if (!text) {
      setMsg("Įklijuokite Google Maps nuorodą arba koordinates (pvz. 54.68, 25.28).");
      return;
    }
    const parsed = parseGoogleMapsCoords(text);
    if (!parsed) {
      setCoords(null);
      setMsg("Nepavyko atpažinti. Maps → pažymėkite kapą → Dalintis → Kopijuoti nuorodą ir įklijuokite čia.");
      return;
    }
    setCoords(parsed);
    setMapZoom(16);
    setMsg(`✓ Atpažinta vieta: ${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`);
  }

  async function fixWithGps() {
    setMsg(null);
    setBusy(true);
    try {
      if (!navigator.geolocation) {
        setMsg("Jūsų įrenginys nepalaiko GPS.");
        return;
      }
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 20000 });
      });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setMapZoom(16);
      setMsg("GPS atpažinta. Galite patvirtinti mygtuku „Išsaugoti“.");
    } catch {
      setMsg("GPS leidimas atmestas arba nepavyko gauti vietos. Naudokite Google Maps arba OpenStreetMap paiešką.");
    } finally {
      setBusy(false);
    }
  }

  async function runSearch() {
    setSearchBusy(true);
    setMsg(null);
    setResults([]);
    try {
      const query = q.trim();
      if (!query) {
        setMsg("Įveskite adresą arba kapinių pavadinimą.");
        return;
      }
      if (query.length < 2) {
        setMsg("Įveskite bent 2 simbolius.");
        return;
      }
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error || "Paieška nepavyko");
      }
      const data = (await res.json()) as SearchResult[];
      setResults(data);
      if (data.length === 0) {
        setMsg("Nieko nerasta. Pabandykite Google Maps arba kitą adresą.");
        return;
      }
      setCoords({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
      setMapZoom(14);
      setMsg(`Rasta ${data.length} vietų — pasirinkite iš sąrašo arba patikslinkite žemėlapyje.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Nepavyko ieškoti vietos.");
    } finally {
      setSearchBusy(false);
    }
  }

  function pickResult(r: SearchResult) {
    setCoords({ lat: Number(r.lat), lng: Number(r.lon) });
    setMapZoom(16);
    setMsg("Vieta pažymėta žemėlapyje. Jei reikia — patikslinkite paspaudimu ant žemėlapio.");
  }

  async function save() {
    if (!coords) {
      setMsg("Pirma pasirinkite vietą (Google Maps, GPS arba žemėlapio žymeklį).");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await onSave(coords);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Nepavyko išsaugoti vietos");
    } finally {
      setBusy(false);
    }
  }

  const googleMapsUrl = googleMapsPickUrl(mapsSearchHint);

  return (
    <div className="ae-card" style={{ padding: "1rem", marginTop: "0.75rem", background: "transparent" }}>
      <div className="ch-memorial-qr-tabs ae-map-step-tabs" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          type="button"
          className={tab === "google" ? "ae-btn ae-btn--primary" : "ae-btn ae-btn--outline"}
          onClick={() => setTab("google")}
        >
          🗺️ Google Maps
        </button>
        <button
          type="button"
          className={tab === "gps" ? "ae-btn ae-btn--primary" : "ae-btn ae-btn--outline"}
          onClick={() => setTab("gps")}
        >
          📍 GPS (esu kapinėse)
        </button>
        <button
          type="button"
          className={tab === "osm" ? "ae-btn ae-btn--primary" : "ae-btn ae-btn--outline"}
          onClick={() => setTab("osm")}
        >
          🌍 OpenStreetMap
        </button>
      </div>

      {tab === "google" && (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <MapsOpenLink href={googleMapsUrl} className="ae-btn ae-btn--primary ae-btn--wide">
              Atidaryti Google Maps
            </MapsOpenLink>
          </div>
          <ol className="grave-loc-steps" style={{ margin: "0 0 1rem", lineHeight: 1.65 }}>
            <li>Suraskite kapą Maps programėlėje (ilgas paspaudimas ant vietos).</li>
            <li>
              Maps → <strong>Dalintis</strong> → <strong>Kopijuoti nuorodą</strong> (arba koordinates{" "}
              <code>54.xxx, 25.xxx</code>).
            </li>
            <li>Įklijuokite žemiau — AETERNA atpažins vietą ir pririš prie atminties.</li>
          </ol>
          <div className="ae-field" style={{ marginBottom: "0.75rem" }}>
            <label>Google Maps nuoroda arba koordinatės</label>
            <textarea
              rows={3}
              value={googleInput}
              onChange={(e) => {
                setGoogleInput(e.target.value);
                const parsed = parseGoogleMapsCoords(e.target.value);
                if (parsed) {
                  setCoords(parsed);
                  setMsg(`✓ Atpažinta vieta: ${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`);
                }
              }}
              onBlur={() => {
                if (googleInput.trim()) applyGoogleInput();
              }}
              placeholder="Įklijuokite maps.app.goo.gl nuorodą arba 54.68716, 25.27965"
            />
          </div>
          <button type="button" className="ae-btn ae-btn--outline ae-btn--wide" onClick={() => applyGoogleInput()}>
            Atpažinti vietą iš įklijuoto teksto
          </button>
        </div>
      )}

      {tab === "gps" && (
        <div>
          <p className="ae-hint" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            Jei stovite prie kapo, leiskite GPS — pažymėsime dabartinę vietą.
          </p>
          <button type="button" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy} onClick={fixWithGps}>
            {busy ? "Nustatoma…" : "Nustatyti per GPS"}
          </button>
        </div>
      )}

      {tab === "osm" && (
        <div>
          <p className="ae-hint" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            Alternatyva be Google — adreso paieška ir žymeklis OpenStreetMap žemėlapyje (naudinga užsienyje).
          </p>
          <div className="ae-field" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            <label>Adresas / kapinės (paieška)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void runSearch();
                  }
                }}
                placeholder={placeholder ?? "Pvz. Rasų kapinės, Vilnius arba London cemetery"}
                style={{ flex: "1 1 auto" }}
              />
              <button type="button" className="ae-btn ae-btn--outline" disabled={searchBusy} onClick={() => void runSearch()}>
                {searchBusy ? "Ieškoma…" : "Ieškoti"}
              </button>
            </div>
            {results.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0.6rem 0 0" }}>
                {results.map((r) => (
                  <li key={`${r.lat}-${r.lon}-${r.display_name.slice(0, 20)}`}>
                    <button
                      type="button"
                      className="ae-btn ae-btn--outline"
                      style={{ width: "100%", marginTop: "0.35rem", textAlign: "left" }}
                      onClick={() => pickResult(r)}
                    >
                      {r.display_name.length > 90 ? `${r.display_name.slice(0, 90)}…` : r.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="ae-hint" style={{ marginTop: 0 }}>
            Paspauskite žemėlapyje, kad patikslintumėte žymeklį.
          </p>
          <div style={{ height: 320, marginTop: "0.75rem" }}>
            <MapContainer center={center} zoom={mapZoom} scrollWheelZoom className="ae-map-leaflet">
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapRecenter center={center} zoom={mapZoom} />
              <ClickToPick
                onPick={(c) => {
                  setCoords(c);
                  setMapZoom(16);
                  setMsg(`Žymeklis: ${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`);
                }}
              />
              {coords && <Marker position={[coords.lat, coords.lng]} />}
            </MapContainer>
          </div>
        </div>
      )}

      {coords && (
        <p className="grave-loc-preview" style={{ marginTop: "0.75rem" }}>
          ✓ Pasirinkta: <strong>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</strong>
        </p>
      )}

      {msg && (
        <p
          className={
            msg.toLowerCase().includes("nepavyko") || msg.startsWith("Nieko") || msg.includes("Nepavyko atpažinti")
              ? "ae-error"
              : "ae-hint"
          }
          style={{ marginTop: "0.75rem" }}
        >
          {msg}
        </p>
      )}

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" className="ae-btn ae-btn--primary" style={{ flex: "1 1 200px" }} disabled={busy} onClick={() => void save()}>
          {busy ? "Išsaugoma…" : "Išsaugoti ir pririšti prie atminties"}
        </button>
      </div>
    </div>
  );
}
