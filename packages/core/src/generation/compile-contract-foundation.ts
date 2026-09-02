import type {
  IdeaIntake,
  InterviewQuestion,
  InterviewSession,
  UserAnswer,
} from "@loopz/contracts/intake";
import {
  contractFoundationSchema,
  type ContractFoundation,
  type DecisionSource,
  type TaskType,
} from "@loopz/contracts/loopspec";

import type { IntakeAnalysis } from "../interview/analyze-idea-intake";

type AcceptedIntakeAnalysis = Extract<IntakeAnalysis, { valid: true }>;

export type ContractFoundationInput = {
  projectId: string;
  intake: IdeaIntake;
  analysis: AcceptedIntakeAnalysis;
  interview: InterviewSession;
  compiledAt?: string;
};

type Decision<T> = {
  value: T;
  source: DecisionSource;
  confidence: number;
  explanation: string;
  confirmedByUser: boolean;
};

type InterviewDecision = {
  question: InterviewQuestion;
  answer: UserAnswer;
  displayValue: string;
};

type ScopeCandidate = {
  description: string;
  confirmedInInterview: boolean;
};

function normalizeForDeduplication(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function uniqueScopeCandidates(candidates: ScopeCandidate[]): ScopeCandidate[] {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const normalized = normalizeForDeduplication(candidate.description);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function decision<T>(input: Decision<T>): Decision<T> {
  return input;
}

function pairInterviewDecisions(session: InterviewSession): InterviewDecision[] {
  return session.answers.map((answer) => {
    const question = session.questions.find((item) => item.id === answer.questionId);
    if (!question) throw new Error(`Interview answer references missing question ${answer.questionId}.`);

    const selectedOption = question.options.find((option) => option.value === answer.value);
    return {
      question,
      answer,
      displayValue: selectedOption?.label ?? answer.value,
    };
  });
}

function scopePrefix(category: InterviewQuestion["category"]): string {
  const labels: Partial<Record<InterviewQuestion["category"], string>> = {
    primary_flow: "Primary user flow",
    roles_and_access: "Roles and access",
    authentication: "Authentication",
    data_handling: "Data handling",
    payments: "Payments",
    external_integrations: "External integration",
    deployment: "Deployment",
    scope: "Scope boundary",
    visual_behavior: "Visual behavior",
  };

  return labels[category] ?? category.replaceAll("_", " ");
}

function includedInterviewScope(decisions: InterviewDecision[]): string[] {
  return decisions.flatMap(({ question, answer, displayValue }) => {
    if (["authorization", "repository_context", "verification"].includes(question.category)) {
      return [];
    }

    if (
      (question.category === "payments" || question.category === "deployment") &&
      answer.value === "exclude"
    ) {
      return [];
    }

    if (
      question.category === "authentication" &&
      /\b(no auth|no authentication|sign[- ]in is not required|exclude (auth|sign[- ]in))\b/i.test(
        answer.value,
      )
    ) {
      return [];
    }

    return [`${scopePrefix(question.category)}: ${displayValue}`];
  });
}

function excludedInterviewScope(decisions: InterviewDecision[]): string[] {
  return decisions.flatMap(({ question, answer }) => {
    if (question.category === "payments" && answer.value === "exclude") {
      return ["Payment functionality"];
    }
    if (question.category === "deployment" && answer.value === "exclude") {
      return ["Deployment"];
    }
    if (
      question.category === "authentication" &&
      /\b(no auth|no authentication|sign[- ]in is not required|exclude (auth|sign[- ]in))\b/i.test(
        answer.value,
      )
    ) {
      return ["Authentication"];
    }
    return [];
  });
}

function explicitConstraintExclusions(constraints: string[]): string[] {
  return constraints
    .filter((constraint) => /\b(do not|don't|without|exclude)\b/i.test(constraint))
    .map((constraint) => constraint.replace(/^.*?\b(do not|don't|without|exclude)\b[:\s-]*/i, ""))
    .filter(Boolean);
}

function conflictsWithExclusion(description: string, exclusion: string): boolean {
  const normalizedDescription = normalizeForDeduplication(description);
  const normalizedExclusion = normalizeForDeduplication(exclusion);

  if (normalizedExclusion === "payment functionality") {
    return /\b(payment|payments|checkout|billing|subscription)\b/i.test(description);
  }
  if (normalizedExclusion === "deployment") {
    return /\b(deploy|deployment|production|staging|hosting)\b/i.test(description);
  }
  if (normalizedExclusion === "authentication") {
    return /\b(authentication|login|log in|sign in|sign-in)\b/i.test(description);
  }

  return (
    normalizedExclusion.length >= 4 && normalizedDescription.includes(normalizedExclusion)
  );
}

function findDecision(
  decisions: InterviewDecision[],
  category: InterviewQuestion["category"],
): InterviewDecision | undefined {
  return decisions.find((item) => item.question.category === category);
}

function resolveProjectStatus(
  intake: IdeaIntake,
  taskType: TaskType,
  repositoryDecision: InterviewDecision | undefined,
): Decision<"new" | "existing"> {
  if (repositoryDecision) {
    if (/\b(new project|from scratch|greenfield)\b/i.test(repositoryDecision.answer.value)) {
      return decision({
        value: "new",
        source: "user_provided",
        confidence: 1,
        explanation: `Clarified in ${repositoryDecision.question.id}.`,
        confirmedByUser: true,
      });
    }
    if (/\b(existing|repository|repo|codebase|current app)\b/i.test(repositoryDecision.answer.value)) {
      return decision({
        value: "existing",
        source: "user_provided",
        confidence: 1,
        explanation: `Clarified in ${repositoryDecision.question.id}.`,
        confirmedByUser: true,
      });
    }
  }

  if (intake.projectStatus !== "unknown") {
    return decision({
      value: intake.projectStatus,
      source: "user_selected",
      confidence: 1,
      explanation: "Selected during idea intake.",
      confirmedByUser: true,
    });
  }

  const inferredStatus = ["existing_app_feature", "bug_fix"].includes(taskType)
    ? "existing"
    : "new";
  return decision({
    value: inferredStatus,
    source: "inferred",
    confidence: 0.8,
    explanation: "Inferred from the supported task classification.",
    confirmedByUser: false,
  });
}

function resolveProjectContext(
  intake: IdeaIntake,
  projectStatus: "new" | "existing",
  repositoryDecision: InterviewDecision | undefined,
): Decision<string> {
  if (repositoryDecision) {
    return decision({
      value: repositoryDecision.answer.value,
      source: "user_provided",
      confidence: 1,
      explanation: `Repository context supplied in ${repositoryDecision.question.id}.`,
      confirmedByUser: true,
    });
  }

  if (intake.projectContext) {
    return decision({
      value: intake.projectContext,
      source: "user_provided",
      confidence: 1,
      explanation: "Repository context supplied during idea intake.",
      confirmedByUser: true,
    });
  }

  return decision({
    value:
      projectStatus === "existing"
        ? "Inspect the existing repository and preserve its established conventions."
        : "A new project will be initialized after the technology choices are confirmed.",
    source: "recommended",
    confidence: 0.6,
    explanation: "No detailed repository context was supplied.",
    confirmedByUser: false,
  });
}

function technologyPreferences(
  intake: IdeaIntake,
  projectStatus: "new" | "existing",
): Array<Decision<string>> {
  if (intake.technologyPreferences.length > 0) {
    return intake.technologyPreferences.map((preference) =>
      decision({
        value: preference,
        source: "user_provided",
        confidence: 1,
        explanation: "Technology preference supplied during idea intake.",
        confirmedByUser: true,
      }),
    );
  }

  return [
    decision({
      value:
        projectStatus === "existing"
          ? "Preserve the existing stack and package manager."
          : "Choose a stable stack compatible with the confirmed requirements.",
      source: "recommended",
      confidence: 0.7,
      explanation: "No explicit technology preference was supplied.",
      confirmedByUser: false,
    }),
  ];
}

export function compileContractFoundation(input: ContractFoundationInput): ContractFoundation {
  const { intake, analysis, interview } = input;

  if (analysis.suitability === "unsupported") {
    throw new Error("Unsupported intake cannot be compiled into a contract.");
  }
  if (interview.projectId !== input.projectId) {
    throw new Error("Interview project ID does not match the contract project ID.");
  }
  if (interview.status !== "ready_for_contract") {
    throw new Error("Interview must be ready for contract generation.");
  }
  if (interview.answers.length !== interview.questions.length) {
    throw new Error("Every selected clarification question must have an answer.");
  }
  if (interview.issues.some((issue) => issue.severity === "blocking")) {
    throw new Error("Blocking interview issues must be resolved before contract generation.");
  }
  if (interview.intentTaskType !== analysis.intent.taskType.value) {
    throw new Error("Interview task type does not match the intake analysis.");
  }
  if (analysis.intent.originalPrompt !== intake.originalPrompt) {
    throw new Error("Intake prompt does not match the analyzed original prompt.");
  }

  const pairedDecisions = pairInterviewDecisions(interview);
  const repositoryDecision = findDecision(pairedDecisions, "repository_context");
  const projectStatus = resolveProjectStatus(
    intake,
    analysis.intent.taskType.value,
    repositoryDecision,
  );
  const projectContext = resolveProjectContext(
    intake,
    projectStatus.value,
    repositoryDecision,
  );
  const excludedCandidates = uniqueScopeCandidates([
    ...explicitConstraintExclusions(analysis.intent.constraints).map((description) => ({
      description,
      confirmedInInterview: false,
    })),
    ...excludedInterviewScope(pairedDecisions).map((description) => ({
      description,
      confirmedInInterview: true,
    })),
  ]);
  const includedCandidates = uniqueScopeCandidates([
    ...analysis.intent.requestedCapabilities.map((description) => ({
      description,
      confirmedInInterview: false,
    })),
    ...includedInterviewScope(pairedDecisions).map((description) => ({
      description,
      confirmedInInterview: true,
    })),
  ]).filter(
    (candidate) =>
      !excludedCandidates.some((excluded) =>
        conflictsWithExclusion(candidate.description, excluded.description),
      ),
  );

  if (includedCandidates.length === 0) {
    throw new Error("No included scope remains after applying the user’s exclusions.");
  }
  const assumptions = analysis.intent.constraints
    .filter((constraint) => !/\b(do not|don't|without|exclude)\b/i.test(constraint))
    .map((constraint) =>
      decision({
        value: constraint,
        source: "user_provided" as const,
        confidence: 1,
        explanation: "Constraint supplied in the original request.",
        confirmedByUser: false,
      }),
    );

  return contractFoundationSchema.parse({
    schemaVersion: "0.2",
    status: "foundation_draft",
    projectId: input.projectId,
    compilation: {
      sourceInterviewUpdatedAt: interview.updatedAt,
      compiledAt: input.compiledAt ?? interview.updatedAt,
    },
    request: {
      originalPrompt: intake.originalPrompt,
      taskType: analysis.intent.taskType,
    },
    objective: {
      goal: analysis.intent.goal,
      deliverables: includedCandidates.map((candidate, index) => ({
        id: `REQ-${String(index + 1).padStart(3, "0")}`,
        description: candidate.description,
        priority: "required",
        provenance: decision({
          value: candidate.description,
          source: "user_provided",
          confidence: 1,
          explanation: candidate.confirmedInInterview
            ? "Clarified by the user during the interview."
            : "Extracted from the user’s original request.",
          confirmedByUser: candidate.confirmedInInterview,
        }),
      })),
    },
    scope: {
      included: includedCandidates.map((candidate, index) => ({
        id: `SCOPE-IN-${String(index + 1).padStart(3, "0")}`,
        description: candidate.description,
        provenance: decision({
          value: candidate.description,
          source: "user_provided",
          confidence: 1,
          explanation: candidate.confirmedInInterview
            ? "Clarified by the user during the interview."
            : "Extracted from the user’s original request.",
          confirmedByUser: candidate.confirmedInInterview,
        }),
      })),
      excluded: excludedCandidates.map((candidate, index) => ({
        id: `SCOPE-OUT-${String(index + 1).padStart(3, "0")}`,
        description: candidate.description,
        provenance: decision({
          value: candidate.description,
          source: "user_provided",
          confidence: 1,
          explanation: "Explicitly excluded by the user’s request or clarification answer.",
          confirmedByUser: candidate.confirmedInInterview,
        }),
      })),
      assumptions,
    },
    environment: {
      projectStatus,
      projectContext,
      technologyPreferences: technologyPreferences(intake, projectStatus.value),
    },
    interviewDecisions: pairedDecisions.map(({ question, answer, displayValue }) => ({
      questionId: question.id,
      category: question.category,
      question: question.prompt,
      answer: displayValue,
      answeredAt: answer.answeredAt,
    })),
    pendingSections: ["acceptance", "safety", "limits", "final_report"],
  });
}
