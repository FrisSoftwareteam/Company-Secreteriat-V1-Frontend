"use client";

import { useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/components/providers/AuthProvider";

function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const authRoute = isAuthRoute(pathname);
    if (!user && !authRoute) {
      router.replace("/login");
      return;
    }

    if (user && authRoute) {
      router.replace(user.role === "ADMIN" ? "/admin" : "/dashboard");
      return;
    }

    if (user?.role === "USER" && pathname.startsWith("/admin")) {
      router.replace("/dashboard");
      return;
    }

    if (user?.role === "ADMIN" && pathname.startsWith("/dashboard")) {
      router.replace("/admin");
    }
  }, [user, loading, pathname, router]);

  const authRoute = isAuthRoute(pathname);

  if (authRoute) {
    return (
      <div className="auth-shell">
        <div className="auth-shell-left">
          <div className="auth-shell-brand">
            <div className="auth-shell-logo-wrap">
              <Image
                src="/firstregistrars.png"
                alt="FirstRegistrars & Investor Services"
                width={220}
                height={62}
                priority
                className="auth-brand-logo"
              />
            </div>
            <p className="auth-shell-tagline">
              Governance. Integrity. Excellence.
            </p>
          </div>
          <div className="auth-shell-decoration" aria-hidden="true">
            <div className="auth-deco-circle auth-deco-circle-1" />
            <div className="auth-deco-circle auth-deco-circle-2" />
            <div className="auth-deco-circle auth-deco-circle-3" />
          </div>
        </div>
        <div className="auth-shell-right">
          <main>{children}</main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="global-brand-bar">
        <Image
          src="/firstregistrars.png"
          alt="FirstRegistrars & Investor Services"
          width={360}
          height={102}
          priority
          className="global-brand-logo"
        />
      </div>
      {user ? (
        <div className="app-layout">
          <Sidebar role={user.role} />
          <div className="main-content">
            <Header user={user} />
            {children}
          </div>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </>
  );
}
