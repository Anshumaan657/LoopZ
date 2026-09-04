import { ideaIntakeSchema, interviewSessionSchema } from "@loopz/contracts/intake";
import {
  safetyContractDraftSchema,
  type SafetyContractDraft,
} from "@loopz/contracts/loopspec";
import { analyzeIdeaIntake } from "@loopz/core/intake";
import {
  compileAcceptanceContract,
  compileContractFoundation,
  compileSafetyContract,
} from "@loopz/core/generation";
import { safeGetItem, safeSetItem, safeParseJSON } from "../../lib/storage";

export type StoredProjectRecord = Record<string, unknown> & {
  projectId: string;
  intake: unknown;
  interview?: unknown;
  contractReview?: unknown;
};

export type StoredContractReview = {
  draft: SafetyContractDraft;
  updatedAt: string;
};

export function projectStorageKey(projectId: string): string {
  return `loopz:project:${projectId}`;
}

export function loadProjectRecord(projectId: string): StoredProjectRecord {
  const raw = safeGetItem(projectStorageKey(projectId));
  if (!raw) throw new Error("This project draft was not found in this browser.");

  const parsed = safeParseJSON<StoredProjectRecord>(raw, projectStorageKey(projectId));
  if (!parsed) throw new Error("Failed to parse project record.");
  if (parsed.projectId !== projectId) throw new Error("The saved project ID does not match this URL.");
  return parsed;
}

export function generateSafetyDraft(record: StoredProjectRecord): SafetyContractDraft {
  const intake = ideaIntakeSchema.parse(record.intake);
  const analysis = analyzeIdeaIntake(intake);
  if (!analysis.valid || analysis.suitability === "unsupported") {
    throw new Error("This project does not contain a supported intake analysis.");
  }
  const interview = interviewSessionSchema.parse(record.interview);
  const foundation = compileContractFoundation({
    projectId: record.projectId,
    intake,
    analysis,
    interview,
  });
  return compileSafetyContract(compileAcceptanceContract(foundation));
}

export function loadOrGenerateContract(projectId: string): {
  record: StoredProjectRecord;
  draft: SafetyContractDraft;
  savedReview: boolean;
} {
  const record = loadProjectRecord(projectId);
  const storedReview = record.contractReview as Partial<StoredContractReview> | undefined;
  const saved = safetyContractDraftSchema.safeParse(storedReview?.draft);
  return {
    record,
    draft: saved.success ? saved.data : generateSafetyDraft(record),
    savedReview: saved.success,
  };
}

export function saveContractReview(
  record: StoredProjectRecord,
  draft: SafetyContractDraft,
  updatedAt = new Date().toISOString(),
): StoredProjectRecord {
  const contractReview: StoredContractReview = {
    draft: safetyContractDraftSchema.parse(draft),
    updatedAt,
  };
  const updated = { ...record, contractReview };
  safeSetItem(projectStorageKey(record.projectId), JSON.stringify(updated));
  return updated;
}
