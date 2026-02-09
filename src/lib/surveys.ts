export type QuestionType =
  | "likert_agree"
  | "rating_5"
  | "short_text"
  | "long_text"
  | "date"
  | "single_select"
  | "multi_select";

export type SurveyQuestion = {
  key: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];
};

export type SurveySection = {
  title: string;
  description?: string;
  questions: SurveyQuestion[];
};

export type SurveyDefinition = {
  slug: string;
  title: string;
  description: string;
  sections: SurveySection[];
};

export const agreeOptions = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
];

export const ratingOptions = ["1", "2", "3", "4", "5"];

export const surveys: SurveyDefinition[] = [
  {
    slug: "board-evaluation",
    title: "Board Evaluation Questionnaire",
    description:
      "Assess board composition, governance framework, processes, and strategic oversight.",
    sections: [
      {
        title: "Section A: Governance Framework",
        questions: [
          {
            key: "board_composition_diverse_mix",
            label:
              "Does the board possess a diverse mix of skills and experiences (i.e. the necessary expertise and diversity to effectively oversee the organisation)?",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_composition_additional_skills",
            label: "If not, what additional skills or experiences are needed?",
            type: "long_text",
          },
          {
            key: "board_diversity_reflect",
            label:
              "Do you agree that the board reflect a diversity of gender, ethnicity, perspectives, experiences and backgrounds?",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_diversity_importance",
            label: "Diversity is important to the board’s strategic goals.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_composition_aligns",
            label:
              "Does the current composition aligns with the skills and expertise needed for effective governance?",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_guidelines_appointment",
            label:
              "There are clear guidelines for the appointment and removal of board members.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_size_appropriate",
            label:
              "The current size of the board is appropriate in relation to the complexity of the organization.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_size_effective",
            label:
              "The board's size allows for effective decision-making and diverse viewpoints.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_understands_roles",
            label: "The board understands its roles and responsibilities.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_induction_training",
            label:
              "Board members undergo induction and are provided with ongoing training and development opportunities.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "chairperson_facilitates",
            label:
              "The chairperson effectively facilitates board meetings and discussions.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "chairperson_participation",
            label:
              "The chairperson encourages active participation from all board members.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_effective_governance",
            label:
              "The board is effective in fulfilling its governance responsibilities.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "committees_charters",
            label:
              "Board Committees have their respective Committee Charters, which provide guidance on their structure, functions, authority and duties in line with Principle 11.1.3 of the NCCG.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "committees_understanding",
            label:
              "Board members adequately understand the roles and responsibilities of each committee.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "committees_effective",
            label: "Board committees function effectively.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "committees_report_back",
            label: "Committees frequently report back to the full board.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "committees_integrate",
            label:
              "Board committees effectively integrate with the overall board structure and decision-making processes.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "independent_directors_number",
            label: "The board has an adequate number of independent directors.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "independent_directors_contribute",
            label:
              "Independent directors contribute to board effectiveness to a large extent.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
        ],
      },
      {
        title: "Section B: Board Processes",
        questions: [
          {
            key: "meetings_frequency",
            label: "Meetings are held regularly and at appropriate intervals.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "meeting_materials",
            label:
              "Board members receive meeting materials in advance to prepare adequately.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "agenda_clarity",
            label: "Meeting agendas are clear, relevant, and strategically focused.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "attendance_rate",
            label: "The attendance rate of board members at meetings is always good.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "meeting_effectiveness",
            label: "Board meetings are scheduled timely and conducted efficiently.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "company_secretary_experience",
            label:
              "The Company Secretary also possesses requisite experience and qualifications to effectively carry out assigned duties, in line with Principle 8.1 of the NCCG.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "company_secretary_senior_staff",
            label:
              "The Company Secretary is a Senior Management staff of the Company as required by Principle 8.2 of the NCCG.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "company_secretary_assists",
            label:
              "In line with Principle 8.6.3 of the NCCG, the Company Secretary assists the Chairman and the MD/CEO in coordinating the activities of the Board.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "information_flow",
            label: "Relevant information is provided to the board in a timely manner.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "decision_making",
            label:
              "Decisions are made clearly and communicated to relevant stakeholders timely and appropriately.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "consensus_building",
            label:
              "There is a process for fostering participation and consensus in decision making.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "consensus_suggestion",
            label:
              "If not, suggest a possible process for fostering participation and consensus in the board’s decision making?",
            type: "long_text",
          },
          {
            key: "conflict_resolution_process",
            label: "There a clear process for addressing conflicts of interest.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "conflict_resolution_suggestion",
            label:
              "If not, suggest a possible process for addressing conflicts of interests.",
            type: "long_text",
          },
          {
            key: "conflict_handling",
            label: "The board handles conflicts or disagreements, if any, effectively.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "board_self_assessment",
            label:
              "The board frequently reviews its own performance and effectiveness.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "director_contribution",
            label:
              "Each director contributes effectively to board discussions and decision-making.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "directors_engaged",
            label: "Directors are engaged and active participants in meetings.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "transparency",
            label: "Board activities and decisions are transparent to stakeholders.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "whistleblowing",
            label:
              "There is a structured process for whistleblowing/providing feedback to board members.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
        ],
      },
      {
        title: "Section D: Stakeholder Engagement",
        questions: [
          {
            key: "stakeholder_interests",
            label: "The board considers stakeholders’ interests in decision-making.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "stakeholder_engagement",
            label:
              "The board engages well with shareholders and other stakeholders to gather insights and feedback.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "management_collaboration",
            label:
              "The board communicates and collaborates well and effectively with executive management.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
        ],
      },
      {
        title: "Section C: Strategic Oversight",
        questions: [
          {
            key: "vision_strategy",
            label: "The board sets a clear and compelling vision for the organization.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "strategic_oversight",
            label:
              "The board effectively manages and oversees the organisation’s strategic direction.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "goal_setting",
            label:
              "There are clear goals and objectives set for the board and its committees.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "succession_plan",
            label: "The board has a formal succession plan for key positions.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "succession_plan_review",
            label: "The board reviews and updates this succession plan regularly.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "resource_allocation",
            label:
              "The board reviews and approves resource allocation to support its strategic goals.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "compliance_legal",
            label:
              "The board effectively and routinely ensures compliance with regulatory and legal requirements.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "risk_management",
            label:
              "The board effectively oversees the company’s risk management processes and policies.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "governance_framework",
            label:
              "The governance framework are well aligned with best practices and regulatory requirements.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
          {
            key: "regulatory_knowledge",
            label:
              "The board is knowledgeable about relevant laws and regulations affecting the organisation.",
            type: "likert_agree",
            required: true,
            options: agreeOptions,
          },
        ],
      },
      {
        title: "Section E: Recommendations",
        questions: [
          {
            key: "improvement_areas",
            label:
              "What areas of the company’s board governance could be improved?",
            type: "long_text",
          },
          {
            key: "additional_comments",
            label: "Any other comments or suggestions?",
            type: "long_text",
          },
        ],
      },
    ],
  },
  {
    slug: "peer-evaluation",
    title: "Directors’ Peer-to-Peer Evaluation Questionnaire",
    description:
      "Assess individual director effectiveness against corporate governance standards.",
    sections: [
      {
        title: "Respondent Context",
        questions: [
          {
            key: "evaluation_date",
            label: "Date",
            type: "date",
            required: true,
          },
          {
            key: "director_being_evaluated",
            label: "Director Being Evaluated",
            type: "single_select",
            required: true,
            options: [
              "Samuel Durojaye (Chairman)",
              "Oluyemisi Dawodu",
              "Abiodun Fari-Arole",
              "Adewale Jubril",
              "Remilekun Bakare",
              "Mufutau Towolawi",
              "Akinwale Ojo",
              "Olusgun Osibote",
              "Ronke Akinleye",
              "Rotimi Olashore",
            ],
          },
          {
            key: "committee_worked_with",
            label: "Committee(s) worked with this Director",
            type: "short_text",
          },
          {
            key: "years_interacting",
            label: "Years interacting with this Director",
            type: "single_select",
            options: ["<1", "1–3", "3–5", ">5"],
          },
        ],
      },
      {
        title: "Section B — Board Effectiveness & Responsibilities",
        description: "Reflects board duties, including oversight, strategy and governance.",
        questions: [
          {
            key: "b1_prepared",
            label: "Comes prepared, understanding agenda items and reports.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "b2_contributes_strategy",
            label: "Actively contributes to strategic discussions.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "b3_understands_risks",
            label: "Demonstrates deep understanding of mortgage banking risks and business issues.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "b4_sustainability",
            label:
              "Ensures decisions consider long-term sustainability, risk, and regulatory compliance.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "b5_regulatory_knowledge",
            label:
              "Demonstrates knowledge of applicable laws, policies, and governance expectations.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "b_optional_comments",
            label: "Optional comments",
            type: "long_text",
          },
        ],
      },
      {
        title: "Section C — Governance, Risk & Compliance Oversight",
        questions: [
          {
            key: "c1_risk_controls",
            label: "Provides robust oversight of risk management and internal controls.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c2_compliance_culture",
            label: "Supports a strong culture of compliance and ethical standards.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c3_compliance_discussions",
            label: "Engages constructively in compliance discussions and risk mitigation.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c4_balance_oversight",
            label:
              "Promotes a balance between oversight and respect for management’s role.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c5_risk_controls_repeat",
            label: "Provides robust oversight of risk management and internal controls.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c_optional_comments",
            label: "Optional comments",
            type: "long_text",
          },
        ],
      },
      {
        title: "Section D — Independence, Integrity & Collision Avoidance",
        description:
          "Reflects expectations on director independence, integrity, and effective governance behaviour.",
        questions: [
          {
            key: "d1_independence",
            label: "Demonstrates independence of thought and judgement.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d2_integrity",
            label: "Upholds integrity in all interactions with Board & stakeholders.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d3_conflicts",
            label: "Manages conflicts of interest effectively.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d4_confidentiality",
            label: "Respects confidentiality and Board protocols.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d5_independence_repeat",
            label: "Demonstrates independence of thought and judgement.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d_optional_comments",
            label: "Optional comments",
            type: "long_text",
          },
        ],
      },
      {
        title: "Section E — Engagement & Team Dynamics",
        questions: [
          {
            key: "e1_collaboration",
            label: "Works collaboratively with fellow directors.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e2_challenges",
            label:
              "Challenges ideas constructively without undermining consensus.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e3_adds_value",
            label: "Adds value to discussions during committee and plenary sessions.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e_optional_comments",
            label: "Optional comments",
            type: "long_text",
          },
        ],
      },
      {
        title: "Section F — Management Engagement & Oversight",
        questions: [
          {
            key: "f1_accountable",
            label: "Holds management accountable for performance and compliance.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "f2_supports_management",
            label: "Supports management with insight without micromanaging.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "f3_constructive_feedback",
            label: "Provides constructive feedback for improvement.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "f_optional_comments",
            label: "Optional comments",
            type: "long_text",
          },
        ],
      },
      {
        title: "Section G — Overall Performance & Reappointment",
        questions: [
          {
            key: "g_strengths_strategic_vision",
            label: "Strategic vision",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_long_term_thinking",
            label: "Long term thinking",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_adaptability",
            label: "Adaptability",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_financial_literacy",
            label: "Financial literacy",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_financial_metrics",
            label: "Understands financial metrics",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_budget_oversight",
            label: "Budget oversight",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_governance_compliance",
            label: "Governance & Compliance",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_regulatory_knowledge",
            label: "Regulatory knowledge",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_risk_management",
            label: "Risk Management",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_leadership",
            label: "Leadership & Influence",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_communication",
            label: "Effective Communication",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_team_player",
            label: "Team Player",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_decision_making",
            label: "Decision Making",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_data_driven",
            label: "Data-driven approach",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_judgement",
            label: "Judgement & insight",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_stakeholder_engagement",
            label: "Stakeholder Engagement",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_relationship_management",
            label: "Relationship management",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_listening_skills",
            label: "Listening skills",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_innovation",
            label: "Innovation & Change Management",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_fostering_innovation",
            label: "Fostering innovation",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_change_adaptability",
            label: "Change adaptability",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_accountability",
            label: "Accountability & Integrity",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_ethical_leadership",
            label: "Ethical leadership",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_responsiveness",
            label: "Responsiveness",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_continuous_learning",
            label: "Continuous Learning",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_commitment_development",
            label: "Commitment to development",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_embraces_feedback",
            label: "Embraces feedback",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_development_areas",
            label: "Suggest areas for development",
            type: "long_text",
          },
          {
            key: "g_overall_rating",
            label: "Overall performance rating",
            type: "single_select",
            options: ["Poor", "Fair", "Good", "Very Good", "Excellent"],
          },
          {
            key: "g_reappoint",
            label: "Recommend re-appointment?",
            type: "single_select",
            options: ["Yes", "Yes with development support", "No"],
          },
          {
            key: "g_optional_comments",
            label: "Optional comments",
            type: "long_text",
          },
        ],
      },
      {
        title: "Section H — Development & Training Needs",
        questions: [
          {
            key: "h_training_needs",
            label: "Recommended training areas",
            type: "multi_select",
            options: [
              "Regulatory updates & governance expectations",
              "Risk & compliance management",
              "Advanced mortgage portfolio oversight",
              "Board leadership & governance best practices",
              "Digital transformation and cyber security oversight",
            ],
          },
        ],
      },
    ],
  },
];

export function getSurveyBySlug(slug: string) {
  return surveys.find((survey) => survey.slug === slug) ?? null;
}
