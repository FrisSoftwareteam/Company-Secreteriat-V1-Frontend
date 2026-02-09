"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "company_secretariat_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
  };

  const setSession = (nextToken: string, nextUser: AuthUser) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
    }
    setToken(nextToken);
    setUser(nextUser);
  };

  const refreshUser = async () => {
    const savedToken = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (!savedToken) {
      clearSession();
      return;
    }

    try {
      const data = await apiRequest<{ user: AuthUser }>("/api/auth/me", { method: "GET" }, savedToken);
      setToken(savedToken);
      setUser(data.user);
    } catch {
      clearSession();
    }
  };

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, setSession, clearSession, refreshUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
