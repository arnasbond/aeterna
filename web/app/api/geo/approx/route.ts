import { NextRequest, NextResponse } from "next/server";
import { isInLithuania, LT_MAP_DEFAULT } from "@/lib/lithuania-map";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  const lat = Number(req.headers.get("x-vercel-ip-latitude"));
  const lng = Number(req.headers.get("x-vercel-ip-longitude"));

  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if (country === "LT" && hasCoords && isInLithuania(lat, lng)) {
    return NextResponse.json(
      { inLithuania: true, lat, lng, source: "vercel-ip" },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  if (country && country !== "LT") {
    return NextResponse.json(
      {
        inLithuania: false,
        lat: LT_MAP_DEFAULT.lat,
        lng: LT_MAP_DEFAULT.lng,
        source: "default-lt",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    {
      inLithuania: true,
      lat: LT_MAP_DEFAULT.lat,
      lng: LT_MAP_DEFAULT.lng,
      source: "default-lt",
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
