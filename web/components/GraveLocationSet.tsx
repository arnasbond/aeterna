"use client";

import { useEffect, useState } from "react";
import { fixMemorialLocation } from "@/lib/api";
import { MemorialLocationShare } from "@/components/MemorialLocationShare";
import { MapStep } from "@/components/wizard/MapStep";
import { MEMORIAL_PILL_BTN } from "@/lib/glass-card";

type Props = {
  slug: string;
  memorialName: string;
  parishTitle?: string;
  onSaved?: (lat: number, lng: number) => void;
  defaultOpen?: boolean;
};

export function GraveLocationSet({ slug, memorialName, parishTitle, onSaved, defaultOpen }: Props) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [saved, setSaved] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  async function saveCoords(lat: number, lng: number) {
    await fixMemorialLocation(slug, lat, lng);
    setSaved({ lat, lng });
    onSaved?.(lat, lng);
  }

  if (saved) {
    return (
      <MemorialLocationShare slug={slug} lat={saved.lat} lng={saved.lng} fullName={memorialName} />
    );
  }

  return (
    <div className="grave-loc-set ae-card">
      <h3 className="grave-loc-set__title chronicle-serif">Nurodyti kapavietę</h3>
      <p className="ae-hint" style={{ marginBottom: "0.75rem" }}>
        Vieta pririšiama prie <strong>šios atminties</strong>. Po išsaugimo visi, su kuriais pasidalinsite puslapio
        nuoroda, galės spausti „Rasti kapavietę“ ir gauti maršrutą.
      </p>

      {!open ? (
        <button type="button" className={`ch-btn ch-btn--primary ae-btn--wide ${MEMORIAL_PILL_BTN}`} onClick={() => setOpen(true)}>
          Pradėti — Google Maps arba GPS
        </button>
      ) : (
        <MapStep
          defaultCoords={null}
          onSave={async ({ lat, lng }) => saveCoords(lat, lng)}
          placeholder="Pvz. Rasų kapinės, Vilnius arba London cemetery"
          mapsSearchHint={
            parishTitle ? `${memorialName} kapinės ${parishTitle}` : `${memorialName} kapinės`
          }
        />
      )}
    </div>
  );
}
