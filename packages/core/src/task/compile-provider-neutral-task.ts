import { loopSpecLiteSchema, type LoopSpecLite } from "@loopz/contracts/loopspec";
import {
  providerNeutralTaskSchema,
  type ProviderNeutralTask,
} from "@loopz/contracts/task";
import {
  confirmedContractVersionSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";

import { hashCanonicalValue } from "../canonical-hash";
import { validateLoopSpec } from "../validation/validate-loop-spec";

function requireConfirmedDecisions(spec: LoopSpecLite): void {
  const decisions = [
    ["request.taskType", spec.request.taskType],
    ["objective.goal", spec.objective.goal],
    ...spec.objective.deliverables.map((item) => [
      `objective.deliverables.${item.id}`,
      item.provenance,
    ] as const),
    ...spec.scope.included.map((item) => [`scope.included.${item.id}`, item.provenance] as const),
    ...spec.scope.excluded.map((item) => [`scope.excluded.${item.id}`, item.provenance] as const),
    ...spec.scope.assumptions.map((item, index) => [`scope.assumptions.${index}`, item] as const),
    ["environment.projectStatus", spec.environment.projectStatus],
    ["environment.projectContext", spec.environment.projectContext],
    ...spec.environment.technologyPreferences.map((item, index) => [
      `environment.technologyPreferences.${index}`,
      item,
    ] as const),
  ] as const;

  const unconfirmed = decisions
    .filter(([, decision]) => !decision.confirmedByUser)
    .map(([path]) => path);
  if (unconfirmed.length > 0) {
    throw new Error(`Task generation requires confirmed decisions: ${unconfirmed.join("; ")}`);
  }
}

function requireApprovalIntegrity(version: ConfirmedContractVersion): void {
  const requiredActions = version.loopSpec.safety.plannedActions
    .filter((action) => action.requiresApproval)
    .map((action) => action.action);
  const recordedActions = version.approvals.map((approval) => approval.action);
  const required = new Set(requiredActions);
  const recorded = new Set(recordedActions);
  const plannedByAction = new Map(
    version.loopSpec.safety.plannedActions.map((action) => [action.action, action]),
  );

  if (required.size !== requiredActions.length || recorded.size !== recordedActions.length) {
    throw new Error("Task generation requires unique planned actions and approval records.");
  }
  if (
    required.size !== recorded.size ||
    requiredActions.some((action) => !recorded.has(action)) ||
    recordedActions.some((action) => !required.has(action))
  ) {
    throw new Error("Confirmed approval records do not match the runtime approval gates.");
  }
  if (version.approvals.some((approval) => {
    const planned = plannedByAction.get(approval.action);
    return planned?.category !== approval.category || approval.approvedAt !== version.confirmedAt;
  })) {
    throw new Error("Confirmed approval metadata does not match the confirmed contract version.");
  }
}

export async function compileProviderNeutralTask(
  input: ConfirmedContractVersion,
): Promise<ProviderNeutralTask> {
  const version = confirmedContractVersionSchema.parse(input);
  const spec = loopSpecLiteSchema.parse(version.loopSpec);
  const validation = validateLoopSpec(spec);
  if (!validation.valid) {
    throw new Error(
      `Task generation requires a valid LoopSpec: ${validation.issues
        .map((issue) => issue.message)
        .join("; ")}`,
    );
  }

  requireConfirmedDecisions(spec);
  requireApprovalIntegrity(version);

  const actualHash = await hashCanonicalValue(spec);
  if (actualHash !== version.contractHash) {
    throw new Error("The confirmed contract hash does not match its LoopSpec content.");
  }

  const requirementIds = spec.objective.deliverables.map((item) => item.id);
  const includedScopeIds = spec.scope.included.map((item) => item.id);
  const criterionIds = spec.acceptance.criteria.map((criterion) => criterion.id);
  const runtimeApprovalGates = spec.safety.plannedActions
    .filter((action) => action.requiresApproval)
    .map((action) => ({ ...action, runtimeApprovalStillRequired: true as const }));

  return providerNeutralTaskSchema.parse({
    schemaVersion: "0.1",
    kind: "provider_neutral_execution_task",
    taskKey: `task:${version.versionId}:v${version.version}`,
    source: {
      projectId: version.projectId,
      contractVersionId: version.versionId,
      contractVersion: version.version,
      contractHash: version.contractHash,
      confirmedAt: version.confirmedAt,
    },
    contract: spec,
    execution: {
      steps: [
        {
          id: "inspect",
          instruction:
            "Inspect the available project and repository state before editing. Treat confirmed project context as context, not proof of files that have not been inspected.",
          references: [],
        },
        {
          id: "plan",
          instruction:
            "Create a concise implementation plan mapped to every confirmed requirement ID before changing files.",
          references: requirementIds,
        },
        {
          id: "implement",
          instruction:
            "Implement only the confirmed included scope, preserve unrelated work, and do not silently add excluded scope.",
          references: [...requirementIds, ...includedScopeIds],
        },
        {
          id: "verify",
          instruction:
            "Verify every acceptance criterion with its specified method and collect each required evidence item.",
          references: criterionIds,
        },
        {
          id: "repair",
          instruction: `Repair failed verification within the confirmed limit of ${spec.limits.maximumRepairAttempts} focused attempts, then stop if the failure persists.`,
          references: criterionIds,
        },
        {
          id: "report",
          instruction:
            "Return the confirmed final-report fields with criterion-level statuses and exact evidence references; never claim completion without evidence.",
          references: criterionIds,
        },
      ],
    },
    runtimeApprovalGates,
  });
}
