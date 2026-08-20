import { describe, expect, it } from "vitest";

import { canTransition } from "./transitions";

describe("canTransition", () => {
  it("allows evidence after an awaiting-evidence state", () => {
    expect(canTransition("awaiting_evidence", "evidence_submitted")).toBe(true);
  });

  it("does not reopen a completed run", () => {
    expect(canTransition("completed", "repair_generated")).toBe(false);
  });
});
