import { z } from "zod";

import { criterionStatusSchema } from "./assessment";
import { evidenceIdSchema } from "./evidence";
import { criterionIdSchema } from "./loopspec";

export const REPAIR_TASK_LEGACY_SCHEMA_VERSION = "0.1" as const;
export const REPAIR_TASK_SCHEMA_VERSION = "0.2" as const;

export const repairTaskV01Schema = z
  .object({
    schemaVersion: z.literal(REPAIR_TASK_LEGACY_SCHEMA_VERSION),
    repairId: z.string().min(1),
    parentRunId: z.string().min(1),
    parentAssessmentId: z.string().min(1),
    attempt: z.number().int().min(1).max(2),
    unresolvedCriterionIds: z.array(criterionIdSchema).min(1),
    preservedCriterionIds: z.array(criterionIdSchema),
    failureEvidenceIds: z.array(evidenceIdSchema),
    instructions: z.string().trim().min(1),
    requiredRegressionChecks: z.array(z.string().trim().min(1)),
    stopWhen: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const repairCriterionSchema = z
  .object({
    criterionId: criterionIdSchema,
    status: criterionStatusSchema.extract(["failed", "partially_supported"]),
    requirement: z.string().trim().min(1),
    explanation: z.string().trim().min(1),
    missingRequiredEvidence: z.array(z.string().trim().min(1)),
    evidenceIds: z.array(evidenceIdSchema),
  })
  .strict();

export const repairTaskSchema = z
  .object({
    schemaVersion: z.literal(REPAIR_TASK_SCHEMA_VERSION),
    repairId: z.string().uuid(),
    parentRunId: z.string().uuid(),
    parentAssessmentId: z.string().uuid(),
    parentEvidenceSubmissionId: z.string().uuid(),
    contractVersionId: z.string().uuid(),
    contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    attempt: z.number().int().min(1).max(2),
    unresolvedCriteria: z.array(repairCriterionSchema).min(1),
    preservedCriterionIds: z.array(criterionIdSchema),
    failureEvidenceIds: z.array(evidenceIdSchema),
    sourceEvidenceFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    instructions: z.string().trim().min(1),
    requiredRegressionChecks: z.array(z.string().trim().min(1)).min(1),
    stopWhen: z.array(z.string().trim().min(1)).min(1),
    generatedAt: z.string().datetime(),
  })
  .strict();

export const anyRepairTaskSchema = z.discriminatedUnion("schemaVersion", [
  repairTaskV01Schema,
  repairTaskSchema,
]);

export type RepairTask = z.infer<typeof repairTaskSchema>;
export type RepairTaskV01 = z.infer<typeof repairTaskV01Schema>;
export type RepairCriterion = z.infer<typeof repairCriterionSchema>;
