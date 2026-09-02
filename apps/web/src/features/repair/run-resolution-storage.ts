import { runResolutionSchema, runSchema, type Run, type RunResolution } from "@loopz/contracts/run";

import { runStorageKey, saveTaskRun, taskRunStorageKey } from "../artifacts/task-storage";

export function runResolutionStorageKey(runId: string): string { return `loopz:run:${runId}:resolution`; }

export function loadRunResolution(runId: string): RunResolution | null {
  const raw = localStorage.getItem(runResolutionStorageKey(runId));
  if (!raw) return null;
  const resolution = runResolutionSchema.parse(JSON.parse(raw));
  if (resolution.runId !== runId) throw new Error("Saved resolution belongs to another run.");
  return resolution;
}

export function persistRunResolution(runInput: Run, resolvedRunInput: Run, resolutionInput: RunResolution): RunResolution {
  const run = runSchema.parse(runInput);
  const resolvedRun = runSchema.parse(resolvedRunInput);
  const resolution = runResolutionSchema.parse(resolutionInput);
  if (run.state !== "assessed" || !["completed", "blocked"].includes(resolvedRun.state)) {
    throw new Error("Invalid terminal run transition.");
  }
  if (
    run.runId !== resolvedRun.runId ||
    resolution.runId !== run.runId ||
    resolution.state !== resolvedRun.state ||
    resolution.contractVersionId !== run.contractVersionId ||
    resolution.contractHash !== run.contractHash
  ) {
    throw new Error("The terminal resolution does not match this run.");
  }
  if (loadRunResolution(run.runId)) throw new Error("This run already has an immutable terminal resolution.");
  const resolutionKey = runResolutionStorageKey(run.runId);
  const contractKey = taskRunStorageKey(run.projectId, run.contractVersionId);
  const indexKey = runStorageKey(run.runId);
  const oldContract = localStorage.getItem(contractKey);
  const oldIndex = localStorage.getItem(indexKey);
  localStorage.setItem(resolutionKey, JSON.stringify(resolution));
  try {
    saveTaskRun(resolvedRun);
  } catch (cause) {
    localStorage.removeItem(resolutionKey);
    if (oldContract === null) localStorage.removeItem(contractKey);
    else localStorage.setItem(contractKey, oldContract);
    if (oldIndex === null) localStorage.removeItem(indexKey);
    else localStorage.setItem(indexKey, oldIndex);
    throw cause;
  }
  return resolution;
}

export function beginAdditionalEvidenceReturn(runInput: Run, assessment: AssessmentLike, updatedAt: string): Run {
  const run = runSchema.parse(runInput);
  if (
    run.state !== "assessed" ||
    assessment.runId !== run.runId ||
    assessment.outcome !== "unverifiable_more_evidence_required"
  ) {
    throw new Error("Additional evidence is not the supported next action for this run.");
  }
  return saveTaskRun({ ...run, state: "awaiting_evidence", updatedAt });
}

type AssessmentLike = { runId: string; outcome: string };
