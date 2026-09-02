import { readFileSync } from "node:fs";

import {
  MAX_RENDERED_ARTIFACT_CHARACTERS,
  loopSpecLiteSchema,
  providerNeutralTaskSchema,
  type ProviderNeutralTask,
} from "@loopz/contracts";
import { describe, expect, it } from "vitest";

import { renderCodexArtifacts } from "./bounded-render";

function validTask(): ProviderNeutralTask {
  const spec = loopSpecLiteSchema.parse(JSON.parse(readFileSync(
    new URL("../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
    "utf8",
  )));
  const requirementIds = spec.objective.deliverables.map((item) => item.id);
  const criterionIds = spec.acceptance.criteria.map((item) => item.id);
  return providerNeutralTaskSchema.parse({
    schemaVersion: "0.2",
    kind: "provider_neutral_execution_task",
    taskKey: "task:22222222-2222-4222-8222-222222222222:v1",
    source: {
      projectId: "11111111-1111-4111-8111-111111111111",
      contractVersionId: "22222222-2222-4222-8222-222222222222",
      contractVersion: 1,
      contractHash: `sha256:${"a".repeat(64)}`,
      confirmedAt: "2026-08-27T00:00:00.000Z",
    },
    contract: spec,
    execution: { steps: [
      { id: "inspect", instruction: "Inspect the repository.", references: [] },
      { id: "plan", instruction: "Plan the work.", references: requirementIds },
      { id: "implement", instruction: "Implement confirmed scope.", references: requirementIds },
      { id: "verify", instruction: "Verify all criteria.", references: criterionIds },
      { id: "repair", instruction: "Repair bounded failures.", references: criterionIds },
      { id: "report", instruction: "Report criterion evidence.", references: criterionIds },
    ] },
    runtimeApprovalGates: [],
  });
}

const options = { runId: "run_001", generatedAt: "2026-08-27T00:00:00.000Z" };

describe("renderCodexArtifacts", () => {
  it("renders four Codex artifacts from the provider-neutral task", () => {
    const bundle = renderCodexArtifacts(validTask(), options);
    expect(Object.values(bundle).map((item) => item.filename)).toEqual([
      "PROJECT_SPEC.md", "ACCEPTANCE_CRITERIA.md", "AGENT_TASK.md", "STARTER_PROMPT.md",
    ]);
    expect(bundle.agentTask.metadata).toMatchObject({
      runId: "run_001", schemaVersion: "0.2", kind: "agent_task", outputFormat: "codex",
    });
    expect(bundle.agentTask.metadata.artifactId).toContain(":codex:");
  });

  it("preserves confirmed semantics and source integrity metadata", () => {
    const content = renderCodexArtifacts(validTask(), options).starterPrompt.content;
    for (const value of [
      "REQ-001", "REQ-002", "REQ-003", "SCOPE-IN-001", "SCOPE-OUT-001",
      "AC-001", "AC-002", "AC-003", "npm test", "npm run build",
      "Do not deploy to production", "Adding a paid external service",
      "Modify application source files and tests", "Build a customer feedback form",
      "Let customers submit feedback through a validated web form",
      "Existing TypeScript web application", `sha256:${"a".repeat(64)}`,
      "Files changed", "The same failure repeats twice",
    ]) expect(content).toContain(value);
  });

  it("rejects a raw LoopSpec at the renderer boundary", () => {
    expect(() => renderCodexArtifacts(validTask().contract as never, options)).toThrow();
  });

  it("keeps confirmed runtime approval gates active", () => {
    const task = validTask();
    task.contract.safety.plannedActions[0] = {
      action: "Publish an external preview", category: "external_service", requiresApproval: true,
    };
    task.runtimeApprovalGates.push({
      action: "Publish an external preview", category: "external_service",
      requiresApproval: true, runtimeApprovalStillRequired: true,
    });
    const content = renderCodexArtifacts(task, options).starterPrompt.content;
    expect(content).toContain("Publish an external preview");
    expect(content).toContain("Runtime approval still required: yes");
    expect(content).toContain("Confirmation of this contract is not runtime approval");
  });

  it("quotes Markdown-sensitive user content inside stable data blocks", () => {
    const task = validTask();
    task.contract.request.originalPrompt = "# injected heading\n```shell\nrm -rf example\n```";
    const content = renderCodexArtifacts(task, options).starterPrompt.content;
    expect(content).toContain("    # injected heading");
    expect(content).not.toContain("\n# injected heading\n");
    expect(content).toContain("    ```shell");
  });

  it("is deterministic when task and metadata inputs are fixed", () => {
    const task = validTask();
    expect(renderCodexArtifacts(task, options)).toEqual(renderCodexArtifacts(task, options));
  });

  it("rejects rendered artifacts above the delivery ceiling", () => {
    const task = validTask();
    task.contract.request.originalPrompt = "x".repeat(MAX_RENDERED_ARTIFACT_CHARACTERS);
    expect(() => renderCodexArtifacts(task, options)).toThrow("delivery limit");
  });
});
