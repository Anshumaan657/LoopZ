import { z } from "zod";

import { criterionIdSchema, requirementIdSchema } from "./loopspec";

const editableRequirementSchema = z
  .object({
    id: requirementIdSchema,
    description: z.string().trim().min(1),
    priority: z.enum(["required", "optional"]),
  })
  .strict();

const editableScopeItemSchema = z
  .object({
    id: z.string().regex(/^SCOPE-(IN|OUT)-[0-9]{3}$/),
    description: z.string().trim().min(1),
  })
  .strict();

const editableCriterionSchema = z
  .object({
    id: criterionIdSchema,
    requirement: z.string().trim().min(1),
    verificationMethod: z.string().trim().min(1),
    requiredEvidence: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const contractReviewInputSchema = z
  .object({
    goal: z.string().trim().min(1),
    deliverables: z.array(editableRequirementSchema).min(1),
    includedScope: z.array(editableScopeItemSchema).min(1),
    excludedScope: z.array(editableScopeItemSchema),
    assumptions: z.array(z.string().trim().min(1)),
    criteria: z.array(editableCriterionSchema).min(1),
    verificationCommands: z.array(z.string().trim().min(1).max(1000)).min(1).max(20),
  })
  .strict();

export type ContractReviewInput = z.infer<typeof contractReviewInputSchema>;
