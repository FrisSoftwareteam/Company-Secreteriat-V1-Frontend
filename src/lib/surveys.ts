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
            "The board possesses a diverse mix of gender, backgrounds, skills and experiences (i.e. the necessary expertise and diversity to effectively oversee the organisation)?",
            1,
            "Board Composition & Diversity"
          ),
          textQuestion("board_composition_additional_skills", "If not, what additional skills or experiences are needed?"),
          likertQuestion(
            "board_guidelines_appointment",
            "There are clear guidelines for the appointment and removal of board members.",
            2
          ),
          likertQuestion(
            "board_structure_size_independence",
            "The current size and structure of the board is appropriate in relation to the complexity of the organization and allows for effective decision-making and diverse viewpoints. It has an adequate mix of non-executive, independent, and executive directors, and they all contribute to board effectiveness to a large extent.",
            3,
            "Board Structure, Size & Independence"
          ),
          likertQuestion(
            "chairperson_facilitates",
            "The chairperson effectively facilitates board meetings, discussions and encourages active participation from all board members.",
            4,
            "Role of Chairperson"
          ),
          likertQuestion(
            "board_understands_roles",
            "The board understands its roles and responsibilities and is effective in fulfilling its governance responsibilities",
            5,
            "Competence (Understanding of Roles, Responsibilities & Overall Effectiveness)"
          ),
          likertQuestion(
            "board_induction_training",
            "Board members undergo induction and are provided with ongoing training and development opportunities.",
            6,
            "Induction & Training"
          ),
          likertQuestion(
            "committees_charters",
            "Board Committees have their respective Committee Charters, which provide guidance on their structure, functions, authority and duties in line with Principle 11.1.3 of the NCCG.",
            7,
            "Board Committees"
          ),
          likertQuestion(
            "committees_roles_integration",
            "Board members adequately understand the roles and responsibilities of each committee, function effectively, integrate with the overall board structure and decision-making processes and frequently report back to the full board.",
            8,
            "Roles, Responsibilities & Integration of Committees"
          ),
        ],
      },
      {
        title: "Section B: Board Processes",
        questions: [
          likertQuestion(
            "meetings_frequency_preparation",
            "Meetings are held regularly, at appropriate intervals and Board members receive meeting materials in advance to prepare adequately.",
            9,
            "Meeting Frequency & Preparation"
          ),
          likertQuestion("agenda_clarity", "Meeting agendas are clear, relevant, and strategically focused.", 10, "Agenda Setting"),
          likertQuestion(
            "attendance_meeting_effectiveness",
            "The attendance rate of board members at meetings is always good and deliberations fruitful and effective",
            11,
            "Attendance & Meeting Effectiveness"
          ),
          likertQuestion("information_flow", "Relevant information is provided to the board in a timely manner.", 12, "Information Flow"),
          likertQuestion(
            "decision_making",
            "Decisions are made clearly and communicated to relevant stakeholders timely and appropriately.",
            13,
            "Decision-Making Process"
          ),
          likertQuestion(
            "consensus_conflict_resolution",
            "There is a clear process for fostering participation in consensus building and decision making as well as addressing conflicts and conflicts of interests.",
            14,
            "Consensus Building & Conflict Resolution"
          ),
        ],
      },
      {
        title: "Section C: Performance Review",
        questions: [
          likertQuestion(
            "board_self_assessment",
            "The board frequently reviews its own performance and effectiveness.",
            15,
            "Self-Assessment"
          ),
        ],
      },
      {
        title: "Section D: Stakeholder Engagement, Communication and Reporting",
        questions: [
          likertQuestion(
            "stakeholder_transparency",
            "The board considers stakeholders’ interests in decision-making and its activities and decisions are transparent to stakeholders.",
            16,
            "Transparency & Stakeholder Interests"
          ),
          likertQuestion(
            "stakeholder_engagement",
            "The board engages well with executive management, shareholders and other stakeholders to gather insights and feedback.",
            17
          ),
          likertQuestion(
            "whistleblowing",
            "There is a structured process for whistleblowing/providing feedback to board members.",
            18,
            "Feedback/Whistleblowing Mechanism"
          ),
        ],
      },
      {
        title: "Section E: Strategic Oversight",
        questions: [
          likertQuestion(
            "vision_strategy",
            "The board sets a clear and compelling vision for the organization. It effectively manages and oversees the organisation’s strategic direction.",
            19,
            "Vision and Strategy"
          ),
          likertQuestion(
            "goal_setting",
            "There are clear goals and objectives set for the board and its committees.",
            20,
            "Goal Setting"
          ),
          likertQuestion(
            "succession_plan",
            "The board has a formal succession plan for key positions and reviews and updates this succession plan regularly.",
            21,
            "Succession Planning"
          ),
          likertQuestion(
            "resource_allocation",
            "The board reviews and approves resource allocation to support its strategic goals.",
            22,
            "Resource Allocation"
          ),
        ],
      },
      {
        title: "Section F: Regulatory Compliance & Risk Management",
        questions: [
          likertQuestion(
            "regulatory_knowledge",
            "The board is knowledgeable about relevant laws and regulations affecting the organisation.",
            23
          ),
          likertQuestion(
            "compliance_risk_oversight",
            "The board effectively and routinely ensures compliance with regulatory and legal requirements. It also oversees the company’s risk management processes and policies.",
            24
          ),
          likertQuestion(
            "governance_framework",
            "The governance framework is well aligned with best practices and regulatory requirements.",
            25,
            "Governance Framework"
          ),
        ],
      },
      {
        title: "Section G: Recommendations",
        questions: [
          {
            ...textQuestion("improvement_areas", "What areas of the company’s board governance could be improved?"),
            subheading: "Improvement Areas",
          },
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
              "Mr Olawale Osisanya",
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
            key: "e1_collaboration_constructive_challenge",
            label:
              "Works collaboratively with fellow directors and challenges ideas constructively without undermining consensus",
            type: "rating_5",
            required: true,
            options: ratingOptions,
          },
          {
            key: "e2_adds_value",
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
    ],
  },
];

export function getSurveyBySlug(slug: string) {
  return surveys.find((survey) => survey.slug === slug) ?? null;
}
