import { readFileSync } from "node:fs";

import type { EvidenceReturnDraft } from "@loopz/contracts/evidence";
import { runSchema } from "@loopz/contracts/run";
import { confirmedContractVersionSchema } from "@loopz/contracts/versioning";
import {
  compileAssessment,
  compileEvidenceSubmission,
  compileRepairTask,
  resolveRun,
} from "@loopz/core";
import { hashCanonicalValue } from "@loopz/core/canonical-hash";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { saveTaskRun } from "../artifacts/task-storage";
import { loadAssessments, persistAssessment } from "../assessment/assessment-storage";
import { loadEvidenceSubmissions, persistEvidenceSubmission } from "../evidence/evidence-storage";
import {
  beginRepairEvidenceReturn,
  loadRepairTasks,
  markRepairDelivered,
  persistRepairTask,
} from "./repair-storage";
import { loadRunResolution, persistRunResolution } from "./run-resolution-storage";

const ids = {
  project: "11111111-1111-4111-8111-111111111111",
  version: "22222222-2222-4222-8222-222222222222",
  run: "33333333-3333-4333-8333-333333333333",
  firstSubmission: "44444444-4444-4444-8444-444444444444",
  firstAssessment: "55555555-5555-4555-8555-555555555555",
  repair: "66666666-6666-4666-8666-666666666666",
  secondSubmission: "77777777-7777-4777-8777-777777777777",
  secondAssessment: "88888888-8888-4888-8888-888888888888",
  resolution: "99999999-9999-4999-8999-999999999999",
};

function evidenceDraft(claim: "failed" | "passed", commandOutput: string): EvidenceReturnDraft {
  return {
    codingAgent: "Codex",
    finalReport: `AC-001 ${claim}. AC-002 ${claim}. AC-003 ${claim}.`,
    commandOutput,
    diffSummary: "Updated the form implementation and its component and integration tests.",
    userObservedProblems: "",
    manualChecks: "",
    userNotes: "",
    criterionClaims: ["AC-001", "AC-002", "AC-003"].map((criterionId) => ({
      criterionId,
      claim,
    })),
  };
}

describe("Phase 9 repair loop", () => {
  const values = new Map<string, string>();

  beforeEach(() => vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }));

  afterEach(() => {
    values.clear();
    vi.unstubAllGlobals();
  });

  it("moves a failed run through one bounded repair to evidence-backed completion", async () => {
    const loopSpec = JSON.parse(readFileSync(
      new URL("../../../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
      "utf8",
    ));
    const contractHash = await hashCanonicalValue(loopSpec);
    const version = confirmedContractVersionSchema.parse({
      schemaVersion: "0.2",
      versionId: ids.version,
      projectId: ids.project,
      version: 1,
      confirmedAt: "2026-09-02T10:00:00.000Z",
      confirmedBy: "user",
      contractHash,
      approvals: [],
      loopSpec,
    });
    let run = runSchema.parse({
      schemaVersion: "0.2",
      runId: ids.run,
      projectId: ids.project,
      loopSpecVersion: "0.2",
      contractVersionId: ids.version,
      contractVersion: 1,
      contractHash,
      generatedAt: "2026-09-02T10:05:00.000Z",
      selectedOutputFormat: "codex",
      state: "awaiting_evidence",
      repairAttempts: 0,
      createdAt: "2026-09-02T10:05:00.000Z",
      updatedAt: "2026-09-02T10:10:00.000Z",
    });
    saveTaskRun(run);

    const failedEvidence = await compileEvidenceSubmission({
      run,
      version,
      draft: evidenceDraft("failed", "npm test\n1 test failed"),
      submissionId: ids.firstSubmission,
      submittedAt: "2026-09-02T10:20:00.000Z",
    });
    run = persistEvidenceSubmission(run, failedEvidence, failedEvidence.submittedAt).run;
    const failedAssessment = await compileAssessment({
      run,
      version,
      submission: failedEvidence,
      assessmentId: ids.firstAssessment,
      assessedAt: "2026-09-02T10:21:00.000Z",
    });
    expect(failedAssessment.outcome).toBe("repair_recommended");
    run = persistAssessment(run, failedAssessment).run;

    const repair = await compileRepairTask({
      run,
      version,
      assessment: failedAssessment,
      submission: failedEvidence,
      previousRepairs: [],
      repairId: ids.repair,
      generatedAt: "2026-09-02T10:22:00.000Z",
    });
    run = persistRepairTask(run, repair).run;
    markRepairDelivered(repair, "2026-09-02T10:23:00.000Z");
    run = beginRepairEvidenceReturn(run, repair, "2026-09-02T10:24:00.000Z");

    const passingEvidence = await compileEvidenceSubmission({
      run,
      version,
      draft: evidenceDraft("passed", "npm test\n3 tests passed\n0 failed"),
      submissionId: ids.secondSubmission,
      submittedAt: "2026-09-02T10:30:00.000Z",
    });
    run = persistEvidenceSubmission(run, passingEvidence, passingEvidence.submittedAt).run;
    const passingAssessment = await compileAssessment({
      run,
      version,
      submission: passingEvidence,
      assessmentId: ids.secondAssessment,
      assessmentVersion: 2,
      previousAssessmentId: ids.firstAssessment,
      assessedAt: "2026-09-02T10:31:00.000Z",
    });
    expect(passingAssessment.outcome).toBe("completed_with_evidence");
    run = persistAssessment(run, passingAssessment).run;

    const terminal = resolveRun({
      run,
      version,
      assessment: passingAssessment,
      resolutionId: ids.resolution,
      resolvedAt: "2026-09-02T10:32:00.000Z",
    });
    persistRunResolution(run, terminal.run, terminal.resolution);

    expect(loadEvidenceSubmissions(run.runId)).toHaveLength(2);
    expect(loadAssessments(run.runId)).toHaveLength(2);
    expect(loadRepairTasks(run.runId)).toHaveLength(1);
    expect(loadRunResolution(run.runId)).toMatchObject({
      state: "completed",
      reason: "completion_supported",
      assessmentId: ids.secondAssessment,
    });
  });
});
