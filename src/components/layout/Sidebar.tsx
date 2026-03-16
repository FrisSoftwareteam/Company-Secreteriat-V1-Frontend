"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
      <path d="M20.59 22a8 8 0 1 0-17.18 0" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function PieChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

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
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#b4952f" fillOpacity="0.15" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="#b4952f" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="sidebar-brand-title">
              <span className="sidebar-brand-primary">COMPANY</span>{" "}
              <span className="sidebar-brand-secondary">SECRETARIAL</span>
            </h1>
            <span className="sidebar-brand-sub">PORTAL</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav" aria-label="Main navigation">
          {isAdmin ? (
            <>
              <Link href="/admin" className={navItemClass(isAdminDashboardRoute)}>
                <span className="nav-icon"><DashboardIcon /></span>
                <span className="nav-label">Admin Dashboard</span>
              </Link>
              <p className="sidebar-nav-group-title">Analysis</p>
              <Link href="/admin/graphical-analysis" className={navItemClass(isAdminGraphRoute)}>
                <span className="nav-icon"><BarChartIcon /></span>
                <span className="nav-label">Peer-to-Peer Analysis</span>
              </Link>
              <Link
                href="/admin/questionaire-graphical-analysis"
                className={navItemClass(isAdminQuestionnaireGraphRoute)}
              >
                <span className="nav-icon"><PieChartIcon /></span>
                <span className="nav-label">Questionnaire Analysis</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className={navItemClass(pathname === "/dashboard")}>
                <span className="nav-icon"><DashboardIcon /></span>
                <span className="nav-label">Dashboard</span>
              </Link>
              <Link
                href="/dashboard#available-surveys"
                className={navItemClass(pathname.startsWith("/surveys"))}
              >
                <span className="nav-icon"><ClipboardIcon /></span>
                <span className="nav-label">Assessments</span>
              </Link>
              <Link href="/dashboard#recent-activity" className={navItemClass(false)}>
                <span className="nav-icon"><ReportIcon /></span>
                <span className="nav-label">My Reports</span>
              </Link>
              <div className="sidebar-divider" style={{ margin: "16px 0" }} />
              <Link href="/admin" className={navItemClass(pathname.startsWith("/admin"))}>
                <span className="nav-icon"><AdminIcon /></span>
                <span className="nav-label">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-help-card">
          <div className="sidebar-help-icon">
            <HelpIcon />
          </div>
          <p className="sidebar-help-title">Need Help?</p>
          <p className="sidebar-help-desc">View our documentation</p>
          <Link href="/help" className="sidebar-help-btn">
            Documentation
          </Link>
        </div>
      </div>
    </aside>
  );
}
