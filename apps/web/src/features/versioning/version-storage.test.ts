import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  confirmedContractVersionSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";

import {
  appendContractVersion,
  loadContractVersions,
  versionStorageKey,
} from "./version-storage";

const projectId = "11111111-1111-4111-8111-111111111111";

function versionFixture(version = 1): ConfirmedContractVersion {
  const loopSpec = JSON.parse(
    readFileSync(
      new URL("../../../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
      "utf8",
    ),
  );
  return confirmedContractVersionSchema.parse({
    schemaVersion: "0.1",
    versionId:
      version === 1
        ? "22222222-2222-4222-8222-222222222222"
        : "33333333-3333-4333-8333-333333333333",
    projectId,
    version,
    confirmedAt: `2026-09-0${version}T10:00:00.000Z`,
    confirmedBy: "user",
    contractHash: `sha256:${String(version).repeat(64)}`,
    approvals: [],
    loopSpec,
  });
}

describe("browser version persistence", () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("appends validated versions without replacing history", () => {
    expect(loadContractVersions(projectId)).toEqual([]);
    appendContractVersion(projectId, versionFixture(1));
    const versions = appendContractVersion(projectId, versionFixture(2));

    expect(versions.map((item) => item.version)).toEqual([1, 2]);
    expect(JSON.parse(values.get(versionStorageKey(projectId))!)).toHaveLength(2);
  });

  it("refuses version overwrite, ID reuse, project mismatch, and corrupted storage", () => {
    expect(() => appendContractVersion(projectId, versionFixture(2))).toThrow("must be version 1");
    appendContractVersion(projectId, versionFixture(1));
    expect(() => appendContractVersion(projectId, versionFixture(1))).toThrow("cannot be overwritten");

    const duplicateContent = { ...versionFixture(2), contractHash: versionFixture(1).contractHash };
    expect(() => appendContractVersion(projectId, duplicateContent)).toThrow("already confirmed");

    const wrongProject = { ...versionFixture(2), projectId: "44444444-4444-4444-8444-444444444444" };
    expect(() => appendContractVersion(projectId, wrongProject)).toThrow("does not match");

    values.set(versionStorageKey(projectId), "not-json");
    expect(() => loadContractVersions(projectId)).toThrow();
  });
});
