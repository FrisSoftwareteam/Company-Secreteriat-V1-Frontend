"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { SurveyDefinition } from "@/lib/surveys";
import { useAuth } from "@/components/providers/AuthProvider";

type Submission = {
  id: string;
  surveySlug: string;
  createdAt: string;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { user, token } = useAuth();
  const [surveys, setSurveys] = useState<SurveyDefinition[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!token) return;

    apiRequest<{ surveys: SurveyDefinition[]; submissions: Submission[] }>(`/api/dashboard?q=${encodeURIComponent(q)}`, {
      method: "GET",
    }, token)
      .then((data) => {
        setSurveys(data.surveys);
        setSubmissions(data.submissions);
      })
      .catch(() => {
        setSurveys([]);
        setSubmissions([]);
      });
  }, [token, q]);

  const term = q.trim();

  return (
    <div className="dashboard-grid">
      <div className="section" style={{ marginTop: 0, border: "none" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>Welcome back</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>{user?.email ?? ""}</p>
      </div>

      <div id="available-surveys">
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Available Surveys</h2>
        {term && surveys.length === 0 ? (
          <p className="text-secondary">No surveys match "{q}".</p>
        ) : (
          <div className="survey-grid">
            {surveys.map((survey) => (
              <div key={survey.slug} className="survey-card">
                <h3>{survey.title}</h3>
                <p>{survey.description}</p>
                <Link className="button primary" href={`/surveys/${survey.slug}`}>
                  Start Assessment
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" id="recent-activity">
        <h2 style={{ fontSize: "1.5rem" }}>Recent Activity</h2>
        {submissions.length === 0 ? (
          <p className="notice" style={{ marginTop: "1rem" }}>
            {term ? `No activity matches "${q}".` : "You haven't submitted any assessments yet."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Assessment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                    <td>{submission.surveySlug}</td>
                    <td>
                      <span className="badge" style={{ background: "rgba(180, 149, 47, 0.2)", color: "#7c6111" }}>
                        Completed
                      </span>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
