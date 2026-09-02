import { describe, expect, it } from "vitest";

import { anyRunSchema, runSchema } from "./run";

describe("run contracts", () => {
  it("ties a current delivery run to an immutable contract version", () => {
    const parsed = runSchema.parse({
      schemaVersion: "0.2",
      runId: "33333333-3333-4333-8333-333333333333",
      projectId: "11111111-1111-4111-8111-111111111111",
      loopSpecVersion: "0.2",
      contractVersionId: "22222222-2222-4222-8222-222222222222",
      contractVersion: 1,
      contractHash: `sha256:${"a".repeat(64)}`,
      generatedAt: "2026-09-02T11:00:00.000Z",
      selectedOutputFormat: "codex",
      state: "task_generated",
      repairAttempts: 0,
      createdAt: "2026-09-02T11:00:00.000Z",
      updatedAt: "2026-09-02T11:00:00.000Z",
    });
    expect(parsed.contractVersionId).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("retains explicit read support for legacy 0.1 runs", () => {
    expect(anyRunSchema.safeParse({
      schemaVersion: "0.1", runId: "run_001", projectId: "project_001",
      loopSpecVersion: "0.1", state: "assessed", repairAttempts: 0,
      createdAt: "2026-08-27T00:00:00.000Z", updatedAt: "2026-08-27T00:10:00.000Z",
    }).success).toBe(true);
  });
});
