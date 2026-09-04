import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("clarification experience", () => {
  it("uses quick choices with a written-answer path and omits duplicate context", () => {
    const interview = readFileSync(new URL("./clarification-interview.tsx", import.meta.url), "utf8");

    for (const marker of [
      "Choose the closest answer",
      "Describe my answer",
      "Describe your answer",
      "Anything else to add to your loop?",
      "answerDetails",
      "quickAnswerOptions(currentQuestion)",
    ]) expect(interview).toContain(marker);

    for (const removed of ["Confirmed intake", "Original request", "Progress is saved in this browser."])
      expect(interview).not.toContain(removed);
  });
});
