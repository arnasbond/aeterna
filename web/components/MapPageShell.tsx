"use client";

import dynamic from "next/dynamic";

const MapPageClient = dynamic(
  () => import("@/components/MapPageClient").then((m) => m.MapPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="hercules-page">
        <div className="hercules-header-spacer" aria-hidden />
        <p className="ae-hint" style={{ textAlign: "center", padding: "2rem" }}>
          Kraunamas žemėlapis…
        </p>
      </div>
    ),
  }
);

export function MapPageShell() {
  return <MapPageClient />;
}
