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

  return (
    <div className="form-grid">
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
