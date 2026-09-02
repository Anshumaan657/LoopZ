import {
  evidenceSubmissionSchema,
  type EvidenceSubmission,
} from "@loopz/contracts/evidence";
import { runSchema, type Run } from "@loopz/contracts/run";

import {
  runStorageKey,
  saveTaskRun,
  taskRunStorageKey,
} from "../artifacts/task-storage";

export const MAX_EVIDENCE_SUBMISSIONS_PER_RUN = 3;

export function evidenceStorageKey(runId: string): string {
  return `loopz:run:${runId}:evidence`;
}

export function loadEvidenceSubmissions(runId: string): EvidenceSubmission[] {
  const raw = localStorage.getItem(evidenceStorageKey(runId));
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Saved evidence history is corrupted.");
  const submissions = parsed.map((item) => evidenceSubmissionSchema.parse(item));
  if (submissions.length > MAX_EVIDENCE_SUBMISSIONS_PER_RUN) {
    throw new Error("Saved evidence history exceeds the bounded submission limit.");
  }
  const submissionIds = new Set<string>();
  for (const submission of submissions) {
    if (submission.runId !== runId) throw new Error("Saved evidence belongs to a different run.");
    if (submissionIds.has(submission.submissionId)) {
      throw new Error("Saved evidence contains duplicate submission IDs.");
    }
    submissionIds.add(submission.submissionId);
    const evidenceIds = new Set(submission.evidenceItems.map((item) => item.id));
    if (evidenceIds.size !== submission.evidenceItems.length) {
      throw new Error("Saved evidence contains duplicate evidence IDs.");
    }
    const criterionIds = new Set<string>();
    for (const criterion of submission.criteria) {
      if (criterionIds.has(criterion.criterionId)) {
        throw new Error("Saved evidence contains duplicate criterion mappings.");
      }
      criterionIds.add(criterion.criterionId);
      if (criterion.evidenceIds.some((id) => !evidenceIds.has(id))) {
        throw new Error("Saved criterion mappings contain an unknown evidence reference.");
      }
    }
  }
  return submissions;
}

export function validateEvidenceHistoryForRun(
  run: Run,
  expectedCriterionIds: readonly string[],
  submissions: readonly EvidenceSubmission[],
): void {
  const expected = new Set(expectedCriterionIds);
  for (const submission of submissions) {
    if (
      submission.runId !== run.runId ||
      submission.contractVersionId !== run.contractVersionId ||
      submission.contractHash !== run.contractHash
    ) {
      throw new Error("Saved evidence does not match the selected run and contract.");
    }
    const actual = new Set(submission.criteria.map((item) => item.criterionId));
    if (
      actual.size !== expected.size ||
      [...actual].some((id) => !expected.has(id)) ||
      [...expected].some((id) => !actual.has(id))
    ) {
      throw new Error("Saved evidence criteria do not match the confirmed contract.");
    }
  }
}

export function persistEvidenceSubmission(
  runInput: Run,
  submissionInput: EvidenceSubmission,
  updatedAt: string,
): { run: Run; submissions: EvidenceSubmission[] } {
  const run = runSchema.parse(runInput);
  const submission = evidenceSubmissionSchema.parse(submissionInput);
  if (run.state !== "awaiting_evidence") {
    throw new Error("This run is not awaiting evidence.");
  }
  if (
    submission.runId !== run.runId ||
    submission.contractVersionId !== run.contractVersionId ||
    submission.contractHash !== run.contractHash
  ) {
    throw new Error("The evidence submission does not match this run and contract.");
  }
  const existing = loadEvidenceSubmissions(run.runId);
  if (existing.some((item) => item.submissionId === submission.submissionId)) {
    throw new Error("This evidence submission already exists and cannot overwrite history.");
  }
  if (existing.length >= MAX_EVIDENCE_SUBMISSIONS_PER_RUN) {
    throw new Error("This run has reached its bounded evidence-submission limit.");
  }
  const submissions = [...existing, submission];
  const updatedRun = runSchema.parse({ ...run, state: "evidence_submitted", updatedAt });
  const contractRunKey = taskRunStorageKey(run.projectId, run.contractVersionId);
  const indexedRunKey = runStorageKey(run.runId);
  const previousContractRun = localStorage.getItem(contractRunKey);
  const previousIndexedRun = localStorage.getItem(indexedRunKey);
  localStorage.setItem(evidenceStorageKey(run.runId), JSON.stringify(submissions));
  try {
    saveTaskRun(updatedRun);
  } catch (cause) {
    if (existing.length === 0) localStorage.removeItem(evidenceStorageKey(run.runId));
    else localStorage.setItem(evidenceStorageKey(run.runId), JSON.stringify(existing));
    if (previousContractRun === null) localStorage.removeItem(contractRunKey);
    else localStorage.setItem(contractRunKey, previousContractRun);
    if (previousIndexedRun === null) localStorage.removeItem(indexedRunKey);
    else localStorage.setItem(indexedRunKey, previousIndexedRun);
    throw cause;
  }
  return { run: updatedRun, submissions };
}

export function deleteLocalRunAndEvidence(run: Run): void {
  localStorage.removeItem(evidenceStorageKey(run.runId));
  localStorage.removeItem(`loopz:run:${run.runId}:assessments`);
  localStorage.removeItem(runStorageKey(run.runId));
  localStorage.removeItem(taskRunStorageKey(run.projectId, run.contractVersionId));
}
