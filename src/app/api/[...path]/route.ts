import { NextRequest, NextResponse } from "next/server";

function resolveTarget(path: string[], search: string) {
  const base = process.env.API_PROXY_TARGET?.trim()?.replace(/\/$/, "");
  if (!base) return null;
  const joined = path.join("/");
  return `${base}/api/${joined}${search}`;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = resolveTarget(path, request.nextUrl.search);
  if (!target) {
    return NextResponse.json(
      { error: "API proxy is not configured. Set API_PROXY_TARGET in environment variables." },
      { status: 500 }
    );
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "content-length") return;
    headers.set(key, value);
  });

  const method = request.method.toUpperCase();
  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(target, init);
    const body = await upstream.text();

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? `Failed to reach upstream API: ${error.message}` : "Failed to reach upstream API.",
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}
