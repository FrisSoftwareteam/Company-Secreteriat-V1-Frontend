"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { SurveyDefinition, SurveyQuestion } from "@/lib/surveys";
import { OverallPercentageField } from "@/components/surveys/OverallPercentageField";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

function shouldNumberQuestion(question: SurveyQuestion) {
  if (question.key.startsWith("g_")) return false;
  return !["short_text", "long_text", "date"].includes(question.type);
}

function isFivePointNumericQuestion(question: SurveyQuestion) {
  if (question.type === "likert_agree") return true;
  if (question.type === "rating_5") return true;
  if (!question.options || question.options.length !== 5) return false;
  return question.options.join(",") === "1,2,3,4,5";
}

function getOptionScore(question: SurveyQuestion, option: string) {
  if (question.type === "likert_agree") {
    const likertScores: Record<string, number> = {
      "Strongly Agree": 5,
      Agree: 4,
      Neutral: 3,
      Disagree: 2,
      "Strongly Disagree": 1,
    };
    return likertScores[option];
  }

  if (question.type === "rating_5") {
    const numeric = Number(option);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  if (question.options?.length === 5 && question.options.join(",") === "1,2,3,4,5") {
    const numeric = Number(option);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  return undefined;
}

function getBoardSectionRank(title: string) {
  const match = title.match(/^Section\s+([A-H])/i);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const order = "ABCDEFGH";
  const index = order.indexOf(match[1].toUpperCase());
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

const BOARD_SECTION_TITLES = {
  A: "Section A: Governance Framework",
  B: "Section B: Board Processes",
  C: "Section C: Performance Review",
  D: "Section D: Communication and Reporting",
  E: "Section E: Stakeholder Engagement",
  F: "Section F: Strategic Oversight",
  G: "Section G: Compliance & Risk Management",
  H: "Section H: Recommendations",
} as const;

type BoardSectionLetter = keyof typeof BOARD_SECTION_TITLES;

function normalizeBoardSectionTitle(section: SurveyDefinition["sections"][number]) {
  const keys = new Set(section.questions.map((q) => q.key));

  // Force stable canonical headings when backend payload has wrong letters.
  if (keys.has("improvement_areas") || keys.has("additional_comments")) {
    return "Section H: Recommendations";
  }
  if (
    keys.has("compliance_legal") ||
    keys.has("risk_management") ||
    keys.has("governance_framework") ||
    keys.has("regulatory_knowledge")
  ) {
    return "Section G: Compliance & Risk Management";
  }
  if (keys.has("vision_strategy") || keys.has("strategic_oversight")) {
    return "Section F: Strategic Oversight";
  }
  if (keys.has("stakeholder_interests") || keys.has("management_collaboration")) {
    return "Section E: Stakeholder Engagement";
  }
  if (keys.has("transparency") || keys.has("whistleblowing")) {
    return "Section D: Communication and Reporting";
  }
  if (keys.has("board_self_assessment") || keys.has("director_contribution")) {
    return "Section C: Performance Review";
  }
  if (keys.has("meetings_frequency") || keys.has("conflict_handling")) {
    return "Section B: Board Processes";
  }
  if (keys.has("board_composition_diverse_mix") || keys.has("independent_directors_contribute")) {
    return "Section A: Governance Framework";
  }

  return section.title;
}

function normalizePeerSectionTitle(section: SurveyDefinition["sections"][number]) {
  const keys = new Set(section.questions.map((q) => q.key));
  if (keys.has("evaluation_date") || keys.has("director_being_evaluated")) {
    return "Section A - Respondent Context";
  }
  return section.title;
}

function getBoardSectionLetterForQuestion(question: SurveyQuestion, resolvedNumber?: number): BoardSectionLetter {
  if (question.key === "improvement_areas" || question.key === "additional_comments") return "H";
  if (question.key === "compliance_legal" || question.key === "risk_management" || question.key === "governance_framework" || question.key === "regulatory_knowledge") return "G";
  if (question.key === "vision_strategy" || question.key === "strategic_oversight" || question.key === "goal_setting" || question.key === "succession_plan" || question.key === "succession_plan_review" || question.key === "resource_allocation") return "F";
  if (question.key === "stakeholder_interests" || question.key === "stakeholder_engagement" || question.key === "management_collaboration") return "E";
  if (question.key === "transparency" || question.key === "whistleblowing") return "D";
  if (question.key === "board_self_assessment" || question.key === "director_contribution" || question.key === "directors_engaged") return "C";
  if (question.key === "meetings_frequency" || question.key === "meeting_materials" || question.key === "agenda_clarity" || question.key === "attendance_rate" || question.key === "meeting_effectiveness" || question.key === "company_secretary_experience" || question.key === "company_secretary_senior_staff" || question.key === "company_secretary_assists" || question.key === "information_flow" || question.key === "decision_making" || question.key === "consensus_building" || question.key === "consensus_suggestion" || question.key === "conflict_resolution_process" || question.key === "conflict_resolution_suggestion" || question.key === "conflict_handling") return "B";
  if (question.key === "board_composition_diverse_mix" || question.key === "board_composition_additional_skills" || question.key === "board_diversity_reflect" || question.key === "board_diversity_importance" || question.key === "board_composition_aligns" || question.key === "board_guidelines_appointment" || question.key === "board_size_appropriate" || question.key === "board_size_effective" || question.key === "board_understands_roles" || question.key === "board_induction_training" || question.key === "chairperson_facilitates" || question.key === "chairperson_participation" || question.key === "board_effective_governance" || question.key === "committees_charters" || question.key === "committees_understanding" || question.key === "committees_effective" || question.key === "committees_report_back" || question.key === "committees_integrate" || question.key === "independent_directors_number" || question.key === "independent_directors_contribute") return "A";

  if (resolvedNumber) {
    if (resolvedNumber <= 19) return "A";
    if (resolvedNumber <= 32) return "B";
    if (resolvedNumber <= 35) return "C";
    if (resolvedNumber <= 37) return "D";
    if (resolvedNumber <= 40) return "E";
    if (resolvedNumber <= 46) return "F";
    if (resolvedNumber <= 50) return "G";
  }

  return "H";
}

function normalizeBoardSections(sections: SurveyDefinition["sections"]): SurveyDefinition["sections"] {
  const flattened = sections.flatMap((section, sectionIndex) =>
    section.questions.map((question, questionIndex) => ({
      question,
      sectionIndex,
      questionIndex,
      resolvedNumber: question.displayNumber ?? getBoardDisplayNumberFallback(question),
    }))
  );

  const ordered = flattened.sort((a, b) => {
    const aNum = a.resolvedNumber ?? Number.MAX_SAFE_INTEGER;
    const bNum = b.resolvedNumber ?? Number.MAX_SAFE_INTEGER;
    if (aNum !== bNum) return aNum - bNum;
    if (a.sectionIndex !== b.sectionIndex) return a.sectionIndex - b.sectionIndex;
    return a.questionIndex - b.questionIndex;
  });

  const hiddenBoardQuestionKeys = new Set([
    "board_composition_additional_skills",
    "consensus_suggestion",
  ]);

  const grouped = new Map<BoardSectionLetter, SurveyQuestion[]>();
  for (const entry of ordered) {
    if (hiddenBoardQuestionKeys.has(entry.question.key)) {
      continue;
    }
    const letter = getBoardSectionLetterForQuestion(entry.question, entry.resolvedNumber);
    const existing = grouped.get(letter) ?? [];
    existing.push(entry.question);
    grouped.set(letter, existing);
  }

  const letters: BoardSectionLetter[] = ["A", "B", "C", "D", "E", "F", "G", "H"];
  return letters
    .filter((letter) => (grouped.get(letter)?.length ?? 0) > 0)
    .map((letter) => ({
      title: BOARD_SECTION_TITLES[letter],
      description: undefined,
      questions: grouped.get(letter) ?? [],
    }));
}

const BOARD_SUBHEADING_BY_KEY: Record<string, string> = {
  board_composition_diverse_mix: "Board Composition",
  board_diversity_reflect: "Board Diversity",
  board_size_appropriate: "Board Structure",
  board_understands_roles: "Competence (Understanding of Roles and Responsibilities)",
  board_induction_training: "Induction & Training",
  chairperson_facilitates: "Role of Chairperson",
  board_effective_governance: "Overall Effectiveness",
  committees_charters: "Board Committees",
  committees_integrate: "Integration of Committees",
  independent_directors_number: "Independence",
  meetings_frequency: "Frequency",
  meeting_materials: "Preparation",
  agenda_clarity: "Agenda Setting",
  attendance_rate: "Attendance",
  meeting_effectiveness: "Meeting Effectiveness",
  company_secretary_experience: "Company Secretariat",
  information_flow: "Information Flow",
  decision_making: "Decision-Making Process",
  consensus_building: "Consensus Building",
  conflict_resolution_process: "Conflict Resolution",
  board_self_assessment: "Self-Assessment",
  director_contribution: "Individual Directors Assessment",
  transparency: "Transparency",
  whistleblowing: "Feedback/Whistleblowing Mechanism",
  stakeholder_interests: "Stakeholder Interests",
  vision_strategy: "Vision and Strategy",
  strategic_oversight: "Strategic Oversight",
  goal_setting: "Goal Setting",
  succession_plan: "Succession Planning",
  resource_allocation: "Resource Allocation",
  compliance_legal: "Compliance and Risk Management",
  risk_management: "Regulatory Compliance",
  governance_framework: "Regulatory Compliance\nGovernance Framework",
  improvement_areas: "Improvement Areas",
  additional_comments: "Additional Comments",
};

const BOARD_DISPLAY_NUMBER_BY_KEY: Record<string, number> = {
  board_composition_diverse_mix: 1,
  board_diversity_reflect: 2,
  board_diversity_importance: 3,
  board_composition_aligns: 4,
  board_guidelines_appointment: 5,
  board_size_appropriate: 6,
  board_size_effective: 7,
  board_understands_roles: 8,
  board_induction_training: 9,
  chairperson_facilitates: 10,
  chairperson_participation: 11,
  board_effective_governance: 12,
  committees_charters: 13,
  committees_understanding: 14,
  committees_effective: 15,
  committees_report_back: 16,
  committees_integrate: 17,
  independent_directors_number: 18,
  independent_directors_contribute: 19,
  meetings_frequency: 20,
  meeting_materials: 21,
  agenda_clarity: 22,
  attendance_rate: 23,
  meeting_effectiveness: 24,
  company_secretary_experience: 25,
  company_secretary_senior_staff: 26,
  company_secretary_assists: 27,
  information_flow: 28,
  decision_making: 29,
  consensus_building: 30,
  conflict_resolution_process: 31,
  conflict_handling: 32,
  board_self_assessment: 33,
  director_contribution: 34,
  directors_engaged: 35,
  transparency: 36,
  whistleblowing: 37,
  stakeholder_interests: 38,
  stakeholder_engagement: 39,
  management_collaboration: 40,
  vision_strategy: 41,
  strategic_oversight: 42,
  goal_setting: 43,
  succession_plan: 44,
  succession_plan_review: 45,
  resource_allocation: 46,
  compliance_legal: 47,
  risk_management: 48,
  governance_framework: 49,
  regulatory_knowledge: 50,
};

const PEER_LABEL_OVERRIDE_BY_KEY: Record<string, string> = {
  g_strengths_strategic_vision: "1a Strategic vision",
  g_strengths_long_term_thinking: "1b Long term thinking",
  g_strengths_adaptability: "1c Adaptability",
  g_strengths_financial_literacy: "2a Financial literacy",
  g_strengths_financial_metrics: "2b Understands financial metrics",
  g_strengths_budget_oversight: "2c Budget oversight",
  g_strengths_governance_compliance: "3a Governance & Compliance",
  g_strengths_regulatory_knowledge: "3b Regulatory knowledge",
  g_strengths_risk_management: "3c Risk Management",
  g_strengths_leadership: "4a Leadership & Influence",
  g_strengths_communication: "4b Effective Communication",
  g_strengths_team_player: "4c Team Player",
  g_strengths_decision_making: "5a Decision Making",
  g_strengths_data_driven: "5b Data-driven approach",
  g_strengths_judgement: "5c Judgement & insight",
  g_strengths_stakeholder_engagement: "6a Stakeholder Engagement",
  g_strengths_relationship_management: "6b Relationship management",
  g_strengths_listening_skills: "6c Listening skills",
  g_strengths_innovation: "7a Innovation & Change Management",
  g_strengths_fostering_innovation: "7b Fostering innovation",
  g_strengths_change_adaptability: "7c Change adaptability",
  g_strengths_accountability: "8a Accountability & Integrity",
  g_strengths_ethical_leadership: "8b Ethical leadership",
  g_strengths_responsiveness: "8c Responsiveness",
  g_strengths_continuous_learning: "9a Continuous Learning",
  g_strengths_commitment_development: "9b Commitment to development",
  g_strengths_embraces_feedback: "9c Embraces feedback",
};

function getBoardSubheadingFallback(question: SurveyQuestion, questionNumber?: number) {
  if (question.key === "risk_management") return undefined;

  if (question.subheading) return question.subheading;

  const byKey = BOARD_SUBHEADING_BY_KEY[question.key];
  if (byKey) return byKey;

  // Fallback for backend payloads with different keys but same question copy.
  if (question.displayNumber === 1 || questionNumber === 1 || /diverse mix of skills and experiences/i.test(question.label)) {
    return "Board Composition";
  }

  return undefined;
}

function getBoardDisplayNumberFallback(question: SurveyQuestion) {
  return BOARD_DISPLAY_NUMBER_BY_KEY[question.key];
}

function getDisplayQuestionLabel(question: SurveyQuestion) {
  return PEER_LABEL_OVERRIDE_BY_KEY[question.key] ?? question.label;
}

function renderQuestion(question: SurveyQuestion, questionNumber?: number, boardTemplate = false) {
  const name = `q_${question.key}`;
  const requiredMark = question.required ? <span className="required-mark">*</span> : null;
  const displayLabel = getDisplayQuestionLabel(question);
  const labelText = questionNumber ? `${questionNumber}. ${displayLabel}` : displayLabel;

  if (question.type === "short_text") {
    return (
      <div className="survey-input-group">
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
      <div className="survey-input-group">
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <input id={name} name={name} type="date" required={question.required} />
      </div>
    );
  }

  if (question.type === "long_text") {
    const isTemplateFollowup =
      boardTemplate &&
      /^(if not|what areas|any other comments)/i.test(question.label.trim());

    return (
      <div
        className={`survey-input-group survey-input-group--full${
          isTemplateFollowup ? " template-followup" : ""
        }`}
      >
        <label htmlFor={name}>
          {isTemplateFollowup ? <span className="template-followup-bullet">•</span> : null}
          {labelText}
          {requiredMark}
        </label>
        <textarea
          id={name}
          name={name}
          required={question.required}
          className={isTemplateFollowup ? "template-followup-input" : undefined}
          placeholder={isTemplateFollowup ? "Type your response here..." : undefined}
        />
        {isTemplateFollowup ? (
          <div className="template-writing-lines" aria-hidden="true">
            <span />
            <span />
          </div>
        ) : null}
      </div>
    );
  }

  if (question.type === "single_select") {
    return (
      <div className="survey-input-group">
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
      <div className="survey-input-group survey-input-group--full">
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

  if (boardTemplate) {
    return (
      <div className="survey-input-group survey-input-group--full">
        <label>
          {labelText}
          {requiredMark}
        </label>
        <div className="template-option-list">
          {options.map((option) => {
            const score = getOptionScore(question, option);
            return (
              <label key={option} className="template-option-item">
                <input
                  type="radio"
                  name={name}
                  value={option}
                  required={question.required}
                  data-scoreable={isFivePointNumericQuestion(question) ? "true" : undefined}
                  data-score={score !== undefined ? String(score) : undefined}
                />
                <span className="template-option-bullet">o</span>
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="survey-input-group survey-input-group--full">
      <label>
        {labelText}
        {requiredMark}
      </label>
      <div className={groupClass}>
        {options.map((option) => {
          const score = getOptionScore(question, option);
          return (
            <label key={option} className="option-pill">
              <input
                type="radio"
                name={name}
                value={option}
                required={question.required}
                data-scoreable={isFivePointNumericQuestion(question) ? "true" : undefined}
                data-score={score !== undefined ? String(score) : undefined}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
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

  if (isBoard) {
    return { label: "Overall Percentage A", key: "overall_percentage_a" };
  }
  if (isPeer) {
    return { label: "Overall Percentage B", key: "overall_percentage_b" };
  }
  return { label: "Overall Percentage", key: "overall_percentage" };
}

function calculateOverallPercentageFromForm(survey: SurveyDefinition, formData: FormData) {
  let earnedPoints = 0;
  let totalQuestions = 0;

  for (const section of survey.sections) {
    for (const question of section.questions) {
      if (!isFivePointNumericQuestion(question)) continue;
      totalQuestions += 1;

      const value = formData.get(`q_${question.key}`);
      if (typeof value !== "string") continue;
      const score = getOptionScore(question, value);
      if (score == null) continue;
      earnedPoints += score;
    }
  }

  const maxPoints = totalQuestions * 5;
  return maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0;
}

export function SurveyForm({ survey }: { survey: SurveyDefinition }) {
  const router = useRouter();
  const { token } = useAuth();
  const allQuestionKeys = new Set(
    survey.sections.flatMap((section) => section.questions.map((question) => question.key))
  );
  const boardTemplate =
    survey.slug === "board-evaluation" ||
    allQuestionKeys.has("board_composition_diverse_mix") ||
    allQuestionKeys.has("vision_strategy") ||
    allQuestionKeys.has("compliance_legal");
  const peerTemplate =
    survey.slug === "peer-evaluation" ||
    allQuestionKeys.has("evaluation_date") ||
    allQuestionKeys.has("director_being_evaluated");
  const overallMeta = getOverallPercentageMeta(survey);
  const sectionsToRender = boardTemplate
    ? normalizeBoardSections(
        survey.sections.map((section) => ({
          ...section,
          title: normalizeBoardSectionTitle(section),
        }))
      )
    : peerTemplate
      ? survey.sections.map((section) => ({
          ...section,
          title: normalizePeerSectionTitle(section),
        }))
      : survey.sections;

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
    answers[overallMeta.key] = calculateOverallPercentageFromForm(survey, formData).toFixed(1);

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
    <form
      className={`survey-form-template${boardTemplate ? " survey-form-template--board" : ""}`}
      onSubmit={handleSubmit}
    >
      <OverallPercentageField
        label={overallMeta.label}
      />

      {sectionsToRender.map((section, index) => (
        <section key={`${section.title}-${index}`} className="survey-block">
          <h3 className="survey-block-title">{section.title}</h3>
          {section.description ? <p className="survey-block-subtitle">{section.description}</p> : null}

          <div className={`survey-row ${index === 0 ? "survey-row--two-col" : "survey-row--single-col"}`}>
            {section.questions.map((question, questionIndex) => {
              const fallbackNumber = section.questions
                .slice(0, questionIndex + 1)
                .filter((q) => shouldNumberQuestion(q)).length;
              const questionNumber = shouldNumberQuestion(question)
                ? boardTemplate
                  ? question.displayNumber ?? getBoardDisplayNumberFallback(question) ?? fallbackNumber
                  : question.displayNumber ?? fallbackNumber
                : undefined;
              const effectiveSubheading = boardTemplate
                ? getBoardSubheadingFallback(question, questionNumber)
                : question.subheading;

              return (
                <Fragment key={question.key}>
                  {effectiveSubheading ? <h4 className="survey-subheading">{effectiveSubheading}</h4> : null}
                  {renderQuestion(question, questionNumber, boardTemplate)}
                </Fragment>
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
