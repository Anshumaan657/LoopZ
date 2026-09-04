import { describe, expect, it } from "vitest";

import { detectPotentialSecrets } from "./detect-potential-secrets";

describe("potential-secret detection", () => {
  const bearerFixture = ["Authorization:", ["Bear", "er"].join(""), ["abcdefghijklm", "nopqrstuvwxyz"].join("")].join(" ");

  it.each([
    ["api_key=sk_live_example123", "API key or access token"],
    ["password=secret123", "Password"],
    [bearerFixture, "Bearer token"],
    ["ghp_abcdefghijklmnopqrstuvwxyz1234567890", "GitHub token"],
    ["AKIAIOSFODNN7EXAMPLE", "AWS access key"],
  ])("detects %s without returning its value", (input, kind) => {
    const findings = detectPotentialSecrets(input);
    expect(findings.some((finding) => finding.kind === kind)).toBe(true);
    expect(JSON.stringify(findings)).not.toContain(input);
  });

  it("does not flag ordinary test output", () => {
    expect(detectPotentialSecrets("48 tests passed; npm run build completed successfully")).toEqual([]);
  });
});
