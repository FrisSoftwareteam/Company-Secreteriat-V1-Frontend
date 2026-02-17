import { NextRequest, NextResponse } from "next/server";

function getTargetUrl() {
  const base = process.env.API_PROXY_TARGET?.trim()?.replace(/\/$/, "");
  if (!base) {
    return null;
  }
  return `${base}/api/auth/login`;
}

export async function POST(request: NextRequest) {
  const targetUrl = getTargetUrl();
  if (!targetUrl) {
    return NextResponse.json(
      { error: "API proxy target is not configured. Set API_PROXY_TARGET." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
      },
      body,
      cache: "no-store",
      signal: controller.signal,
    });

    const payload = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Upstream request timed out while contacting backend." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Upstream request failed: ${error.message}`
            : "Upstream request failed.",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
