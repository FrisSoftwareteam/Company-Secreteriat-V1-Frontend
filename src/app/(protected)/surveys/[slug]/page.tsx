"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SurveyForm } from "@/components/surveys/SurveyForm";
import { SurveyDefinition } from "@/lib/surveys";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SurveyPage() {
  const params = useParams<{ slug: string }>();
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);

  useEffect(() => {
    if (!token || !params?.slug) return;

    apiRequest<{ survey: SurveyDefinition }>(`/api/surveys/${params.slug}`, { method: "GET" }, token)
      .then((data) => setSurvey(data.survey))
      .catch(() => setSurvey(null));
  }, [token, params?.slug]);

  if (!survey) {
    return (
      <div className="card">
        <h1>Survey not found</h1>
        <Link className="button" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="survey-template-page">
      <div className="survey-template-header">
        <div>
          <h1 className="survey-template-title">{survey.title}</h1>
          <p className="survey-template-desc">{survey.description}</p>
        </div>
        <Link className="button" href="/dashboard">
          Cancel
        </Link>
      </div>

      <div className="card survey-template-card">
        <div className="survey-template-card-body">
          <SurveyForm survey={survey} />
        </div>
      </div>
    </div>
  );
}
