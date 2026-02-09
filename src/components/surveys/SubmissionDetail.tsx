import { SurveyDefinition } from "@/lib/surveys";

type SubmissionData = {
  answers?: Record<string, string | string[] | null>;
};

export function SubmissionDetail({
  survey,
  data,
}: {
  survey: SurveyDefinition;
  data: SubmissionData;
}) {
  const answers = data.answers ?? {};

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
