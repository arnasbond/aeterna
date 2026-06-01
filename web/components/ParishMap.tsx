"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip } from "react-leaflet";
import L, { type PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { DeaneryFeatureProperties, MapData, ParishMapPoint } from "@/lib/api";
import { mapsDirectionsUrl } from "@/lib/api";

const LT_CENTER: [number, number] = [55.17, 23.88];
const LT_ZOOM = 7;

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const churchIcon = L.divIcon({
  className: "ae-map-marker",
  html: '<span aria-hidden="true">✝</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

type Props = {
  data: MapData;
};

export function ParishMap({ data }: Props) {
  const router = useRouter();
  const [hoveredDeanery, setHoveredDeanery] = useState<string | null>(null);
  const [selectedDeanery, setSelectedDeanery] = useState<string | null>(null);
  const [hoveredParish, setHoveredParish] = useState<string | null>(null);

  const activeDeaneryId = selectedDeanery ?? hoveredDeanery;

  const deaneryMeta = useMemo(() => {
    if (!activeDeaneryId) return null;
    const f = data.deaneries.features.find((x) => x.properties.id === activeDeaneryId);
    return f?.properties ?? null;
  }, [activeDeaneryId, data.deaneries.features]);

  const parishesInDeanery = useMemo(() => {
    if (!activeDeaneryId) return [];
    return data.parishes.filter((p) => p.deaneryId === activeDeaneryId);
  }, [activeDeaneryId, data.parishes]);

  type DeaneryFeature = MapData["deaneries"]["features"][number];

  const deaneryStyle = useCallback(
    (feature?: { properties?: DeaneryFeatureProperties }): PathOptions => {
      const id = feature?.properties?.id;
      const active = id === hoveredDeanery || id === selectedDeanery;
      return {
        fillColor: active ? "#4a6741" : "#9bb392",
        fillOpacity: active ? 0.42 : 0.18,
        color: active ? "#2f4429" : "#6b7f66",
        weight: active ? 2.5 : 1,
      };
    },
    [hoveredDeanery, selectedDeanery]
  );

  const onEachDeanery = useCallback((feature: DeaneryFeature, layer: L.Layer) => {
    const props = feature.properties as DeaneryFeatureProperties;
    layer.on({
      mouseover: () => setHoveredDeanery(props.id),
      mouseout: () => setHoveredDeanery((h) => (h === props.id ? null : h)),
      click: () => setSelectedDeanery(props.id),
    });
    if ("bindTooltip" in layer && typeof layer.bindTooltip === "function") {
      layer.bindTooltip(props.name, { sticky: true, className: "ae-map-tooltip" });
    }
  }, []);

  function goToParish(id: string) {
    router.push(`/parishes/${encodeURIComponent(id)}`);
  }

  return (
    <div className="ae-map-layout">
      <aside className="ae-map-sidebar">
        <h2 className="ae-map-sidebar__title">Lietuvos parapijos</h2>
        <p className="ae-map-sidebar__hint">
          Užveskite ant seniūnijos arba paspauskite žymeklį — atsidarys parapijos puslapis su Mišiomis,
          žvakute ir atmintimi.
        </p>
        {deaneryMeta ? (
          <div className="ae-map-sidebar__panel">
            <p className="ae-map-sidebar__deanery">{deaneryMeta.name}</p>
            <p className="ae-map-sidebar__diocese">{deaneryMeta.diocese}</p>
            <ul className="ae-map-parish-list">
              {parishesInDeanery.map((p) => (
                <li key={p.id}>
                  <button type="button" className="ae-map-parish-link" onClick={() => goToParish(p.id)}>
                    <strong>{p.title}</strong>
                    {p.city && <span>{p.city}</span>}
                  </button>
                </li>
              ))}
            </ul>
            {parishesInDeanery.length === 0 && (
              <p className="ae-hint">Šioje seniūnijoje dar nėra parapijų duomenų bazėje.</p>
            )}
          </div>
        ) : hoveredParish ? (
          <ParishPreview
            parish={data.parishes.find((p) => p.id === hoveredParish)!}
            onOpen={() => goToParish(hoveredParish)}
          />
        ) : (
          <p className="ae-hint">Pasirinkite sritį žemėlapyje arba parapijos žymeklį.</p>
        )}
        {selectedDeanery && (
          <button type="button" className="ae-btn ae-btn--outline ae-map-clear" onClick={() => setSelectedDeanery(null)}>
            Rodyti visą Lietuvą
          </button>
        )}
      </aside>
      <div className="ae-map-canvas">
        <MapContainer center={LT_CENTER} zoom={LT_ZOOM} className="ae-map-leaflet" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            key={`deaneries-${selectedDeanery ?? "all"}`}
            data={data.deaneries}
            style={deaneryStyle}
            onEachFeature={onEachDeanery}
          />
          {data.parishes.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={churchIcon}
              eventHandlers={{
                mouseover: () => setHoveredParish(p.id),
                mouseout: () => setHoveredParish((h) => (h === p.id ? null : h)),
                click: () => goToParish(p.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="ae-map-tooltip">
                {p.title}
              </Tooltip>
              <Popup>
                <strong>{p.title}</strong>
                <br />
                <span style={{ fontSize: "0.85rem", color: "#5c6b5c" }}>{p.deaneryName}</span>
                <br />
                <Link href={`/parishes/${p.id}`} className="ae-map-popup-link">
                  Atidaryti parapiją →
                </Link>
                <br />
                <a href={mapsDirectionsUrl(p.lat, p.lng)} target="_blank" rel="noreferrer" className="ae-map-popup-link">
                  Maršrutas
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

function ParishPreview({ parish, onOpen }: { parish: ParishMapPoint; onOpen: () => void }) {
  return (
    <div className="ae-map-sidebar__panel">
      <p className="ae-map-sidebar__deanery">{parish.title}</p>
      <p className="ae-map-sidebar__diocese">
        {parish.city ? `${parish.city} · ` : ""}
        {parish.deaneryName}
      </p>
      <button type="button" className="ae-btn ae-btn--primary ae-btn--wide" onClick={onOpen}>
        Atidaryti parapiją
      </button>
    </div>
  );
}
