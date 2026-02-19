"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { SurveyDefinition, surveys as localSurveys } from "@/lib/surveys";
import { useAuth } from "@/components/providers/AuthProvider";

type AdminSubmission = {
  id: string;
  surveySlug: string;
  createdAt: string;
  user?: { email: string } | null;
};

type AdminOverviewResponse = {
  surveys?: SurveyDefinition[];
  submissions?: AdminSubmission[];
  countsBySurveySlug?: Record<string, number>;
  recentSubmissions?: AdminSubmission[];
  submissionCounts?: Record<string, number>;
};

type AdminResultsResponse = {
  survey?: SurveyDefinition;
  submissions?: AdminSubmission[];
};

type SurveysResponse = {
  surveys?: SurveyDefinition[];
};

type DashboardResponse = {
  surveys?: SurveyDefinition[];
  submissions?: unknown[];
};

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildDerivedCounts(submissions: AdminSubmission[]) {
  const byNormalizedSlug: Record<string, number> = {};
  for (const submission of submissions) {
    const key = normalizeSlug(submission.surveySlug || "unknown");
    byNormalizedSlug[key] = (byNormalizedSlug[key] ?? 0) + 1;
  }
  return byNormalizedSlug;
}

function extractArrayFromUnknown(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];
  const obj = input as Record<string, unknown>;
  const candidates = [
    obj.submissions,
    obj.recentSubmissions,
    obj.items,
    obj.rows,
    obj.data,
    (obj.data as Record<string, unknown> | undefined)?.items,
    (obj.data as Record<string, unknown> | undefined)?.rows,
    (obj.data as Record<string, unknown> | undefined)?.submissions,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

async function downloadExport(slug: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/export?slug=${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Export failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}-submissions.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AdminContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { token } = useAuth();
  const [surveys, setSurveys] = useState<SurveyDefinition[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [countsBySurveySlug, setCountsBySurveySlug] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [scopeNotice, setScopeNotice] = useState("");

  const normalizeSubmissions = (items: unknown, fallbackSurveySlug?: string): AdminSubmission[] => {
    const rows = extractArrayFromUnknown(items);
    if (!Array.isArray(rows)) return [];
    return rows
      .map((item) => {
        const row = item as Record<string, unknown>;
        const surveySlug =
          typeof row.surveySlug === "string"
            ? row.surveySlug
            : typeof row.survey_slug === "string"
              ? row.survey_slug
            : typeof row.slug === "string"
              ? row.slug
              : typeof row.surveyId === "string"
                ? row.surveyId
              : typeof row.survey_id === "string"
                ? row.survey_id
                : typeof (row.survey as { slug?: unknown } | undefined)?.slug === "string"
                  ? String((row.survey as { slug?: unknown }).slug)
                  : fallbackSurveySlug ?? "unknown";
        const createdAt =
          typeof row.createdAt === "string"
            ? row.createdAt
            : typeof row.created_at === "string"
              ? String(row.created_at)
              : typeof row.submittedAt === "string"
                ? String(row.submittedAt)
                : typeof row.updatedAt === "string"
                  ? String(row.updatedAt)
                  : typeof row.date === "string"
                    ? String(row.date)
              : new Date().toISOString();

        const userRecord = row.user as { email?: unknown } | null | undefined;
        const email =
          userRecord?.email ??
          (typeof row.userEmail === "string" ? row.userEmail : undefined) ??
          (typeof row.email === "string" ? row.email : undefined);

        return {
          id:
            typeof row.id === "string"
              ? row.id
              : typeof row._id === "string"
                ? row._id
                : typeof row.submissionId === "string"
                  ? row.submissionId
                  : String(row.id ?? row._id ?? row.submissionId ?? ""),
          surveySlug,
          createdAt,
          user: email ? { email: String(email) } : null,
        };
      })
      .filter((item) => item.id);
  };

  useEffect(() => {
    if (!token) return;
    setError("");
    setScopeNotice("");

    const loadCountsFromResults = async (items: SurveyDefinition[]) => {
      const settled = await Promise.allSettled(
        items.map((survey) =>
          apiRequest<AdminResultsResponse>(`/api/admin/results?slug=${encodeURIComponent(survey.slug)}`, { method: "GET" }, token)
            .then((data) => ({
              slug: survey.slug,
              submissions: normalizeSubmissions(data, survey.slug),
            }))
        )
      );

      const counts: Record<string, number> = {};
      const merged: AdminSubmission[] = [];

      for (const result of settled) {
        if (result.status !== "fulfilled") continue;
        counts[result.value.slug] = result.value.submissions.length;
        merged.push(...result.value.submissions);
      }

      return { counts, merged };
    };

    const loadOverviewFallback = async () => {
      try {
        const dashboardData = await apiRequest<DashboardResponse>("/api/dashboard", { method: "GET" }, token);
        const dashboardSurveys = Array.isArray(dashboardData.surveys) ? dashboardData.surveys : [];
        const dashboardSubmissions = normalizeSubmissions(dashboardData.submissions);
        if (dashboardSubmissions.length > 0) {
          const query = q.trim().toLowerCase();
          const filtered = query
            ? dashboardSubmissions.filter((item) => {
                const email = item.user?.email?.toLowerCase() ?? "";
                return (
                  item.surveySlug.toLowerCase().includes(query) ||
                  email.includes(query) ||
                  item.id.toLowerCase().includes(query)
                );
              })
            : dashboardSubmissions;
          const recent = filtered
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 50);
          setSurveys(dashboardSurveys.length > 0 ? dashboardSurveys : localSurveys);
          setSubmissions(recent);
          setCountsBySurveySlug(buildDerivedCounts(dashboardSubmissions));
          setError("");
          setScopeNotice("Showing your own submissions because admin aggregation endpoints are unavailable.");
          return;
        }
      } catch {
        // Continue to broader fallbacks.
      }

      let nextSurveys: SurveyDefinition[] = [];
      try {
        const surveysPayload = await apiRequest<SurveysResponse | SurveyDefinition[]>(
          "/api/surveys",
          { method: "GET" },
          token
        );
        nextSurveys = Array.isArray(surveysPayload)
          ? surveysPayload
          : Array.isArray((surveysPayload as SurveysResponse).surveys)
            ? (surveysPayload as SurveysResponse).surveys!
            : [];
      } catch {
        nextSurveys = localSurveys;
      }

      const settled = await Promise.allSettled(
        nextSurveys.map((survey) =>
          apiRequest<AdminResultsResponse>(`/api/admin/results?slug=${encodeURIComponent(survey.slug)}`, { method: "GET" }, token)
            .then((data) => ({ slug: survey.slug, submissions: normalizeSubmissions(data, survey.slug) }))
        )
      );

      const fulfilledCount = settled.filter((result) => result.status === "fulfilled").length;

      const counts: Record<string, number> = {};
      const merged: AdminSubmission[] = [];

      for (const result of settled) {
        if (result.status !== "fulfilled") continue;
        counts[result.value.slug] = result.value.submissions.length;
        merged.push(...result.value.submissions);
      }

      const query = q.trim().toLowerCase();
      const filtered = query
        ? merged.filter((item) => {
            const email = item.user?.email?.toLowerCase() ?? "";
            return (
              item.surveySlug.toLowerCase().includes(query) ||
              email.includes(query) ||
              item.id.toLowerCase().includes(query)
            );
          })
        : merged;

      const recent = filtered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 50);

      if (fulfilledCount === 0) {
        throw new Error("Unable to load admin submissions with this session. Please log out and log in again.");
      }

      if (recent.length === 0) {
        const submissionsSettled = await Promise.allSettled([
          apiRequest<unknown>("/api/admin/submissions", { method: "GET" }, token),
          apiRequest<unknown>("/api/admin/recent-submissions", { method: "GET" }, token),
        ]);

        const extra = submissionsSettled.flatMap((result) =>
          result.status === "fulfilled" ? normalizeSubmissions(result.value) : []
        );

        if (extra.length > 0) {
          const extraFiltered = query
            ? extra.filter((item) => {
                const email = item.user?.email?.toLowerCase() ?? "";
                return (
                  item.surveySlug.toLowerCase().includes(query) ||
                  email.includes(query) ||
                  item.id.toLowerCase().includes(query)
                );
              })
            : extra;

          const extraRecent = extraFiltered
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 50);

          for (const item of extra) {
            counts[item.surveySlug] = (counts[item.surveySlug] ?? 0) + 1;
          }

          setSurveys(nextSurveys);
          setSubmissions(extraRecent);
          setCountsBySurveySlug(counts);
          setError("");
          return;
        }
      }

      setSurveys(nextSurveys);
      setSubmissions(recent);
      setCountsBySurveySlug(counts);
      setError("");
      if (recent.length > 0) {
        setScopeNotice("Showing fallback aggregated data. Admin overview endpoint is unavailable.");
      }
    };

    apiRequest<AdminOverviewResponse>(`/api/admin/overview?q=${encodeURIComponent(q)}`, { method: "GET" }, token)
      .then(async (data) => {
        const nextSurveys = Array.isArray(data.surveys) ? data.surveys : [];
        const nextSubmissions = normalizeSubmissions(data);
        const nextCounts = data.countsBySurveySlug ?? data.submissionCounts ?? {};

        const hasAnyCount = Object.values(nextCounts).some((value) => Number(value) > 0);
        if ((!hasAnyCount || nextSubmissions.length === 0) && nextSurveys.length > 0) {
          const fallback = await loadCountsFromResults(nextSurveys);
          const fallbackHasCounts = Object.values(fallback.counts).some((value) => Number(value) > 0);
          if (fallbackHasCounts || fallback.merged.length > 0) {
            const mergedCounts = { ...nextCounts };
            for (const [key, value] of Object.entries(fallback.counts)) {
              mergedCounts[key] = Math.max(Number(mergedCounts[key] ?? 0), Number(value ?? 0));
            }
            setSurveys(nextSurveys);
            setSubmissions(
              nextSubmissions.length > 0
                ? nextSubmissions
                : fallback.merged
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 50)
            );
            setCountsBySurveySlug(mergedCounts);
            setScopeNotice("Showing recalculated counts from submission results.");
            return;
          }
        }

        setSurveys(nextSurveys);
        setSubmissions(nextSubmissions);
        setCountsBySurveySlug(nextCounts);
        setScopeNotice("");
      })
      .catch(async () => {
        try {
          await loadOverviewFallback();
        } catch (fallbackErr) {
          const fallbackMessage =
            fallbackErr instanceof Error ? fallbackErr.message : "Unable to load admin overview.";
          setSurveys([]);
          setSubmissions([]);
          setCountsBySurveySlug({});
          setError(fallbackMessage);
        }
      });
  }, [token, q]);

  return (
    <div className="dashboard-grid fade-in">
      <div className="card">
        <div className="flex-between mb-4">
          <h1>Admin Dashboard</h1>
        </div>

        <h3 className="text-secondary text-sm mb-4 font-medium">Export Data</h3>
        <div className="flex gap-3 flex-wrap">
          {surveys.map((survey) => (
            <button
              key={survey.slug}
              className="button hover-scale"
              type="button"
              onClick={() => token && downloadExport(survey.slug, token)}
            >
              <span>Download {survey.title} CSV</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Survey Results</h2>
        <div className="overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Survey</th>
                <th>Submissions</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const derivedCounts = buildDerivedCounts(submissions);
                const countsEntries = Object.entries(countsBySurveySlug);
                return surveys.map((survey) => {
                  const directCount = countsBySurveySlug[survey.slug];
                  const normalizedSurveySlug = normalizeSlug(survey.slug);
                  const normalizedCountFromMap =
                    countsEntries.find(([key]) => normalizeSlug(key) === normalizedSurveySlug)?.[1] ?? 0;
                  const derivedCount = derivedCounts[normalizedSurveySlug] ?? 0;
                  const resolvedCount = Math.max(directCount ?? 0, normalizedCountFromMap, derivedCount);

                  return (
                    <tr key={survey.slug}>
                      <td>
                        <div className="font-bold">{survey.title}</div>
                        <div className="text-secondary text-xs">{survey.description}</div>
                      </td>
                      <td>{resolvedCount}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="flex items-center justify-between" style={{ justifyContent: "flex-end", gap: 12 }}>
                          <Link href={`/admin/results/${survey.slug}`} className="text-primary font-bold hover:underline">
                            View Results
                          </Link>
                          <button
                            type="button"
                            className="text-secondary hover:underline"
                            onClick={() => token && downloadExport(survey.slug, token)}
                          >
                            CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Recent Submissions</h2>
        {scopeNotice ? (
          <p className="notice" style={{ marginBottom: "1rem" }}>
            {scopeNotice}
          </p>
        ) : null}
        {error ? (
          <p className="notice" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
        ) : null}
        {submissions.length === 0 ? (
          <p className="p-4 text-secondary text-center">{q ? `No submissions match "${q}".` : "No submissions yet."}</p>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assessment</th>
                  <th>User</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td>
                      <div className="font-bold">{new Date(submission.createdAt).toLocaleDateString()}</div>
                      <div className="text-secondary text-xs">
                        {new Date(submission.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary text-white bg-opacity-10 text-primary">{submission.surveySlug}</span>
                    </td>
                    <td>{submission.user?.email ?? "Unknown"}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/submissions/${submission.id}`} className="text-primary font-bold hover:underline">
                        View Details ?
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <AdminContent />
    </Suspense>
  );
}
