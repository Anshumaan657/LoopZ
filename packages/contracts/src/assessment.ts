import { z } from "zod";

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

export const criterionAssessmentSchema = z.object({
  criterionId: z.string().regex(/^AC-[0-9]{3}$/),
  status: criterionStatusSchema,
  evidenceReferences: z.array(z.string()),
  explanation: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const runOutcomeSchema = z.enum([
  "completed_with_evidence",
  "partially_completed",
  "repair_recommended",
  "blocked_human_input_required",
  "unverifiable_more_evidence_required",
  "unsafe_or_out_of_scope",
]);

export const assessmentSchema = z.object({
  runId: z.string().min(1),
  outcome: runOutcomeSchema,
  criteria: z.array(criterionAssessmentSchema).min(1),
  risks: z.array(z.string()),
  recommendedNextAction: z.string().min(1),
});

export type CriterionAssessment = z.infer<typeof criterionAssessmentSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type CriterionStatus = z.infer<typeof criterionStatusSchema>;
