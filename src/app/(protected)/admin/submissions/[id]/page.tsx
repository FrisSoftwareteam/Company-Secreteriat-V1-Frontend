"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { SubmissionDetail } from "@/components/surveys/SubmissionDetail";
import { SurveyDefinition } from "@/lib/surveys";
import { useAuth } from "@/components/providers/AuthProvider";

type Submission = {
  id: string;
  createdAt: string;
  user?: { email: string } | null;
  data: { answers?: Record<string, string | string[] | null> };
};

export default function SubmissionPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (!token || !params?.id) return;

    apiRequest<{ survey: SurveyDefinition; submission: Submission }>(
      `/api/admin/submissions/${params.id}`,
      { method: "GET" },
      token
    )
      .then((data) => {
        setSurvey(data.survey);
        setSubmission(data.submission);
      })
      .catch(() => {
        setSurvey(null);
        setSubmission(null);
      });
  }, [token, params?.id]);

  if (!submission || !survey) {
    return (
      <div className="card">
        <h1>Submission not found</h1>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="form-grid">
      <div className="card">
        <h1>{survey.title}</h1>
        <p>Submitted by: {submission.user?.email ?? "Unknown"}</p>
        <p>Submitted at: {new Date(submission.createdAt).toLocaleString()}</p>
        <Link className="button" href="/admin">
          Back to Admin
        </Link>
      </div>
      <div className="card">
        <SubmissionDetail survey={survey} data={submission.data} />
      </div>
    </div>
  );
}
