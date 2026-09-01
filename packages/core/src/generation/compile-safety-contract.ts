import {
  acceptanceContractDraftSchema,
  safetyContractDraftSchema,
  type AcceptanceContractDraft,
  type ContractFinding,
  type SafetyAction,
  type SafetyContractDraft,
} from "@loopz/contracts/loopspec";
import type { ValidationIssue } from "@loopz/contracts/validation";

import { validateAcceptanceContractDraft } from "./compile-acceptance-contract";

export type SafetyDraftValidation =
  | { valid: true; value: SafetyContractDraft; issues: [] }
  | { valid: false; issues: ValidationIssue[] };

const restrictedActions = [
  "Do not expose, print, commit, or transmit credentials or secrets.",
  "Do not deploy to or modify production systems in the LoopZ MVP.",
  "Do not perform irreversible data deletion or destructive migrations without " +
    "human approval and a recovery plan.",
  "Do not initiate real financial transactions, purchases, or subscriptions without human approval.",
  "Do not call external services or send external communications beyond confirmed scope and approval gates.",
] as const;

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function duplicateValues(values: readonly string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function uniqueActions(actions: SafetyAction[]): SafetyAction[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    const key = `${action.category}:${normalize(action.action)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function decision(
  draft: AcceptanceContractDraft,
  category: AcceptanceContractDraft["interviewDecisions"][number]["category"],
) {
  return draft.interviewDecisions.find((item) => item.category === category);
}

function referencedText(draft: AcceptanceContractDraft): Array<{ reference: string; text: string }> {
  return [
    ...draft.objective.deliverables.map((item) => ({ reference: item.id, text: item.description })),
    ...draft.scope.included.map((item) => ({ reference: item.id, text: item.description })),
  ];
}

function plannedActions(draft: AcceptanceContractDraft): SafetyAction[] {
  const actions: SafetyAction[] = [];
  const candidates = referencedText(draft);
  const paymentDecision = decision(draft, "payments")?.answer ?? "";
  const integrationDecision = decision(draft, "external_integrations")?.answer ?? "";
  const deploymentDecision = decision(draft, "deployment")?.answer ?? "";
  let hasExternalServiceCandidate = false;

  for (const candidate of candidates) {
    if (
      /\b(delete|deletion|remove|removal|erase|purge|drop|truncate|destructive migration|reset (?:the )?database)\b/i.test(
        candidate.text,
      )
    ) {
      actions.push({
        action:
          `Perform the destructive data operation described by ${candidate.reference}: ` +
          candidate.text,
        category: "destructive",
        requiresApproval: true,
      });
    }

    if (
      /\b(api|webhook|third[- ]party|external (?:service|integration)|send (?:email|sms)|email service|sms service)\b/i.test(
        candidate.text,
      )
    ) {
      hasExternalServiceCandidate = true;
      actions.push({
        action:
          `Connect to or call the external service described by ${candidate.reference}: ` +
          candidate.text,
        category: "external_service",
        requiresApproval: true,
      });
    }

    if (/\b(api key|access token|secret|credential|private key|password)\b/i.test(candidate.text)) {
      actions.push({
        action: `Use credentials required by ${candidate.reference}: ${candidate.text}`,
        category: "credentials",
        requiresApproval: true,
      });
    }
  }

  if (/\breal payment/i.test(paymentDecision)) {
    actions.push({
      action: "Enable or test real payment processing",
      category: "financial",
      requiresApproval: true,
    });
  }

  if (
    !paymentDecision &&
    candidates.some(
      (item) =>
        /\b(payments?|checkout|billing|subscriptions?)\b/i.test(item.text) &&
        !/\b(prototype|mock|simulated|non-functional)\b/i.test(item.text),
    )
  ) {
    actions.push({
      action: "Enable or test payment processing whose prototype/real boundary is not confirmed",
      category: "financial",
      requiresApproval: true,
    });
  }

  if (
    integrationDecision &&
    !hasExternalServiceCandidate &&
    !/\b(mock|local fake|stub|do not call|without calling)\b/i.test(integrationDecision)
  ) {
    actions.push({
      action: `Use the confirmed external integration: ${integrationDecision}`,
      category: "external_service",
      requiresApproval: true,
    });
  }

  if (/\b(staging|production)\b/i.test(deploymentDecision)) {
    actions.push({
      action: `Deploy to the confirmed environment: ${deploymentDecision}`,
      category: "production",
      requiresApproval: true,
    });
  }

  return uniqueActions(actions);
}

function detectFindings(
  draft: AcceptanceContractDraft,
  actions: SafetyAction[],
): ContractFinding[] {
  const findings: Omit<ContractFinding, "id">[] = [];
  const included = new Map(
    draft.scope.included.map((item) => [normalize(item.description), item.id]),
  );

  for (const excluded of draft.scope.excluded) {
    const includedId = included.get(normalize(excluded.description));
    if (includedId) {
      findings.push({
        kind: "contradiction",
        severity: "blocking",
        message: `${includedId} and ${excluded.id} describe the same included and excluded scope.`,
        sourceReferences: [includedId, excluded.id],
      });
    }
  }

  const paymentDecision = decision(draft, "payments");
  const authenticationDecision = decision(draft, "authentication");
  const authorizationDecision = decision(draft, "authorization");
  const deploymentDecision = decision(draft, "deployment");
  const dataDecision = decision(draft, "data_handling");
  const deliverables = draft.objective.deliverables;

  if (
    paymentDecision &&
    /\bexclude\b/i.test(paymentDecision.answer) &&
    deliverables.some((item) => /\b(payments?|checkout|billing|subscriptions?)\b/i.test(item.description))
  ) {
    findings.push({
      kind: "contradiction",
      severity: "warning",
      message:
        "The confirmed interview answer excludes payments, but a payment deliverable remains in scope.",
      sourceReferences: [
        paymentDecision.questionId,
        ...deliverables
          .filter((item) => /\b(payments?|checkout|billing|subscriptions?)\b/i.test(item.description))
          .map((item) => item.id),
      ],
    });
  }

  if (
    authenticationDecision &&
    /\b(no auth|no authentication|not required|exclude)\b/i.test(authenticationDecision.answer) &&
    deliverables.some((item) => /\b(auth|authentication|login|log in|sign[- ]in)\b/i.test(item.description))
  ) {
    findings.push({
      kind: "contradiction",
      severity: "warning",
      message:
        "The confirmed interview answer excludes authentication, but an authentication deliverable remains in scope.",
      sourceReferences: [
        authenticationDecision.questionId,
        ...deliverables
          .filter((item) =>
            /\b(auth|authentication|login|log in|sign[- ]in)\b/i.test(item.description),
          )
          .map((item) => item.id),
      ],
    });
  }

  if (
    authorizationDecision &&
    !/^(?:authorized|yes,? i am authorized)$/i.test(authorizationDecision.answer.trim())
  ) {
    findings.push({
      kind: "safety_boundary",
      severity: "blocking",
      message: "Project modification authorization is absent or unresolved.",
      sourceReferences: [authorizationDecision.questionId],
    });
  }

  if (deploymentDecision && /\bproduction\b/i.test(deploymentDecision.answer)) {
    findings.push({
      kind: "safety_boundary",
      severity: "blocking",
      message: "Production deployment is outside the LoopZ MVP execution boundary.",
      sourceReferences: [deploymentDecision.questionId],
    });
  }

  if (
    !deploymentDecision &&
    /(?:\bdeploy\b[^.!?\n]{0,160}\bproduction\b|\bproduction deployment\b|\bpush (?:it )?live\b)/i.test(
      draft.request.originalPrompt,
    )
  ) {
    findings.push({
      kind: "safety_boundary",
      severity: "blocking",
      message: "The request includes production deployment without a confirmed safe environment boundary.",
      sourceReferences: ["request.originalPrompt"],
    });
  }

  if (
    dataDecision &&
    /\b(real patient|medical records?|credit card numbers?|bank credentials?)\b/i.test(
      dataDecision.answer,
    )
  ) {
    findings.push({
      kind: "safety_boundary",
      severity: "blocking",
      message: "Real regulated or payment credential data is outside the LoopZ MVP boundary.",
      sourceReferences: [dataDecision.questionId],
    });
  }

  for (const action of actions) {
    const embeddedReferences = action.action.match(/(?:REQ-[0-9]{3}|SCOPE-(?:IN|OUT)-[0-9]{3})/g) ?? [];
    const decisionReference =
      action.category === "financial"
        ? paymentDecision?.questionId
        : action.category === "external_service"
          ? decision(draft, "external_integrations")?.questionId
          : action.category === "production"
            ? deploymentDecision?.questionId
            : undefined;
    findings.push({
      kind: "approval_gate",
      severity: "warning",
      message: `Human approval is required before this action: ${action.action}`,
      sourceReferences:
        embeddedReferences.length > 0
          ? embeddedReferences
          : [decisionReference ?? `safety.${action.category}`],
    });
  }

  return findings.map((finding, index) => ({
    id: `FIND-${String(index + 1).padStart(3, "0")}`,
    ...finding,
  }));
}

export function compileSafetyContract(input: AcceptanceContractDraft): SafetyContractDraft {
  const draft = acceptanceContractDraftSchema.parse(input);
  const actions = plannedActions(draft);
  const findings = detectFindings(draft, actions);

  return safetyContractDraftSchema.parse({
    ...draft,
    status: "safety_draft",
    safety: {
      restrictedActions: [...restrictedActions],
      approvalRequired: actions.map((action) => action.action),
      plannedActions: actions,
    },
    contractChecks: { findings },
    pendingSections: ["limits", "final_report"],
  });
}

export function validateSafetyContractDraft(input: unknown): SafetyDraftValidation {
  const parsed = safetyContractDraftSchema.safeParse(input);
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
  const { safety: _safety, contractChecks: _contractChecks, ...acceptanceFields } = draft;
  const acceptanceValidation = validateAcceptanceContractDraft({
    ...acceptanceFields,
    status: "acceptance_draft",
    pendingSections: ["safety", "limits", "final_report"],
  });
  const issues: ValidationIssue[] = acceptanceValidation.valid
    ? []
    : acceptanceValidation.issues;

  draft.contractChecks.findings.forEach((finding, index) => {
    if (finding.severity === "blocking") {
      issues.push({
        code: finding.kind === "contradiction" ? "scope_conflict" : "blocking_decision_unresolved",
        message: finding.message,
        path: `contractChecks.findings.${index}`,
      });
    }
  });

  for (const id of duplicateValues(draft.contractChecks.findings.map((finding) => finding.id))) {
    issues.push({
      code: "duplicate_finding_id",
      message: `Finding ID must be unique: ${id}`,
      path: "contractChecks.findings",
    });
  }

  const restrictionSet = new Set(draft.safety.restrictedActions.map(normalize));
  for (const restriction of restrictedActions) {
    if (!restrictionSet.has(normalize(restriction))) {
      issues.push({
        code: "safety_restriction_missing",
        message: `Required MVP safety restriction is missing: ${restriction}`,
        path: "safety.restrictedActions",
      });
    }
  }

  const approvalSet = new Set(draft.safety.approvalRequired.map(normalize));
  draft.safety.plannedActions.forEach((action, index) => {
    if (action.category !== "other" && !action.requiresApproval) {
      issues.push({
        code: "approval_required",
        message: `${action.category} action must require human approval: ${action.action}`,
        path: `safety.plannedActions.${index}`,
      });
    } else if (action.requiresApproval && !approvalSet.has(normalize(action.action))) {
      issues.push({
        code: "approval_required",
        message: `Approval-required action is missing from the approval gate list: ${action.action}`,
        path: `safety.approvalRequired`,
      });
    }
  });

  return issues.length > 0
    ? { valid: false, issues }
    : { valid: true, value: draft, issues: [] };
}
