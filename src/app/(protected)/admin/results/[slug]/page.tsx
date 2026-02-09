"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { SurveyDefinition } from "@/lib/surveys";
import { useAuth } from "@/components/providers/AuthProvider";

type Submission = {
  id: string;
  createdAt: string;
  user?: { email: string } | null;
};

async function downloadExport(slug: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/export/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Export failed");

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

export default function AdminSurveyResultsPage() {
  const params = useParams<{ slug: string }>();
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!token || !params?.slug) return;

    apiRequest<{ survey: SurveyDefinition; submissions: Submission[] }>(
      `/api/admin/results/${params.slug}`,
      { method: "GET" },
      token
    )
      .then((data) => {
        setSurvey(data.survey);
        setSubmissions(data.submissions);
      })
      .catch(() => {
        setSurvey(null);
        setSubmissions([]);
      });
  }, [token, params?.slug]);

  if (!survey) {
    return (
      <div className="card">
        <h1>Survey not found</h1>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h1 style={{ marginBottom: 8 }}>{survey.title}</h1>
            <p className="text-secondary" style={{ margin: 0 }}>
              {survey.description}
            </p>
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            <button className="button" type="button" onClick={() => token && downloadExport(survey.slug, token)}>
              Download CSV
            </button>
            <Link className="button" href="/admin">
              Back to Admin
            </Link>
          </div>
        </div>
        <p className="text-secondary text-sm" style={{ margin: 0 }}>
          Total submissions: {submissions.length}
        </p>
      </div>

      <div className="card">
        {submissions.length === 0 ? (
          <p className="p-4 text-secondary text-center">No submissions yet for this survey.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className="font-bold">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-secondary text-xs">
                        {new Date(submission.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>{submission.user?.email ?? "Unknown"}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="text-primary font-bold hover:underline"
                      >
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
