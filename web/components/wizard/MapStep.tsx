"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type GeoLocation = { lat: number; lng: number };

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  defaultCoords?: GeoLocation | null;
  onSave: (coords: GeoLocation) => Promise<void>;
  placeholder?: string;
};

if (typeof window !== "undefined") {
  // Leaflet default icons sometimes fail in bundlers; set URLs explicitly.
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

export function MapStep({ defaultCoords = null, onSave, placeholder }: Props) {
  const LT_CENTER: GeoLocation = { lat: 54.687155, lng: 25.279651 };
  const [tab, setTab] = useState<"auto" | "manual">("auto");
  const [coords, setCoords] = useState<GeoLocation | null>(defaultCoords);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);

  const center = useMemo<[number, number]>(() => {
    if (coords) return [coords.lat, coords.lng];
    return [LT_CENTER.lat, LT_CENTER.lng];
  }, [coords]);

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
      setTab("auto");
      setMsg("GPS atpažinta. Galite patvirtinti mygtuku „Išsaugoti“.");
    } catch (e) {
      setMsg("GPS leidimas atmestas arba nepavyko gauti vietos. Naudokite „Rankiniu būdu“.");
    } finally {
      setBusy(false);
    }
  }

  async function runSearch() {
    setSearchBusy(true);
    setMsg(null);
    try {
      const query = q.trim();
      if (!query) {
        setResults([]);
        return;
      }
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
        query
      )}&accept-language=lt`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Paieška nepavyko");
      const data = (await res.json()) as SearchResult[];
      setResults(data);
      if (data[0]) {
        setCoords({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
      }
    } catch {
      setMsg("Nepavyko ieškoti vietos. Pabandykite kitą adresą/kapinių pavadinimą.");
    } finally {
      setSearchBusy(false);
    }
  }

  async function save() {
    if (!coords) {
      setMsg("Pirma pasirinkite vietą (GPS arba žemėlapio žymeklį).");
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

  return (
    <div className="ae-card" style={{ padding: "1rem", marginTop: "0.75rem", background: "transparent" }}>
      <div className="ch-memorial-qr-tabs" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          type="button"
          className={tab === "auto" ? "ae-btn ae-btn--primary" : "ae-btn ae-btn--outline"}
          onClick={() => setTab("auto")}
        >
          📍 Nustatyti automatiškai (Esu kapinėse)
        </button>
        <button
          type="button"
          className={tab === "manual" ? "ae-btn ae-btn--primary" : "ae-btn ae-btn--outline"}
          onClick={() => setTab("manual")}
        >
          🔍 Rasti žemėlapyje (Rankiniu būdu)
        </button>
      </div>

      {tab === "auto" ? (
        <div>
          <p className="ae-hint" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            Jei esate kapinėse, leiskite prieigą prie vietos ir automatiškai pažymėsime kapo tašką.
          </p>
          <button type="button" className="ae-btn ae-btn--primary ae-btn--wide" disabled={busy} onClick={fixWithGps}>
            {busy ? "Nustatoma…" : "Nustatyti per GPS"}
          </button>
          {coords && (
            <p className="grave-loc-preview">
              ✓ Pasirinkta: <strong>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</strong>
            </p>
          )}
        </div>
      ) : (
        <div>
          <div className="ae-field" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
            <label>Adresas / kapinės (paieška)</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder ?? "Pvz. London, cemetery name"}
                style={{ flex: "1 1 auto" }}
              />
              <button type="button" className="ae-btn ae-btn--outline" disabled={searchBusy} onClick={() => void runSearch()}>
                {searchBusy ? "Ieškoma…" : "Ieškoti"}
              </button>
            </div>
            {results.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0.6rem 0 0" }}>
                {results.map((r) => (
                  <li key={`${r.lat}-${r.lon}`}>
                    <button
                      type="button"
                      className="ae-btn ae-btn--outline"
                      style={{ width: "100%", marginTop: "0.35rem" }}
                      onClick={() => setCoords({ lat: Number(r.lat), lng: Number(r.lon) })}
                    >
                      {r.display_name.length > 70 ? `${r.display_name.slice(0, 70)}…` : r.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="ae-hint" style={{ marginTop: 0 }}>
            Paspauskite žemėlapyje, kad „numestumėte“ žymeklį bet kurioje pasaulio vietoje.
          </p>

          <div style={{ height: 320, marginTop: "0.75rem" }}>
            <MapContainer center={center} zoom={coords ? 13 : 4} scrollWheelZoom className="ae-map-leaflet">
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickToPick onPick={(c) => setCoords(c)} />
              {coords && (
                <Marker position={[coords.lat, coords.lng]}>
                  {/* marker is clickable for future extension */}
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {msg && (
        <p className={msg.toLowerCase().includes("nepavyko") ? "ae-error" : "ae-hint"} style={{ marginTop: "0.75rem" }}>
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

