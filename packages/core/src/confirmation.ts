import {
  safetyContractDraftSchema,
  loopSpecLiteSchema,
  type SafetyContractDraft,
} from "@loopz/contracts/loopspec";
import {
  confirmedContractVersionSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";

import { validateSafetyContractDraft } from "./generation/compile-safety-contract";
import { validateLoopSpec } from "./validation/validate-loop-spec";

function confirmedDecision<T extends { confirmedByUser: boolean }>(decision: T): T {
  return { ...decision, confirmedByUser: true };
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

export function compileConfirmedLoopSpec(draftInput: SafetyContractDraft) {
  const draft = safetyContractDraftSchema.parse(draftInput);
  const validation = validateSafetyContractDraft(draft);
  if (!validation.valid) {
    throw new Error(
      `The contract cannot be confirmed: ${validation.issues.map((issue) => issue.message).join("; ")}`,
    );
  }

  const loopSpec = loopSpecLiteSchema.parse({
    schemaVersion: draft.schemaVersion,
    request: {
      ...draft.request,
      taskType: confirmedDecision(draft.request.taskType),
    },
    objective: {
      goal: confirmedDecision(draft.objective.goal),
      deliverables: draft.objective.deliverables.map((item) => ({
        ...item,
        provenance: confirmedDecision(item.provenance),
      })),
    },
    scope: {
      included: draft.scope.included.map((item) => ({
        ...item,
        provenance: confirmedDecision(item.provenance),
      })),
      excluded: draft.scope.excluded.map((item) => ({
        ...item,
        provenance: confirmedDecision(item.provenance),
      })),
      assumptions: draft.scope.assumptions.map(confirmedDecision),
      unresolvedDecisions: [],
    },
    environment: {
      projectStatus: confirmedDecision(draft.environment.projectStatus),
      projectContext: confirmedDecision(draft.environment.projectContext),
      technologyPreferences: draft.environment.technologyPreferences.map(confirmedDecision),
    },
    workflow: { phases: ["plan", "implement", "verify", "repair"] },
    acceptance: { criteria: draft.acceptance.criteria },
    safety: draft.safety,
    limits: {
      maximumRepairAttempts: 2,
      stopWhen: [
        "A human approval gate is reached.",
        "Required credentials, repository access, or evidence are unavailable.",
        "The same failure repeats after two focused repair attempts.",
        "Continuing would expand confirmed scope or violate a restricted action.",
      ],
    },
    finalReport: {
      requiredFields: [
        "Summary of work completed",
        "Changed files",
        "Verification commands and results",
        "Criterion-by-criterion status and evidence references",
        "Blockers, assumptions, approvals, and remaining work",
      ],
      criterionIdReferencesRequired: true,
      evidenceReferencesRequired: true,
    },
  });
  const loopSpecValidation = validateLoopSpec(loopSpec);
  if (!loopSpecValidation.valid) {
    throw new Error(
      `The confirmed LoopSpec is invalid: ${loopSpecValidation.issues
        .map((issue) => issue.message)
        .join("; ")}`,
    );
  }
  return loopSpec;
}

export async function confirmContractVersion(input: {
  draft: SafetyContractDraft;
  versionId: string;
  version: number;
  confirmedAt: string;
  approvedActions: string[];
}): Promise<ConfirmedContractVersion> {
  const draft = safetyContractDraftSchema.parse(input.draft);
  const requiredApprovals = draft.safety.plannedActions
    .filter((action) => action.requiresApproval)
    .map((action) => action.action);
  const approved = new Set(input.approvedActions);
  const missing = requiredApprovals.filter((action) => !approved.has(action));
  const unknown = input.approvedActions.filter((action) => !requiredApprovals.includes(action));
  if (missing.length > 0) {
    throw new Error(`Approve every planned action before confirmation: ${missing.join("; ")}`);
  }
  if (unknown.length > 0 || approved.size !== input.approvedActions.length) {
    throw new Error("Approval acknowledgments must be unique and match planned actions.");
  }

  const loopSpec = compileConfirmedLoopSpec(draft);
  const contractHash = await sha256(canonicalJson(loopSpec));
  const actionByName = new Map(draft.safety.plannedActions.map((action) => [action.action, action]));

  return confirmedContractVersionSchema.parse({
    schemaVersion: "0.1",
    versionId: input.versionId,
    projectId: draft.projectId,
    version: input.version,
    confirmedAt: input.confirmedAt,
    confirmedBy: "user",
    contractHash,
    approvals: input.approvedActions.map((action) => ({
      action,
      category: actionByName.get(action)!.category,
      approvedAt: input.confirmedAt,
    })),
    loopSpec,
  });
}
