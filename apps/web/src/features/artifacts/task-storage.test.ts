import { readFileSync } from "node:fs";

import { confirmedContractVersionSchema, type ConfirmedContractVersion } from "@loopz/contracts/versioning";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  markTaskCopied,
  prepareTaskRun,
  saveTaskRun,
  selectTaskOutput,
  taskRunStorageKey,
} from "./task-storage";

const projectId = "11111111-1111-4111-8111-111111111111";
const versionId = "22222222-2222-4222-8222-222222222222";

function versionFixture(): ConfirmedContractVersion {
  const loopSpec = JSON.parse(readFileSync(
    new URL("../../../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
    "utf8",
  ));
  return confirmedContractVersionSchema.parse({
    schemaVersion: "0.2", versionId, projectId, version: 1,
    confirmedAt: "2026-09-02T10:00:00.000Z", confirmedBy: "user",
    contractHash: `sha256:${"a".repeat(64)}`, approvals: [], loopSpec,
  });
}

describe("task run persistence", () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("creates one real task-generated run and reuses its stable identity", () => {
    const version = versionFixture();
    const prepared = prepareTaskRun(version, {
      runId: "33333333-3333-4333-8333-333333333333",
      generatedAt: "2026-09-02T11:00:00.000Z",
    });
    expect(values.size).toBe(0);
    const first = saveTaskRun(prepared.run);
    const reloaded = prepareTaskRun(version, {
      runId: "44444444-4444-4444-8444-444444444444",
      generatedAt: "2026-09-02T12:00:00.000Z",
    });

    expect(reloaded).toEqual({ run: first, isNew: false });
    expect(first).toMatchObject({
      state: "task_generated", contractVersionId: versionId,
      runId: "33333333-3333-4333-8333-333333333333",
      generatedAt: "2026-09-02T11:00:00.000Z",
    });
  });

  it("persists output selection and advances to copied only after delivery", () => {
    const run = saveTaskRun(prepareTaskRun(versionFixture(), {
      runId: "33333333-3333-4333-8333-333333333333",
      generatedAt: "2026-09-02T11:00:00.000Z",
    }).run);
    const universal = selectTaskOutput(run, "universal", "2026-09-02T11:01:00.000Z");
    const copied = markTaskCopied(universal, "2026-09-02T11:02:00.000Z");

    expect(copied).toMatchObject({ selectedOutputFormat: "universal", state: "copied" });
    expect(JSON.parse(values.get(taskRunStorageKey(projectId, versionId))!)).toEqual(copied);
  });

  it("rejects corrupted or mismatched saved run data", () => {
    const version = versionFixture();
    values.set(taskRunStorageKey(projectId, versionId), "not-json");
    expect(() => prepareTaskRun(version, {
      runId: "33333333-3333-4333-8333-333333333333",
      generatedAt: "2026-09-02T11:00:00.000Z",
    })).toThrow();

    values.clear();
    const run = saveTaskRun(prepareTaskRun(version, {
      runId: "33333333-3333-4333-8333-333333333333",
      generatedAt: "2026-09-02T11:00:00.000Z",
    }).run);
    values.set(taskRunStorageKey(projectId, versionId), JSON.stringify({
      ...run, contractHash: `sha256:${"b".repeat(64)}`,
    }));
    expect(() => prepareTaskRun(version, {
      runId: "44444444-4444-4444-8444-444444444444",
      generatedAt: "2026-09-02T12:00:00.000Z",
    })).toThrow("does not match");
  });
});
