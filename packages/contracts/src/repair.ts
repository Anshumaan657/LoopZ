import { z } from "zod";

export const repairTaskSchema = z.object({
  parentRunId: z.string().min(1),
  attempt: z.number().int().min(1).max(2),
  unresolvedCriterionIds: z.array(z.string().regex(/^AC-[0-9]{3}$/)).min(1),
  preservedCriterionIds: z.array(z.string().regex(/^AC-[0-9]{3}$/)),
  failureEvidence: z.array(z.string().min(1)),
  instructions: z.string().min(1),
  requiredRegressionChecks: z.array(z.string().min(1)),
});

export type RepairTask = z.infer<typeof repairTaskSchema>;
