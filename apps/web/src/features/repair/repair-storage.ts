import { repairTaskSchema, type RepairTask } from "@loopz/contracts/repair";
import { runSchema, type Run } from "@loopz/contracts/run";

import { runStorageKey, saveTaskRun, taskRunStorageKey } from "../artifacts/task-storage";
import { safeGetItem, safeSetItem, safeRemoveItem, safeParseJSON, StorageCorruptedError } from "../../lib/storage";

export const MAX_REPAIRS_PER_RUN = 2;

export function repairStorageKey(runId: string): string {
  return `loopz:run:${runId}:repairs`;
}

export function repairDeliveryKey(repairId: string): string {
  return `loopz:repair:${repairId}:delivered`;
}

export function loadRepairTasks(runId: string): RepairTask[] {
  const raw = safeGetItem(repairStorageKey(runId));
  if (!raw) return [];
  const parsed = safeParseJSON<unknown>(raw, repairStorageKey(runId));
  if (!Array.isArray(parsed)) throw new StorageCorruptedError("Saved repair history is corrupted.");
  const repairs = parsed.map((item) => repairTaskSchema.parse(item));
  if (repairs.length > MAX_REPAIRS_PER_RUN) throw new Error("Saved repair history exceeds its limit.");
  const ids = new Set<string>();
  repairs.forEach((repair, index) => {
    if (repair.parentRunId !== runId) throw new Error("Saved repair belongs to another run.");
    if (repair.attempt !== index + 1) throw new Error("Saved repair attempts are not sequential.");
    if (ids.has(repair.repairId)) throw new Error("Saved repair IDs must be unique.");
    ids.add(repair.repairId);
  });
  return repairs;
}

export function validateRepairHistoryForRun(run: Run, repairs: readonly RepairTask[]): void {
  if (repairs.length !== run.repairAttempts) throw new Error("Repair history does not match the run attempt count.");
  for (const repair of repairs) {
    if (
      repair.parentRunId !== run.runId ||
      repair.contractVersionId !== run.contractVersionId ||
      repair.contractHash !== run.contractHash
    ) throw new Error("Saved repair does not match the selected run and contract.");
  }
}

export function persistRepairTask(
  runInput: Run,
  repairInput: RepairTask,
): { run: Run; repairs: RepairTask[] } {
  const run = runSchema.parse(runInput);
  const repair = repairTaskSchema.parse(repairInput);
  if (run.state !== "assessed") throw new Error("A repair can only be created from an assessed run.");
  const existing = loadRepairTasks(run.runId);
  validateRepairHistoryForRun(run, existing);
  if (existing.length >= MAX_REPAIRS_PER_RUN) throw new Error("The repair-attempt limit has been reached.");
  if (
    repair.parentRunId !== run.runId ||
    repair.contractVersionId !== run.contractVersionId ||
    repair.contractHash !== run.contractHash ||
    repair.attempt !== existing.length + 1 ||
    existing.some((item) => item.repairId === repair.repairId)
  ) throw new Error("The repair cannot be appended to this run's immutable history.");

  const repairs = [...existing, repair];
  const updatedRun = runSchema.parse({
    ...run,
    state: "repair_generated",
    repairAttempts: repair.attempt,
    updatedAt: repair.generatedAt,
  });
  const historyKey = repairStorageKey(run.runId);
  const contractRunKey = taskRunStorageKey(run.projectId, run.contractVersionId);
  const indexedRunKey = runStorageKey(run.runId);
  const oldHistory = safeGetItem(historyKey);
  const oldContractRun = safeGetItem(contractRunKey);
  const oldIndexedRun = safeGetItem(indexedRunKey);
  safeSetItem(historyKey, JSON.stringify(repairs));
  try {
    saveTaskRun(updatedRun);
  } catch (cause) {
    if (oldHistory === null) safeRemoveItem(historyKey);
    else safeSetItem(historyKey, oldHistory);
    if (oldContractRun === null) safeRemoveItem(contractRunKey);
    else safeSetItem(contractRunKey, oldContractRun);
    if (oldIndexedRun === null) safeRemoveItem(indexedRunKey);
    else safeSetItem(indexedRunKey, oldIndexedRun);
    throw cause;
  }
  return { run: updatedRun, repairs };
}

export function markRepairDelivered(repair: RepairTask, deliveredAt: string): void {
  const parsed = new Date(deliveredAt);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(deliveredAt) || Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== deliveredAt) {
    throw new Error("Repair delivery requires a valid canonical ISO timestamp (for example, 2024-01-15T10:30:00.000Z).");
  }
  safeSetItem(repairDeliveryKey(repair.repairId), deliveredAt);
}

export function wasRepairDelivered(repair: RepairTask): boolean {
  return safeGetItem(repairDeliveryKey(repair.repairId)) !== null;
}

export function beginRepairEvidenceReturn(runInput: Run, repair: RepairTask, updatedAt: string): Run {
  const run = runSchema.parse(runInput);
  if (run.state === "awaiting_evidence") return run;
  if (run.state !== "repair_generated") throw new Error("This run does not have a repair ready for execution.");
  if (repair.parentRunId !== run.runId || repair.attempt !== run.repairAttempts) {
    throw new Error("The selected repair does not match the current run attempt.");
  }
  if (!wasRepairDelivered(repair)) throw new Error("Copy or download the repair task first.");
  return saveTaskRun({ ...run, state: "awaiting_evidence", updatedAt });
}

export function deleteRepairHistory(runId: string): void {
  for (const repair of loadRepairTasks(runId)) safeRemoveItem(repairDeliveryKey(repair.repairId));
  safeRemoveItem(repairStorageKey(runId));
  safeRemoveItem(`loopz:run:${runId}:resolution`);
}
