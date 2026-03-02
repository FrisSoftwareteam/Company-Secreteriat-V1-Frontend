"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { QuestionType, SurveyDefinition } from "@/lib/surveys";

type SubmissionPayload = {
  id: string;
  createdAt: string;
  data?: { answers?: Record<string, string | string[] | null> } & Record<string, unknown>;
};

type ResultsResponse = {
  survey: SurveyDefinition;
  submissions: SubmissionPayload[];
};

const BOARD_SURVEY_SLUG = "board-evaluation";

type QuestionMetric = {
  key: string;
  questionNumber: number;
  label: string;
  type: QuestionType;
  sectionTitle: string;
  percentage: number;
  answeredCount: number;
  topChoice: string;
  topChoiceCount: number;
};

const SCORE_BY_LIKERT_LABEL: Record<string, number> = {
  "strongly agree": 5,
  agree: 4,
  neutral: 3,
  disagree: 2,
  "strongly disagree": 1,
};

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

export default function QuestionaireGraphicalAnalysisPage() {
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionPayload[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    apiRequest<ResultsResponse>(`/api/admin/results?slug=${encodeURIComponent(BOARD_SURVEY_SLUG)}`, { method: "GET" }, token)
      .then((data) => {
        setSurvey(data.survey);
        const nextSubmissions = Array.isArray(data.submissions) ? data.submissions : [];
        setSubmissions(nextSubmissions);
        setSubmissionCount(nextSubmissions.length);
        setError("");
      })
      .catch((err) => {
        setSurvey(null);
        setSubmissions([]);
        setSubmissionCount(0);
        setError(err instanceof Error ? err.message : "Unable to load board evaluation analysis.");
      });
  }, [token]);

  const analysis = useMemo(() => {
    if (!survey) return null;

    const metricsBySection: Record<string, QuestionMetric[]> = {};
    let scoreableCount = 0;
    let overallScoreSum = 0;
    let overallScoreCount = 0;
    let runningQuestionNumber = 0;

    for (const section of survey.sections) {
      metricsBySection[section.title] = [];

      for (const question of section.questions) {
        runningQuestionNumber += 1;
        let scoreSum = 0;
        let answeredCount = 0;
        const choiceCounter: Record<string, number> = {};

        for (const submission of submissions) {
          const answers = getAnswerMap(submission.data);
          const value = answers[question.key];

          const addChoice = (raw: string) => {
            const choice = raw.trim();
            if (!choice) return;
            choiceCounter[choice] = (choiceCounter[choice] ?? 0) + 1;
          };

          if (typeof value === "string") {
            addChoice(value);
          } else if (Array.isArray(value)) {
            value.forEach((item) => addChoice(String(item)));
          }

          if (isScoreableQuestion(question.type)) {
            const score = getQuestionScore(question.type, value);
            if (score == null) continue;
            scoreSum += score;
            answeredCount += 1;
          } else {
            const hasValue = Array.isArray(value)
              ? value.length > 0
              : typeof value === "string"
                ? value.trim() !== ""
                : value != null;
            if (hasValue) {
              answeredCount += 1;
            }
          }
        }

        const percentage = isScoreableQuestion(question.type)
          ? answeredCount > 0
            ? (scoreSum / (answeredCount * 5)) * 100
            : 0
          : submissionCount > 0
            ? (answeredCount / submissionCount) * 100
            : 0;

        if (isScoreableQuestion(question.type)) {
          scoreableCount += 1;
          if (answeredCount > 0) {
            overallScoreSum += scoreSum;
            overallScoreCount += answeredCount;
          }
        }

        const topChoiceEntry = Object.entries(choiceCounter).sort((a, b) => b[1] - a[1])[0];

        metricsBySection[section.title].push({
          key: question.key,
          questionNumber: question.displayNumber ?? runningQuestionNumber,
          label: question.label,
          type: question.type,
          sectionTitle: section.title,
          percentage,
          answeredCount,
          topChoice: topChoiceEntry?.[0] ?? "No response",
          topChoiceCount: topChoiceEntry?.[1] ?? 0,
        });
      }
    }

    const overallPercentageA = overallScoreCount > 0 ? (overallScoreSum / (overallScoreCount * 5)) * 100 : 0;

    return {
      metricsBySection,
      scoreableCount,
      overallPercentageA,
      totalQuestions: survey.sections.reduce((sum, section) => sum + section.questions.length, 0),
    };
  }, [survey, submissions, submissionCount]);

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h1 style={{ marginBottom: 8 }}>Questionaire Graphical Analysis</h1>
            <p className="text-secondary" style={{ margin: 0 }}>
              Board Evaluation questionnaire analysis across all submitted responses.
            </p>
          </div>
          <Link className="button" href="/admin">
            Back to Admin
          </Link>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div
            style={{
              background: "var(--accent)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              minWidth: 210,
            }}
          >
            <p className="text-secondary text-xs" style={{ margin: 0 }}>Questionaire</p>
            <p className="font-bold text-sm" style={{ margin: "6px 0 0" }}>
              {survey?.title ?? "Board Evaluation Questionnaire"}
            </p>
          </div>
          <div
            style={{
              background: "var(--accent)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              minWidth: 190,
            }}
          >
            <p className="text-secondary text-xs" style={{ margin: 0 }}>Total Submissions</p>
            <p className="font-bold" style={{ margin: "6px 0 0", fontSize: 22 }}>
              {submissionCount}
            </p>
          </div>
          <div
            style={{
              background: "var(--accent)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              minWidth: 190,
            }}
          >
            <p className="text-secondary text-xs" style={{ margin: 0 }}>Overall Percentage A</p>
            <p className="font-bold" style={{ margin: "6px 0 0", fontSize: 22 }}>
              {analysis ? `${analysis.overallPercentageA.toFixed(1)}%` : "0.0%"}
            </p>
          </div>
          <div
            style={{
              background: "var(--accent)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              minWidth: 190,
            }}
          >
            <p className="text-secondary text-xs" style={{ margin: 0 }}>Questions Analyzed</p>
            <p className="font-bold" style={{ margin: "6px 0 0", fontSize: 22 }}>
              {analysis?.totalQuestions ?? 0}
            </p>
          </div>
        </div>
        {error ? (
          <p className="notice" style={{ marginTop: "1rem", marginBottom: 0 }}>
            {error}
          </p>
        ) : null}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Board Evaluation Graph (All Questions)</h2>
        {!survey || !analysis ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            No Board Evaluation analysis data available yet.
          </p>
        ) : (
          <div className="dashboard-grid">
            {survey.sections.map((section) => {
              const metrics = analysis.metricsBySection[section.title] ?? [];
              return (
                <div key={section.title} className="analysis-panel">
                  <h3>{section.title}</h3>
                  {section.description ? (
                    <p className="text-secondary text-sm">{section.description}</p>
                  ) : null}
                  <div className="analysis-bars">
                    {metrics.map((metric) => (
                      <div key={metric.key} className="analysis-bar-row">
                        <div className="analysis-bar-label" title={metric.label}>
                          {metric.questionNumber}. {metric.label}
                          <div className="text-xs text-secondary" style={{ marginTop: 4 }}>
                            Most picked: <strong>{metric.topChoice}</strong> ({metric.topChoiceCount})
                          </div>
                        </div>
                        <div className="analysis-bar-track">
                          <div className="analysis-bar-fill" style={{ width: `${Math.max(0, Math.min(100, metric.percentage))}%` }} />
                        </div>
                        <div className="analysis-bar-value">{metric.percentage.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-secondary text-xs" style={{ marginTop: 12, marginBottom: 0 }}>
                    Score-based questions show average score %. Text questions show response rate %. Most picked option is shown for every question.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
