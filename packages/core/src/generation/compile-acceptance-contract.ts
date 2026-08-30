import {
  acceptanceContractDraftSchema,
  contractFoundationSchema,
  type AcceptanceContractDraft,
  type AcceptanceCriterion,
  type ContractFoundation,
  type Requirement,
} from "@loopz/contracts/loopspec";
import type { ValidationIssue } from "@loopz/contracts/validation";

type RequirementKind =
  | "authentication"
  | "data"
  | "deletion"
  | "external_integration"
  | "form"
  | "payment"
  | "regression"
  | "user_interface"
  | "generic";

export type AcceptanceDraftValidation =
  | { valid: true; value: AcceptanceContractDraft; issues: [] }
  | { valid: false; issues: ValidationIssue[] };

function uniqueValues(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    // Command arguments and paths are case-sensitive; do not normalize their contents.
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function duplicateValues(values: readonly string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function requirementKind(requirement: Requirement, foundation: ContractFoundation): RequirementKind {
  const text = requirement.description.toLocaleLowerCase();

  if (foundation.request.taskType.value === "bug_fix" || /\b(bug|broken|fix|regression)\b/.test(text)) {
    return "regression";
  }
  if (/\b(delete|deletion|remove|removal|erase|purge)\b/.test(text)) {
    return "deletion";
  }
  if (/\b(auth|authentication|login|log in|sign in|sign-in|permission|role)\b/.test(text)) {
    return "authentication";
  }
  if (/\b(payments?|checkout|billing|subscriptions?|stripe|razorpay)\b/.test(text)) {
    return "payment";
  }
  if (/\b(api|webhook|integration|third-party|email service|sms|maps)\b/.test(text)) {
    return "external_integration";
  }
  if (/\b(form|field|submit|input|validation)\b/.test(text)) {
    return "form";
  }
  if (/\b(save|store|persist|database|data|upload|retention)\b/.test(text)) {
    return "data";
  }
  if (/\b(page|screen|view|dashboard|responsive|visual|layout|component|button)\b/.test(text)) {
    return "user_interface";
  }
  return "generic";
}

function acceptanceStatement(kind: RequirementKind, description: string): string {
  const requirement = description.replace(/[.!?]+$/, "");

  switch (kind) {
    case "regression":
      return `A focused regression test reproduces the reported failure for “${requirement}” and passes after the fix without breaking the existing test suite.`;
    case "authentication":
      return `Authorized users can complete “${requirement}”, while unauthenticated or disallowed users receive an observable rejection.`;
    case "payment":
      if (/\b(non-functional prototype|prototype|mock|simulated)\b/i.test(requirement)) {
        return `The payment prototype described by “${requirement}” shows simulated success, cancellation, and failure outcomes without initiating a real transaction.`;
      }
      return `The payment behavior described by “${requirement}” produces explicit success, cancellation, and failure outcomes without creating duplicate transactions.`;
    case "external_integration":
      return `The integration described by “${requirement}” handles both a successful response and an unavailable or failed service without corrupting application state.`;
    case "data":
      return `After completing “${requirement}”, the expected data remains after reload or re-query and respects the clarified access and deletion rules.`;
    case "deletion":
      return `After completing “${requirement}”, reload or re-query confirms the requested removal or retention outcome under the clarified deletion and access rules; unrelated data is unchanged.`;
    case "form":
      return `Users can complete “${requirement}” with valid input, while invalid input shows an actionable error and does not create an invalid record.`;
    case "user_interface":
      return `The interface described by “${requirement}” is reachable through the intended user flow and works at mobile and desktop widths without runtime errors.`;
    default:
      return `Completing the behavior described by “${requirement}” produces an observable success result without introducing errors in the affected flow.`;
  }
}

function evidenceFor(kind: RequirementKind, requirementId: string): string[] {
  const focusedEvidence: Record<RequirementKind, string> = {
    regression: `Passing regression-test output for ${requirementId}`,
    authentication: `Passing authentication and authorization test output for ${requirementId}`,
    payment: `Passing success, cancellation, and failure-path test output for ${requirementId}`,
    external_integration: `Passing integration or mock-contract test output for ${requirementId}`,
    data: `Passing persistence and access-control test output for ${requirementId}`,
    deletion: `Passing deletion, retention, and unaffected-data test output for ${requirementId}`,
    form: `Passing valid-input and invalid-input test output for ${requirementId}`,
    user_interface: `Browser-check result or screenshots for ${requirementId}`,
    generic: `Passing focused behavior-test output for ${requirementId}`,
  };

  return [focusedEvidence[kind], "Relevant verification command output", "Changed-file summary"];
}

function extractCommands(value: string): string[] {
  // Scan once, in source order, so python -m pytest is not also emitted as pytest.
  // This reads a bounded command notation, not arbitrary shell syntax. Nothing is executed.
  const start = /\b(?:(?:npm|pnpm|yarn|bun)[ \t]+(?:run[ \t]+)?[a-z0-9:_-]+|npx[ \t]+[a-z0-9@/._-]+|python(?:3)?[ \t]+-m[ \t]+pytest|pytest|cargo[ \t]+(?:test|build|check)|go[ \t]+test)\b/g;
  const argument = /^[ \t]+("[^"\n]*"|'[^'\n]*'|[^\s,;`|&<>]+)/;
  const proseBoundary = /^(?:and|or|then|next|after|before|followed|to|with|which|while|follow|inspect|verify|check|confirm|ensure)$/i;
  const commands: string[] = [];

  for (let match = start.exec(value); match; match = start.exec(value)) {
    const parts = [match[0]];
    let end = start.lastIndex;
    let next = argument.exec(value.slice(end));
    while (next) {
      const token = next[1]!;
      if (proseBoundary.test(token)) break;
      // Strip sentence punctuation, but preserve file extensions and Go's ./... selector.
      const cleaned = token.replace(/(?<!\.)\.$/, "");
      if (!cleaned) break;
      parts.push(cleaned);
      end += next[0].length;
      if (cleaned !== token) break;
      next = argument.exec(value.slice(end));
    }
    commands.push(parts.join(" "));
    start.lastIndex = end;
  }
  return uniqueValues(commands);
}

function inferredCommands(foundation: ContractFoundation): string[] {
  const context = [
    foundation.environment.projectContext.value,
    ...foundation.environment.technologyPreferences.map((item) => item.value),
  ].join(" ");

  if (/\b(rust|cargo)\b/i.test(context)) return ["cargo test", "cargo build"];
  if (/\b(python|django|flask|fastapi|pytest)\b/i.test(context)) return ["pytest"];
  if (/\b(golang|go module|go project)\b/i.test(context)) return ["go test ./..."];

  const packageManager = /\bpnpm\b/i.test(context)
    ? "pnpm"
    : /\byarn\b/i.test(context)
      ? "yarn"
      : /\bbun\b/i.test(context)
        ? "bun"
        : "npm";
  return [`${packageManager} test`, `${packageManager} run build`];
}

function verificationPlan(foundation: ContractFoundation): string | undefined {
  return foundation.interviewDecisions.find((item) => item.category === "verification")?.answer;
}

function verificationCommands(foundation: ContractFoundation): string[] {
  const confirmedPlan = verificationPlan(foundation);
  const explicitCommands = confirmedPlan ? extractCommands(confirmedPlan) : [];
  return explicitCommands.length > 0 ? explicitCommands : inferredCommands(foundation);
}

function verificationMethod(
  foundation: ContractFoundation,
  kind: RequirementKind,
  commands: string[],
): string {
  const confirmedPlan = verificationPlan(foundation);
  const focus: Record<RequirementKind, string> = {
    regression: "run a focused regression test for the reported failure",
    authentication: "test permitted and rejected access paths",
    payment: "test success, cancellation, failure, and duplicate-submission paths",
    external_integration: "test successful and unavailable-service responses",
    data: "test persistence after reload and the clarified access rules",
    deletion: "test the requested removal or retention outcome after reload and confirm unrelated data is unchanged",
    form: "test valid and invalid submissions",
    user_interface: "inspect the intended flow at mobile and desktop widths",
    generic: "run a focused behavior test and inspect the result",
  };
  const commandText = commands.join("; ");

  return confirmedPlan
    ? `Follow the user-confirmed verification plan: ${confirmedPlan} Focus this criterion by checking that you ${focus[kind]}.`
    : `Run ${commandText}, then ${focus[kind]}.`;
}

export function compileAcceptanceContract(
  foundationInput: ContractFoundation,
): AcceptanceContractDraft {
  const foundation = contractFoundationSchema.parse(foundationInput);
  const commands = verificationCommands(foundation);
  const criteria: AcceptanceCriterion[] = foundation.objective.deliverables.map(
    (requirement, index) => {
      const kind = requirementKind(requirement, foundation);
      return {
        id: `AC-${String(index + 1).padStart(3, "0")}`,
        requirementIds: [requirement.id],
        requirement: acceptanceStatement(kind, requirement.description),
        verificationMethod: verificationMethod(foundation, kind, commands),
        requiredEvidence: evidenceFor(kind, requirement.id),
        priority: requirement.priority,
      };
    },
  );

  const draft = acceptanceContractDraftSchema.parse({
    ...foundation,
    status: "acceptance_draft",
    acceptance: { criteria, verificationCommands: commands },
    pendingSections: ["safety", "limits", "final_report"],
  });
  const validation = validateAcceptanceContractDraft(draft);
  if (!validation.valid) {
    throw new Error(
      `Generated acceptance contract is invalid: ${validation.issues
        .map((issue) => issue.message)
        .join("; ")}`,
    );
  }

  return draft;
}

export function validateAcceptanceContractDraft(input: unknown): AcceptanceDraftValidation {
  const parsed = acceptanceContractDraftSchema.safeParse(input);
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

  const draft = parsed.data;
  const issues: ValidationIssue[] = [];
  const requirementIds = draft.objective.deliverables.map((item) => item.id);
  const criterionIds = draft.acceptance.criteria.map((item) => item.id);
  const knownRequirementIds = new Set(requirementIds);
  const coveredRequirementIds = new Set<string>();

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

  draft.acceptance.criteria.forEach((criterion, criterionIndex) => {
    criterion.requirementIds.forEach((requirementId) => {
      if (!knownRequirementIds.has(requirementId)) {
        issues.push({
          code: "unknown_requirement_reference",
          message: `${criterion.id} references unknown requirement ${requirementId}`,
          path: `acceptance.criteria.${criterionIndex}.requirementIds`,
        });
      } else {
        coveredRequirementIds.add(requirementId);
      }
    });

    const mappedRequirements = draft.objective.deliverables.filter((requirement) =>
      criterion.requirementIds.includes(requirement.id),
    );
    if (mappedRequirements.some((requirement) => requirement.priority !== criterion.priority)) {
      issues.push({
        code: "criterion_priority_mismatch",
        message: `${criterion.id} priority must match its mapped requirement priority`,
        path: `acceptance.criteria.${criterionIndex}.priority`,
      });
    }
  });

  draft.objective.deliverables.forEach((requirement, requirementIndex) => {
    if (requirement.priority === "required" && !coveredRequirementIds.has(requirement.id)) {
      issues.push({
        code: "required_requirement_uncovered",
        message: `Required requirement ${requirement.id} must map to an acceptance criterion`,
        path: `objective.deliverables.${requirementIndex}`,
      });
    }
  });

  if (draft.acceptance.verificationCommands.length === 0) {
    issues.push({
      code: "verification_command_missing",
      message: "At least one verification command is required",
      path: "acceptance.verificationCommands",
    });
  }

  return issues.length > 0
    ? { valid: false, issues }
    : { valid: true, value: draft, issues: [] };
}
