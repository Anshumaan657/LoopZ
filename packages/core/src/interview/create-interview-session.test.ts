import { describe, expect, it } from "vitest";

import { analyzeIdeaIntake } from "./analyze-idea-intake";
import {
  answerInterviewQuestion,
  createInterviewSession,
  selectClarificationQuestions,
} from "./create-interview-session";

const projectId = "11111111-1111-4111-8111-111111111111";
const now = "2026-08-28T00:00:00.000Z";

function acceptedAnalysis(prompt: string, overrides: Record<string, unknown> = {}) {
  const result = analyzeIdeaIntake({
    originalPrompt: prompt,
    mode: "guided",
    projectStatus: "new",
    projectContext: "",
    technologyPreferences: [],
    ...overrides,
  });

  if (!result.valid || result.suitability === "unsupported") {
    throw new Error("Test fixture must produce a supported intake analysis.");
  }

  return result;
}

describe("risk-based clarification interview", () => {
  it("selects no more than five unique questions with blocking risks first", () => {
    const analysis = acceptedAnalysis(
      "Build and deploy a professional customer portal where users login, store profile data, pay, and integrate an external API.",
    );

    const questions = selectClarificationQuestions(analysis, 5);

    expect(questions).toHaveLength(5);
    expect(new Set(questions.map((question) => question.category)).size).toBe(5);
    expect(questions[0]?.blocking).toBe(true);
    expect(questions.map((question) => question.id)).toEqual([
      "Q-001",
      "Q-002",
      "Q-003",
      "Q-004",
      "Q-005",
    ]);
  });

  it("is immediately ready when the request has no material unanswered questions", () => {
    const analysis = acceptedAnalysis(
      "Create a landing page where visitors view product details, and verify completion with a responsive browser test.",
    );
    expect(analysis.missingInformation).toEqual([]);
    expect(selectClarificationQuestions(analysis)).toEqual([]);
    const session = createInterviewSession({ projectId, analysis, startedAt: now });

    expect(session.status).toBe("ready_for_contract");
    expect(session.questions).toEqual([]);
    expect(session.currentQuestionId).toBeNull();
  });

  it("asks one question at a time and completes after the final answer", () => {
    const analysis = acceptedAnalysis("Add a profile settings page with a display name field.");
    const session = createInterviewSession({ projectId, analysis, startedAt: now });

    expect(session.status).toBe("in_progress");
    expect(session.currentQuestionId).toBe("Q-001");

    const afterFirst = answerInterviewQuestion(
      session,
      "A user updates their display name and sees a saved confirmation.",
      "2026-08-28T00:01:00.000Z",
    );
    expect(afterFirst.answers).toHaveLength(1);
    expect(afterFirst.currentQuestionId).toBe("Q-002");

    const completed = answerInterviewQuestion(
      afterFirst,
      "Run the profile component test and manually reload the saved value.",
      "2026-08-28T00:02:00.000Z",
    );
    expect(completed.status).toBe("ready_for_contract");
    expect(completed.currentQuestionId).toBeNull();
  });

  it("blocks when project authorization is absent or uncertain", () => {
    const analysis = acceptedAnalysis(
      "Add a tested notification panel to a client company repository using its existing Next.js stack.",
      { projectStatus: "existing" },
    );
    const session = createInterviewSession({ projectId, analysis, startedAt: now });

    expect(session.questions[0]?.category).toBe("authorization");

    const blocked = answerInterviewQuestion(
      session,
      "not_sure",
      "2026-08-28T00:01:00.000Z",
    );
    expect(blocked.status).toBe("blocked");
    expect(blocked.issues[0]).toEqual(expect.objectContaining({ severity: "blocking" }));
  });

  it("blocks production deployment but records real payments as an approval warning", () => {
    const deploymentAnalysis = acceptedAnalysis(
      "Deploy a tested landing page where visitors can view our product to production.",
    );
    const deploymentSession = createInterviewSession({
      projectId,
      analysis: deploymentAnalysis,
      startedAt: now,
    });
    const blocked = answerInterviewQuestion(deploymentSession, "production", now);
    expect(blocked.status).toBe("blocked");

    const paymentAnalysis = acceptedAnalysis(
      "Build checkout where customers can make a payment and verify success with an integration test.",
    );
    const paymentSession = createInterviewSession({
      projectId,
      analysis: paymentAnalysis,
      startedAt: now,
    });
    const warned = answerInterviewQuestion(paymentSession, "real_payments", now);
    expect(warned.issues).toContainEqual(
      expect.objectContaining({ category: "payments", severity: "warning" }),
    );
  });

  it("rejects answers that do not match a choice question", () => {
    const analysis = acceptedAnalysis(
      "Deploy a tested landing page where visitors view product details to production.",
    );
    const session = createInterviewSession({ projectId, analysis, startedAt: now });

    expect(() => answerInterviewQuestion(session, "maybe later", now)).toThrow(
      "Choose one of the available answers.",
    );
  });

  it("records an answer that conflicts with inferred repository status", () => {
    const analysis = acceptedAnalysis(
      "Add a profile view for users in my existing app and verify it with a browser test.",
      { projectStatus: "existing" },
    );
    const session = createInterviewSession({ projectId, analysis, startedAt: now });

    expect(session.questions[0]?.category).toBe("repository_context");
    const clarified = answerInterviewQuestion(
      session,
      "This is actually a new project from scratch using Next.js.",
      now,
    );

    expect(clarified.issues).toContainEqual(
      expect.objectContaining({ kind: "contradiction", severity: "warning" }),
    );
    expect(clarified.status).toBe("ready_for_contract");
  });
});
