import {
  interviewSessionSchema,
  type InterviewIssue,
  type InterviewQuestion,
  type InterviewSession,
  type MissingInformation,
  type RiskCategory,
} from "@loopz/contracts/intake";

import type { IntakeAnalysis } from "./analyze-idea-intake";

type AcceptedIntakeAnalysis = Extract<IntakeAnalysis, { valid: true }>;

type QuestionTemplate = Pick<
  InterviewQuestion,
  "prompt" | "rationale" | "answerKind" | "options" | "placeholder"
>;

const categoryOrder: Record<RiskCategory, number> = {
  authorization: 1,
  primary_flow: 2,
  roles_and_access: 3,
  authentication: 4,
  data_handling: 5,
  payments: 6,
  external_integrations: 7,
  deployment: 8,
  repository_context: 9,
  verification: 10,
  scope: 11,
  visual_behavior: 12,
};

const questionTemplates: Record<RiskCategory, QuestionTemplate> = {
  authorization: {
    prompt: "Do you own this project or have explicit permission to modify it?",
    rationale: "LoopZ must not prepare work against a system you are not authorized to change.",
    answerKind: "choice",
    options: [
      { value: "authorized", label: "Yes, I am authorized" },
      { value: "not_authorized", label: "No" },
      { value: "not_sure", label: "I’m not sure" },
    ],
  },
  primary_flow: {
    prompt: "What is the single most important action a user must complete?",
    rationale: "The main successful user flow determines the implementation boundary.",
    answerKind: "text",
    options: [],
    placeholder: "Example: A visitor submits feedback and immediately sees confirmation.",
  },
  roles_and_access: {
    prompt: "Which user types exist, and what can each one view or change?",
    rationale: "Unclear access boundaries frequently cause security and scope mistakes.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Members edit their own profile; admins can review all submissions.",
  },
  authentication: {
    prompt: "How should users sign in for this version?",
    rationale: "Authentication is required, but its method or existing convention is unresolved.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Preserve the existing email-and-password flow; do not add OAuth.",
  },
  data_handling: {
    prompt: "What data should be stored, who can access it, and when may it be deleted?",
    rationale: "Storage and retention choices affect the data model, privacy, and acceptance tests.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Store message and timestamp; admins only; delete after 90 days.",
  },
  payments: {
    prompt: "What level of payment functionality is required?",
    rationale: "Real payment handling needs explicit scope and a human approval gate.",
    answerKind: "choice",
    options: [
      { value: "prototype", label: "Non-functional prototype" },
      { value: "real_payments", label: "Real payment processing" },
      { value: "exclude", label: "Exclude payments from this version" },
    ],
  },
  external_integrations: {
    prompt: "Which external service or API should be used, and may it be mocked?",
    rationale: "The integration cannot be implemented or verified without a named boundary.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Use Resend when credentials exist; otherwise provide a local mock.",
  },
  repository_context: {
    prompt: "Is this a new project or an existing repository, and what stack must be preserved?",
    rationale: "Repository status and existing conventions change how the agent should work.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Existing Next.js app using npm, TypeScript, and PostgreSQL.",
  },
  deployment: {
    prompt: "Where should this version run?",
    rationale: "Deployment authority and risk must be explicit before generating execution steps.",
    answerKind: "choice",
    options: [
      { value: "local_preview", label: "Local or preview only" },
      { value: "staging", label: "Staging environment" },
      { value: "production", label: "Production" },
      { value: "exclude", label: "Deployment is not included" },
    ],
  },
  verification: {
    prompt: "What observable result or command would prove this task is complete?",
    rationale: "LoopZ needs objective evidence instead of relying on the agent’s completion claim.",
    answerKind: "text",
    options: [],
    placeholder: "Example: npm test and npm run build pass, then manually submit the form.",
  },
  scope: {
    prompt: "What is the smallest useful outcome, and what should be postponed?",
    rationale: "A clear boundary prevents a broad request from consuming the question and repair budget.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Include create and list; postpone editing, exports, and notifications.",
  },
  visual_behavior: {
    prompt: "Is there an existing design system or visual reference the agent must follow?",
    rationale: "An inspectable reference is more useful than subjective wording such as professional.",
    answerKind: "text",
    options: [],
    placeholder: "Example: Reuse the current app components and support mobile and desktop widths.",
  },
};

function inferredMissingInformation(analysis: AcceptedIntakeAnalysis): MissingInformation[] {
  const prompt = analysis.intent.originalPrompt.toLocaleLowerCase();
  const inferred: MissingInformation[] = [];

  if (/\b(employer|company|third[- ]party|production system)\b/.test(prompt) || /\bclient\b(?!\s*-?\s*side\b)/.test(prompt)) {
    inferred.push({
      category: "authorization",
      reason: "The request may affect a system owned or controlled by another party.",
      blocking: true,
      priority: 1,
    });
  }

  if (
    /\b(admin|moderator|manager|member|customer|staff)\b/.test(prompt) &&
    /\b(role|permission|private|access|dashboard)\b/.test(prompt)
  ) {
    inferred.push({
      category: "roles_and_access",
      reason: "Multiple roles or access boundaries are implied but not defined.",
      blocking: true,
      priority: 2,
    });
  }

  if (/\b(deploy|deployment|live|production|staging|host)\b/.test(prompt)) {
    inferred.push({
      category: "deployment",
      reason: "The requested execution environment or deployment authority is unresolved.",
      blocking: true,
      priority: 2,
    });
  }

  if (analysis.intent.requestedCapabilities.length >= 4) {
    inferred.push({
      category: "scope",
      reason: "The request contains several capabilities without identifying the smallest useful version.",
      blocking: false,
      priority: 4,
    });
  }

  if (/\b(beautiful|modern|professional|polished|responsive design)\b/.test(prompt)) {
    inferred.push({
      category: "visual_behavior",
      reason: "The visual expectation is subjective and has no inspectable reference.",
      blocking: false,
      priority: 5,
    });
  }

  return inferred;
}

export function selectClarificationQuestions(
  analysis: AcceptedIntakeAnalysis,
  questionBudget = 5,
): InterviewQuestion[] {
  if (analysis.suitability === "unsupported") return [];

  const boundedBudget = Math.min(5, Math.max(1, Math.trunc(questionBudget)));
  const byCategory = new Map<RiskCategory, MissingInformation>();

  for (const item of [...analysis.missingInformation, ...inferredMissingInformation(analysis)]) {
    const existing = byCategory.get(item.category);
    if (
      !existing ||
      Number(item.blocking) > Number(existing.blocking) ||
      item.priority < existing.priority
    ) {
      byCategory.set(item.category, item);
    }
  }

  return [...byCategory.values()]
    .sort(
      (left, right) =>
        Number(right.blocking) - Number(left.blocking) ||
        categoryOrder[left.category] - categoryOrder[right.category] ||
        left.priority - right.priority,
    )
    .slice(0, boundedBudget)
    .map((item, index) => ({
      id: `Q-${String(index + 1).padStart(3, "0")}`,
      category: item.category,
      prompt: questionTemplates[item.category].prompt,
      rationale: questionTemplates[item.category].rationale,
      blocking: item.blocking,
      priority: item.priority,
      answerKind: questionTemplates[item.category].answerKind,
      options: questionTemplates[item.category].options,
      placeholder: questionTemplates[item.category].placeholder,
    }));
}

export function createInterviewSession(input: {
  projectId: string;
  analysis: AcceptedIntakeAnalysis;
  questionBudget?: number;
  startedAt?: string;
}): InterviewSession {
  if (input.analysis.suitability === "unsupported") {
    throw new Error("Unsupported intake cannot start a clarification interview.");
  }

  const questionBudget = Math.min(5, Math.max(1, Math.trunc(input.questionBudget ?? 5)));
  const questions = selectClarificationQuestions(input.analysis, questionBudget);
  const startedAt = input.startedAt ?? new Date().toISOString();

  return interviewSessionSchema.parse({
    projectId: input.projectId,
    intentTaskType: input.analysis.intent.taskType.value,
    status: questions.length === 0 ? "ready_for_contract" : "in_progress",
    questionBudget,
    questions,
    answers: [],
    currentQuestionId: questions[0]?.id ?? null,
    issues: [],
    startedAt,
    updatedAt: startedAt,
  });
}

function evaluateAnswer(
  question: InterviewQuestion,
  value: string,
  intentTaskType: InterviewSession["intentTaskType"],
): InterviewIssue[] {
  if (question.category === "authorization" && value !== "authorized") {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "safety_boundary",
        severity: "blocking",
        message:
          value === "not_authorized"
            ? "LoopZ cannot continue without authorization to modify the target project."
            : "Confirm authorization with the project owner before generating an execution task.",
      },
    ];
  }

  if (question.category === "deployment" && value === "production") {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "safety_boundary",
        severity: "blocking",
        message: "Production deployment is outside the LoopZ MVP execution boundary.",
      },
    ];
  }

  if (question.category === "payments" && value === "real_payments") {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "approval_gate",
        severity: "warning",
        message: "The generated contract must include a human approval gate before real payments are enabled.",
      },
    ];
  }

  if (
    question.category === "data_handling" &&
    /\b(real patient|medical records?|credit card numbers?|bank credentials?)\b/i.test(value)
  ) {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "safety_boundary",
        severity: "blocking",
        message: "Real regulated or payment credential data is outside the current MVP boundary.",
      },
    ];
  }

  if (
    question.category === "repository_context" &&
    ["existing_app_feature", "bug_fix"].includes(intentTaskType) &&
    /\b(new project|from scratch|no existing (project|repo))\b/i.test(value)
  ) {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "contradiction",
        severity: "warning",
        message:
          "This answer describes a new project, but the intake was classified as work on an existing application. The contract must use the clarified answer.",
      },
    ];
  }

  if (
    question.category === "authentication" &&
    /\b(no auth|no authentication|sign[- ]in is not required|exclude (auth|sign[- ]in))\b/i.test(value)
  ) {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "contradiction",
        severity: "warning",
        message:
          "The intake implied authentication, but this answer removes it. The clarified scope must override the original inference.",
      },
    ];
  }

  if (question.category === "payments" && value === "exclude") {
    return [
      {
        questionId: question.id,
        category: question.category,
        kind: "contradiction",
        severity: "warning",
        message:
          "The original request mentioned payments, but the clarified MVP excludes them.",
      },
    ];
  }

  return [];
}

export function answerInterviewQuestion(
  sessionInput: InterviewSession,
  valueInput: string,
  answeredAt = new Date().toISOString(),
  detailsInput = "",
): InterviewSession {
  const session = interviewSessionSchema.parse(sessionInput);

  if (session.status !== "in_progress" || !session.currentQuestionId) {
    throw new Error("This interview is not waiting for an answer.");
  }

  const question = session.questions.find((item) => item.id === session.currentQuestionId);
  if (!question) throw new Error("The current interview question is missing.");

  const value = valueInput.trim();
  const details = detailsInput.trim();
  if (value.length < 2) throw new Error("Please provide a meaningful answer.");
  if (details.length > 2000) throw new Error("Additional loop details must be 2,000 characters or fewer.");
  if (
    question.answerKind === "choice" &&
    !question.options.some((option) => option.value === value)
  ) {
    throw new Error("Choose one of the available answers.");
  }

  const answer = {
    questionId: question.id,
    value,
    ...(details ? { details } : {}),
    answeredAt,
  };
  const issues = evaluateAnswer(question, value, session.intentTaskType);
  const answers = [...session.answers, answer];
  const hasBlockingIssue = issues.some((issue) => issue.severity === "blocking");
  const nextQuestion = session.questions[answers.length];

  return interviewSessionSchema.parse({
    ...session,
    status: hasBlockingIssue
      ? "blocked"
      : nextQuestion
        ? "in_progress"
        : "ready_for_contract",
    answers,
    currentQuestionId: hasBlockingIssue ? null : (nextQuestion?.id ?? null),
    issues: [...session.issues, ...issues],
    updatedAt: answeredAt,
  });
}
