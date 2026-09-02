import { assessmentSchema, type Assessment } from "@loopz/contracts/assessment";
import {
  runResolutionSchema,
  runSchema,
  type Run,
  type RunResolution,
  type RunResolutionReason,
} from "@loopz/contracts/run";
import { confirmedContractVersionSchema, type ConfirmedContractVersion } from "@loopz/contracts/versioning";

type ResolveRunInput = {
  run: Run;
  version: ConfirmedContractVersion;
  assessment: Assessment;
  resolutionId: string;
  resolvedAt: string;
  forcedBlockReason?: Extract<RunResolutionReason, "no_progress">;
};

export type RunNextStep = "complete" | "repair" | "more_evidence" | "block";

export function determineRunNextStep(
  runInput: Run,
  versionInput: ConfirmedContractVersion,
  assessmentInput: Assessment,
): RunNextStep {
  const run = runSchema.parse(runInput);
  const version = confirmedContractVersionSchema.parse(versionInput);
  const assessment = assessmentSchema.parse(assessmentInput);
  if (
    run.projectId !== version.projectId ||
    run.contractVersionId !== version.versionId ||
    run.contractHash !== version.contractHash ||
    assessment.runId !== run.runId ||
    assessment.contractVersionId !== version.versionId ||
    assessment.contractHash !== run.contractHash
  ) {
    throw new Error("The run, contract, and assessment do not match.");
  }
  if (assessment.outcome === "completed_with_evidence") return "complete";
  if (["blocked_human_input_required", "unsafe_or_out_of_scope"].includes(assessment.outcome)) return "block";
  if (run.repairAttempts >= version.loopSpec.limits.maximumRepairAttempts) return "block";
  if (assessment.outcome === "unverifiable_more_evidence_required") return "more_evidence";
  return "repair";
}

export function resolveRun(input: ResolveRunInput): { run: Run; resolution: RunResolution } {
  const run = runSchema.parse(input.run);
  const version = confirmedContractVersionSchema.parse(input.version);
  const assessment = assessmentSchema.parse(input.assessment);
  if (run.state !== "assessed") throw new Error("Only an assessed run can be resolved.");
  const next = input.forcedBlockReason ? "block" : determineRunNextStep(run, version, assessment);
  if (next !== "complete" && next !== "block") throw new Error("This run still has a supported non-terminal next step.");

  let reason: RunResolutionReason;
  let explanation: string;
  if (input.forcedBlockReason === "no_progress") {
    reason = "no_progress";
    explanation = "The unresolved criteria and failure evidence repeated without material progress. Human review is required.";
  } else if (next === "complete") {
    reason = "completion_supported";
    explanation = "Every required acceptance criterion is supported by the submitted evidence assessment.";
  } else if (assessment.outcome === "unsafe_or_out_of_scope") {
    reason = "unsafe_or_out_of_scope";
    explanation = "The submitted evidence indicates unsafe or out-of-scope execution. Automated work must stop.";
  } else if (assessment.outcome === "blocked_human_input_required") {
    reason = "human_input_required";
    explanation = "A blocker requires human input, access, or approval before any further execution.";
  } else {
    reason = "repair_limit_reached";
    explanation = `The confirmed maximum of ${version.loopSpec.limits.maximumRepairAttempts} repair attempts has been reached.`;
  }
  const state = next === "complete" ? "completed" : "blocked";
  return {
    run: runSchema.parse({ ...run, state, updatedAt: input.resolvedAt }),
    resolution: runResolutionSchema.parse({
      schemaVersion: "0.1",
      resolutionId: input.resolutionId,
      runId: run.runId,
      assessmentId: assessment.assessmentId,
      contractVersionId: version.versionId,
      contractHash: version.contractHash,
      state,
      reason,
      explanation,
      resolvedAt: input.resolvedAt,
    }),
  };
}
