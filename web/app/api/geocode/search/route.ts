import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NOMINATIM_UA = "AETERNA/1.0 (memorial grave search; https://aeterna-web-six.vercel.app)";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ success: false, error: "Įveskite bent 2 simbolius" }, { status: 400 });
  }

  const limit = Math.min(10, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 8)));
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURIComponent(
    q
  )}&accept-language=lt`;

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": NOMINATIM_UA,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, error: "Geokodavimo paslauga laikinai nepasiekiama" },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Nepavyko susisiekti su paieškos paslauga" },
      { status: 502 }
    );
  }
}
