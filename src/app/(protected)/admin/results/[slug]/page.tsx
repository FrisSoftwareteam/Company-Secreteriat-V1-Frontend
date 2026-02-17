"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { QuestionType, SurveyDefinition } from "@/lib/surveys";
import { useAuth } from "@/components/providers/AuthProvider";

type Submission = {
  id: string;
  createdAt: string;
  user?: { email: string } | null;
  data?: { answers?: Record<string, string | string[] | null> } & Record<string, unknown>;
};

type SectionAverage = {
  sectionTitle: string;
  percentage: number;
  responses: number;
};

type DistributionSlice = {
  label: string;
  count: number;
  color: string;
};

const SCORE_BY_LIKERT_LABEL: Record<string, number> = {
  "strongly agree": 5,
  agree: 4,
  neutral: 3,
  disagree: 2,
  "strongly disagree": 1,
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

function isScoreableQuestion(type: QuestionType) {
  return type === "likert_agree" || type === "rating_5";
}

function getQuestionScore(type: QuestionType, value: string | string[] | null | undefined) {
  if (Array.isArray(value) || value == null) return null;

  if (type === "rating_5") {
    const parsed = Number(value);
    if (parsed >= 1 && parsed <= 5) return parsed;
    return null;
  }

  if (type === "likert_agree") {
    const key = value.trim().toLowerCase();
    return SCORE_BY_LIKERT_LABEL[key] ?? null;
  }

  return null;
}

function getPerformanceBand(percentage: number) {
  if (percentage >= 80) return "Excellent";
  if (percentage >= 60) return "Good";
  if (percentage >= 40) return "Fair";
  return "Poor";
}

function getOverallPercentageMeta(survey: SurveyDefinition) {
  const allQuestionKeys = new Set(
    survey.sections.flatMap((section) => section.questions.map((question) => question.key))
  );
  const isBoard =
    survey.slug === "board-evaluation" ||
    allQuestionKeys.has("board_composition_diverse_mix") ||
    allQuestionKeys.has("vision_strategy") ||
    allQuestionKeys.has("compliance_legal");
  const isPeer = survey.slug === "peer-evaluation";

  if (isBoard) return { key: "overall_percentage_a", label: "Overall Percentage A" };
  if (isPeer) return { key: "overall_percentage_b", label: "Overall Percentage B" };
  return { key: "overall_percentage", label: "Overall Percentage" };
}

function getAnswerMap(data?: { answers?: Record<string, string | string[] | null> } & Record<string, unknown>) {
  if (!data) return {};
  if (data.answers && typeof data.answers === "object" && !Array.isArray(data.answers)) {
    return data.answers;
  }
  return Object.entries(data).reduce<Record<string, string | string[] | null>>((acc, [key, value]) => {
    if (key === "answers") return acc;
    if (typeof value === "string" || value === null) {
      acc[key] = value;
    } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      acc[key] = value as string[];
    }
    return acc;
  }, {});
}

function analyzeSubmissions(survey: SurveyDefinition, submissions: Submission[]) {
  const overallMeta = getOverallPercentageMeta(survey);
  const sectionAcc: Record<string, { sum: number; count: number }> = {};
  const bandAcc: Record<string, number> = {
    Excellent: 0,
    Good: 0,
    Fair: 0,
    Poor: 0,
  };

  let scoredSubmissionCount = 0;
  let totalSubmissionPercentage = 0;

  for (const section of survey.sections) {
    sectionAcc[section.title] = { sum: 0, count: 0 };
  }

  for (const submission of submissions) {
    const answers = getAnswerMap(submission.data);
    const storedOverallRaw = answers[overallMeta.key];
    const storedOverall =
      typeof storedOverallRaw === "string" && storedOverallRaw.trim() !== ""
        ? Number(storedOverallRaw)
        : Number.NaN;
    let submissionSum = 0;
    let submissionCount = 0;

    for (const section of survey.sections) {
      for (const question of section.questions) {
        if (!isScoreableQuestion(question.type)) continue;
        const score = getQuestionScore(question.type, answers[question.key]);
        if (score == null) continue;

        submissionSum += score;
        submissionCount += 1;
        sectionAcc[section.title].sum += score;
        sectionAcc[section.title].count += 1;
      }
    }

    if (Number.isFinite(storedOverall)) {
      scoredSubmissionCount += 1;
      totalSubmissionPercentage += storedOverall;
      bandAcc[getPerformanceBand(storedOverall)] += 1;
    } else if (submissionCount > 0) {
      scoredSubmissionCount += 1;
      const percentage = (submissionSum / (submissionCount * 5)) * 100;
      totalSubmissionPercentage += percentage;
      bandAcc[getPerformanceBand(percentage)] += 1;
    }
  }

  const sectionAverages: SectionAverage[] = survey.sections
    .map((section) => {
      const metrics = sectionAcc[section.title];
      const percentage = metrics.count > 0 ? (metrics.sum / (metrics.count * 5)) * 100 : 0;
      return {
        sectionTitle: section.title,
        percentage,
        responses: metrics.count,
      };
    })
    .filter((item) => item.responses > 0);

  const distribution: DistributionSlice[] = [
    { label: "Excellent", count: bandAcc.Excellent, color: "#1f9d55" },
    { label: "Good", count: bandAcc.Good, color: "#2f7ed8" },
    { label: "Fair", count: bandAcc.Fair, color: "#d9a441" },
    { label: "Poor", count: bandAcc.Poor, color: "#d64545" },
  ];

  const overallAveragePercentage =
    scoredSubmissionCount > 0 ? totalSubmissionPercentage / scoredSubmissionCount : 0;

  return {
    sectionAverages,
    distribution,
    overallAveragePercentage,
    scoredSubmissionCount,
    overallLabel: overallMeta.label,
  };
}

function PieChart({ data }: { data: DistributionSlice[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentOffset = 0;

  return (
    <div className="analysis-chart-wrap">
      <svg viewBox="0 0 42 42" className="analysis-pie" role="img" aria-label="Submission performance distribution">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e6edf7" strokeWidth="8" />
        {data.map((slice) => {
          if (!total || slice.count === 0) return null;
          const pct = (slice.count / total) * 100;
          const segment = (
            <circle
              key={slice.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="8"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-currentOffset}
              transform="rotate(-90 21 21)"
            />
          );
          currentOffset += pct;
          return segment;
        })}
      </svg>
      <div className="analysis-legend">
        {data.map((slice) => (
          <div key={slice.label} className="analysis-legend-row">
            <span className="analysis-dot" style={{ background: slice.color }} />
            <span>{slice.label}</span>
            <strong>{slice.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: SectionAverage[] }) {
  return (
    <div className="analysis-bars">
      {data.map((item) => (
        <div key={item.sectionTitle} className="analysis-bar-row">
          <div className="analysis-bar-label">{item.sectionTitle}</div>
          <div className="analysis-bar-track">
            <div className="analysis-bar-fill" style={{ width: `${Math.max(0, Math.min(100, item.percentage))}%` }} />
          </div>
          <div className="analysis-bar-value">{item.percentage.toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

export default function AdminSurveyResultsPage() {
  const params = useParams<{ slug: string }>();
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!token || !params?.slug) return;

    apiRequest<{ survey: SurveyDefinition; submissions: Submission[] }>(
      `/api/admin/results?slug=${encodeURIComponent(params.slug)}`,
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

  const analysis = useMemo(() => {
    if (!survey) return null;
    return analyzeSubmissions(survey, submissions);
  }, [survey, submissions]);

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
        <h2 style={{ marginBottom: 12 }}>Results Analysis</h2>
        {!analysis || analysis.scoredSubmissionCount === 0 ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            No scoreable responses available yet for chart analysis.
          </p>
        ) : (
          <div className="analysis-grid">
            <div className="analysis-panel">
              <h3>Overall Distribution</h3>
              <p className="text-secondary text-sm">
                Based on {analysis.scoredSubmissionCount} scored submission(s).
              </p>
              <PieChart data={analysis.distribution} />
            </div>
            <div className="analysis-panel">
              <h3>Section Average Scores</h3>
              <p className="text-secondary text-sm">
                {analysis.overallLabel} mean score: {analysis.overallAveragePercentage.toFixed(1)}%
              </p>
              <BarChart data={analysis.sectionAverages} />
            </div>
          </div>
        )}
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
