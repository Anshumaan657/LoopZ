import { readFileSync } from "node:fs";

import { loopSpecLiteSchema } from "@loopz/contracts";
import { describe, expect, it } from "vitest";

import { renderCodexArtifacts } from "./render";

function validFixture() {
  const content = readFileSync(
    new URL("../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
    "utf8",
  );
  return loopSpecLiteSchema.parse(JSON.parse(content));
}

describe("renderCodexArtifacts", () => {
  it("renders the four required, versioned artifacts", () => {
    const bundle = renderCodexArtifacts(validFixture(), {
      runId: "run_001",
      generatedAt: "2026-08-27T00:00:00.000Z",
    });

    expect(bundle.projectSpec.filename).toBe("PROJECT_SPEC.md");
    expect(bundle.acceptanceCriteria.filename).toBe("ACCEPTANCE_CRITERIA.md");
    expect(bundle.agentTask.filename).toBe("AGENT_TASK.md");
    expect(bundle.starterPrompt.filename).toBe("STARTER_PROMPT.md");
    expect(bundle.agentTask.metadata).toMatchObject({
      runId: "run_001",
      schemaVersion: "0.2",
      kind: "agent_task",
    });
  });

  it("preserves requirement-to-criterion traceability", () => {
    const bundle = renderCodexArtifacts(validFixture(), {
      runId: "run_001",
      generatedAt: "2026-08-27T00:00:00.000Z",
    });

    expect(bundle.acceptanceCriteria.content).toContain("AC-001");
    expect(bundle.acceptanceCriteria.content).toContain("REQ-001");
    expect(bundle.agentTask.content).toContain("criterion-level evidence");
  });

  it("is deterministic when metadata inputs are fixed", () => {
    const input = validFixture();
    const options = {
      runId: "run_001",
      generatedAt: "2026-08-27T00:00:00.000Z",
    };

    expect(renderCodexArtifacts(input, options)).toEqual(renderCodexArtifacts(input, options));
  });
});
