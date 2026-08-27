import { z } from "zod";

import { evidenceIdSchema } from "./evidence.js";
import { criterionIdSchema } from "./loopspec.js";

export const REPAIR_TASK_SCHEMA_VERSION = "0.1" as const;

export const repairTaskSchema = z
  .object({
    schemaVersion: z.literal(REPAIR_TASK_SCHEMA_VERSION),
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

export type RepairTask = z.infer<typeof repairTaskSchema>;
