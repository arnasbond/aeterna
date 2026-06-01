"use client";

import { mapsDirectionsUrl } from "@/lib/api";

type Props = {
  lat: number;
  lng: number;
};

export function NavigateToGrave({ lat, lng }: Props) {
  return (
    <a
      href={mapsDirectionsUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className="ae-btn ae-btn--outline"
    >
      Naviguoti iki kapo
    </a>
  );
}
