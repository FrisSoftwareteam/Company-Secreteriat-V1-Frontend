import { NextRequest, NextResponse } from "next/server";

function getApiProxyTarget() {
  return process.env.API_PROXY_TARGET?.trim().replace(/\/$/, "") || "";
}

export function shouldProxyToUpstream() {
  return !process.env.DATABASE_URL?.trim() && Boolean(getApiProxyTarget());
}

export async function proxyToUpstream(request: NextRequest, pathname?: string) {
  const base = getApiProxyTarget();
  if (!base) {
    return NextResponse.json({ error: "API proxy is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const targetPath = pathname ?? `${url.pathname}${url.search}`;
  const upstreamUrl = `${base}${targetPath}`;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");

  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);

  const method = request.method.toUpperCase();
  const canHaveBody = method !== "GET" && method !== "HEAD";
  const body = canHaveBody ? await request.text() : undefined;

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  const passthroughHeaders = ["content-type", "content-disposition", "cache-control"];
  for (const name of passthroughHeaders) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  const payload = await upstream.arrayBuffer();
  return new NextResponse(payload, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
