import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export type ApiSessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
  token: string;
};

function readToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get("session_token")?.value || null;
}

function readCookieToken(request: NextRequest) {
  return request.cookies.get("session_token")?.value || null;
}

async function readUpstreamUser(token: string): Promise<Omit<ApiSessionUser, "token"> | null> {
  const base = process.env.API_PROXY_TARGET?.trim()?.replace(/\/$/, "");
  if (!base) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${base}/api/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const payload = (await response.json().catch(() => ({}))) as
      | {
          user?: { id?: string; email?: string; role?: "ADMIN" | "USER" };
          id?: string;
          email?: string;
          role?: "ADMIN" | "USER";
        }
      | undefined;

    const user = payload?.user ?? payload;
    const id = user?.id;
    const email = user?.email;
    const role = user?.role;

    if (!id || !email || (role !== "ADMIN" && role !== "USER")) return null;
    return { id, email, role };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getApiSessionUser(request: NextRequest): Promise<ApiSessionUser | null> {
  const primaryToken = readToken(request);
  const cookieToken = readCookieToken(request);
  const tokens = [primaryToken, cookieToken].filter(
    (value, index, array): value is string => Boolean(value) && array.indexOf(value) === index
  );
  if (tokens.length === 0) return null;

  for (const token of tokens) {
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session) continue;

    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { token } }).catch(() => {});
      continue;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      token,
    };
  }

  for (const token of tokens) {
    const upstreamUser = await readUpstreamUser(token);
    if (upstreamUser) {
      return { ...upstreamUser, token };
    }
  }

  return null;
}
