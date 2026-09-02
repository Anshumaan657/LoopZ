import { runSchema, type Run } from "@loopz/contracts/run";
import type { ConfirmedContractVersion } from "@loopz/contracts/versioning";

export function taskRunStorageKey(projectId: string, contractVersionId: string): string {
  return `loopz:project:${projectId}:contract:${contractVersionId}:run`;
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
  localStorage.setItem(
    taskRunStorageKey(parsed.projectId, parsed.contractVersionId),
    JSON.stringify(parsed),
  );
  return parsed;
}

export function prepareTaskRun(
  version: ConfirmedContractVersion,
  create: { runId: string; generatedAt: string },
): { run: Run; isNew: boolean } {
  const key = taskRunStorageKey(version.projectId, version.versionId);
  const raw = localStorage.getItem(key);
  if (raw) {
    const run = runSchema.parse(JSON.parse(raw));
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
  if (run.state !== "task_generated" && run.state !== "copied") {
    throw new Error(`A task in the ${run.state} state cannot be marked as copied.`);
  }
  return saveTaskRun({ ...run, state: "copied", updatedAt: now });
}
