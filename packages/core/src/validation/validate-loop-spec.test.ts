import { describe, expect, it } from "vitest";

import { validateLoopSpec } from "./validate-loop-spec";

describe("validateLoopSpec", () => {
  it("returns structured schema issues", () => {
    const result = validateLoopSpec({ schemaVersion: "0.1" });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]?.code).toBe("schema_invalid");
    }
  });
});
