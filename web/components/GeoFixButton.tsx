"use client";

import { useState } from "react";
import { fixMemorialLocation } from "@/lib/api";

type Props = {
  slug: string;
  onFixed?: (lat: number, lng: number) => void;
};

export function GeoFixButton({ slug, onFixed }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function fix() {
    if (!navigator.geolocation) {
      setMsg("Jūsų įrenginys nepalaiko GPS.");
      return;
    }
    setBusy(true);
    setMsg(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          await fixMemorialLocation(slug, lat, lng);
          setMsg("Vieta išsaugota.");
          onFixed?.(lat, lng);
        } catch (e) {
          setMsg(e instanceof Error ? e.message : "Nepavyko išsaugoti");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setMsg("Leidimas prieiti prie vietos atmestas.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div>
      <button type="button" className="ae-btn ae-btn--primary" disabled={busy} onClick={fix}>
        {busy ? "Fiksuojama…" : "Fiksuoti vietą (stovint prie kapo)"}
      </button>
      {msg && (
        <p style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "var(--ae-muted)" }}>{msg}</p>
      )}
    </div>
  );
}
