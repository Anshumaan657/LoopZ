import { describe, expect, it } from "vitest";

import { isValidUUID } from "./validation";

describe("route identifier validation", () => {
  it("accepts valid UUID identifiers and rejects malformed route input", () => {
    expect(isValidUUID("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("../../projects/new")).toBe(false);
  });
});
