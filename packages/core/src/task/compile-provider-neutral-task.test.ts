import { readFileSync } from "node:fs";

import { loopSpecLiteSchema, type LoopSpecLite } from "@loopz/contracts/loopspec";
import {
  confirmedContractVersionSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";
import { describe, expect, it } from "vitest";

import { hashCanonicalValue } from "../canonical-hash";
import { compileProviderNeutralTask } from "./compile-provider-neutral-task";

function loopSpecFixture(): LoopSpecLite {
  const content = readFileSync(
    new URL("../../../../tests/fixtures/loopspec/valid-small-web-project.json", import.meta.url),
    "utf8",
  );
  return loopSpecLiteSchema.parse(JSON.parse(content));
}

async function confirmedVersion(
  spec = loopSpecFixture(),
  approvals: ConfirmedContractVersion["approvals"] = [],
): Promise<ConfirmedContractVersion> {
  return confirmedContractVersionSchema.parse({
    schemaVersion: "0.1",
    versionId: "22222222-2222-4222-8222-222222222222",
    projectId: "11111111-1111-4111-8111-111111111111",
    version: 1,
    confirmedAt: "2026-09-02T10:00:00.000Z",
    confirmedBy: "user",
    contractHash: await hashCanonicalValue(spec),
    approvals,
    loopSpec: spec,
  });
}

describe("compileProviderNeutralTask", () => {
  it("compiles deterministic output linked to the immutable contract version", async () => {
    const version = await confirmedVersion();

    const first = await compileProviderNeutralTask(version);
    const second = await compileProviderNeutralTask(version);

    expect(first).toEqual(second);
    expect(first.taskKey).toBe(`task:${version.versionId}:v1`);
    expect(first.source).toEqual({
      projectId: version.projectId,
      contractVersionId: version.versionId,
      contractVersion: version.version,
      contractHash: version.contractHash,
      confirmedAt: version.confirmedAt,
    });
  });

  it("preserves the complete confirmed contract and stable trace references", async () => {
    const version = await confirmedVersion();
    const task = await compileProviderNeutralTask(version);

    expect(task.contract).toEqual(version.loopSpec);
    expect(task.execution.steps.map((step) => step.id)).toEqual([
      "inspect",
      "plan",
      "implement",
      "verify",
      "repair",
      "report",
    ]);
    expect(task.execution.steps[1].references).toEqual(["REQ-001", "REQ-002", "REQ-003"]);
    expect(task.execution.steps[3].references).toEqual(["AC-001", "AC-002", "AC-003"]);
    expect(task.contract.acceptance.criteria[0]?.requiredEvidence).toEqual([
      "Passing named component test",
      "Test command output",
    ]);
    expect(task.contract.safety.restrictedActions).toContain("Do not deploy to production");
    expect(task.contract.finalReport.criterionIdReferencesRequired).toBe(true);
  });

  it("keeps confirmed approval acknowledgments as runtime approval gates", async () => {
    const spec = loopSpecFixture();
    spec.safety.plannedActions.push({
      action: "Call the external profile service",
      category: "external_service",
      requiresApproval: true,
    });
    const version = await confirmedVersion(spec, [{
      action: "Call the external profile service",
      category: "external_service",
      approvedAt: "2026-09-02T10:00:00.000Z",
    }]);

    const task = await compileProviderNeutralTask(version);

    expect(task.runtimeApprovalGates).toEqual([{
      action: "Call the external profile service",
      category: "external_service",
      requiresApproval: true,
      runtimeApprovalStillRequired: true,
    }]);
  });

  it("rejects altered contract content and unconfirmed decisions", async () => {
    const altered = await confirmedVersion();
    altered.loopSpec.objective.goal.value = "Altered after confirmation";
    await expect(compileProviderNeutralTask(altered)).rejects.toThrow("hash does not match");

    const unconfirmedSpec = loopSpecFixture();
    unconfirmedSpec.scope.assumptions[0]!.confirmedByUser = false;
    const unconfirmed = await confirmedVersion(unconfirmedSpec);
    await expect(compileProviderNeutralTask(unconfirmed)).rejects.toThrow(
      "requires confirmed decisions",
    );
  });

  it("rejects missing, unknown, or duplicate approval records", async () => {
    const spec = loopSpecFixture();
    spec.safety.plannedActions.push({
      action: "Send an external notification",
      category: "external_service",
      requiresApproval: true,
    });

    await expect(compileProviderNeutralTask(await confirmedVersion(spec))).rejects.toThrow(
      "do not match",
    );
    await expect(compileProviderNeutralTask(await confirmedVersion(spec, [{
      action: "Unknown action",
      category: "other",
      approvedAt: "2026-09-02T10:00:00.000Z",
    }]))).rejects.toThrow("do not match");
    const approval = {
      action: "Send an external notification",
      category: "external_service" as const,
      approvedAt: "2026-09-02T10:00:00.000Z",
    };
    await expect(
      compileProviderNeutralTask(await confirmedVersion(spec, [approval, approval])),
    ).rejects.toThrow("unique");
    await expect(compileProviderNeutralTask(await confirmedVersion(spec, [{
      ...approval,
      category: "other",
    }]))).rejects.toThrow("metadata does not match");
  });
});
