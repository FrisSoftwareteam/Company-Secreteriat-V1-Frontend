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
      {user && !authRoute ? (
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
