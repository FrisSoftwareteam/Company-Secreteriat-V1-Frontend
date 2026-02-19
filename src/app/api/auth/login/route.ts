import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

function getTargetUrl() {
  const base = process.env.API_PROXY_TARGET?.trim()?.replace(/\/$/, "");
  if (!base) {
    return null;
  }
  return `${base}/api/auth/login`;
}

async function localLogin(request: NextRequest, bodyText: string) {
  let payload: { loginAs?: string; identifier?: string; password?: string } = {};
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const loginAs = String(payload.loginAs || "").toUpperCase();
  const identifier = String(payload.identifier || "").trim().toLowerCase();
  const password = String(payload.password || "");

  if (!loginAs || !identifier || !password) {
    return NextResponse.json(
      { error: "Login role, username/email and password are required." },
      { status: 400 }
    );
  }

  if (loginAs !== "ADMIN" && loginAs !== "USER") {
    return NextResponse.json({ error: "Invalid login role selected." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: identifier } });
  if (!user) {
    return NextResponse.json({ error: "Invalid username/email or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username/email or password." }, { status: 401 });
  }

  if (user.role !== loginAs) {
    return NextResponse.json(
      { error: `This account is registered as ${user.role}. Please choose ${user.role} login.` },
      { status: 403 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  await db.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  (await cookies()).set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return NextResponse.json(
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const targetUrl = getTargetUrl();
  const body = await request.text();

  // Prefer local DB-backed login so issued tokens are always valid for local admin APIs.
  const localResponse = await localLogin(request, body);
  if (localResponse.status === 200 || !targetUrl) {
    return localResponse;
  }

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
    // If local login already failed and upstream is unavailable, return local failure first.
    if (localResponse.status >= 400 && localResponse.status < 500) {
      return localResponse;
    }
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
