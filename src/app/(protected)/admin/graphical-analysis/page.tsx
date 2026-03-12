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
  sectionTitle: string;
  topDirector: string;
  topScore: number;
  rows: Array<{ director: string; percentage: number; count: number }>;
};

const PEER_SURVEY_SLUG = "peer-evaluation";
const DIRECTOR_FIELD_KEY = "director_being_evaluated";
const TOP_DIRECTORS_LIMIT = 11;

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

function normalizeDirectorName(value: string) {
  return value.trim().toLowerCase().replace(/\./g, "");
}

export default function GraphicalAnalysisPage() {
  const { token } = useAuth();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const [directorFilter, setDirectorFilter] = useState("");
  const [questionFilter, setQuestionFilter] = useState("");
  const [showOnlyActiveDirectors, setShowOnlyActiveDirectors] = useState(true);
  const [displayLimit, setDisplayLimit] = useState<"11" | "all">("11");

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
        .map((question) => ({ key: question.key, label: question.label, type: question.type, sectionTitle: section.title }))
    );
    const directorQuestion = survey.sections
      .flatMap((section) => section.questions)
      .find((question) => question.key === DIRECTOR_FIELD_KEY);
    const directorOptions = (directorQuestion?.options ?? []).filter((option) => option.trim() !== "");
    const canonicalDirectorNameByKey: Record<string, string> = {};

    for (const option of directorOptions) {
      const key = normalizeDirectorName(option);
      if (!canonicalDirectorNameByKey[key]) {
        canonicalDirectorNameByKey[key] = option.trim();
      }
    }

    const directorMap: Record<
      string,
      { totalScore: number; totalCount: number; questionScores: Record<string, { sum: number; count: number }> }
    > = {};

    for (const option of directorOptions) {
      const canonical = canonicalDirectorNameByKey[normalizeDirectorName(option)] ?? option.trim();
      if (!directorMap[canonical]) {
        directorMap[canonical] = {
          totalScore: 0,
          totalCount: 0,
          questionScores: {},
        };
      }
    }

    for (const submission of submissions) {
      const answers = getAnswerMap(submission.data);
      const directorRaw = answers[DIRECTOR_FIELD_KEY];
      const rawName =
        typeof directorRaw === "string" && directorRaw.trim()
          ? directorRaw.trim()
          : "Unknown Director";
      const normalizedName = normalizeDirectorName(rawName);
      const directorName = canonicalDirectorNameByKey[normalizedName] ?? rawName;

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

    const rankedDirectors: DirectorSummary[] = Object.entries(directorMap)
      .map(([name, entry]) => ({
        name,
        overallPercentage: entry.totalCount > 0 ? toPercentage(entry.totalScore / entry.totalCount) : 0,
        totalResponses: entry.totalCount,
        questionScores: entry.questionScores,
      }))
      .sort((a, b) => b.overallPercentage - a.overallPercentage)
      .slice(0, TOP_DIRECTORS_LIMIT);

    const questionRankings: QuestionRanking[] = scoreableQuestions
      .map((question) => {
        const rows = rankedDirectors
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
          .sort((a, b) => b.percentage - a.percentage);
        const topRow = rows[0];

        return {
          key: question.key,
          label: question.label,
          sectionTitle: question.sectionTitle,
          topDirector: topRow?.director ?? "N/A",
          topScore: topRow?.percentage ?? 0,
          rows,
        };
      })
      .filter((question) => question.rows.length > 0);

    const bestDirector = rankedDirectors[0] ?? null;
    const lowestDirector = rankedDirectors[rankedDirectors.length - 1] ?? null;

    return {
      rankedDirectors,
      questionRankings,
      scoreableQuestionsCount: scoreableQuestions.length,
      activeDirectorsCount: rankedDirectors.filter((director) => director.totalResponses > 0).length,
      averageOverallScore:
        rankedDirectors.length > 0
          ? rankedDirectors.reduce((sum, director) => sum + director.overallPercentage, 0) / rankedDirectors.length
          : 0,
      bestDirector,
      lowestDirector,
    };
  }, [survey, submissions]);

  const filteredDirectorsBase = useMemo(() => {
    if (!analysis) return [];
    const query = directorFilter.trim().toLowerCase();
    const byActive = showOnlyActiveDirectors
      ? analysis.rankedDirectors.filter((director) => director.totalResponses > 0)
      : analysis.rankedDirectors;
    if (!query) return byActive;
    return byActive.filter((director) => director.name.toLowerCase().includes(query));
  }, [analysis, directorFilter, showOnlyActiveDirectors]);

  const filteredDirectors = useMemo(() => {
    if (displayLimit === "all") return filteredDirectorsBase;
    return filteredDirectorsBase.slice(0, 11);
  }, [filteredDirectorsBase, displayLimit]);

  const filteredQuestionRankings = useMemo(() => {
    if (!analysis) return [];
    const query = questionFilter.trim().toLowerCase();
    const questionRows = analysis.questionRankings.map((question) => ({
      ...question,
      rows: displayLimit === "all" ? question.rows : question.rows.slice(0, 11),
    }));
    if (!query) return questionRows;
    return questionRows.filter((question) => question.label.toLowerCase().includes(query));
  }, [analysis, questionFilter, displayLimit]);

  const groupedQuestionRankings = useMemo(() => {
    return filteredQuestionRankings.reduce<Record<string, QuestionRanking[]>>((acc, question) => {
      if (!acc[question.sectionTitle]) acc[question.sectionTitle] = [];
      acc[question.sectionTitle].push(question);
      return acc;
    }, {});
  }, [filteredQuestionRankings]);

  return (
    <div className="dashboard-grid">
      <div className="card peer-hero">
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
        <div className="peer-stats">
          <div className="peer-stat-card">
            <span className="peer-stat-label">Survey</span>
            <strong className="peer-stat-value">{survey?.title ?? "Peer Evaluation"}</strong>
          </div>
          <div className="peer-stat-card">
            <span className="peer-stat-label">Submissions</span>
            <strong className="peer-stat-value">{submissions.length}</strong>
          </div>
          <div className="peer-stat-card">
            <span className="peer-stat-label">Directors With Responses</span>
            <strong className="peer-stat-value">{analysis?.activeDirectorsCount ?? 0}</strong>
          </div>
          <div className="peer-stat-card">
            <span className="peer-stat-label">Average Overall Score</span>
            <strong className="peer-stat-value">
              {analysis ? `${analysis.averageOverallScore.toFixed(1)}%` : "0.0%"}
            </strong>
          </div>
          <div className="peer-stat-card">
            <span className="peer-stat-label">Highest Director</span>
            <strong className="peer-stat-value">
              {analysis?.bestDirector ? `${analysis.bestDirector.name} (${analysis.bestDirector.overallPercentage.toFixed(1)}%)` : "N/A"}
            </strong>
          </div>
          <div className="peer-stat-card">
            <span className="peer-stat-label">Lowest Director</span>
            <strong className="peer-stat-value">
              {analysis?.lowestDirector ? `${analysis.lowestDirector.name} (${analysis.lowestDirector.overallPercentage.toFixed(1)}%)` : "N/A"}
            </strong>
          </div>
        </div>
        {error ? <p className="notice" style={{ marginTop: "1rem", marginBottom: 0 }}>{error}</p> : null}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Top 11 Directors (Overall)</h2>
        <div className="peer-controls peer-controls-row">
          <input
            type="text"
            placeholder="Filter directors..."
            value={directorFilter}
            onChange={(event) => setDirectorFilter(event.target.value)}
          />
          <label className="peer-toggle">
            <input
              type="checkbox"
              checked={showOnlyActiveDirectors}
              onChange={(event) => setShowOnlyActiveDirectors(event.target.checked)}
            />
            Show only directors with responses
          </label>
          <select value={displayLimit} onChange={(event) => setDisplayLimit(event.target.value as "11" | "all")}>
            <option value="11">Show Top 11</option>
            <option value="all">Show All</option>
          </select>
        </div>
        {!analysis || filteredDirectors.length === 0 ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            {error || "No directors match the current filter."}
          </p>
        ) : (
          <div className="analysis-bars">
            {filteredDirectors.map((director, index) => (
              <div key={director.name} className="analysis-bar-row">
                <div className="analysis-bar-label peer-bar-label" title={director.name}>
                  <span className="peer-rank-badge">{index + 1}</span>
                  <span>{director.name}</span>
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
        <h2 style={{ marginBottom: 12 }}>Question-by-Question Top 11 Directors</h2>
        <div className="peer-controls peer-controls-row">
          <input
            type="text"
            placeholder="Filter questions..."
            value={questionFilter}
            onChange={(event) => setQuestionFilter(event.target.value)}
          />
        </div>
        {!analysis || filteredQuestionRankings.length === 0 ? (
          <p className="text-secondary" style={{ margin: 0 }}>
            {error || "No questions match the current filter."}
          </p>
        ) : (
          <div className="dashboard-grid">
            {Object.entries(groupedQuestionRankings).map(([sectionTitle, questions]) => (
              <div key={sectionTitle} className="analysis-panel">
                <h3 style={{ marginBottom: 10 }}>{sectionTitle}</h3>
                <div className="dashboard-grid" style={{ gap: 12 }}>
                  {questions.map((question, index) => (
                    <div key={question.key} className="peer-question-card">
                      <h3 style={{ marginBottom: 8 }}>
                        Q{index + 1}. {question.label}
                      </h3>
                      <p className="text-secondary text-sm" style={{ marginTop: 0 }}>
                        Top performer: <strong>{question.topDirector}</strong> ({question.topScore.toFixed(1)}%)
                      </p>
                      <div className="analysis-bars">
                        {question.rows.map((row, rowIndex) => (
                          <div key={`${question.key}-${row.director}`} className="analysis-bar-row">
                            <div className="analysis-bar-label peer-bar-label" title={row.director}>
                              <span className="peer-rank-badge">{rowIndex + 1}</span>
                              <span>{row.director}</span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
