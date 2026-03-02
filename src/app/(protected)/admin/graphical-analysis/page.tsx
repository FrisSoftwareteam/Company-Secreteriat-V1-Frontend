"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { QuestionType, SurveyDefinition } from "@/lib/surveys";

type Submission = {
  id: string;
  data?: { answers?: Record<string, string | string[] | null> } & Record<string, unknown>;
};

type DirectorSummary = {
  name: string;
  overallPercentage: number;
  totalResponses: number;
  questionScores: Record<string, { sum: number; count: number }>;
};

type QuestionRanking = {
  key: string;
  label: string;
  rows: Array<{ director: string; percentage: number; count: number }>;
};

const PEER_SURVEY_SLUG = "peer-evaluation";
const DIRECTOR_FIELD_KEY = "director_being_evaluated";

const SCORE_BY_LIKERT_LABEL: Record<string, number> = {
  "strongly agree": 5,
  agree: 4,
  neutral: 3,
  disagree: 2,
  "strongly disagree": 1,
};

function isScoreableQuestion(type: QuestionType) {
  return type === "rating_5" || type === "likert_agree";
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

function toPercentage(score: number) {
  return (score / 5) * 100;
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

export default function GraphicalAnalysisPage() {
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setError("");

    apiRequest<{ survey: SurveyDefinition; submissions: Submission[] }>(
      `/api/admin/results?slug=${encodeURIComponent(PEER_SURVEY_SLUG)}`,
      { method: "GET" },
      token
    )
      .then((data) => {
        setSurvey(data.survey);
        setSubmissions(data.submissions ?? []);
      })
      .catch((err) => {
        setSurvey(null);
        setSubmissions([]);
        setError(err instanceof Error ? err.message : "Unable to load peer evaluation data.");
      });
  }, [token]);

  const analysis = useMemo(() => {
    if (!survey) return null;

    const scoreableQuestions = survey.sections.flatMap((section) =>
      section.questions
        .filter((question) => isScoreableQuestion(question.type))
        .map((question) => ({ key: question.key, label: question.label, type: question.type }))
    );

    const directorMap: Record<
      string,
      { totalScore: number; totalCount: number; questionScores: Record<string, { sum: number; count: number }> }
    > = {};

    for (const submission of submissions) {
      const answers = getAnswerMap(submission.data);
      const directorRaw = answers[DIRECTOR_FIELD_KEY];
      const directorName =
        typeof directorRaw === "string" && directorRaw.trim()
          ? directorRaw.trim()
          : "Unknown Director";

      if (!directorMap[directorName]) {
        directorMap[directorName] = {
          totalScore: 0,
          totalCount: 0,
          questionScores: {},
        };
      }

      for (const question of scoreableQuestions) {
        const score = getQuestionScore(question.type, answers[question.key]);
        if (score == null) continue;

        directorMap[directorName].totalScore += score;
        directorMap[directorName].totalCount += 1;
        if (!directorMap[directorName].questionScores[question.key]) {
          directorMap[directorName].questionScores[question.key] = { sum: 0, count: 0 };
        }
        directorMap[directorName].questionScores[question.key].sum += score;
        directorMap[directorName].questionScores[question.key].count += 1;
      }
    }

    const topDirectors: DirectorSummary[] = Object.entries(directorMap)
      .filter(([, entry]) => entry.totalCount > 0)
      .map(([name, entry]) => ({
        name,
        overallPercentage: toPercentage(entry.totalScore / entry.totalCount),
        totalResponses: entry.totalCount,
        questionScores: entry.questionScores,
      }))
      .sort((a, b) => b.overallPercentage - a.overallPercentage)
      .slice(0, 5);

    const questionRankings: QuestionRanking[] = scoreableQuestions
      .map((question) => {
        const rows = topDirectors
          .map((director) => {
            const questionScore = director.questionScores[question.key];
            const percentage =
              questionScore && questionScore.count > 0
                ? toPercentage(questionScore.sum / questionScore.count)
                : 0;
            return {
              director: director.name,
              percentage,
              count: questionScore?.count ?? 0,
            };
          })
          .filter((row) => row.count > 0)
          .sort((a, b) => b.percentage - a.percentage);

        return {
          key: question.key,
          label: question.label,
          rows,
        };
      })
      .filter((question) => question.rows.length > 0);

    return {
      topDirectors,
      questionRankings,
      scoreableQuestionsCount: scoreableQuestions.length,
    };
  }, [survey, submissions]);

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="flex-between mb-4">
          <div>
            <h1 style={{ marginBottom: 8 }}>Peer to Peer Graphical Analysis</h1>
            <p className="text-secondary" style={{ margin: 0 }}>
              Peer-to-peer director analysis based on all scoreable questions.
            </p>
          </div>
          <Link className="button" href="/admin">
            Back to Admin
          </Link>
        </div>
        {survey ? (
          <p className="text-secondary text-sm" style={{ margin: 0 }}>
            Survey: {survey.title} | Submissions loaded: {submissions.length}
          </p>
        ) : null}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Top 5 Directors (Overall)</h2>
        {!analysis || analysis.topDirectors.length === 0 ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            {error || "No scoreable peer evaluation responses available yet."}
          </p>
        ) : (
          <div className="analysis-bars">
            {analysis.topDirectors.map((director) => (
              <div key={director.name} className="analysis-bar-row">
                <div className="analysis-bar-label" title={director.name}>
                  {director.name}
                </div>
                <div className="analysis-bar-track">
                  <div className="analysis-bar-fill" style={{ width: `${director.overallPercentage}%` }} />
                </div>
                <div className="analysis-bar-value">{director.overallPercentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Question-by-Question Top 5</h2>
        {!analysis || analysis.questionRankings.length === 0 ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            {error || "No per-question data available for the current submissions."}
          </p>
        ) : (
          <div className="dashboard-grid">
            {analysis.questionRankings.map((question, index) => (
              <div key={question.key} className="analysis-panel">
                <h3 style={{ marginBottom: 8 }}>
                  Q{index + 1}. {question.label}
                </h3>
                <p className="text-secondary text-sm">
                  Ranked within top 5 directors using all {analysis.scoreableQuestionsCount} scoreable questions.
                </p>
                <div className="analysis-bars">
                  {question.rows.map((row) => (
                    <div key={`${question.key}-${row.director}`} className="analysis-bar-row">
                      <div className="analysis-bar-label" title={row.director}>
                        {row.director}
                      </div>
                      <div className="analysis-bar-track">
                        <div className="analysis-bar-fill" style={{ width: `${row.percentage}%` }} />
                      </div>
                      <div className="analysis-bar-value">{row.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
