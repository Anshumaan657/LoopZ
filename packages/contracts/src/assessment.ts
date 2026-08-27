import { z } from "zod";

import { evidenceIdSchema } from "./evidence.js";
import { criterionIdSchema } from "./loopspec.js";

export const CRITERION_ASSESSMENT_SCHEMA_VERSION = "0.1" as const;

export const criterionStatusSchema = z.enum([
  "verified_by_submitted_evidence",
  "partially_supported",
  "unsupported_claim",
  "failed",
  "blocked",
  "not_attempted",
  "unverifiable",
  "not_applicable",
]);

export const criterionAssessmentSchema = z
  .object({
    criterionId: criterionIdSchema,
    status: criterionStatusSchema,
    evidenceReferences: z.array(evidenceIdSchema),
    explanation: z.string().trim().min(1),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export const runOutcomeSchema = z.enum([
  "completed_with_evidence",
  "partially_completed",
  "repair_recommended",
  "blocked_human_input_required",
  "unverifiable_more_evidence_required",
  "unsafe_or_out_of_scope",
]);

export const assessmentSchema = z
  .object({
    schemaVersion: z.literal(CRITERION_ASSESSMENT_SCHEMA_VERSION),
    assessmentId: z.string().min(1),
    runId: z.string().min(1),
    evidenceSubmissionId: z.string().min(1),
    outcome: runOutcomeSchema,
    criteria: z.array(criterionAssessmentSchema).min(1),
    risks: z.array(z.string().trim().min(1)),
    recommendedNextAction: z.string().trim().min(1),
    assessedAt: z.string().min(1),
  })
  .strict();

export type CriterionAssessment = z.infer<typeof criterionAssessmentSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type CriterionStatus = z.infer<typeof criterionStatusSchema>;
