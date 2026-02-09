"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SurveyDefinition, SurveyQuestion } from "@/lib/surveys";
import { OverallPercentageField } from "@/components/surveys/OverallPercentageField";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

function shouldNumberQuestion(question: SurveyQuestion) {
  return !["short_text", "long_text", "date"].includes(question.type);
}

function isFivePointNumericQuestion(question: SurveyQuestion) {
  if (question.type === "rating_5") return true;
  if (!question.options || question.options.length !== 5) return false;
  return question.options.join(",") === "1,2,3,4,5";
}

function renderQuestion(question: SurveyQuestion, questionNumber?: number) {
  const name = `q_${question.key}`;
  const requiredMark = question.required ? <span className="required-mark">*</span> : null;
  const labelText = questionNumber ? `${questionNumber}. ${question.label}` : question.label;

  if (question.type === "short_text") {
    return (
      <div className="survey-input-group" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <input id={name} name={name} type="text" required={question.required} />
      </div>
    );
  }

  if (question.type === "date") {
    return (
      <div className="survey-input-group" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <input id={name} name={name} type="date" required={question.required} />
      </div>
    );
  }

  if (question.type === "long_text") {
    return (
      <div className="survey-input-group survey-input-group--full" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <textarea id={name} name={name} required={question.required} />
      </div>
    );
  }

  if (question.type === "single_select") {
    return (
      <div className="survey-input-group" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <select id={name} name={name} required={question.required}>
          <option value="">Select an option</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (question.type === "multi_select") {
    return (
      <div className="survey-input-group survey-input-group--full" key={question.key}>
        <label>
          {labelText}
          {requiredMark}
        </label>
        <div className="multi-select-options">
          {question.options?.map((option) => (
            <label key={option} className="option-chip">
              <input type="checkbox" name={name} value={option} />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  const options = question.options ?? [];
  const groupClass =
    question.type === "likert_agree"
      ? "likert-options survey-rating-scale"
      : "rating-options survey-rating-scale";

  return (
    <div className="survey-input-group survey-input-group--full" key={question.key}>
      <label>
        {labelText}
        {requiredMark}
      </label>
      <div className={groupClass}>
        {options.map((option) => (
          <label key={option} className="option-pill">
            <input
              type="radio"
              name={name}
              value={option}
              required={question.required}
              data-scoreable={isFivePointNumericQuestion(question) ? "true" : undefined}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SurveyForm({ survey }: { survey: SurveyDefinition }) {
  const router = useRouter();
  const { token } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      router.push("/login");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const answers: Record<string, string | string[] | null> = {};

    for (const section of survey.sections) {
      for (const question of section.questions) {
        const key = `q_${question.key}`;
        if (question.type === "multi_select") {
          answers[question.key] = formData.getAll(key).map((item) => String(item));
        } else {
          const value = formData.get(key);
          answers[question.key] = value ? String(value) : null;
        }
      }
    }

    try {
      await apiRequest(`/api/surveys/${survey.slug}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }, token);

      router.push(`/dashboard?submitted=${survey.slug}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit survey.");
    }
  };

  return (
    <form className="survey-form-template" onSubmit={handleSubmit}>
      <OverallPercentageField />

      {survey.sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className="survey-block">
          <h3 className="survey-block-title">{section.title}</h3>
          {section.description ? <p className="survey-block-subtitle">{section.description}</p> : null}

          <div className={`survey-row ${index === 0 ? "survey-row--two-col" : "survey-row--single-col"}`}>
            {section.questions.map((question, questionIndex) => {
              const questionNumber = section.questions
                .slice(0, questionIndex + 1)
                .filter((q) => shouldNumberQuestion(q)).length;

              return renderQuestion(
                question,
                shouldNumberQuestion(question) ? questionNumber : undefined
              );
            })}
          </div>
        </section>
      ))}

      <div className="survey-action-row">
        <button className="button primary survey-submit-btn" type="submit">
          Submit Survey
        </button>
        <Link className="button" href="/dashboard">
          Cancel
        </Link>
      </div>
    </form>
  );
}
