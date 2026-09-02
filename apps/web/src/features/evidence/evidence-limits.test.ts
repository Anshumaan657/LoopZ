import { evidenceReturnDraftSchema } from "@loopz/contracts/evidence";
import { describe, expect, it } from "vitest";

import { MAX_EVIDENCE_TOTAL_CHARACTERS, validateEvidenceReturnSize } from "./evidence-limits";

function draft() {
  return evidenceReturnDraftSchema.parse({
    codingAgent: "Codex", finalReport: "AC-001 passed.", commandOutput: "",
    diffSummary: "", userObservedProblems: "", manualChecks: "", userNotes: "",
    criterionClaims: [{ criterionId: "AC-001", claim: "passed" }],
  });
}

describe("evidence return limits", () => {
  it("accepts a bounded evidence return", () => {
    expect(() => validateEvidenceReturnSize(draft())).not.toThrow();
  });

  it("rejects oversized fields and total payloads without truncating", () => {
    const oversizedField = draft();
    oversizedField.finalReport = "x".repeat(80_001);
    expect(() => validateEvidenceReturnSize(oversizedField)).toThrow("finalReport exceeds");

    const oversizedTotal = draft();
    oversizedTotal.finalReport = "a".repeat(70_000);
    oversizedTotal.commandOutput = "b".repeat(70_000);
    oversizedTotal.diffSummary = "c".repeat(25_000);
    oversizedTotal.userNotes = "d".repeat(16_000);
    expect(() => validateEvidenceReturnSize(oversizedTotal)).toThrow(
      `${MAX_EVIDENCE_TOTAL_CHARACTERS.toLocaleString("en-US")}-character total limit`,
    );
  });
});
