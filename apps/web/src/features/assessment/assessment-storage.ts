import { assessmentSchema, type Assessment } from "@loopz/contracts/assessment";
import { runSchema, type Run } from "@loopz/contracts/run";

import { runStorageKey, saveTaskRun, taskRunStorageKey } from "../artifacts/task-storage";
import { safeGetItem, safeSetItem, safeRemoveItem, safeParseJSON, StorageCorruptedError } from "../../lib/storage";

export const MAX_ASSESSMENT_VERSIONS_PER_RUN = 10;

export function assessmentStorageKey(runId: string): string {
  return `loopz:run:${runId}:assessments`;
}

export function loadAssessments(runId: string): Assessment[] {
  const raw = safeGetItem(assessmentStorageKey(runId));
  if (!raw) return [];
  const parsed = safeParseJSON<unknown>(raw, assessmentStorageKey(runId));
  if (!Array.isArray(parsed)) throw new StorageCorruptedError("Saved assessment history is corrupted.");
  const assessments = parsed.map((item) => assessmentSchema.parse(item));
  if (assessments.length > MAX_ASSESSMENT_VERSIONS_PER_RUN) {
    throw new Error("Saved assessment history exceeds its bounded limit.");
  }
  const ids = new Set<string>();
  assessments.forEach((assessment, index) => {
    if (assessment.runId !== runId) throw new Error("Saved assessment belongs to another run.");
    if (assessment.assessmentVersion !== index + 1) {
      throw new Error("Saved assessment versions are not sequential.");
    }
    if (ids.has(assessment.assessmentId)) throw new Error("Saved assessment IDs must be unique.");
    if (index === 0 && assessment.previousAssessmentId !== null) {
      throw new Error("The first assessment cannot reference a previous version.");
    }
    if (index > 0 && assessment.previousAssessmentId !== assessments[index - 1]?.assessmentId) {
      throw new Error("Saved assessment history has a broken revision chain.");
    }
    ids.add(assessment.assessmentId);
  });
  return assessments;
}

export function validateAssessmentHistoryForRun(
  run: Run,
  evidenceSubmissionIds: readonly string[],
  expectedCriterionIds: readonly string[],
  assessments: readonly Assessment[],
): void {
  const expected = new Set(expectedCriterionIds);
  const evidenceIds = new Set(evidenceSubmissionIds);
  for (const assessment of assessments) {
    if (
      assessment.runId !== run.runId ||
      assessment.contractVersionId !== run.contractVersionId ||
      assessment.contractHash !== run.contractHash ||
      !evidenceIds.has(assessment.evidenceSubmissionId)
    ) throw new Error("Saved assessment does not match the selected run, contract, and evidence.");
    const actual = new Set(assessment.criteria.map((item) => item.criterionId));
    if (actual.size !== expected.size || [...expected].some((id) => !actual.has(id))) {
      throw new Error("Saved assessment criteria do not match the confirmed contract.");
    }
  }
}

export function persistAssessment(
  runInput: Run,
  assessmentInput: Assessment,
): { run: Run; assessments: Assessment[] } {
  const run = runSchema.parse(runInput);
  const assessment = assessmentSchema.parse(assessmentInput);
  const existing = loadAssessments(run.runId);
  if (existing.length >= MAX_ASSESSMENT_VERSIONS_PER_RUN) {
    throw new Error("This run has reached its bounded assessment-revision limit.");
  }
  const isNewEvidence = existing.at(-1)?.evidenceSubmissionId !== assessment.evidenceSubmissionId;
  const expectedState = isNewEvidence ? "evidence_submitted" : "assessed";
  if (run.state !== expectedState) {
    throw new Error(`Assessment version ${existing.length + 1} requires a run in the ${expectedState} state.`);
  }
  if (
    assessment.runId !== run.runId ||
    assessment.contractVersionId !== run.contractVersionId ||
    assessment.contractHash !== run.contractHash ||
    assessment.assessmentVersion !== existing.length + 1 ||
    assessment.previousAssessmentId !== (existing.at(-1)?.assessmentId ?? null) ||
    existing.some((item) => item.assessmentId === assessment.assessmentId)
  ) throw new Error("The assessment cannot be appended to this run's immutable history.");

  const assessments = [...existing, assessment];
  const updatedRun = runSchema.parse({ ...run, state: "assessed", updatedAt: assessment.assessedAt });
  const historyKey = assessmentStorageKey(run.runId);
  const contractRunKey = taskRunStorageKey(run.projectId, run.contractVersionId);
  const indexedRunKey = runStorageKey(run.runId);
  const oldHistory = safeGetItem(historyKey);
  const oldContractRun = safeGetItem(contractRunKey);
  const oldIndexedRun = safeGetItem(indexedRunKey);
  safeSetItem(historyKey, JSON.stringify(assessments));
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
  return { run: updatedRun, assessments };
}
