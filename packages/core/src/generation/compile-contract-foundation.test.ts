import { describe, expect, it } from "vitest";

import type { IdeaIntake, InterviewSession, RiskCategory } from "@loopz/contracts/intake";
import { contractFoundationSchema } from "@loopz/contracts/loopspec";

import { analyzeIdeaIntake, type IntakeAnalysis } from "../interview/analyze-idea-intake";
import {
  answerInterviewQuestion,
  createInterviewSession,
} from "../interview/create-interview-session";
import { compileContractFoundation } from "./compile-contract-foundation";

const projectId = "11111111-1111-4111-8111-111111111111";
const startedAt = "2026-08-28T10:00:00.000Z";
type AcceptedAnalysis = Extract<IntakeAnalysis, { valid: true }>;

function analyze(intake: IdeaIntake): AcceptedAnalysis {
  const analysis = analyzeIdeaIntake(intake);
  if (!analysis.valid || analysis.suitability === "unsupported") {
    throw new Error("Fixture must produce a supported intake analysis.");
  }
  return analysis;
}

function completeInterview(
  analysis: AcceptedAnalysis,
  answers: Partial<Record<RiskCategory, string>> = {},
): InterviewSession {
  let session = createInterviewSession({ projectId, analysis, startedAt });
  let minute = 1;

  while (session.status === "in_progress") {
    const question = session.questions.find((item) => item.id === session.currentQuestionId);
    if (!question) throw new Error("Fixture interview lost its current question.");

    const defaults: Record<RiskCategory, string> = {
      authorization: "authorized",
      primary_flow: "A user completes the main action and sees a confirmation.",
      roles_and_access: "Members manage their own data; admins can review all records.",
      authentication: "Use the existing email-and-password authentication flow.",
      data_handling: "Store only the required profile fields; users can delete their own data.",
      payments: "prototype",
      external_integrations: "Use a local mock until service credentials are available.",
      repository_context: "Existing Next.js repository using npm and TypeScript.",
      deployment: "local_preview",
      verification: "Run npm test and npm run build, then manually verify the main flow.",
      scope: "Implement the core flow and postpone analytics and notifications.",
      visual_behavior: "Reuse the existing design system at mobile and desktop widths.",
    };

    session = answerInterviewQuestion(
      session,
      answers[question.category] ?? defaults[question.category],
      `2026-08-28T10:${String(minute).padStart(2, "0")}:00.000Z`,
    );
    minute += 1;
  }

  if (session.status !== "ready_for_contract") {
    throw new Error("Fixture interview must be ready for contract generation.");
  }
  return session;
}

describe("compileContractFoundation", () => {
  it("compiles stable requirements, scope, environment, and interview provenance", () => {
    const intake: IdeaIntake = {
      originalPrompt:
        "Add a profile settings page to my existing Next.js app where users login, update their display name, and save it in PostgreSQL.",
      mode: "guided",
      projectStatus: "unknown",
      projectContext: "",
      technologyPreferences: [],
    };
    const analysis = analyze(intake);
    const interview = completeInterview(analysis);
    const foundation = compileContractFoundation({ projectId, intake, analysis, interview });

    expect(contractFoundationSchema.safeParse(foundation).success).toBe(true);
    expect(foundation.status).toBe("foundation_draft");
    expect(foundation.objective.deliverables.map((item) => item.id)).toEqual(
      foundation.objective.deliverables.map((_, index) =>
        `REQ-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(foundation.scope.included.map((item) => item.id)).toEqual(
      foundation.scope.included.map((_, index) =>
        `SCOPE-IN-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(foundation.environment.projectStatus.value).toBe("existing");
    expect(foundation.interviewDecisions).toHaveLength(interview.answers.length);
    expect(foundation.interviewDecisions[0]).toEqual(
      expect.objectContaining({ questionId: "Q-001", answeredAt: expect.any(String) }),
    );
    expect(foundation.pendingSections).toEqual([
      "acceptance",
      "safety",
      "limits",
      "final_report",
    ]);
  });

  it("is deterministic when the source state is unchanged", () => {
    const intake: IdeaIntake = {
      originalPrompt:
        "Create a landing page where visitors view product details and verify it with a responsive browser test.",
      mode: "geek",
      projectStatus: "new",
      projectContext: "New TypeScript project",
      technologyPreferences: ["Next.js", "Use the supplied design tokens"],
    };
    const analysis = analyze(intake);
    const interview = completeInterview(analysis);

    const first = compileContractFoundation({ projectId, intake, analysis, interview });
    const second = compileContractFoundation({ projectId, intake, analysis, interview });

    expect(second).toEqual(first);
    expect(first.compilation.compiledAt).toBe(interview.updatedAt);
    expect(first.environment.projectContext).toEqual(
      expect.objectContaining({ source: "user_provided", confirmedByUser: true }),
    );
    expect(first.environment.technologyPreferences.map((item) => item.value)).toEqual([
      "Next.js",
      "Use the supplied design tokens",
    ]);
  });

  it("uses a repository clarification to override inferred project status", () => {
    const intake: IdeaIntake = {
      originalPrompt:
        "Add a profile view for users in my existing app and verify it with a browser test.",
      mode: "guided",
      projectStatus: "unknown",
      projectContext: "",
      technologyPreferences: [],
    };
    const analysis = analyze(intake);
    const interview = completeInterview(analysis, {
      repository_context: "This is actually a new project from scratch using Next.js.",
    });
    const foundation = compileContractFoundation({ projectId, intake, analysis, interview });

    expect(foundation.environment.projectStatus).toEqual(
      expect.objectContaining({
        value: "new",
        source: "user_provided",
        confirmedByUser: true,
      }),
    );
    expect(foundation.environment.projectContext.value).toContain("new project from scratch");
  });

  it("records an explicitly excluded capability outside included scope", () => {
    const intake: IdeaIntake = {
      originalPrompt:
        "Build a product catalog where customers view available items. Add checkout so customers can make a payment. Verify the catalog with an integration test.",
      mode: "guided",
      projectStatus: "new",
      projectContext: "",
      technologyPreferences: [],
    };
    const analysis = analyze(intake);
    const interview = completeInterview(analysis, { payments: "exclude" });
    const foundation = compileContractFoundation({ projectId, intake, analysis, interview });

    expect(foundation.scope.excluded).toContainEqual(
      expect.objectContaining({ description: "Payment functionality" }),
    );
    expect(
      foundation.scope.included.some((item) => /\b(payment|checkout)\b/i.test(item.description)),
    ).toBe(false);
  });

  it("rejects incomplete, blocked, and mismatched source state", () => {
    const intake: IdeaIntake = {
      originalPrompt: "Add a display name field to the profile page.",
      mode: "guided",
      projectStatus: "existing",
      projectContext: "Existing TypeScript application",
      technologyPreferences: [],
    };
    const analysis = analyze(intake);
    const inProgress = createInterviewSession({ projectId, analysis, startedAt });

    expect(() =>
      compileContractFoundation({ projectId, intake, analysis, interview: inProgress }),
    ).toThrow("Interview must be ready for contract generation.");

    const completed = completeInterview(analysis);
    expect(() =>
      compileContractFoundation({
        projectId: "22222222-2222-4222-8222-222222222222",
        intake,
        analysis,
        interview: completed,
      }),
    ).toThrow("Interview project ID does not match");

    expect(() =>
      compileContractFoundation({
        projectId,
        intake: { ...intake, originalPrompt: `${intake.originalPrompt} changed` },
        analysis,
        interview: completed,
      }),
    ).toThrow("Intake prompt does not match");
  });
});
