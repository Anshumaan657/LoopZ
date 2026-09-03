import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("contract review workflow safeguards", () => {
  it("keeps the focused four-step review without the former findings sidebar", () => {
    const page = readFileSync(new URL("./contract-review.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./contract-review.module.css", import.meta.url), "utf8");
    const sidebar = readFileSync(new URL("../../components/line-sidebar.tsx", import.meta.url), "utf8");

    for (const marker of [
      'const STEPS = ["Deliverables", "Scope", "Acceptance & Proof", "Review"]',
      "<LineSidebar",
      'aria-label="Contract review steps"',
      "Review your contract",
      "Continue to confirmation",
      "prefers-reduced-motion: reduce",
    ]) expect(`${page}\n${styles}\n${sidebar}`).toContain(marker);

    expect(page).not.toContain("<h2>Findings</h2>");
    expect(page).not.toContain("styles.aside");
    expect(styles).not.toContain("gradient");
  });
});
