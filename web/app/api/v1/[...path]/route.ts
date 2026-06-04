import { NextRequest, NextResponse } from "next/server";

const API = (process.env.API_INTERNAL_URL || "http://127.0.0.1:4000").replace(/\/$/, "");

async function proxy(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const target = `${API}/api/v1/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const res = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    cache: "no-store",
  });

  const outHeaders = new Headers();
  const resType = res.headers.get("content-type");
  if (resType) outHeaders.set("content-type", resType);

  return new NextResponse(await res.arrayBuffer(), { status: res.status, headers: outHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
