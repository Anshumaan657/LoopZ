import { evidenceSubmissionSchema } from "@loopz/contracts/evidence";
import { runSchema } from "@loopz/contracts/run";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runStorageKey, taskRunStorageKey } from "../artifacts/task-storage";
import {
  deleteLocalRunAndEvidence,
  evidenceStorageKey,
  loadEvidenceSubmissions,
  persistEvidenceSubmission,
  validateEvidenceHistoryForRun,
} from "./evidence-storage";

const run = runSchema.parse({
  schemaVersion: "0.2", runId: "33333333-3333-4333-8333-333333333333",
  projectId: "11111111-1111-4111-8111-111111111111", loopSpecVersion: "0.2",
  contractVersionId: "22222222-2222-4222-8222-222222222222", contractVersion: 1,
  contractHash: `sha256:${"a".repeat(64)}`, generatedAt: "2026-09-02T11:00:00.000Z",
  selectedOutputFormat: "codex", state: "awaiting_evidence", repairAttempts: 0,
  createdAt: "2026-09-02T11:00:00.000Z", updatedAt: "2026-09-02T11:30:00.000Z",
});

function submission(id = "44444444-4444-4444-8444-444444444444") {
  return evidenceSubmissionSchema.parse({
    schemaVersion: "0.2", submissionId: id, runId: run.runId,
    contractVersionId: run.contractVersionId, contractHash: run.contractHash,
    submittedAt: "2026-09-02T12:00:00.000Z", codingAgent: "Codex",
    finalReport: "AC-001 passed.",
    evidenceItems: [{ id: "EV-001", type: "agent_report", description: "Report", content: "AC-001 passed." }],
    criteria: [{ criterionId: "AC-001", claim: "passed", evidenceIds: ["EV-001"] }],
    userNotes: "",
  });
}

describe("evidence persistence", () => {
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

  it("appends evidence and advances the matching run", () => {
    const saved = persistEvidenceSubmission(run, submission(), "2026-09-02T12:00:00.000Z");
    expect(saved.run.state).toBe("evidence_submitted");
    expect(loadEvidenceSubmissions(run.runId)).toEqual([submission()]);
    expect(JSON.parse(values.get(runStorageKey(run.runId))!).state).toBe("evidence_submitted");
  });

  it("rejects duplicate, mismatched, wrong-state, and corrupted evidence history", () => {
    values.set(evidenceStorageKey(run.runId), JSON.stringify([submission()]));
    expect(() => persistEvidenceSubmission(run, submission(), "2026-09-02T12:01:00.000Z"))
      .toThrow("already exists");
    expect(loadEvidenceSubmissions(run.runId)).toHaveLength(1);

    const mismatch = { ...submission("55555555-5555-4555-8555-555555555555"), contractHash: `sha256:${"b".repeat(64)}` };
    expect(() => persistEvidenceSubmission(run, mismatch, "2026-09-02T12:01:00.000Z"))
      .toThrow("does not match");
    expect(() => persistEvidenceSubmission({ ...run, state: "copied" }, submission("55555555-5555-4555-8555-555555555555"), "2026-09-02T12:01:00.000Z"))
      .toThrow("not awaiting");

    values.set(evidenceStorageKey(run.runId), "not-json");
    expect(() => loadEvidenceSubmissions(run.runId)).toThrow();

    values.set(evidenceStorageKey(run.runId), JSON.stringify([{
      ...submission(),
      criteria: [{ criterionId: "AC-001", claim: "passed", evidenceIds: ["EV-999"] }],
    }]));
    expect(() => loadEvidenceSubmissions(run.runId)).toThrow("unknown evidence reference");
  });

  it("deletes only the selected browser-local run and its evidence", () => {
    values.set(evidenceStorageKey(run.runId), JSON.stringify([submission()]));
    values.set(runStorageKey(run.runId), JSON.stringify(run));
    values.set(taskRunStorageKey(run.projectId, run.contractVersionId), JSON.stringify(run));
    values.set("unrelated", "keep");
    deleteLocalRunAndEvidence(run);
    expect(values.get(evidenceStorageKey(run.runId))).toBeUndefined();
    expect(values.get(runStorageKey(run.runId))).toBeUndefined();
    expect(values.get(taskRunStorageKey(run.projectId, run.contractVersionId))).toBeUndefined();
    expect(values.get("unrelated")).toBe("keep");
  });

  it("requires stored evidence to match the run source and complete criterion set", () => {
    const saved = submission();
    expect(() => validateEvidenceHistoryForRun(run, ["AC-001"], [saved])).not.toThrow();
    expect(() => validateEvidenceHistoryForRun(run, ["AC-001", "AC-002"], [saved]))
      .toThrow("criteria do not match");
    expect(() => validateEvidenceHistoryForRun(run, ["AC-001"], [{
      ...saved, contractHash: `sha256:${"b".repeat(64)}`,
    }])).toThrow("does not match");
  });

  it("restores previous evidence and run pointers when the run update fails", () => {
    const contractKey = taskRunStorageKey(run.projectId, run.contractVersionId);
    const indexKey = runStorageKey(run.runId);
    values.set(contractKey, JSON.stringify(run));
    values.set(indexKey, JSON.stringify(run));
    let failIndexUpdate = true;
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === indexKey && failIndexUpdate && JSON.parse(value).state === "evidence_submitted") {
          failIndexUpdate = false;
          throw new Error("Quota exceeded");
        }
        values.set(key, value);
      },
      removeItem: (key: string) => values.delete(key),
    });

    expect(() => persistEvidenceSubmission(run, submission(), "2026-09-02T12:00:00.000Z"))
      .toThrow("Quota exceeded");
    expect(values.get(evidenceStorageKey(run.runId))).toBeUndefined();
    expect(JSON.parse(values.get(contractKey)!)).toEqual(run);
    expect(JSON.parse(values.get(indexKey)!)).toEqual(run);
  });
});
