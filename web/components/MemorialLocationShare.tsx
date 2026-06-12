"use client";

import { useState } from "react";
import { MapsOpenLink } from "@/components/MapsOpenLink";
import { googleMapsDirectionsUrl } from "@/lib/open-maps";
import { getSiteOrigin } from "@/lib/site";

type Props = {
  slug: string;
  lat: number;
  lng: number;
  fullName: string;
};

export function MemorialLocationShare({ slug, lat, lng, fullName }: Props) {
  const [copied, setCopied] = useState<"page" | "maps" | null>(null);
  const pageUrl = `${getSiteOrigin()}/m/${slug}`;
  const mapsUrl = googleMapsDirectionsUrl(lat, lng);

  async function copy(text: string, kind: "page" | "maps") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      window.prompt("Nukopijuokite nuorodą:", text);
    }
  }

  return (
    <div className="grave-loc-share ae-card">
      <h3 className="grave-loc-share__title chronicle-serif">Kapavietė išsaugota</h3>
      <p className="ae-hint">
        Dabar mygtukas <strong>„Rasti kapavietę“</strong> atidarys GPS maršrutą iki kapo. Galite pasidalinti
        atminties puslapio nuoroda — lankytojai matys tą patį.
      </p>
      <div className="grave-loc-share__row">
        <span className="grave-loc-share__label">Atminties puslapis</span>
        <code className="grave-loc-share__url">{pageUrl}</code>
        <button type="button" className="ch-btn ch-btn--outline" onClick={() => void copy(pageUrl, "page")}>
          {copied === "page" ? "✓ Nukopijuota" : "Kopijuoti nuorodą"}
        </button>
      </div>
      <div className="grave-loc-share__row">
        <span className="grave-loc-share__label">Tiesiai į Google Maps</span>
        <MapsOpenLink href={mapsUrl} className="ch-btn ch-btn--outline">
          Atidaryti maršrutą
        </MapsOpenLink>
        <button type="button" className="ch-btn ch-btn--outline" onClick={() => void copy(mapsUrl, "maps")}>
          {copied === "maps" ? "✓ Nukopijuota" : "Kopijuoti Maps nuorodą"}
        </button>
      </div>
      <p className="ae-hint" style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
        {fullName} · {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </div>
  );
}
