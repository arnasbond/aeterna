import type { MouseEvent } from "react";

/** Google Maps nuorodos ir atidarymas (naršyklė + Android programėlė). */

type AeternaWindow = Window & { AeternaApp?: { openMaps?: (url: string) => void } };

export function googleMapsSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) return "https://maps.google.com/";
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}`;
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?daddr=${lat},${lng}`;
}

/** Tik programėlės WebView — kitaip leisti naršyklei atidaryti href natūraliai. */
export function handleMapsLinkClick(e: MouseEvent<HTMLAnchorElement>): void {
  const w = window as AeternaWindow;
  if (!w.AeternaApp?.openMaps) return;
  e.preventDefault();
  w.AeternaApp.openMaps(e.currentTarget.href);
}

/** Retas atvejis be <a> elemento (pvz. programinis kvietimas). */
export function openExternalMaps(url: string): void {
  if (typeof window === "undefined") return;
  const w = window as AeternaWindow;
  if (w.AeternaApp?.openMaps) {
    w.AeternaApp.openMaps(url);
    return;
  }
  window.location.assign(url);
}

export function openGoogleMapsSearch(query: string): void {
  openExternalMaps(googleMapsSearchUrl(query));
}

export function openGoogleMapsDirections(lat: number, lng: number): void {
  openExternalMaps(googleMapsDirectionsUrl(lat, lng));
}
