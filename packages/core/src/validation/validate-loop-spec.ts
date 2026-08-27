import {
  loopSpecLiteSchema,
  type LoopSpecLite,
  type ValidationIssue,
} from "@loopz/contracts";

export type LoopSpecValidation =
  | { valid: true; value: LoopSpecLite; issues: [] }
  | { valid: false; issues: ValidationIssue[] };

function duplicateValues(values: readonly string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function normalizeScopeText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function validateLoopSpec(input: unknown): LoopSpecValidation {
  const parsed = loopSpecLiteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "schema_invalid",
        message: issue.message,
        path: issue.path.join("."),
      })),
    };
  }

  const spec = parsed.data;
  const issues: ValidationIssue[] = [];
  const requirementIds = spec.objective.deliverables.map((item) => item.id);
  const criterionIds = spec.acceptance.criteria.map((criterion) => criterion.id);

  for (const id of duplicateValues(requirementIds)) {
    issues.push({
      code: "duplicate_requirement_id",
      message: `Requirement ID must be unique: ${id}`,
      path: "objective.deliverables",
    });
  }

  for (const id of duplicateValues(criterionIds)) {
    issues.push({
      code: "duplicate_criterion_id",
      message: `Criterion ID must be unique: ${id}`,
      path: "acceptance.criteria",
    });
  }

  const knownRequirementIds = new Set(requirementIds);
  const coveredRequirementIds = new Set<string>();

  spec.acceptance.criteria.forEach((criterion, criterionIndex) => {
    criterion.requirementIds.forEach((requirementId) => {
      if (!knownRequirementIds.has(requirementId)) {
        issues.push({
          code: "unknown_requirement_reference",
          message: `${criterion.id} references unknown requirement ${requirementId}`,
          path: `acceptance.criteria.${criterionIndex}.requirementIds`,
        });
        return;
      }

      coveredRequirementIds.add(requirementId);
    });
  });

  spec.objective.deliverables.forEach((requirement, requirementIndex) => {
    if (requirement.priority === "required" && !coveredRequirementIds.has(requirement.id)) {
      issues.push({
        code: "required_requirement_uncovered",
        message: `Required requirement ${requirement.id} must map to an acceptance criterion`,
        path: `objective.deliverables.${requirementIndex}`,
      });
    }
  });

  const included = new Map(
    spec.scope.included.map((item) => [normalizeScopeText(item.description), item.id]),
  );

  spec.scope.excluded.forEach((item, excludedIndex) => {
    const conflictingId = included.get(normalizeScopeText(item.description));
    if (conflictingId !== undefined) {
      issues.push({
        code: "scope_conflict",
        message: `${conflictingId} and ${item.id} describe the same included and excluded scope`,
        path: `scope.excluded.${excludedIndex}`,
      });
    }
  });

  spec.scope.unresolvedDecisions.forEach((decision, decisionIndex) => {
    if (decision.blocking || decision.risk === "high" || decision.risk === "critical") {
      issues.push({
        code: "blocking_decision_unresolved",
        message: `${decision.id} must be resolved before task generation`,
        path: `scope.unresolvedDecisions.${decisionIndex}`,
      });
    }
  });

  spec.safety.plannedActions.forEach((action, actionIndex) => {
    if (action.category !== "other" && !action.requiresApproval) {
      issues.push({
        code: "approval_required",
        message: `${action.category} action must require human approval: ${action.action}`,
        path: `safety.plannedActions.${actionIndex}`,
      });
    }
  });

  if (issues.length > 0) {
    return { valid: false, issues };
  }

  return { valid: true, value: spec, issues: [] };
}
