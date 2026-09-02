import { readFileSync } from "node:fs";

import { evidenceSubmissionSchema, type EvidenceSubmission } from "@loopz/contracts/evidence";
import { runSchema } from "@loopz/contracts/run";
import { confirmedContractVersionSchema } from "@loopz/contracts/versioning";
import { describe, expect, it } from "vitest";

import { hashCanonicalValue } from "../canonical-hash";
import {
  applyAssessmentCorrection,
  compileAssessment,
  normalizeEvidenceItem,
} from "./compile-assessment";

async function fixtures() {
  const loopSpec = JSON.parse(readFileSync(
    new URL("../../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
    "utf8",
  ));
  const contractHash = await hashCanonicalValue(loopSpec);
  const version = confirmedContractVersionSchema.parse({
    schemaVersion: "0.2",
    versionId: "22222222-2222-4222-8222-222222222222",
    projectId: "11111111-1111-4111-8111-111111111111",
    version: 1,
    confirmedAt: "2026-09-02T10:00:00.000Z",
    confirmedBy: "user",
    contractHash,
    approvals: [],
    loopSpec,
  });
  const run = runSchema.parse({
    schemaVersion: "0.2",
    runId: "33333333-3333-4333-8333-333333333333",
    projectId: version.projectId,
    loopSpecVersion: "0.2",
    contractVersionId: version.versionId,
    contractVersion: version.version,
    contractHash,
    generatedAt: "2026-09-02T11:00:00.000Z",
    selectedOutputFormat: "codex",
    state: "evidence_submitted",
    repairAttempts: 0,
    createdAt: "2026-09-02T11:00:00.000Z",
    updatedAt: "2026-09-02T12:00:00.000Z",
  });
  const base = {
    schemaVersion: "0.2" as const,
    submissionId: "44444444-4444-4444-8444-444444444444",
    runId: run.runId,
    contractVersionId: version.versionId,
    contractHash,
    submittedAt: "2026-09-02T12:00:00.000Z",
    codingAgent: "Codex",
    finalReport: "AC-001 passed. AC-002 passed. AC-003 passed.",
    evidenceItems: [{
      id: "EV-001" as const,
      type: "test_output" as const,
      description: "Named component and integration tests",
      content: "feedback form > rejects invalid input passed\nfeedback form > stores valid input passed\n3 passed, 0 failed",
      command: "npm test",
      exitCode: 0,
    }],
    criteria: version.loopSpec.acceptance.criteria.map((criterion) => ({
      criterionId: criterion.id,
      claim: "passed" as const,
      evidenceIds: ["EV-001" as const],
    })),
    userNotes: "",
  };
  return { version, run, submission: evidenceSubmissionSchema.parse(base) };
}

async function assess(submission?: EvidenceSubmission) {
  const data = await fixtures();
  return compileAssessment({
    ...data,
    submission: submission ?? data.submission,
    assessmentId: "55555555-5555-4555-8555-555555555555",
    assessedAt: "2026-09-02T12:05:00.000Z",
  });
}

describe("compileAssessment", () => {
  it("verifies criteria only when submitted deterministic evidence supports them", async () => {
    const result = await assess();
    expect(result.criteria.every((item) => item.status === "verified_by_submitted_evidence")).toBe(true);
    expect(result.criteria.every((item) => item.evidenceStrength === "deterministic")).toBe(true);
    expect(result.outcome).toBe("completed_with_evidence");
    expect(result.assessmentVersion).toBe(1);
  });

  it("labels agent-only pass claims unsupported", async () => {
    const data = await fixtures();
    const submission = evidenceSubmissionSchema.parse({
      ...data.submission,
      evidenceItems: [{ id: "EV-001", type: "agent_report", description: "Agent report", content: data.submission.finalReport }],
    });
    const result = await assess(submission);
    expect(result.criteria.every((item) => item.status === "unsupported_claim")).toBe(true);
    expect(result.outcome).toBe("unverifiable_more_evidence_required");
  });

  it("uses failed output over a contradictory passed claim", async () => {
    const data = await fixtures();
    const submission = evidenceSubmissionSchema.parse({
      ...data.submission,
      evidenceItems: [{
        id: "EV-001", type: "test_output", description: "Test output",
        content: "1 failed", command: "npm test", exitCode: 1,
      }],
    });
    const result = await assess(submission);
    expect(result.criteria.every((item) => item.status === "failed")).toBe(true);
    expect(result.contradictions).toHaveLength(3);
    expect(result.outcome).toBe("repair_recommended");
  });

  it("stops when submitted evidence reports a restricted production action", async () => {
    const data = await fixtures();
    const submission = evidenceSubmissionSchema.parse({
      ...data.submission,
      finalReport: `${data.submission.finalReport} Deployed it to production.`,
    });
    const result = await assess(submission);
    expect(result.outcome).toBe("unsafe_or_out_of_scope");
    expect(result.contradictions.some((item) => item.includes("forbidden by the contract"))).toBe(true);
  });

  it("distinguishes blocked, not-attempted, and partially supported criteria", async () => {
    const data = await fixtures();
    const submission = evidenceSubmissionSchema.parse({
      ...data.submission,
      evidenceItems: [{ id: "EV-001", type: "diff_summary", description: "Files changed", content: "Changed form.tsx" }],
      criteria: [
        { criterionId: "AC-001", claim: "blocked", evidenceIds: ["EV-001"] },
        { criterionId: "AC-002", claim: "unverified", evidenceIds: [] },
        { criterionId: "AC-003", claim: "passed", evidenceIds: ["EV-001"] },
      ],
    });
    const result = await assess(submission);
    expect(result.criteria.map((item) => item.status)).toEqual([
      "blocked", "not_attempted", "partially_supported",
    ]);
    expect(result.outcome).toBe("blocked_human_input_required");
  });

  it("creates immutable correction revisions and recalculates the outcome", async () => {
    const original = await assess();
    const corrected = applyAssessmentCorrection({
      assessment: original,
      correctionId: "66666666-6666-4666-8666-666666666666",
      criterionId: "AC-002",
      correctedStatus: "failed",
      reason: "The stored record was manually inspected and is absent.",
      correctedAt: "2026-09-02T12:10:00.000Z",
      nextAssessmentId: "77777777-7777-4777-8777-777777777777",
    });
    expect(corrected.previousAssessmentId).toBe(original.assessmentId);
    expect(corrected.assessmentVersion).toBe(2);
    expect(corrected.outcome).toBe("repair_recommended");
    expect(corrected.corrections).toHaveLength(1);
    expect(original.criteria[1]?.status).toBe("verified_by_submitted_evidence");
  });

  it("rejects mismatched sources and invalid corrections", async () => {
    const data = await fixtures();
    await expect(compileAssessment({
      ...data,
      run: { ...data.run, contractHash: `sha256:${"a".repeat(64)}` },
      assessmentId: "55555555-5555-4555-8555-555555555555",
      assessedAt: "2026-09-02T12:05:00.000Z",
    })).rejects.toThrow("do not match");
    const original = await assess();
    expect(() => applyAssessmentCorrection({
      assessment: original,
      correctionId: "66666666-6666-4666-8666-666666666666",
      criterionId: "AC-999",
      correctedStatus: "failed",
      reason: "Incorrect parser result",
      correctedAt: "2026-09-02T12:10:00.000Z",
      nextAssessmentId: "77777777-7777-4777-8777-777777777777",
    })).toThrow("unknown criterion");
  });
});

describe("normalizeEvidenceItem", () => {
  it("uses exit codes before ambiguous wording", () => {
    expect(normalizeEvidenceItem({
      id: "EV-001", type: "command_output", description: "Test failures fixed",
      content: "All tests passed", exitCode: 0,
    })).toMatchObject({ supportsSuccess: true, reportsFailure: false, strength: "deterministic" });
  });

  it("does not interpret a zero-failure summary as a failure", () => {
    expect(normalizeEvidenceItem({
      id: "EV-001", type: "command_output", description: "Returned test output",
      content: "4 passed, 0 failed\nBuild completed successfully",
    })).toMatchObject({ supportsSuccess: true, reportsFailure: false });
  });

  it("does not mistake a report saying there were no errors for failed output", () => {
    expect(normalizeEvidenceItem({
      id: "EV-001", type: "agent_report", description: "Final report",
      content: "AC-001 passed without errors.",
    })).toMatchObject({ supportsSuccess: true, reportsFailure: false, strength: "agent_assertion" });
  });
});
