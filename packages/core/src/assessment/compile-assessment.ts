import {
  assessmentCorrectionSchema,
  assessmentSchema,
  type Assessment,
  type AssessmentCorrection,
  type CriterionAssessment,
  type CriterionStatus,
  type EvidenceStrength,
} from "@loopz/contracts/assessment";
import {
  evidenceSubmissionSchema,
  type EvidenceItem,
  type EvidenceSubmission,
} from "@loopz/contracts/evidence";
import type { AcceptanceCriterion } from "@loopz/contracts/loopspec";
import { runSchema, type Run } from "@loopz/contracts/run";
import {
  confirmedContractVersionSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";

import { hashCanonicalValue } from "../canonical-hash";

export type NormalizedEvidence = {
  id: string;
  strength: EvidenceStrength;
  supportsSuccess: boolean;
  reportsFailure: boolean;
  inspectable: boolean;
  summary: string;
};

type CompileAssessmentInput = {
  run: Run;
  version: ConfirmedContractVersion;
  submission: EvidenceSubmission;
  assessmentId: string;
  assessedAt: string;
  assessmentVersion?: number;
  previousAssessmentId?: string | null;
};

type ApplyCorrectionInput = {
  assessment: Assessment;
  correctionId: string;
  criterionId: string;
  correctedStatus: CriterionStatus;
  reason: string;
  correctedAt: string;
  nextAssessmentId: string;
};

const FAILURE_PATTERN = /(?:^|\b)(?:fail(?:ed|ure)?|error|exception|timed?\s*out|non-zero|not\s+pass(?:ed)?)(?:\b|:)/i;
const COUNTED_FAILURE_PATTERN = /(?:^|\s)[1-9][0-9]*\s+(?:tests?\s+)?failed\b/i;
const SUCCESS_PATTERN = /(?:^|\b)(?:pass(?:ed|ing)?|success(?:ful(?:ly)?)?|completed|built|build\s+succeeded|0\s+failed)(?:\b|:)/i;

function evidenceText(item: EvidenceItem): string {
  return [item.description, item.command, item.content, item.uri].filter(Boolean).join("\n");
}

export function normalizeEvidenceItem(item: EvidenceItem): NormalizedEvidence {
  const text = evidenceText(item);
  const textWithoutBenignNegatives = text
    .replace(/\b0\s+(?:tests?\s+)?failed\b/gi, "")
    .replace(/\b(?:no|zero)\s+errors?\b/gi, "")
    .replace(/\bwithout\s+errors?\b/gi, "");
  const deterministic = item.type === "command_output" || item.type === "test_output";
  const reportsFailure = item.exitCode !== undefined
    ? item.exitCode !== 0
    : deterministic
      ? COUNTED_FAILURE_PATTERN.test(textWithoutBenignNegatives) || FAILURE_PATTERN.test(textWithoutBenignNegatives)
      : /(?:\bAC-[0-9]{3}\b.{0,50}\bfailed\b|\bstatus\s*[:=-]\s*failed\b)/i.test(textWithoutBenignNegatives);
  const supportsSuccess = !reportsFailure && (
    item.exitCode === 0 || SUCCESS_PATTERN.test(text)
  );
  const strength: EvidenceStrength = deterministic
    ? "deterministic"
    : item.type === "diff_summary" || item.type === "file_reference"
      ? "inspectable"
      : item.type === "screenshot" || item.type === "user_observation"
        ? "manual_observation"
        : "agent_assertion";

  return {
    id: item.id,
    strength,
    supportsSuccess,
    reportsFailure,
    inspectable: item.content !== undefined || item.uri !== undefined,
    summary: `${item.type.replaceAll("_", " ")}: ${item.description}`,
  };
}

function requirementKind(value: string): "deterministic" | "inspectable" | "manual" | "report" {
  const text = value.toLowerCase();
  if (/test|command|build|lint|type.?check|exit\s*code|terminal/.test(text)) return "deterministic";
  if (/diff|file|source|implementation|change/.test(text)) return "inspectable";
  if (/manual|browser|visual|screen|screenshot|observ/.test(text)) return "manual";
  return "report";
}

function satisfiesRequiredEvidence(required: string, evidence: readonly NormalizedEvidence[]): boolean {
  const kind = requirementKind(required);
  if (kind === "deterministic") {
    return evidence.some((item) => item.strength === "deterministic" && item.supportsSuccess);
  }
  if (kind === "inspectable") {
    return evidence.some((item) => item.strength === "inspectable" && item.inspectable);
  }
  if (kind === "manual") {
    return evidence.some((item) => item.strength === "manual_observation" && item.inspectable);
  }
  return evidence.some((item) => item.strength !== "agent_assertion" && item.inspectable);
}

function strongestEvidence(evidence: readonly NormalizedEvidence[]): EvidenceStrength {
  for (const strength of ["deterministic", "inspectable", "manual_observation", "agent_assertion"] as const) {
    if (evidence.some((item) => item.strength === strength)) return strength;
  }
  return "none";
}

function assessCriterion(
  criterion: AcceptanceCriterion,
  mapping: EvidenceSubmission["criteria"][number],
  items: ReadonlyMap<string, EvidenceItem>,
): CriterionAssessment {
  const evidence = mapping.evidenceIds
    .map((id) => items.get(id))
    .filter((item): item is EvidenceItem => item !== undefined)
    .map(normalizeEvidenceItem);
  const evidenceStrength = strongestEvidence(evidence);
  const missingRequiredEvidence = criterion.requiredEvidence.filter(
    (required) => !satisfiesRequiredEvidence(required, evidence),
  );
  const contradictions: string[] = [];
  const hasFailure = evidence.some((item) => item.reportsFailure);
  const hasSuccess = evidence.some((item) => item.supportsSuccess);
  if (mapping.claim === "passed" && hasFailure) {
    contradictions.push("The agent claimed this criterion passed, but linked output reports a failure.");
  }
  if (mapping.claim === "failed" && hasSuccess) {
    contradictions.push("The agent claimed this criterion failed, but linked output contains a success signal.");
  }

  let status: CriterionStatus;
  let explanation: string;
  let confidence: number;
  if (mapping.claim === "blocked") {
    status = "blocked";
    explanation = "The execution report marked this criterion blocked; human input or access is required.";
    confidence = 0.95;
  } else if (mapping.claim === "failed" || hasFailure) {
    status = "failed";
    explanation = hasFailure
      ? "Linked execution output contains a failure signal."
      : "The coding agent explicitly reported this criterion as failed.";
    confidence = hasFailure ? 0.98 : 0.8;
  } else if (mapping.claim === "unverified") {
    status = evidence.length === 0 ? "not_attempted" : "unverifiable";
    explanation = evidence.length === 0
      ? "No attempt or evidence was submitted for this criterion."
      : "Evidence was submitted, but neither the agent nor the output supports completion.";
    confidence = 0.9;
  } else if (evidence.length === 0 || evidenceStrength === "agent_assertion") {
    status = "unsupported_claim";
    explanation = "The pass claim has no supporting evidence beyond the agent's own assertion.";
    confidence = 0.98;
  } else if (missingRequiredEvidence.length === 0 && hasSuccess) {
    status = "verified_by_submitted_evidence";
    explanation = "The submitted evidence supports the claim and covers the required evidence types.";
    confidence = evidenceStrength === "deterministic" ? 0.96 : 0.82;
  } else if (hasSuccess || evidenceStrength === "inspectable" || evidenceStrength === "manual_observation") {
    status = "partially_supported";
    explanation = missingRequiredEvidence.length > 0
      ? `Some support was submitted, but required evidence is missing: ${missingRequiredEvidence.join("; ")}.`
      : "The submitted material provides partial support but no conclusive success signal.";
    confidence = 0.78;
  } else {
    status = "unverifiable";
    explanation = "The linked material does not contain enough information to determine completion.";
    confidence = 0.75;
  }

  return {
    criterionId: criterion.id,
    claim: mapping.claim,
    priority: criterion.priority,
    status,
    evidenceReferences: mapping.evidenceIds,
    evidenceStrength,
    missingRequiredEvidence,
    contradictions,
    explanation,
    confidence,
  };
}

function deriveOutcome(criteria: readonly CriterionAssessment[]): Assessment["outcome"] {
  const required = criteria.filter((item) => item.priority === "required");
  if (required.some((item) => item.status === "blocked")) return "blocked_human_input_required";
  if (required.some((item) => item.status === "failed")) return "repair_recommended";
  if (required.some((item) => ["unsupported_claim", "unverifiable", "not_attempted"].includes(item.status))) {
    return "unverifiable_more_evidence_required";
  }
  if (required.some((item) => item.status === "partially_supported")) return "partially_completed";
  if (criteria.some((item) => !["verified_by_submitted_evidence", "not_applicable"].includes(item.status))) {
    return "partially_completed";
  }
  return "completed_with_evidence";
}

function detectSafetyContradictions(
  version: ConfirmedContractVersion,
  submission: EvidenceSubmission,
): string[] {
  const report = [submission.finalReport, ...submission.evidenceItems.map(evidenceText)].join("\n").toLowerCase();
  const findings: string[] = [];
  for (const restriction of version.loopSpec.safety.restrictedActions) {
    const normalized = restriction.toLowerCase();
    if (/do not deploy|no production/.test(normalized) && /deployed?\s+(?:it\s+)?to\s+production/.test(report)) {
      findings.push(`Submitted evidence reports an action forbidden by the contract: ${restriction}`);
    }
    if (/credential|secret|api key/.test(normalized) && /(?:exposed|committed|printed|logged)\s+(?:a\s+)?(?:credential|secret|api key)/.test(report)) {
      findings.push(`Submitted evidence may violate the credential boundary: ${restriction}`);
    }
    if (/delete|destructive|drop/.test(normalized) && /(?:deleted?|dropped?)\s+(?:the\s+)?(?:production\s+)?(?:database|table|records?)/.test(report)) {
      findings.push(`Submitted evidence reports a potentially destructive restricted action: ${restriction}`);
    }
  }
  return [...new Set(findings)];
}

function nextAction(outcome: Assessment["outcome"]): string {
  const actions: Record<Assessment["outcome"], string> = {
    completed_with_evidence: "Review the evidence trace, then mark the run complete.",
    partially_completed: "Submit the missing evidence or continue to a focused repair for incomplete work.",
    repair_recommended: "Generate a focused repair task for the failed criteria.",
    blocked_human_input_required: "Resolve the listed blocker or provide the required approval before continuing.",
    unverifiable_more_evidence_required: "Return to evidence intake and provide the missing original output.",
    unsafe_or_out_of_scope: "Stop execution and review the contract boundary with a human.",
  };
  return actions[outcome];
}

function assertSourceIntegrity(
  run: Run,
  version: ConfirmedContractVersion,
  submission: EvidenceSubmission,
): void {
  if (run.state !== "evidence_submitted") {
    throw new Error("Assessment requires a run with submitted evidence.");
  }
  if (
    run.projectId !== version.projectId ||
    run.contractVersionId !== version.versionId ||
    run.contractHash !== version.contractHash ||
    submission.runId !== run.runId ||
    submission.contractVersionId !== version.versionId ||
    submission.contractHash !== version.contractHash
  ) {
    throw new Error("The run, contract version, and evidence submission do not match.");
  }
  const expected = version.loopSpec.acceptance.criteria.map((item) => item.id);
  const submitted = submission.criteria.map((item) => item.criterionId);
  if (new Set(submitted).size !== submitted.length || expected.length !== submitted.length || expected.some((id) => !submitted.includes(id))) {
    throw new Error("Evidence mappings must exactly match the confirmed acceptance criteria.");
  }
}

export async function compileAssessment(input: CompileAssessmentInput): Promise<Assessment> {
  const run = runSchema.parse(input.run);
  const version = confirmedContractVersionSchema.parse(input.version);
  const submission = evidenceSubmissionSchema.parse(input.submission);
  assertSourceIntegrity(run, version, submission);
  if (await hashCanonicalValue(version.loopSpec) !== version.contractHash) {
    throw new Error("The confirmed contract hash does not match its LoopSpec content.");
  }

  const mappings = new Map(submission.criteria.map((item) => [item.criterionId, item]));
  const items = new Map(submission.evidenceItems.map((item) => [item.id, item]));
  const criteria = version.loopSpec.acceptance.criteria.map((criterion) =>
    assessCriterion(criterion, mappings.get(criterion.id)!, items)
  );
  const contradictions = criteria.flatMap((item) =>
    item.contradictions.map((message) => `${item.criterionId}: ${message}`)
  );
  const safetyContradictions = detectSafetyContradictions(version, submission);
  contradictions.push(...safetyContradictions);
  const risks = criteria
    .filter((item) => item.missingRequiredEvidence.length > 0)
    .map((item) => `${item.criterionId} is missing ${item.missingRequiredEvidence.length} required evidence item(s).`);
  const outcome = safetyContradictions.length > 0 ? "unsafe_or_out_of_scope" : deriveOutcome(criteria);

  return assessmentSchema.parse({
    schemaVersion: "0.2",
    assessmentId: input.assessmentId,
    assessmentVersion: input.assessmentVersion ?? 1,
    previousAssessmentId: input.previousAssessmentId ?? null,
    runId: run.runId,
    contractVersionId: version.versionId,
    contractHash: version.contractHash,
    evidenceSubmissionId: submission.submissionId,
    outcome,
    criteria,
    contradictions,
    risks,
    recommendedNextAction: nextAction(outcome),
    corrections: [],
    assessedAt: input.assessedAt,
  });
}

export function applyAssessmentCorrection(input: ApplyCorrectionInput): Assessment {
  const assessment = assessmentSchema.parse(input.assessment);
  const selected = assessment.criteria.find((item) => item.criterionId === input.criterionId);
  if (!selected) throw new Error("The correction references an unknown criterion.");
  if (selected.status === input.correctedStatus) {
    throw new Error("Choose a status different from the current assessment.");
  }
  const correction: AssessmentCorrection = assessmentCorrectionSchema.parse({
    correctionId: input.correctionId,
    criterionId: input.criterionId,
    previousStatus: selected.status,
    correctedStatus: input.correctedStatus,
    reason: input.reason,
    correctedAt: input.correctedAt,
  });
  const criteria = assessment.criteria.map((item) => item.criterionId === input.criterionId
    ? {
        ...item,
        status: input.correctedStatus,
        explanation: `User correction: ${input.reason.trim()}`,
        confidence: 1,
        contradictions: [],
        missingRequiredEvidence: ["verified_by_submitted_evidence", "not_applicable"].includes(input.correctedStatus)
          ? []
          : item.missingRequiredEvidence,
      }
    : item
  );
  const nonCriterionContradictions = assessment.contradictions.filter((item) => !/^AC-[0-9]{3}:/.test(item));
  const outcome = nonCriterionContradictions.length > 0 ? "unsafe_or_out_of_scope" : deriveOutcome(criteria);
  const contradictions = [
    ...nonCriterionContradictions,
    ...criteria.flatMap((item) => item.contradictions.map((message) => `${item.criterionId}: ${message}`)),
  ];
  const risks = criteria
    .filter((item) => item.missingRequiredEvidence.length > 0)
    .map((item) => `${item.criterionId} is missing ${item.missingRequiredEvidence.length} required evidence item(s).`);
  return assessmentSchema.parse({
    ...assessment,
    assessmentId: input.nextAssessmentId,
    assessmentVersion: assessment.assessmentVersion + 1,
    previousAssessmentId: assessment.assessmentId,
    outcome,
    criteria,
    contradictions,
    risks,
    recommendedNextAction: nextAction(outcome),
    corrections: [...assessment.corrections, correction],
    assessedAt: input.correctedAt,
  });
}
