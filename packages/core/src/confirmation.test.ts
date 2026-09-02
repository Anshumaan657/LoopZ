import { describe, expect, it } from "vitest";

import { safetyContractDraftSchema, type SafetyContractDraft } from "@loopz/contracts/loopspec";

import { compileConfirmedLoopSpec, confirmContractVersion } from "./confirmation";

function fixture(): SafetyContractDraft {
  const decision = (value: string) => ({
    value,
    source: "user_provided" as const,
    confidence: 1,
    explanation: "Reviewed value.",
    confirmedByUser: false,
  });
  const approvalAction = "Call the external profile API";
  return safetyContractDraftSchema.parse({
    schemaVersion: "0.2",
    status: "safety_draft",
    projectId: "11111111-1111-4111-8111-111111111111",
    compilation: {
      sourceInterviewUpdatedAt: "2026-09-01T10:00:00.000Z",
      compiledAt: "2026-09-01T10:00:00.000Z",
    },
    request: {
      originalPrompt: "Add profile settings with an external API.",
      taskType: decision("existing_app_feature"),
    },
    objective: {
      goal: decision("Update a profile safely"),
      deliverables: [{
        id: "REQ-001",
        description: "Profile API integration",
        priority: "required",
        provenance: decision("Profile API integration"),
      }],
    },
    scope: {
      included: [{
        id: "SCOPE-IN-001",
        description: "Profile API integration",
        provenance: decision("Profile API integration"),
      }],
      excluded: [],
      assumptions: [decision("Credentials are supplied only after approval")],
    },
    environment: {
      projectStatus: decision("existing"),
      projectContext: decision("Existing TypeScript project"),
      technologyPreferences: [decision("Preserve the stack")],
    },
    interviewDecisions: [],
    acceptance: {
      criteria: [{
        id: "AC-001",
        requirementIds: ["REQ-001"],
        requirement: "Success and failure responses are handled.",
        verificationMethod: "Run mocked integration tests.",
        requiredEvidence: ["Passing integration output"],
        priority: "required",
      }],
      verificationCommands: ["npm test"],
    },
    safety: {
      restrictedActions: [
        "Do not expose, print, commit, or transmit credentials or secrets.",
        "Do not deploy to or modify production systems in the LoopZ MVP.",
        "Do not perform irreversible data deletion or destructive migrations without " +
          "human approval and a recovery plan.",
        "Do not initiate real financial transactions, purchases, or subscriptions without human approval.",
        "Do not call external services or send external communications beyond confirmed scope and approval gates.",
      ],
      approvalRequired: [approvalAction],
      plannedActions: [{ action: approvalAction, category: "external_service", requiresApproval: true }],
    },
    contractChecks: {
      findings: [{
        id: "FIND-001",
        kind: "approval_gate",
        severity: "warning",
        message: `Human approval is required before this action: ${approvalAction}`,
        sourceReferences: ["REQ-001"],
      }],
    },
    pendingSections: ["limits", "final_report"],
  });
}

describe("contract confirmation", () => {
  it("compiles a complete, validated LoopSpec and marks decisions confirmed", () => {
    const loopSpec = compileConfirmedLoopSpec(fixture());

    expect(loopSpec.workflow.phases).toEqual(["plan", "implement", "verify", "repair"]);
    expect(loopSpec.objective.goal.confirmedByUser).toBe(true);
    expect(loopSpec.scope.unresolvedDecisions).toEqual([]);
    expect(loopSpec.acceptance.verificationCommands).toEqual(["npm test"]);
    expect(loopSpec.limits.maximumRepairAttempts).toBe(2);
    expect(loopSpec.finalReport.criterionIdReferencesRequired).toBe(true);
  });

  it("creates deterministic content hashes and immutable version metadata", async () => {
    const input = {
      draft: fixture(),
      versionId: "22222222-2222-4222-8222-222222222222",
      version: 1,
      confirmedAt: "2026-09-02T10:00:00.000Z",
      approvedActions: ["Call the external profile API"],
    };
    const first = await confirmContractVersion(input);
    const second = await confirmContractVersion(input);

    expect(first).toEqual(second);
    expect(first.contractHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(first.schemaVersion).toBe("0.2");
    expect(first.approvals[0]).toEqual(expect.objectContaining({
      category: "external_service",
      approvedAt: input.confirmedAt,
    }));
  });

  it("requires every approval exactly once and rejects unknown approvals", async () => {
    const base = {
      draft: fixture(),
      versionId: "22222222-2222-4222-8222-222222222222",
      version: 1,
      confirmedAt: "2026-09-02T10:00:00.000Z",
    };
    await expect(confirmContractVersion({ ...base, approvedActions: [] })).rejects.toThrow(
      "Approve every planned action",
    );
    await expect(
      confirmContractVersion({ ...base, approvedActions: ["Unknown action"] }),
    ).rejects.toThrow();
    await expect(
      confirmContractVersion({
        ...base,
        approvedActions: ["Call the external profile API", "Call the external profile API"],
      }),
    ).rejects.toThrow("must be unique");
  });

  it("refuses semantic blockers and malformed versions", async () => {
    const blocked = fixture();
    blocked.contractChecks.findings.push({
      id: "FIND-002",
      kind: "safety_boundary",
      severity: "blocking",
      message: "Production is blocked.",
      sourceReferences: ["Q-001"],
    });
    expect(() => compileConfirmedLoopSpec(blocked)).toThrow("cannot be confirmed");

    await expect(confirmContractVersion({
      draft: fixture(),
      versionId: "not-a-uuid",
      version: 0,
      confirmedAt: "invalid",
      approvedActions: ["Call the external profile API"],
    })).rejects.toThrow();
  });
});
