"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { SurveyDefinition } from "@/lib/surveys";
import { useAuth } from "@/components/providers/AuthProvider";

type AdminSubmission = {
  id: string;
  surveySlug: string;
  createdAt: string;
  user?: { email: string } | null;
};

async function downloadExport(slug: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/export/${slug}`, {
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

  useEffect(() => {
    if (!token) return;

    apiRequest<{
      surveys: SurveyDefinition[];
      submissions: AdminSubmission[];
      countsBySurveySlug: Record<string, number>;
    }>(`/api/admin/overview?q=${encodeURIComponent(q)}`, { method: "GET" }, token)
      .then((data) => {
        setSurveys(data.surveys);
        setSubmissions(data.submissions);
        setCountsBySurveySlug(data.countsBySurveySlug);
      })
      .catch(() => {
        setSurveys([]);
        setSubmissions([]);
        setCountsBySurveySlug({});
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
              {surveys.map((survey) => (
                <tr key={survey.slug}>
                  <td>
                    <div className="font-bold">{survey.title}</div>
                    <div className="text-secondary text-xs">{survey.description}</div>
                  </td>
                  <td>{countsBySurveySlug[survey.slug] ?? 0}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Recent Submissions</h2>
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
