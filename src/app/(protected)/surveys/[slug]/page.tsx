"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { SurveyForm } from "@/components/surveys/SurveyForm";
import { surveys, type SurveyDefinition } from "@/lib/surveys";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

type LoadState = "idle" | "loading" | "success" | "error";

function SurveyInstructions({ slug }: { slug: string }) {
  if (slug === "peer-evaluation") {
    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Instructions for Completion</p>
        <p style={{ margin: "0 0 6px" }}>Please complete the questionnaire as frankly as you can.</p>
        <p style={{ margin: "0 0 6px" }}>
          Your feedback is crucial for enhancing board effectiveness and corporate governance.
        </p>
        <p style={{ margin: "0 0 12px" }}>Click submit when the questionnaire is fully completed.</p>

        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Evaluation Scale</p>
        <p style={{ margin: "0 0 6px" }}>Please rate on a scale of 1 to 5</p>
        <p style={{ margin: "0 0 4px" }}>5: Exceptional (Always exceeds expectations)</p>
        <p style={{ margin: "0 0 4px" }}>4: Strong (Consistently meets and often exceeds)</p>
        <p style={{ margin: "0 0 4px" }}>3: Competent (Meets expectations)</p>
        <p style={{ margin: "0 0 4px" }}>2: Needs Improvement (Inconsistent)</p>
        <p style={{ margin: 0 }}>1: Unsatisfactory (Fails to meet basic requirements)</p>
      </div>
    );
  }

  if (slug === "board-evaluation") {
    return (
      <div style={{ marginTop: 16 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Instructions for Completion</p>
        <p style={{ margin: "0 0 6px" }}>Please complete the questionnaire as frankly as you can.</p>
        <p style={{ margin: "0 0 6px" }}>
          Your feedback is crucial for enhancing board effectiveness and corporate governance.
        </p>
        <p style={{ margin: "0 0 12px" }}>Click submit when the questionnaire is fully completed.</p>

        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Evaluation Scale</p>
        <p style={{ margin: "0 0 6px" }}>Please rate on a scale of 1 to 5</p>
        <p style={{ margin: "0 0 4px" }}>5: Strongly Agree</p>
        <p style={{ margin: "0 0 4px" }}>4: Agree</p>
        <p style={{ margin: "0 0 4px" }}>3: Neutral</p>
        <p style={{ margin: "0 0 4px" }}>2: Disagree</p>
        <p style={{ margin: 0 }}>1: Strongly Disagree</p>
      </div>
    );
  }

  return null;
}

export default function SurveyPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const fallbackSurvey = useMemo(() => {
    if (!slug) return null;
    const normalized = slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    return surveys.find((item) => item.slug.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === normalized) ?? null;
  }, [slug]);
  const effectiveSurvey = survey ?? fallbackSurvey;

  useEffect(() => {
    if (!token || !slug) return;

    let cancelled = false;
    setState("loading");

    apiRequest<{ survey: SurveyDefinition }>(`/api/surveys/${slug}`, { method: "GET" }, token)
      .then((data) => {
        if (cancelled) return;
        setSurvey(data.survey);
        setState("success");
      })
      .catch(() => {
        if (cancelled) return;
        setSurvey(null);
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token, slug]);

  if (!slug) {
    return (
      <div className="card">
        <h1>Invalid survey link</h1>
        <Link className="button" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="card">
        <h1>Loading...</h1>
        <p>Preparing your session.</p>
      </div>
    );
  }

  if ((state === "idle" || state === "loading") && !effectiveSurvey) {
    return (
      <div className="card">
        <h1>Loading survey...</h1>
        <p>Please wait.</p>
        <Link className="button" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (state === "error" && !effectiveSurvey) {
    return (
      <div className="card">
        <h1>Survey not found</h1>
        <p>The survey link may be wrong, expired, or you may not have access.</p>
        <Link className="button" href="/dashboard">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!effectiveSurvey) {
    return (
      <div className="card">
        <h1>Survey not found</h1>
        <p>The survey link may be wrong, expired, or you may not have access.</p>
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
          <h1 className="survey-template-title">{effectiveSurvey.title}</h1>
          <p className="survey-template-desc">{effectiveSurvey.description}</p>
          <SurveyInstructions slug={effectiveSurvey.slug} />
        </div>
        <Link className="button" href="/dashboard">
          Cancel
        </Link>
      </div>

      <div className="card survey-template-card">
        <div className="survey-template-card-body">
          <SurveyForm survey={effectiveSurvey} />
        </div>
      </div>
    </div>
  );
}
