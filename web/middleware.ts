import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Telefono WebView ir CDN — visada šviežias HTML (pataisymai matomi po deploy). */
export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const p = request.nextUrl.pathname;
  if (p === "/" || p === "/paieska" || p.startsWith("/m/") || p.startsWith("/wizard")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)"],
};
