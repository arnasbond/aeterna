import { NextResponse } from "next/server";

const API = (process.env.API_INTERNAL_URL || "http://127.0.0.1:4000").replace(/\/$/, "");

export async function GET() {
  try {
    const res = await fetch(`${API}/health`, { cache: "no-store" });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": res.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ status: "error", message: "API nepasiekiama" }, { status: 503 });
  }
}
