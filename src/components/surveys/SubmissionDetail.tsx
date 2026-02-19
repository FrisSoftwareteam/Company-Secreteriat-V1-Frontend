import { SurveyDefinition } from "@/lib/surveys";

type SubmissionData = {
  answers?: Record<string, string | string[] | null>;
} & Record<string, unknown>;

export function SubmissionDetail({
  survey,
  data,
}: {
  survey: SurveyDefinition;
  data: SubmissionData;
}) {
  const nestedAnswers =
    data.answers && typeof data.answers === "object" && !Array.isArray(data.answers)
      ? data.answers
      : null;
  const flatAnswers = Object.entries(data).reduce<Record<string, string | string[] | null>>(
    (acc, [key, value]) => {
      if (key === "answers") return acc;
      if (typeof value === "string" || value === null) {
        acc[key] = value;
      } else if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
        acc[key] = value as string[];
      }
      return acc;
    },
    {}
  );
  const answers = nestedAnswers ?? flatAnswers;
  const isPeer = survey.slug === "peer-evaluation";
  const isBoard = survey.slug === "board-evaluation";
  const overallLabel = isPeer
    ? "Overall Percentage B"
    : isBoard
      ? "Overall Percentage A"
      : "Overall Percentage";
  const overallKey = isPeer
    ? "overall_percentage_b"
    : isBoard
      ? "overall_percentage_a"
      : "overall_percentage";

  const toScore = (type: string, value: string | string[] | null | undefined) => {
    if (Array.isArray(value) || value == null) return null;
    if (type === "rating_5") {
      const n = Number(value);
      return n >= 1 && n <= 5 ? n : null;
    }
    if (type === "likert_agree") {
      const normalized = value.trim().toLowerCase();
      const map: Record<string, number> = {
        "strongly agree": 5,
        agree: 4,
        neutral: 3,
        disagree: 2,
        "strongly disagree": 1,
      };
      return map[normalized] ?? null;
    }
    return null;
  };

  const storedOverallRaw = answers[overallKey];
  const storedOverall =
    typeof storedOverallRaw === "string" && storedOverallRaw.trim() !== ""
      ? Number(storedOverallRaw)
      : Number.NaN;
  const computedOverall = (() => {
    if (Number.isFinite(storedOverall)) return storedOverall;
    let sum = 0;
    let count = 0;
    for (const section of survey.sections) {
      for (const question of section.questions) {
        if (question.type !== "likert_agree" && question.type !== "rating_5") continue;
        const score = toScore(question.type, answers[question.key]);
        if (score == null) continue;
        sum += score;
        count += 1;
      }
    }
    return count > 0 ? (sum / (count * 5)) * 100 : null;
  })();

  return (
    <div className="form-grid">
      <section className="section">
        <h3>Overall Score</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>{overallLabel}</label>
            <div>
              {computedOverall != null ? `${computedOverall.toFixed(1)}%` : <span className="badge">No response</span>}
            </div>
          </div>
        </div>
      </section>
      {survey.sections.map((section) => (
        <section key={section.title} className="section">
          <h3>{section.title}</h3>
          {section.description ? <p>{section.description}</p> : null}
          <div className="form-grid">
            {section.questions.map((question) => {
              const value = answers[question.key];
              const display = Array.isArray(value)
                ? value.join(", ")
                : value ?? "";
                
              return (
                <div key={question.key} className="form-field">
                  <label>{question.label}</label>
                  <div>{display || <span className="badge">No response</span>}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
