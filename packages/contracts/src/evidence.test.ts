import { describe, expect, it } from "vitest";

import {
  anyEvidenceSubmissionSchema,
  evidenceReturnDraftSchema,
  evidenceSubmissionSchema,
} from "./evidence";

describe("evidence contracts", () => {
  it("accepts a user-facing evidence draft with explicit criterion claims", () => {
    expect(evidenceReturnDraftSchema.safeParse({
      codingAgent: "Codex",
      finalReport: "Implemented the form. AC-001 passed.",
      commandOutput: "npm test\n3 passed",
      diffSummary: "Changed form.tsx and form.test.tsx",
      userObservedProblems: "",
      manualChecks: "Submitted the form in a browser",
      userNotes: "",
      criterionClaims: [{ criterionId: "AC-001", claim: "passed" }],
    }).success).toBe(true);
  });

  it("requires immutable source identity on current submissions", () => {
    const result = evidenceSubmissionSchema.safeParse({
      schemaVersion: "0.2",
      submissionId: "33333333-3333-4333-8333-333333333333",
      runId: "44444444-4444-4444-8444-444444444444",
      contractVersionId: "22222222-2222-4222-8222-222222222222",
      contractHash: `sha256:${"a".repeat(64)}`,
      submittedAt: "2026-09-02T12:00:00.000Z",
      codingAgent: "Codex",
      finalReport: "AC-001 passed.",
      evidenceItems: [{
        id: "EV-001", type: "agent_report", description: "Coding agent final report",
        content: "AC-001 passed.",
      }],
      criteria: [{ criterionId: "AC-001", claim: "passed", evidenceIds: ["EV-001"] }],
      userNotes: "",
    });
    expect(result.success).toBe(true);
  });

  it("retains explicit parsing for legacy evidence history", () => {
    expect(anyEvidenceSubmissionSchema.safeParse({
      schemaVersion: "0.1", submissionId: "submission_001", runId: "run_001",
      submittedAt: "2026-08-27T00:05:00.000Z", finalReport: "AC-001 failed.",
      evidenceItems: [{ id: "EV-001", type: "test_output", description: "Tests", content: "1 failed" }],
      criteria: [{ criterionId: "AC-001", claim: "Failed", evidenceIds: ["EV-001"] }],
      userNotes: "",
    }).success).toBe(true);
  });
});
