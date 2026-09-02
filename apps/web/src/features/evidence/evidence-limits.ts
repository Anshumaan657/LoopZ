import type { EvidenceReturnDraft } from "@loopz/contracts/evidence";

export const MAX_EVIDENCE_TOTAL_CHARACTERS = 180_000;

const fieldLimits: Record<keyof Omit<EvidenceReturnDraft, "criterionClaims">, number> = {
  codingAgent: 200,
  finalReport: 80_000,
  commandOutput: 80_000,
  diffSummary: 30_000,
  userObservedProblems: 20_000,
  manualChecks: 20_000,
  userNotes: 20_000,
};

export function validateEvidenceReturnSize(draft: EvidenceReturnDraft): void {
  for (const [field, limit] of Object.entries(fieldLimits) as [keyof typeof fieldLimits, number][]) {
    if (draft[field].length > limit) {
      throw new Error(`${field} exceeds its ${limit.toLocaleString("en-US")}-character limit.`);
    }
  }
  const total = Object.keys(fieldLimits)
    .map((field) => draft[field as keyof typeof fieldLimits].length)
    .reduce((sum, length) => sum + length, 0);
  if (total > MAX_EVIDENCE_TOTAL_CHARACTERS) {
    throw new Error(
      `The evidence return exceeds the ${MAX_EVIDENCE_TOTAL_CHARACTERS.toLocaleString("en-US")}-character total limit.`,
    );
  }
}
