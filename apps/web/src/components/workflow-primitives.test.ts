import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("workflow presentation primitives", () => {
  it("keeps the eight-stage orientation cue textual and accessible", () => {
    const component = readFileSync(new URL("./workflow-progress.tsx", import.meta.url), "utf8");
    expect(component).toContain('"Idea", "Clarify", "Contract", "Confirm", "Task", "Evidence", "Assess", "Repair"');
    expect(component).toContain('aria-label="Build workflow progress"');
    expect(component).toContain('aria-current="step"');
    expect(component).toContain("Next: {next}");
  });

  it("provides one reusable responsive grid and action hierarchy", () => {
    const component = readFileSync(new URL("./workflow-layout.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("./workflow-layout.module.css", import.meta.url), "utf8");
    expect(component).toContain("export function WorkflowGrid");
    expect(component).toContain("export function ActionRow");
    expect(component).toContain('role="status"');
    expect(styles).toContain("minmax(220px,260px) minmax(0,760px)");
    expect(styles).toContain("position: sticky");
    expect(styles).toContain("@media (max-width: 900px)");
  });

  it("is consumed across every workflow stage", () => {
    const stageSources = [
      "../features/intake/idea-intake-form.tsx",
      "../features/interview/clarification-interview.tsx",
      "../features/contract/contract-review.tsx",
      "../features/versioning/contract-confirmation.tsx",
      "../features/artifacts/task-delivery.tsx",
      "../features/evidence/evidence-return.tsx",
      "../features/assessment/assessment-results.tsx",
      "../features/repair/repair-delivery.tsx",
    ].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));

    for (const source of stageSources) {
      expect(source).toContain("WorkflowGrid");
      expect(source).toContain("ActionRow");
    }

    const stageIndicators = [
      readFileSync(new URL("../app/projects/new/page.tsx", import.meta.url), "utf8"),
      ...stageSources.slice(1),
    ];
    for (const source of stageIndicators) expect(source).toContain("WorkflowProgress");
  });
});
