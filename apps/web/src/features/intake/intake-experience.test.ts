import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("adaptive intake experience", () => {
  it("keeps mode switching, shared input, and Super Geek boundaries explicit", () => {
    const intake = readFileSync(new URL("./idea-intake-form.tsx", import.meta.url), "utf8");
    const gooey = readFileSync(new URL("../../components/gooey-nav.tsx", import.meta.url), "utf8");
    const gooeyStyles = readFileSync(new URL("../../components/gooey-nav.module.css", import.meta.url), "utf8");

    for (const marker of [
      '{ label: "Guided", href: "/projects/new?mode=guided" }',
      '{ label: "Geek", href: "/projects/new?mode=geek" }',
      'useState<IntakeMode>("guided")',
      "Go with your idea",
      "Super Geek",
      'mode === "geek"',
      "prefers-reduced-motion: reduce",
      'aria-label="Choose project setup mode"',
    ]) expect(`${intake}\n${gooey}\n${gooeyStyles}`).toContain(marker);

    for (const removed of [
      "Write the request as you would normally send it to a coding agent",
      "Decisions to clarify",
      'className="task-type"',
      'className="intake-aside"',
    ]) expect(intake).not.toContain(removed);
  });
});
