import {
  evidenceReturnDraftSchema,
  evidenceSubmissionSchema,
  type EvidenceItem,
  type EvidenceReturnDraft,
  type EvidenceSubmission,
} from "@loopz/contracts/evidence";
import { runSchema, type Run } from "@loopz/contracts/run";
import {
  confirmedContractVersionSchema,
  type ConfirmedContractVersion,
} from "@loopz/contracts/versioning";

import { hashCanonicalValue } from "../canonical-hash";

type CompileEvidenceInput = {
  run: Run;
  version: ConfirmedContractVersion;
  draft: EvidenceReturnDraft;
  submissionId: string;
  submittedAt: string;
};

type EvidenceSource = "report" | "command" | "diff" | "observation" | "manual";

function relevantSources(verificationText: string): Set<EvidenceSource> {
  const text = verificationText.toLowerCase();
  const sources = new Set<EvidenceSource>();
  if (/test|command|build|lint|typecheck|terminal/.test(text)) sources.add("command");
  if (/diff|file|source|change/.test(text)) sources.add("diff");
  if (/manual|browser|visual|screenshot|observ/.test(text)) {
    sources.add("observation");
    sources.add("manual");
  }
  return sources;
}

function mentionedCriterionIds(value: string): string[] {
  return [...new Set(value.match(/\bAC-[0-9]{3}\b/g) ?? [])];
}

export async function compileEvidenceSubmission(
  input: CompileEvidenceInput,
): Promise<EvidenceSubmission> {
  const run = runSchema.parse(input.run);
  const version = confirmedContractVersionSchema.parse(input.version);
  const draft = evidenceReturnDraftSchema.parse(input.draft);

  if (run.state !== "awaiting_evidence") {
    throw new Error("Evidence can only be submitted for a run awaiting evidence.");
  }
  if (
    run.projectId !== version.projectId ||
    run.contractVersionId !== version.versionId ||
    run.contractVersion !== version.version ||
    run.contractHash !== version.contractHash
  ) {
    throw new Error("The run does not match the confirmed contract version.");
  }
  if (await hashCanonicalValue(version.loopSpec) !== version.contractHash) {
    throw new Error("The confirmed contract hash does not match its LoopSpec content.");
  }

  const criterionIds = version.loopSpec.acceptance.criteria.map((criterion) => criterion.id);
  const knownCriteria = new Set(criterionIds);
  const claims = new Map(draft.criterionClaims.map((item) => [item.criterionId, item.claim]));
  if (claims.size !== draft.criterionClaims.length) {
    throw new Error("Each acceptance criterion must have exactly one claim.");
  }
  const submittedIds = [...claims.keys()];
  const unknownClaims = submittedIds.filter((id) => !knownCriteria.has(id));
  const missingClaims = criterionIds.filter((id) => !claims.has(id));
  if (unknownClaims.length > 0 || missingClaims.length > 0) {
    throw new Error(
      `Criterion claims must exactly match the confirmed contract. Unknown: ${unknownClaims.join(", ") || "none"}; missing: ${missingClaims.join(", ") || "none"}.`,
    );
  }
  const unknownReportIds = mentionedCriterionIds(draft.finalReport).filter(
    (id) => !knownCriteria.has(id),
  );
  if (unknownReportIds.length > 0) {
    throw new Error(`The final report references unknown criterion IDs: ${unknownReportIds.join(", ")}.`);
  }

  const evidenceItems: EvidenceItem[] = [];
  const sourceIds = new Map<EvidenceSource, string>();
  function addEvidence(source: EvidenceSource, item: Omit<EvidenceItem, "id">) {
    const id = `EV-${String(evidenceItems.length + 1).padStart(3, "0")}`;
    evidenceItems.push({ id, ...item });
    sourceIds.set(source, id);
  }

  addEvidence("report", {
    type: "agent_report",
    description: "Coding agent final report",
    content: draft.finalReport.trim(),
  });
  if (draft.commandOutput.trim()) addEvidence("command", {
    type: "command_output",
    description: "Returned test or build command output",
    content: draft.commandOutput.trim(),
  });
  if (draft.diffSummary.trim()) addEvidence("diff", {
    type: "diff_summary",
    description: "Returned diff or file-change summary",
    content: draft.diffSummary.trim(),
  });
  if (draft.userObservedProblems.trim()) addEvidence("observation", {
    type: "user_observation",
    description: "Problems observed by the user",
    content: draft.userObservedProblems.trim(),
  });
  if (draft.manualChecks.trim()) addEvidence("manual", {
    type: "user_observation",
    description: "Manual checks performed by the user",
    content: draft.manualChecks.trim(),
  });

  const reportMentions = new Set(mentionedCriterionIds(draft.finalReport));
  const criteria = version.loopSpec.acceptance.criteria.map((criterion) => {
    const evidenceIds: string[] = [];
    const reportId = sourceIds.get("report");
    if (reportId && reportMentions.has(criterion.id)) evidenceIds.push(reportId);
    const relevance = relevantSources([
      criterion.verificationMethod,
      ...criterion.requiredEvidence,
    ].join(" "));
    for (const source of ["command", "diff", "observation", "manual"] as const) {
      const evidenceId = sourceIds.get(source);
      if (evidenceId && relevance.has(source)) evidenceIds.push(evidenceId);
    }
    return {
      criterionId: criterion.id,
      claim: claims.get(criterion.id)!,
      evidenceIds,
    };
  });

  return evidenceSubmissionSchema.parse({
    schemaVersion: "0.2",
    submissionId: input.submissionId,
    runId: run.runId,
    contractVersionId: version.versionId,
    contractHash: version.contractHash,
    submittedAt: input.submittedAt,
    codingAgent: draft.codingAgent,
    finalReport: draft.finalReport,
    evidenceItems,
    criteria,
    userNotes: draft.userNotes,
  });
}
