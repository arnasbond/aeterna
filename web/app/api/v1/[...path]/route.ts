import { NextRequest, NextResponse } from "next/server";
import { getApiProxyTarget } from "@/lib/api-proxy-target";

export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, pathSegments: string[]) {
  const base = getApiProxyTarget();
  const path = pathSegments.join("/");
  const url = new URL(req.url);
  const target = `${base}/api/v1/${path}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "host" || k === "connection" || k === "content-length") return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, init);
  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    outHeaders.set(key, value);
  });
  outHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
