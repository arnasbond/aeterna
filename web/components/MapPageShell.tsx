"use client";

import dynamic from "next/dynamic";

const MapPageClient = dynamic(
  () => import("@/components/MapPageClient").then((m) => m.MapPageClient),
  {
    ssr: false,
    loading: () => (
      <section className="ae-section">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunamas žemėlapis…
        </p>
      </section>
    ),
  }
);

export function MapPageShell() {
  return <MapPageClient />;
}
