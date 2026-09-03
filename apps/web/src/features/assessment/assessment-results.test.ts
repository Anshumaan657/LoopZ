import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("assessment results UI safeguards", () => {
  it("states the verification boundary and exposes traceability, corrections, and accessible states", () => {
    const page = readFileSync(new URL("./assessment-results.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./assessment-results.module.css", import.meta.url), "utf8");
    for (const marker of [
      "It did not access the repository or rerun these commands",
      "Agent claims alone are never marked as supported by evidence",
      "Inspect {ids.length} linked evidence item(s)",
      "Correct this assessment",
      "Correction audit trail",
      "canReadExistingAssessment(run.state)",
      'role="alert"',
    ]) expect(page).toContain(marker);
    expect(styles).toContain(":focus-visible");
    expect(styles).toContain("@media (max-width:650px)");
  });
});
