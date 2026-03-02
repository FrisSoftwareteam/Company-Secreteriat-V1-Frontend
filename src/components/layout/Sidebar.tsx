"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({
  className = "",
  role = "USER",
}: {
  className?: string;
  role?: "ADMIN" | "USER";
}) {
  const isAdmin = role === "ADMIN";
  const pathname = usePathname();
  const navItemClass = (active: boolean) => `nav-item${active ? " active" : ""}`;
  const isAdminGraphRoute = pathname.startsWith("/admin/graphical-analysis");
  const isAdminQuestionnaireGraphRoute = pathname.startsWith("/admin/questionaire-graphical-analysis");
  const isAdminDashboardRoute =
    pathname.startsWith("/admin") && !isAdminGraphRoute && !isAdminQuestionnaireGraphRoute;

  return (
    <aside className={`sidebar ${className} flex-col justify-between`}>
      <div>
        <div className="mb-4 px-4 mt-2">
          <h1 className="font-bold" style={{ fontSize: 26, margin: 0 }}>
            <span className="sidebar-brand-primary">COMPANY SECRETERIAL</span>{" "}
            <span className="font-medium sidebar-brand-secondary">PORTAL</span>
          </h1>
        </div>

        <div className="w-full h-px sidebar-divider mb-4" />

        <nav className="flex-col gap-2">
          {isAdmin ? (
            <>
              <Link href="/admin" className={navItemClass(isAdminDashboardRoute)}>
                <span className="nav-icon">AD</span>
                <span className="nav-label">Admin Dashboard</span>
              </Link>
              <p className="sidebar-nav-group-title">Analysis</p>
              <Link href="/admin/graphical-analysis" className={navItemClass(isAdminGraphRoute)}>
                <span className="nav-icon">GA</span>
                <span className="nav-label">Peer-to-Peer Graphical Analysis</span>
              </Link>
              <Link
                href="/admin/questionaire-graphical-analysis"
                className={navItemClass(isAdminQuestionnaireGraphRoute)}
              >
                <span className="nav-icon">QA</span>
                <span className="nav-label">Questionaire Graphical Analysis</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={navItemClass(pathname === "/dashboard")}>
                <span className="nav-icon">DB</span>
                <span className="nav-label">Dashboard</span>
              </Link>
              <Link
                href="/dashboard#available-surveys"
                className={navItemClass(pathname.startsWith("/surveys"))}
              >
                <span className="nav-icon">AS</span>
                <span className="nav-label">Assessments</span>
              </Link>
              <Link href="/dashboard#recent-activity" className={navItemClass(false)}>
                <span className="nav-icon">MR</span>
                <span className="nav-label">My Reports</span>
              </Link>
              <div className="my-4 sidebar-divider" />
              <Link href="/admin" className={navItemClass(pathname.startsWith("/admin"))}>
                <span className="nav-icon">AP</span>
                <span className="nav-label">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="mt-auto">
        <div
          className="card text-white hover-scale"
          style={{
            background: "linear-gradient(135deg, #1f467b 0%, #15355d 100%)",
            padding: 20,
            border: "1px solid rgba(180, 149, 47, 0.35)",
          }}
        >
          <div className="flex-center w-10 h-10 rounded-full bg-white mb-2 bg-opacity-20 backdrop-blur-sm">
            <span style={{ fontSize: 20, color: "#b4952f" }}>?</span>
          </div>
          <p className="font-bold mb-1 text-white">Need Help?</p>
          <p className="text-sm opacity-80 text-white mb-2">Check our docs</p>
          <button
            className="button w-full"
            style={{ background: "#b4952f", color: "#122e53", border: "none", fontWeight: 700 }}
          >
            Documentation
          </button>
        </div>
      </div>
    </aside>
  );
}
