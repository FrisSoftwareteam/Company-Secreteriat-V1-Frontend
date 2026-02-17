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
  subheading?: string;
  displayNumber?: number;
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

function likertQuestion(
  key: string,
  label: string,
  displayNumber: number,
  subheading?: string
): SurveyQuestion {
  return {
    key,
    label,
    type: "likert_agree",
    required: true,
    options: agreeOptions,
    displayNumber,
    subheading,
  };
}

function textQuestion(key: string, label: string): SurveyQuestion {
  return {
    key,
    label,
    type: "long_text",
  };
}

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
          likertQuestion(
            "board_composition_diverse_mix",
            "Does the board possess a diverse mix of skills and experiences (i.e. the necessary expertise and diversity to effectively oversee the organisation)?",
            1,
            "Board Composition"
          ),
          likertQuestion(
            "board_diversity_reflect",
            "Do you agree that the board reflect a diversity of gender, ethnicity, perspectives, experiences and backgrounds?",
            2,
            "Board Diversity"
          ),
          likertQuestion("board_diversity_importance", "Diversity is important to the board’s strategic goals.", 3),
          likertQuestion(
            "board_composition_aligns",
            "Does the current composition aligns with the skills and expertise needed for effective governance?",
            4
          ),
          likertQuestion(
            "board_guidelines_appointment",
            "There are clear guidelines for the appointment and removal of board members.",
            5
          ),
          likertQuestion(
            "board_size_appropriate",
            "The current size of the board is appropriate in relation to the complexity of the organization.",
            6,
            "Board Structure"
          ),
          likertQuestion("board_size_effective", "The board's size allows for effective decision-making and diverse viewpoints.", 7),
          likertQuestion(
            "board_understands_roles",
            "The board understands its roles and responsibilities.",
            8,
            "Competence (Understanding of Roles and Responsibilities)"
          ),
          likertQuestion(
            "board_induction_training",
            "Board members undergo induction and are provided with ongoing training and development opportunities.",
            9,
            "Induction & Training"
          ),
          likertQuestion(
            "chairperson_facilitates",
            "The chairperson effectively facilitates board meetings and discussions.",
            10,
            "Role of Chairperson"
          ),
          likertQuestion(
            "chairperson_participation",
            "The chairperson encourages active participation from all board members.",
            11
          ),
          likertQuestion(
            "board_effective_governance",
            "The board is effective in fulfilling its governance responsibilities.",
            12,
            "Overall Effectiveness"
          ),
          likertQuestion(
            "committees_charters",
            "Board Committees have their respective Committee Charters, which provide guidance on their structure, functions, authority and duties in line with Principle 11.1.3 of the NCCG.",
            13,
            "Board Committees"
          ),
          likertQuestion(
            "committees_understanding",
            "Board members adequately understand the roles and responsibilities of each committee.",
            14
          ),
          likertQuestion("committees_effective", "Board committees function effectively.", 15),
          likertQuestion("committees_report_back", "Committees frequently report back to the full board.", 16),
          likertQuestion(
            "committees_integrate",
            "Board committees effectively integrate with the overall board structure and decision-making processes.",
            17,
            "Integration of Committees"
          ),
          likertQuestion(
            "independent_directors_number",
            "The board has an adequate number of independent directors.",
            18,
            "Independence"
          ),
          likertQuestion(
            "independent_directors_contribute",
            "Independent directors contribute to board effectiveness to a large extent.",
            19
          ),
        ],
      },
      {
        title: "Section B: Board Processes",
        questions: [
          likertQuestion("meetings_frequency", "Meetings are held regularly and at appropriate intervals.", 20, "Frequency"),
          likertQuestion(
            "meeting_materials",
            "Board members receive meeting materials in advance to prepare adequately.",
            21,
            "Preparation"
          ),
          likertQuestion("agenda_clarity", "Meeting agendas are clear, relevant, and strategically focused.", 22, "Agenda Setting"),
          likertQuestion("attendance_rate", "The attendance rate of board members at meetings is always good.", 23, "Attendance"),
          likertQuestion("meeting_effectiveness", "Board meetings are scheduled timely and conducted efficiently.", 24, "Meeting Effectiveness"),
          likertQuestion(
            "company_secretary_experience",
            "The Company Secretary also possesses requisite experience and qualifications to effectively carry out assigned duties, in line with Principle 8.1 of the NCCG.",
            25,
            "Company Secretariat"
          ),
          likertQuestion(
            "company_secretary_senior_staff",
            "The Company Secretary is a Senior Management staff of the Company as required by Principle 8.2 of the NCCG.",
            26
          ),
          likertQuestion(
            "company_secretary_assists",
            "In line with Principle 8.6.3 of the NCCG, the Company Secretary assists the Chairman and the MD/CEO in coordinating the activities of the Board.",
            27
          ),
          likertQuestion("information_flow", "Relevant information is provided to the board in a timely manner.", 28, "Information Flow"),
          likertQuestion(
            "decision_making",
            "Decisions are made clearly and communicated to relevant stakeholders timely and appropriately.",
            29,
            "Decision-Making Process"
          ),
          likertQuestion(
            "consensus_building",
            "There is a process for fostering participation and consensus in decision making.",
            30,
            "Consensus Building"
          ),
          likertQuestion(
            "conflict_resolution_process",
            "There a clear process for addressing conflicts of interest.",
            31,
            "Conflict Resolution"
          ),
          textQuestion(
            "conflict_resolution_suggestion",
            "If not, suggest a possible process for addressing conflicts of interests."
          ),
          likertQuestion("conflict_handling", "The board handles conflicts or disagreements, if any, effectively.", 32),
        ],
      },
      {
        title: "Section C: Performance Review",
        questions: [
          likertQuestion(
            "board_self_assessment",
            "The board frequently reviews its own performance and effectiveness.",
            33,
            "Self-Assessment"
          ),
          likertQuestion(
            "director_contribution",
            "Each director contributes effectively to board discussions and decision-making.",
            34,
            "Individual Directors Assessment"
          ),
          likertQuestion("directors_engaged", "Directors are engaged and active participants in meetings.", 35),
        ],
      },
      {
        title: "Section D: Communication and Reporting",
        questions: [
          likertQuestion("transparency", "Board activities and decisions are transparent to stakeholders.", 36, "Transparency"),
          likertQuestion(
            "whistleblowing",
            "There is a structured process for whistleblowing/providing feedback to board members.",
            37,
            "Feedback/Whistleblowing Mechanism"
          ),
        ],
      },
      {
        title: "Section E: Stakeholder Engagement",
        questions: [
          likertQuestion(
            "stakeholder_interests",
            "The board considers stakeholders’ interests in decision-making.",
            38,
            "Stakeholder Interests"
          ),
          likertQuestion(
            "stakeholder_engagement",
            "The board engages well with shareholders and other stakeholders to gather insights and feedback.",
            39
          ),
          likertQuestion(
            "management_collaboration",
            "The board communicates and collaborates well and effectively with executive management.",
            40
          ),
        ],
      },
      {
        title: "Section F: Strategic Oversight",
        questions: [
          likertQuestion("vision_strategy", "The board sets a clear and compelling vision for the organization.", 41, "Vision and Strategy"),
          likertQuestion(
            "strategic_oversight",
            "The board effectively manages and oversees the organisation’s strategic direction.",
            42,
            "Strategic Oversight"
          ),
          likertQuestion(
            "goal_setting",
            "There are clear goals and objectives set for the board and its committees.",
            43,
            "Goal Setting"
          ),
          likertQuestion("succession_plan", "The board has a formal succession plan for key positions.", 44, "Succession Planning"),
          likertQuestion("succession_plan_review", "The board reviews and updates this succession plan regularly.", 45),
          likertQuestion(
            "resource_allocation",
            "The board reviews and approves resource allocation to support its strategic goals.",
            46,
            "Resource Allocation"
          ),
        ],
      },
      {
        title: "Section G: Compliance & Risk Management",
        questions: [
          likertQuestion(
            "compliance_legal",
            "The board effectively and routinely ensures compliance with regulatory and legal requirements.",
            47,
            "Compliance and Risk Management"
          ),
          likertQuestion(
            "risk_management",
            "The board effectively oversees the company’s risk management processes and policies.",
            48,
            "Regulatory Compliance"
          ),
          likertQuestion(
            "governance_framework",
            "The governance framework are well aligned with best practices and regulatory requirements.",
            49,
            "Governance Framework"
          ),
          likertQuestion(
            "regulatory_knowledge",
            "The board is knowledgeable about relevant laws and regulations affecting the organisation.",
            50
          ),
        ],
      },
      {
        title: "Section H: Recommendations",
        questions: [
          { ...textQuestion("improvement_areas", "What areas of the company’s board governance could be improved?"), subheading: "Improvement Areas" },
          { ...textQuestion("additional_comments", "Any other comments or suggestions?"), subheading: "Additional Comments" },
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
        title: "Section A - Respondent Context",
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
            displayNumber: 1,
            options: [
              "Mr. Samuel Durojaye (Chairman)",
              "Mrs. Oluyemisi Dawodu",
              "Dr. Remilekun Bakare",
              "Mr. Adesina Towolawi",
              "Mr. Otunba Adewale Jubril",
              "Esv. Akinwale Ojo",
              "Arc. Abiodun Fari-Arole",
              "Mrs. Ronke Akinleye",
              "Mr. Rotimi Olashore",
              "Mr. Olawale Osisanya",
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
            displayNumber: 2,
            options: ["<1", "1–3", "3–5", ">5"],
          },
        ],
      },
      {
        title: "SECTION B — BOARD EFFECTIVENESS & RESPONSIBILITIES",
        description: "(Reflects board duties, including oversight, strategy and governance)",
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
              "Demonstrates knowledge of applicable laws, policies, and CBN governance expectations.",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "b_optional_comments",
            label: "Optional Comments: _________________",
            type: "long_text",
          },
        ],
      },
      {
        title: "SECTION C — GOVERNANCE, RISK & COMPLIANCE OVERSIGHT",
        questions: [
          {
            key: "c1_risk_controls",
            label: "Provides robust oversight of risk management and internal controls",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c2_compliance_culture",
            label: "Supports a strong culture of compliance and ethical standards",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c3_compliance_discussions",
            label: "Engages constructively in compliance discussions and risk mitigation",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c4_balance_oversight",
            label: "Promotes a balance between oversight and respect for management’s role",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c5_risk_controls_repeat",
            label: "Provides robust oversight of risk management and internal controls",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "c_optional_comments",
            label: "Optional Comments: _________________",
            type: "long_text",
          },
        ],
      },
      {
        title: "SECTION D — INDEPENDENCE, INTEGRITY & COLLISION AVOIDANCE",
        description:
          "(Reflects expectations on director independence, integrity, and effective governance behaviour)",
        questions: [
          {
            key: "d1_independence",
            label: "Demonstrates independence of thought and judgement",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d2_integrity",
            label: "Upholds integrity in all interactions with Board & stakeholders",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d3_conflicts",
            label: "Manages conflicts of interest effectively",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d4_confidentiality",
            label: "Respects confidentiality and Board protocols",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d5_independence_repeat",
            label: "Demonstrates independence of thought and judgement",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "d_optional_comments",
            label: "Optional Comments: _________________",
            type: "long_text",
          },
        ],
      },
      {
        title: "SECTION E — ENGAGEMENT & TEAM DYNAMICS",
        description: "(Behavioral aspects key to effective boards, as reinforced in governance practice)",
        questions: [
          {
            key: "e1_collaboration",
            label: "Works collaboratively with fellow directors",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e2_challenges",
            label: "Challenges ideas constructively without undermining consensus",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e3_adds_value",
            label: "Adds value to discussions during committee and plenary sessions",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e_optional_comments",
            label: "Optional Comments: _________________",
            type: "long_text",
          },
        ],
      },
      {
        title: "SECTION F — MANAGEMENT ENGAGEMENT & OVERSIGHT",
        description: "(Aligned with governance but respects management’s role)",
        questions: [
          {
            key: "f1_accountable",
            label: "Holds management accountable for performance and compliance",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "f2_supports_management",
            label: "Supports management with insight without micromanaging",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "f3_constructive_feedback",
            label: "Provides constructive feedback for improvement",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "f_optional_comments",
            label: "Optional Comments: _________________",
            type: "long_text",
          },
        ],
      },
      {
        title: "SECTION G — OVERALL PERFORMANCE & REAPPOINTMENT",
        description: "(For cumulative assessment)",
        questions: [
          {
            key: "g_strengths_strategic_vision",
            label: "1a Strategic vision",
            type: "rating_5",
            subheading: "1. Key strengths:",
            options: ratingOptions,
          },
          {
            key: "g_strengths_long_term_thinking",
            label: "1b Long term thinking",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_adaptability",
            label: "1c Adaptability",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_financial_literacy",
            label: "2a Financial literacy",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_financial_metrics",
            label: "2b Understands financial metrics",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_budget_oversight",
            label: "2c Budget oversight",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_governance_compliance",
            label: "3a Governance & Compliance",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_regulatory_knowledge",
            label: "3b Regulatory knowledge",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_risk_management",
            label: "3c Risk Management",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_leadership",
            label: "4a Leadership & Influence",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_communication",
            label: "4b Effective Communication",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_team_player",
            label: "4c Team Player",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_decision_making",
            label: "5a Decision Making",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_data_driven",
            label: "5b Data-driven approach",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_judgement",
            label: "5c Judgement & insight",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_stakeholder_engagement",
            label: "6a Stakeholder Engagement",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_relationship_management",
            label: "6b Relationship management",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_listening_skills",
            label: "6c Listening skills",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_innovation",
            label: "7a Innovation & Change Management",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_fostering_innovation",
            label: "7b Fostering innovation",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_change_adaptability",
            label: "7c Change adaptability",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_accountability",
            label: "8a Accountability & Integrity",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_ethical_leadership",
            label: "8b Ethical leadership",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_responsiveness",
            label: "8c Responsiveness",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_continuous_learning",
            label: "9a Continuous Learning",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_commitment_development",
            label: "9b Commitment to development",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_strengths_embraces_feedback",
            label: "9c Embraces feedback",
            type: "rating_5",
            options: ratingOptions,
          },
          {
            key: "g_development_areas",
            label: "2. Suggest areas for development:",
            type: "long_text",
          },
          {
            key: "g_overall_rating",
            label: "3. Overall performance rating:",
            type: "single_select",
            options: ["Poor", "Fair", "Good", "Very Good", "Excellent"],
          },
          {
            key: "g_reappoint",
            label: "4. Recommend re-appointment?",
            type: "single_select",
            options: ["Yes", "Yes with development support", "No"],
          },
          {
            key: "g_optional_comments",
            label: "Optional Comments: _________________",
            type: "long_text",
          },
        ],
      },
      {
        title: "SECTION H — DEVELOPMENT & TRAINING NEEDS",
        description: "(Training areas that promote compliance and board effectiveness)",
        questions: [
          {
            key: "h_training_needs",
            label: "Please tick any recommended areas for this Director",
            type: "multi_select",
            options: [
              "Regulatory updates & CBN governance expectations",
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
