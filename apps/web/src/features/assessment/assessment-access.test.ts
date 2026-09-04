import { describe, expect, it } from "vitest";

import { canReadExistingAssessment } from "./assessment-access";

describe("assessment access", () => {
  it("keeps an assessment readable after a repair has been generated", () => {
    expect(canReadExistingAssessment("assessed")).toBe(true);
    expect(canReadExistingAssessment("repair_generated")).toBe(true);
    expect(canReadExistingAssessment("completed")).toBe(true);
    expect(canReadExistingAssessment("blocked")).toBe(true);
  });

  it("does not expose assessment before the run reaches assessment", () => {
    expect(canReadExistingAssessment("evidence_submitted")).toBe(false);
    expect(canReadExistingAssessment("awaiting_evidence")).toBe(false);
  });
});
