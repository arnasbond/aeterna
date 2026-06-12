"use client";

import { MapsOpenLink } from "@/components/MapsOpenLink";
import { googleMapsDirectionsUrl } from "@/lib/open-maps";

type Props = {
  lat: number;
  lng: number;
};

export function NavigateToGrave({ lat, lng }: Props) {
  return (
    <MapsOpenLink href={googleMapsDirectionsUrl(lat, lng)} className="ae-btn ae-btn--outline">
      Naviguoti iki kapo
    </MapsOpenLink>
  );
}
