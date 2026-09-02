import {
  ideaIntakeSchema,
  type ExtractedUserIntent,
  type IdeaIntake,
  type IntakeSuitability,
  type IntakeTaskType,
  type MissingInformation,
} from "@loopz/contracts/intake";

export type IntakeFieldIssue = {
  path: string;
  message: string;
};

export type IntakeAnalysis =
  | {
      valid: false;
      issues: IntakeFieldIssue[];
    }
  | {
      valid: true;
      suitability: IntakeSuitability;
      intent: ExtractedUserIntent;
      missingInformation: MissingInformation[];
      rejectionReasons: string[];
      warnings: string[];
    };

const unsupportedPatterns: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\b(native\s+)?(ios|android|mobile)\s+app\b/i,
    reason: "Native mobile applications are outside the initial web-project MVP.",
  },
  {
    pattern: /\b(desktop app|electron app|windows app|macos app)\b/i,
    reason: "Desktop applications are outside the initial web-project MVP.",
  },
  {
    pattern: /\b(video game|unity|unreal engine|game engine)\b/i,
    reason: "Game-development projects are outside the initial MVP.",
  },
  {
    pattern: /\b(smart contract|solidity|cryptocurrency token)\b/i,
    reason: "Blockchain and smart-contract projects are outside the initial MVP.",
  },
  {
    pattern: /\b(diagnose patients?|medical diagnosis|legal advice engine)\b/i,
    reason: "High-risk regulated decision systems require specialist review and are unsupported.",
  },
];

const unsafePatterns: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\b(ransomware|credential stealer|steal passwords?|phishing kit)\b/i,
    reason: "The request appears to involve credential theft or malicious software.",
  },
  {
    pattern: /\b(bypass authentication|evade detection|disable security controls?)\b/i,
    reason: "The request asks to bypass security controls.",
  },
];

function classifyTaskType(intake: IdeaIntake): IntakeTaskType {
  const prompt = intake.originalPrompt.toLocaleLowerCase();

  if (/\b(fix|bug|broken|error|issue|crash|not working|regression)\b/.test(prompt)) {
    return "bug_fix";
  }

  if (/\b(landing page|marketing page|product page|waitlist page)\b/.test(prompt)) {
    return "landing_page";
  }

  if (
    intake.projectStatus === "existing" ||
    /\b(add|integrate|extend|update|change|refactor|existing|current|my app|our app)\b/.test(
      prompt,
    )
  ) {
    return "existing_app_feature";
  }

  return "new_web_application";
}

function inferGoal(prompt: string): string {
  return prompt
    .trim()
    .replace(/^(please\s+|can you\s+|i want (you )?to\s+)/i, "")
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "");
}

function splitPromptSegments(prompt: string): string[] {
  return prompt.split(/\n+|[!?]+|\.(?=\s|$)/);
}

function extractCapabilities(prompt: string): string[] {
  const candidates = splitPromptSegments(prompt)
    .map((part) => part.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((part) => part.length >= 6);

  return [...new Set(candidates)].slice(0, 8);
}

function extractConstraints(intake: IdeaIntake): string[] {
  const promptConstraints = splitPromptSegments(intake.originalPrompt)
    .map((part) => part.trim())
    .filter((part) =>
      /\b(must|only|without|do not|don't|keep|existing stack|use\s+[a-z])\b/i.test(part),
    );

  return [
    ...new Set([
      ...promptConstraints,
      ...intake.technologyPreferences.map((item) => `Technology preference: ${item}`),
    ]),
  ].slice(0, 12);
}

function detectMissingInformation(intake: IdeaIntake): MissingInformation[] {
  const prompt = intake.originalPrompt.toLocaleLowerCase();
  const missing: MissingInformation[] = [];
  const signalsExistingProject =
    /\b(existing|current|my app|our app|codebase|repository|repo)\b/.test(prompt);
  const signalsNewProject = /\b(new project|from scratch|start fresh|greenfield)\b/.test(prompt);
  const providesStackContext =
    /\b(next(?:\.js)?|react|vue|angular|svelte|typescript|javascript|node(?:\.js)?|django|rails|laravel)\b/.test(
      prompt,
    );

  if (intake.projectStatus === "unknown" && !signalsExistingProject && !signalsNewProject) {
    missing.push({
      category: "repository_context",
      reason: "It is unclear whether this starts a new project or changes an existing one.",
      blocking: false,
      priority: 2,
    });
  }

  if (
    (intake.projectStatus === "existing" || signalsExistingProject) &&
    !intake.projectContext &&
    !providesStackContext
  ) {
    missing.push({
      category: "repository_context",
      reason: "The request changes an existing project but does not describe its stack or repository.",
      blocking: false,
      priority: 2,
    });
  }

  if (!/\b(users?|visitors?|customers?|admins?|owners?|teams?|clients?|members?)\b/.test(prompt)) {
    missing.push({
      category: "primary_flow",
      reason: "The main user and their successful end-to-end action are not explicit.",
      blocking: false,
      priority: 1,
    });
  }

  if (!/\b(test|verify|acceptance|success means|done when)\b/.test(prompt)) {
    missing.push({
      category: "verification",
      reason: "The request does not explain how successful completion should be verified.",
      blocking: false,
      priority: 2,
    });
  }

  if (/\b(login|sign in|sign up|authentication|account|role|permission)\b/.test(prompt)) {
    if (!/\b(email|password|google|github|oauth|magic link|clerk|auth0|supabase)\b/.test(prompt)) {
      missing.push({
        category: "authentication",
        reason: "Authentication is requested but the method or provider is not specified.",
        blocking: true,
        priority: 1,
      });
    }
  }

  if (/\b(payment|checkout|subscription|billing|stripe|razorpay)\b/.test(prompt)) {
    if (!/\b(one[- ]time|monthly|annual|free trial|refund|currency|price)\b/.test(prompt)) {
      missing.push({
        category: "payments",
        reason: "Payment behavior is requested without a clear pricing or transaction model.",
        blocking: true,
        priority: 1,
      });
    }
  }

  if (/\b(store|save|database|upload|personal data|customer data|form)\b/.test(prompt)) {
    if (!/\b(postgres|mysql|sqlite|mongodb|supabase|firebase|retention|delete)\b/.test(prompt)) {
      missing.push({
        category: "data_handling",
        reason: "The request handles data but does not define storage or retention expectations.",
        blocking: false,
        priority: 3,
      });
    }
  }

  if (/\b(integrate|third[- ]party|external api|webhook)\b/.test(prompt)) {
    if (!/\b(stripe|github|google|slack|twilio|sendgrid|resend|openai)\b/.test(prompt)) {
      missing.push({
        category: "external_integrations",
        reason: "An external integration is requested without naming the service or API.",
        blocking: true,
        priority: 2,
      });
    }
  }

  return missing.sort((a, b) => a.priority - b.priority);
}

function detectRejectionReasons(prompt: string): string[] {
  return [...unsafePatterns, ...unsupportedPatterns]
    .filter((item) => item.pattern.test(prompt))
    .map((item) => item.reason);
}

export function analyzeIdeaIntake(input: unknown): IntakeAnalysis {
  const parsed = ideaIntakeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  const intake = parsed.data;
  const taskType = classifyTaskType(intake);
  const missingInformation = detectMissingInformation(intake);
  const rejectionReasons = detectRejectionReasons(intake.originalPrompt);
  const capabilities = extractCapabilities(intake.originalPrompt);
  const constraints = extractConstraints(intake);
  const goal = inferGoal(intake.originalPrompt);
  const suitability: IntakeSuitability =
    rejectionReasons.length > 0
      ? "unsupported"
      : missingInformation.length > 0
        ? "needs_clarification"
        : "ready_for_interview";
  const confidence = rejectionReasons.length > 0 ? 0.5 : taskType === "new_web_application" ? 0.72 : 0.9;

  return {
    valid: true,
    suitability,
    intent: {
      originalPrompt: intake.originalPrompt,
      taskType: {
        value: taskType,
        source: "inferred",
        confidence,
        explanation: "Classified deterministically from the request and selected project status.",
        confirmedByUser: false,
      },
      goal: {
        value: goal,
        source: "inferred",
        confidence: 0.75,
        explanation: "Normalized from the unchanged original request for confirmation.",
        confirmedByUser: false,
      },
      requestedCapabilities: capabilities.length > 0 ? capabilities : [goal],
      constraints,
      unknowns: missingInformation.map((item) => item.reason),
    },
    missingInformation,
    rejectionReasons,
    warnings:
      intake.mode === "guided"
        ? ["Technical choices will be proposed later and require confirmation."]
        : [],
  };
}
