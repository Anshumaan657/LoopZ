import { runSchema, type Run } from "@loopz/contracts/run";
import type { ConfirmedContractVersion } from "@loopz/contracts/versioning";
import { safeGetItem, safeParseJSON, safeSetItemsAtomically } from "../../lib/storage";

export function taskRunStorageKey(projectId: string, contractVersionId: string): string {
  return `loopz:project:${projectId}:contract:${contractVersionId}:run`;
}

export function runStorageKey(runId: string): string {
  return `loopz:run:${runId}`;
}

function requireMatchingRun(run: Run, version: ConfirmedContractVersion): void {
  if (
    run.projectId !== version.projectId ||
    run.contractVersionId !== version.versionId ||
    run.contractVersion !== version.version ||
    run.contractHash !== version.contractHash ||
    run.loopSpecVersion !== version.loopSpec.schemaVersion
  ) {
    throw new Error("The saved run does not match the selected confirmed contract version.");
  }
}

export function saveTaskRun(run: Run): Run {
  const parsed = runSchema.parse(run);
  const serialized = JSON.stringify(parsed);
  safeSetItemsAtomically([
    [taskRunStorageKey(parsed.projectId, parsed.contractVersionId), serialized],
    [runStorageKey(parsed.runId), serialized],
  ]);
  return parsed;
}

export function loadTaskRunById(runId: string): Run {
  const raw = safeGetItem(runStorageKey(runId));
  if (!raw) throw new Error("This run was not found in this browser.");
  const run = runSchema.parse(safeParseJSON(raw, runStorageKey(runId)));
  if (run.runId !== runId) throw new Error("The saved run ID does not match this URL.");
  return run;
}

export function prepareTaskRun(
  version: ConfirmedContractVersion,
  create: { runId: string; generatedAt: string },
): { run: Run; isNew: boolean } {
  const key = taskRunStorageKey(version.projectId, version.versionId);
  const raw = safeGetItem(key);
  if (raw) {
    const run = runSchema.parse(safeParseJSON(raw, key));
    requireMatchingRun(run, version);
    return { run, isNew: false };
  }

  return { run: runSchema.parse({
    schemaVersion: "0.2",
    runId: create.runId,
    projectId: version.projectId,
    loopSpecVersion: version.loopSpec.schemaVersion,
    contractVersionId: version.versionId,
    contractVersion: version.version,
    contractHash: version.contractHash,
    generatedAt: create.generatedAt,
    selectedOutputFormat: "codex",
    state: "task_generated",
    repairAttempts: 0,
    createdAt: create.generatedAt,
    updatedAt: create.generatedAt,
  }), isNew: true };
}

export function selectTaskOutput(run: Run, selectedOutputFormat: Run["selectedOutputFormat"], now: string): Run {
  return saveTaskRun({ ...run, selectedOutputFormat, updatedAt: now });
}

export function markTaskCopied(run: Run, now: string): Run {
  if (["copied", "awaiting_evidence", "evidence_submitted", "assessed", "repair_generated", "completed", "blocked"].includes(run.state)) {
    return run;
  }
  if (run.state !== "task_generated") {
    throw new Error(`A task in the ${run.state} state cannot be marked as copied.`);
  }
  return saveTaskRun({ ...run, state: "copied", updatedAt: now });
}

export function beginEvidenceReturn(run: Run, now: string): Run {
  if (run.state === "awaiting_evidence") return run;
  if (run.state !== "copied") {
    throw new Error("Copy or download the task before returning execution evidence.");
  }
  return saveTaskRun({ ...run, state: "awaiting_evidence", updatedAt: now });
}
