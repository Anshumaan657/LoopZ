import { assessmentSchema } from "@loopz/contracts/assessment";
import { runSchema } from "@loopz/contracts/run";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runStorageKey, taskRunStorageKey } from "../artifacts/task-storage";
import {
  assessmentStorageKey,
  loadAssessments,
  persistAssessment,
  validateAssessmentHistoryForRun,
} from "./assessment-storage";

const run = runSchema.parse({
  schemaVersion: "0.2", runId: "33333333-3333-4333-8333-333333333333",
  projectId: "11111111-1111-4111-8111-111111111111", loopSpecVersion: "0.2",
  contractVersionId: "22222222-2222-4222-8222-222222222222", contractVersion: 1,
  contractHash: `sha256:${"a".repeat(64)}`, generatedAt: "2026-09-02T11:00:00.000Z",
  selectedOutputFormat: "codex", state: "evidence_submitted", repairAttempts: 0,
  createdAt: "2026-09-02T11:00:00.000Z", updatedAt: "2026-09-02T12:00:00.000Z",
});

function assessment(version = 1, id = "55555555-5555-4555-8555-555555555555", previous: string | null = null) {
  return assessmentSchema.parse({
    schemaVersion: "0.2", assessmentId: id, assessmentVersion: version,
    previousAssessmentId: previous, runId: run.runId,
    contractVersionId: run.contractVersionId, contractHash: run.contractHash,
    evidenceSubmissionId: "44444444-4444-4444-8444-444444444444",
    outcome: "completed_with_evidence",
    criteria: [{
      criterionId: "AC-001", claim: "passed", priority: "required",
      status: "verified_by_submitted_evidence", evidenceReferences: ["EV-001"],
      evidenceStrength: "deterministic", missingRequiredEvidence: [], contradictions: [],
      explanation: "The submitted test output supports completion.", confidence: 0.96,
    }],
    contradictions: [], risks: [], recommendedNextAction: "Complete the run.", corrections: [],
    assessedAt: version === 1 ? "2026-09-02T12:05:00.000Z" : "2026-09-02T12:10:00.000Z",
  });
}

describe("assessment persistence", () => {
  const values = new Map<string, string>();
  beforeEach(() => {
    values.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("appends the initial assessment and advances the run", () => {
    const saved = persistAssessment(run, assessment());
    expect(saved.run.state).toBe("assessed");
    expect(loadAssessments(run.runId)).toEqual([assessment()]);
    expect(JSON.parse(values.get(runStorageKey(run.runId))!).state).toBe("assessed");
  });

  it("preserves a sequential immutable correction history", () => {
    const first = persistAssessment(run, assessment());
    const second = assessment(2, "66666666-6666-4666-8666-666666666666", first.assessments[0]!.assessmentId);
    const saved = persistAssessment(first.run, second);
    expect(saved.assessments.map((item) => item.assessmentVersion)).toEqual([1, 2]);
    expect(() => persistAssessment(saved.run, second)).toThrow("immutable history");
  });

  it("appends a new automated assessment for a later evidence submission", () => {
    const first = persistAssessment(run, assessment());
    const returnedRun = { ...first.run, state: "evidence_submitted" as const };
    const second = assessmentSchema.parse({
      ...assessment(2, "66666666-6666-4666-8666-666666666666", first.assessments[0]!.assessmentId),
      evidenceSubmissionId: "77777777-7777-4777-8777-777777777777",
    });
    const saved = persistAssessment(returnedRun, second);
    expect(saved.assessments.map((item) => item.evidenceSubmissionId)).toEqual([
      "44444444-4444-4444-8444-444444444444",
      "77777777-7777-4777-8777-777777777777",
    ]);
  });

  it("rejects broken revision chains and mismatched sources", () => {
    values.set(assessmentStorageKey(run.runId), JSON.stringify([
      assessment(), assessment(2, "66666666-6666-4666-8666-666666666666", "77777777-7777-4777-8777-777777777777"),
    ]));
    expect(() => loadAssessments(run.runId)).toThrow("broken revision chain");
    expect(() => validateAssessmentHistoryForRun(
      run,
      ["99999999-9999-4999-8999-999999999999"],
      ["AC-001"],
      [assessment()],
    )).toThrow("does not match");
  });

  it("rolls history back if updating the run pointers fails", () => {
    const contractKey = taskRunStorageKey(run.projectId, run.contractVersionId);
    const indexKey = runStorageKey(run.runId);
    values.set(contractKey, JSON.stringify(run));
    values.set(indexKey, JSON.stringify(run));
    let fail = true;
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === indexKey && fail && JSON.parse(value).state === "assessed") {
          fail = false;
          throw new Error("Quota exceeded");
        }
        values.set(key, value);
      },
      removeItem: (key: string) => values.delete(key),
    });
    expect(() => persistAssessment(run, assessment())).toThrow("Quota exceeded");
    expect(values.get(assessmentStorageKey(run.runId))).toBeUndefined();
    expect(JSON.parse(values.get(contractKey)!)).toEqual(run);
    expect(JSON.parse(values.get(indexKey)!)).toEqual(run);
  });
});
