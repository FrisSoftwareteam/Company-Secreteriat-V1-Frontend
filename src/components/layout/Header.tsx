"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a5 5 0 0 0-5 5v2.6c0 .8-.3 1.5-.8 2.1L4.8 14a1 1 0 0 0 .7 1.7h13a1 1 0 0 0 .7-1.7l-1.4-1.3a3.2 3.2 0 0 1-.8-2.1V8a5 5 0 0 0-5-5Z" />
      <path d="M9.9 17.5a2.1 2.1 0 0 0 4.2 0" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 3.6a8.6 8.6 0 1 0 6 14.8 8.8 8.8 0 0 1-6-14.8Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.3v5.4" />
      <circle cx="12" cy="7.3" r=".8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.2" />
      <path d="m15.1 15.1 4.4 4.4" />
    </svg>
  );
}

function getTitle(pathname: string) {
  if (pathname.startsWith("/admin")) return "Admin";
  if (pathname.startsWith("/surveys")) return "Evaluation Survey";
  if (pathname.startsWith("/dashboard")) return "Overview";
  if (pathname.startsWith("/help")) return "Help";
  return "Overview";
}

export function Header({ user }: { user: { email: string; role?: "ADMIN" | "USER" } | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const title = getTitle(pathname || "/");
  const name = user?.email?.split("@")[0] ?? "";
  const initial = name ? name[0].toUpperCase() : "U";
  const initialQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    const basePath = pathname.startsWith("/admin") ? "/admin" : "/dashboard";
    router.push(q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath);
  };

  const handleNotifications = () => {
    if (pathname.startsWith("/admin")) {
      router.push("/admin");
      return;
    }
    router.push("/dashboard#recent-activity");
  };

  const handleThemeToggle = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      window.localStorage.setItem("theme", "light");
    }
  };

  const handleHelp = () => {
    router.push("/help");
  };

  return (
    <header className="header-bar glass">
      <div className="header-page-meta">
        <p className="text-secondary text-sm font-medium">Pages / {title}</p>
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-actions">
        <form className="header-search" onSubmit={handleSearch}>
          <span className="header-search-icon">
            <SearchIcon />
          </span>
          <input
            id="header-search"
            name="q"
            placeholder="Search surveys, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="header-icon-group" aria-label="Quick actions">
          <button className="header-icon-button" type="button" aria-label="Notifications" onClick={handleNotifications}>
            <BellIcon />
          </button>
          <button className="header-icon-button" type="button" aria-label="Toggle theme" onClick={handleThemeToggle}>
            <MoonIcon />
          </button>
          <button className="header-icon-button" type="button" aria-label="Help" onClick={handleHelp}>
            <InfoIcon />
          </button>
        </div>

        {user ? (
          <div className="header-user">
            <div className="header-user-text">
              <span className="text-secondary text-xs">Hello</span>
              <strong>{name}</strong>
            </div>
            <div className="header-user-avatar">{initial}</div>
            <LogoutButton className="header-logout-btn" />
          </div>
        ) : (
          <Link href="/login" className="button primary text-sm">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
