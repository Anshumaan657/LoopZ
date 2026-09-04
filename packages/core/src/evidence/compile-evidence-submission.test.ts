import { readFileSync } from "node:fs";

import { evidenceReturnDraftSchema } from "@loopz/contracts/evidence";
import { runSchema } from "@loopz/contracts/run";
import { confirmedContractVersionSchema } from "@loopz/contracts/versioning";
import { describe, expect, it } from "vitest";

import { hashCanonicalValue } from "../canonical-hash";
import { compileEvidenceSubmission, relevantEvidenceSources } from "./compile-evidence-submission";

async function fixtures() {
  const loopSpec = JSON.parse(readFileSync(
    new URL("../../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
    "utf8",
  ));
  const contractHash = await hashCanonicalValue(loopSpec);
  const version = confirmedContractVersionSchema.parse({
    schemaVersion: "0.2", versionId: "22222222-2222-4222-8222-222222222222",
    projectId: "11111111-1111-4111-8111-111111111111", version: 1,
    confirmedAt: "2026-09-02T10:00:00.000Z", confirmedBy: "user",
    contractHash, approvals: [], loopSpec,
  });
  const run = runSchema.parse({
    schemaVersion: "0.2", runId: "33333333-3333-4333-8333-333333333333",
    projectId: version.projectId, loopSpecVersion: "0.2", contractVersionId: version.versionId,
    contractVersion: version.version, contractHash, generatedAt: "2026-09-02T11:00:00.000Z",
    selectedOutputFormat: "codex", state: "awaiting_evidence", repairAttempts: 0,
    createdAt: "2026-09-02T11:00:00.000Z", updatedAt: "2026-09-02T11:30:00.000Z",
  });
  const draft = evidenceReturnDraftSchema.parse({
    codingAgent: "Codex",
    finalReport: "AC-001 passed. AC-002 passed. AC-003 passed.",
    commandOutput: "npm test\n3 passed",
    diffSummary: "Changed feedback-form.tsx and feedback-form.test.tsx",
    userObservedProblems: "",
    manualChecks: "Submitted valid and invalid forms in a browser",
    userNotes: "No additional notes",
    criterionClaims: version.loopSpec.acceptance.criteria.map((criterion) => ({
      criterionId: criterion.id, claim: "passed" as const,
    })),
  });
  return { version, run, draft };
}

describe("compileEvidenceSubmission", () => {
  it("maps automated tests to command evidence and manual checks to observations", () => {
    expect([...relevantEvidenceSources("Run npm test")]).toEqual(["command"]);
    expect([...relevantEvidenceSources("Manual browser check")]).toEqual(["observation", "manual"]);
  });

  it("preserves raw evidence and maps it to every stable criterion ID", async () => {
    const input = await fixtures();
    const submission = await compileEvidenceSubmission({
      ...input, submissionId: "44444444-4444-4444-8444-444444444444",
      submittedAt: "2026-09-02T12:00:00.000Z",
    });

    expect(submission.finalReport).toBe(input.draft.finalReport);
    expect(submission.criteria.map((item) => item.criterionId)).toEqual([
      "AC-001", "AC-002", "AC-003",
    ]);
    expect(submission.criteria.every((item) => item.evidenceIds.includes("EV-001"))).toBe(true);
    expect(submission.criteria.every((item) => item.evidenceIds.includes("EV-002"))).toBe(true);
    expect(submission.evidenceItems.map((item) => item.type)).toEqual([
      "agent_report", "command_output", "diff_summary", "user_observation",
    ]);
    expect(submission.contractHash).toBe(input.version.contractHash);
  });

  it("does not treat a passed claim as evidence when the report omits its ID", async () => {
    const input = await fixtures();
    input.draft.finalReport = "Everything passed.";
    input.draft.commandOutput = "";
    input.draft.diffSummary = "";
    input.draft.manualChecks = "";
    const submission = await compileEvidenceSubmission({
      ...input, submissionId: "44444444-4444-4444-8444-444444444444",
      submittedAt: "2026-09-02T12:00:00.000Z",
    });
    expect(submission.criteria.every((item) => item.claim === "passed")).toBe(true);
    expect(submission.criteria.every((item) => item.evidenceIds.length === 0)).toBe(true);
  });

  it("rejects wrong state, mismatched source, missing claims, and unknown report IDs", async () => {
    const wrongState = await fixtures();
    wrongState.run.state = "copied";
    await expect(compileEvidenceSubmission({
      ...wrongState, submissionId: "44444444-4444-4444-8444-444444444444",
      submittedAt: "2026-09-02T12:00:00.000Z",
    })).rejects.toThrow("awaiting evidence");

    const mismatch = await fixtures();
    mismatch.run.contractHash = `sha256:${"a".repeat(64)}`;
    await expect(compileEvidenceSubmission({
      ...mismatch, submissionId: "44444444-4444-4444-8444-444444444444",
      submittedAt: "2026-09-02T12:00:00.000Z",
    })).rejects.toThrow("does not match");

    const missing = await fixtures();
    missing.draft.criterionClaims.pop();
    await expect(compileEvidenceSubmission({
      ...missing, submissionId: "44444444-4444-4444-8444-444444444444",
      submittedAt: "2026-09-02T12:00:00.000Z",
    })).rejects.toThrow("must exactly match");

    const unknown = await fixtures();
    unknown.draft.finalReport += " AC-999 passed.";
    await expect(compileEvidenceSubmission({
      ...unknown, submissionId: "44444444-4444-4444-8444-444444444444",
      submittedAt: "2026-09-02T12:00:00.000Z",
    })).rejects.toThrow("unknown criterion IDs");
  });
});
