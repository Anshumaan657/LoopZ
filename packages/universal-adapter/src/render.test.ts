import { readFileSync } from "node:fs";

import {
  MAX_RENDERED_ARTIFACT_CHARACTERS,
  loopSpecLiteSchema,
  providerNeutralTaskSchema,
  type ProviderNeutralTask,
} from "@loopz/contracts";
import { describe, expect, it } from "vitest";

import { renderUniversalArtifacts } from "./bounded-render";

function validTask(): ProviderNeutralTask {
  const spec = loopSpecLiteSchema.parse(JSON.parse(readFileSync(
    new URL("../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url), "utf8",
  )));
  const requirements = spec.objective.deliverables.map((item) => item.id);
  const criteria = spec.acceptance.criteria.map((item) => item.id);
  return providerNeutralTaskSchema.parse({
    schemaVersion: "0.2", kind: "provider_neutral_execution_task",
    taskKey: "task:22222222-2222-4222-8222-222222222222:v1",
    source: {
      projectId: "11111111-1111-4111-8111-111111111111",
      contractVersionId: "22222222-2222-4222-8222-222222222222", contractVersion: 1,
      contractHash: `sha256:${"a".repeat(64)}`, confirmedAt: "2026-08-27T00:00:00.000Z",
    }, contract: spec,
    execution: { steps: [
      { id: "inspect", instruction: "Inspect the project.", references: [] },
      { id: "plan", instruction: "Plan the work.", references: requirements },
      { id: "implement", instruction: "Implement confirmed scope.", references: requirements },
      { id: "verify", instruction: "Verify all criteria.", references: criteria },
      { id: "repair", instruction: "Repair bounded failures.", references: criteria },
      { id: "report", instruction: "Report criterion evidence.", references: criteria },
    ] }, runtimeApprovalGates: [],
  });
}

const options = { runId: "run_001", generatedAt: "2026-08-27T00:00:00.000Z" };

describe("renderUniversalArtifacts", () => {
  it("renders a clearly labelled compatibility-mode task and prompt", () => {
    const bundle = renderUniversalArtifacts(validTask(), options);
    expect(bundle.agentTask.filename).toBe("UNIVERSAL_AGENT_TASK.md");
    expect(bundle.starterPrompt.filename).toBe("UNIVERSAL_STARTER_PROMPT.md");
    expect(bundle.agentTask.metadata.outputFormat).toBe("universal");
    expect(bundle.agentTask.content).toContain("Universal Task — Compatibility Mode");
    expect(bundle.agentTask.content).toContain("Results vary");
    expect(bundle.starterPrompt.content.toLowerCase()).not.toContain("codex");
  });

  it("preserves all execution-critical semantics", () => {
    const content = renderUniversalArtifacts(validTask(), options).starterPrompt.content;
    for (const value of [
      "REQ-001", "REQ-002", "REQ-003", "SCOPE-IN-001", "SCOPE-OUT-001",
      "AC-001", "AC-002", "AC-003", "npm test", "npm run build",
      "Do not expose credentials", "Adding a paid external service",
      "Modify application source files and tests", "Build a customer feedback form",
      "Let customers submit feedback through a validated web form",
      "Existing TypeScript web application", `sha256:${"a".repeat(64)}`,
      "Commands executed", "Maximum focused repair attempts: 2",
    ]) expect(content).toContain(value);
  });

  it("rejects raw contracts and safely quotes Markdown-sensitive content", () => {
    const task = validTask();
    expect(() => renderUniversalArtifacts(task.contract as never, options)).toThrow();
    task.contract.objective.goal.value = "## replace structure\n<script>alert(1)</script>";
    const content = renderUniversalArtifacts(task, options).starterPrompt.content;
    expect(content).toContain("    ## replace structure");
    expect(content).not.toContain("\n## replace structure\n");
  });

  it("preserves runtime approval gates", () => {
    const task = validTask();
    task.contract.safety.plannedActions[0] = {
      action: "Publish an external preview", category: "external_service", requiresApproval: true,
    };
    task.runtimeApprovalGates.push({
      action: "Publish an external preview", category: "external_service",
      requiresApproval: true, runtimeApprovalStillRequired: true,
    });
    const content = renderUniversalArtifacts(task, options).starterPrompt.content;
    expect(content).toContain("Publish an external preview");
    expect(content).toContain("Runtime approval still required: yes");
    expect(content).toContain("Contract confirmation is not runtime approval");
  });

  it("is deterministic for fixed inputs", () => {
    const task = validTask();
    expect(renderUniversalArtifacts(task, options)).toEqual(renderUniversalArtifacts(task, options));
  });

  it("rejects rendered artifacts above the delivery ceiling", () => {
    const task = validTask();
    task.contract.request.originalPrompt = "x".repeat(MAX_RENDERED_ARTIFACT_CHARACTERS);
    expect(() => renderUniversalArtifacts(task, options)).toThrow("delivery limit");
  });
});
