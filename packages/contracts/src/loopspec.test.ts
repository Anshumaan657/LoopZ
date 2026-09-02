import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { anyAssessmentSchema } from "./assessment";
import { anyEvidenceSubmissionSchema } from "./evidence";
import {
  clarificationQuestionSchema,
  extractedUserIntentSchema,
  userAnswerSchema,
} from "./interview";
import { loopSpecLiteSchema, loopSpecLiteV01Schema } from "./loopspec";
import { anyRepairTaskSchema } from "./repair";
import { anyRunSchema } from "./run";

function readJson(relativePath: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../../../tests/fixtures/${relativePath}`, import.meta.url), "utf8"),
  );
}

describe("LoopSpec Lite contracts", () => {
  it("accepts the complete valid fixture", () => {
    expect(loopSpecLiteSchema.safeParse(readJson("loopspec/valid-small-web-project.json")).success).toBe(
      true,
    );
  });

  it("rejects criteria without required evidence", () => {
    const fixture = loopSpecLiteSchema.parse(
      readJson("loopspec/valid-small-web-project.json"),
    );
    fixture.acceptance.criteria[0]!.requiredEvidence = [];

    expect(loopSpecLiteSchema.safeParse(fixture).success).toBe(false);
  });

  it("rejects unknown fields to prevent silent contract drift", () => {
    const fixture = readJson("loopspec/valid-small-web-project.json") as Record<string, unknown>;
    fixture.providerInstructions = "Use a provider-specific hidden option";

    expect(loopSpecLiteSchema.safeParse(fixture).success).toBe(false);
  });

  it("requires commands in 0.2 while retaining explicit legacy 0.1 parsing", () => {
    const current = loopSpecLiteSchema.parse(readJson("loopspec/valid-small-web-project.json"));
    const { verificationCommands: _commands, ...legacyAcceptance } = current.acceptance;
    const legacy = { ...current, schemaVersion: "0.1", acceptance: legacyAcceptance };

    expect(loopSpecLiteV01Schema.safeParse(legacy).success).toBe(true);
    expect(loopSpecLiteSchema.safeParse(legacy).success).toBe(false);
    expect(current.acceptance.verificationCommands).toEqual(["npm test", "npm run build"]);
  });

  it("bounds the confirmed command section", () => {
    const missing = readJson("loopspec/valid-small-web-project.json") as {
      acceptance: Record<string, unknown>;
    };
    delete missing.acceptance.verificationCommands;
    expect(loopSpecLiteSchema.safeParse(missing).success).toBe(false);

    const tooMany = readJson("loopspec/valid-small-web-project.json") as {
      acceptance: { verificationCommands: string[] };
    };
    tooMany.acceptance.verificationCommands = Array.from({ length: 21 }, (_, index) =>
      `npm run check:${index}`,
    );
    expect(loopSpecLiteSchema.safeParse(tooMany).success).toBe(false);

    const tooLong = readJson("loopspec/valid-small-web-project.json") as {
      acceptance: { verificationCommands: string[] };
    };
    tooLong.acceptance.verificationCommands = ["x".repeat(1001)];
    expect(loopSpecLiteSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe("supporting Phase 2 contracts", () => {
  it("represents intent, questions, and answers", () => {
    const taskType = {
      value: "bug_fix",
      source: "user_selected",
      confidence: 1,
      explanation: "Selected by the user",
      confirmedByUser: true,
    } as const;

    expect(
      extractedUserIntentSchema.safeParse({
        originalPrompt: "Fix the broken form",
        taskType,
        goal: { ...taskType, value: "Make the form submit successfully" },
        requestedCapabilities: ["Submit the form"],
        constraints: ["Keep the current stack"],
        unknowns: ["Expected error behavior"],
      }).success,
    ).toBe(true);

    expect(
      clarificationQuestionSchema.safeParse({
        id: "Q-001",
        category: "primary_flow",
        prompt: "What should happen after submission?",
        rationale: "Defines the observable success state",
        blocking: true,
        priority: 1,
      }).success,
    ).toBe(true);

    expect(
      userAnswerSchema.safeParse({
        questionId: "Q-001",
        value: "Show a success message",
        answeredAt: "2026-08-27T00:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("represents the full run-to-evidence-to-assessment-to-repair trace", () => {
    const run = {
      schemaVersion: "0.1",
      runId: "run_001",
      projectId: "project_001",
      loopSpecVersion: "0.1",
      state: "assessed",
      repairAttempts: 0,
      createdAt: "2026-08-27T00:00:00.000Z",
      updatedAt: "2026-08-27T00:10:00.000Z",
    };
    const evidence = {
      schemaVersion: "0.1",
      submissionId: "submission_001",
      runId: "run_001",
      submittedAt: "2026-08-27T00:05:00.000Z",
      finalReport: "AC-001 failed during the integration test.",
      evidenceItems: [
        {
          id: "EV-001",
          type: "test_output",
          description: "Integration test output",
          content: "1 failed",
          command: "npm test",
          exitCode: 1,
        },
      ],
      criteria: [{ criterionId: "AC-001", claim: "Failed", evidenceIds: ["EV-001"] }],
      userNotes: "",
    };
    const assessment = {
      schemaVersion: "0.1",
      assessmentId: "assessment_001",
      runId: "run_001",
      evidenceSubmissionId: "submission_001",
      outcome: "repair_recommended",
      criteria: [
        {
          criterionId: "AC-001",
          status: "failed",
          evidenceReferences: ["EV-001"],
          explanation: "The required integration test failed.",
          confidence: 1,
        },
      ],
      risks: [],
      recommendedNextAction: "Repair AC-001",
      assessedAt: "2026-08-27T00:10:00.000Z",
    };
    const repair = {
      schemaVersion: "0.1",
      repairId: "repair_001",
      parentRunId: "run_001",
      parentAssessmentId: "assessment_001",
      attempt: 1,
      unresolvedCriterionIds: ["AC-001"],
      preservedCriterionIds: [],
      failureEvidenceIds: ["EV-001"],
      instructions: "Repair only the failed submission behavior.",
      requiredRegressionChecks: ["npm test"],
      stopWhen: ["The same failure repeats twice"],
    };

    expect(anyRunSchema.safeParse(run).success).toBe(true);
    expect(anyEvidenceSubmissionSchema.safeParse(evidence).success).toBe(true);
    expect(anyAssessmentSchema.safeParse(assessment).success).toBe(true);
    expect(anyRepairTaskSchema.safeParse(repair).success).toBe(true);
  });
});
