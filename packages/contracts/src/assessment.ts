import { z } from "zod";

import { evidenceClaimSchema, evidenceIdSchema } from "./evidence";
import { criterionIdSchema } from "./loopspec";

export const CRITERION_ASSESSMENT_LEGACY_SCHEMA_VERSION = "0.1" as const;
export const CRITERION_ASSESSMENT_SCHEMA_VERSION = "0.2" as const;

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

export const evidenceStrengthSchema = z.enum([
  "deterministic",
  "inspectable",
  "manual_observation",
  "agent_assertion",
  "none",
]);

const criterionAssessmentBaseSchema = z
  .object({
    criterionId: criterionIdSchema,
    status: criterionStatusSchema,
    evidenceReferences: z.array(evidenceIdSchema),
    explanation: z.string().trim().min(1),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export const criterionAssessmentV01Schema = criterionAssessmentBaseSchema;

export const criterionAssessmentSchema = criterionAssessmentBaseSchema
  .omit({})
  .extend({
    claim: evidenceClaimSchema,
    priority: z.enum(["required", "optional"]),
    evidenceStrength: evidenceStrengthSchema,
    missingRequiredEvidence: z.array(z.string().trim().min(1)),
    contradictions: z.array(z.string().trim().min(1)),
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

export const assessmentCorrectionSchema = z
  .object({
    correctionId: z.string().uuid(),
    criterionId: criterionIdSchema,
    previousStatus: criterionStatusSchema,
    correctedStatus: criterionStatusSchema,
    reason: z.string().trim().min(3).max(1000),
    correctedAt: z.string().datetime(),
  })
  .strict();

export const assessmentV01Schema = z
  .object({
    schemaVersion: z.literal(CRITERION_ASSESSMENT_LEGACY_SCHEMA_VERSION),
    assessmentId: z.string().min(1),
    runId: z.string().min(1),
    evidenceSubmissionId: z.string().min(1),
    outcome: runOutcomeSchema,
    criteria: z.array(criterionAssessmentV01Schema).min(1),
    risks: z.array(z.string().trim().min(1)),
    recommendedNextAction: z.string().trim().min(1),
    assessedAt: z.string().min(1),
  })
  .strict();

export const assessmentSchema = z
  .object({
    schemaVersion: z.literal(CRITERION_ASSESSMENT_SCHEMA_VERSION),
    assessmentId: z.string().uuid(),
    assessmentVersion: z.number().int().min(1),
    previousAssessmentId: z.string().uuid().nullable(),
    runId: z.string().uuid(),
    contractVersionId: z.string().uuid(),
    contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    evidenceSubmissionId: z.string().uuid(),
    outcome: runOutcomeSchema,
    criteria: z.array(criterionAssessmentSchema).min(1),
    contradictions: z.array(z.string().trim().min(1)),
    risks: z.array(z.string().trim().min(1)),
    recommendedNextAction: z.string().trim().min(1),
    corrections: z.array(assessmentCorrectionSchema),
    assessedAt: z.string().datetime(),
  })
  .strict();

export const anyAssessmentSchema = z.discriminatedUnion("schemaVersion", [
  assessmentV01Schema,
  assessmentSchema,
]);

export type CriterionAssessment = z.infer<typeof criterionAssessmentSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type AssessmentCorrection = z.infer<typeof assessmentCorrectionSchema>;
export type CriterionStatus = z.infer<typeof criterionStatusSchema>;
export type EvidenceStrength = z.infer<typeof evidenceStrengthSchema>;
