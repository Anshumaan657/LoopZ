import { z } from "zod";

export const decisionSourceSchema = z.enum([
  "user_provided",
  "user_selected",
  "inferred",
  "recommended",
  "default",
]);

export const decisionSchema = <T extends z.ZodType>(valueSchema: T) =>
  z.object({
    value: valueSchema,
    source: decisionSourceSchema,
    confidence: z.number().min(0).max(1),
    explanation: z.string().min(1),
    confirmedByUser: z.boolean(),
  });

export const acceptanceCriterionSchema = z.object({
  id: z.string().regex(/^AC-[0-9]{3}$/),
  requirement: z.string().min(1),
  verificationMethod: z.string().min(1),
  requiredEvidence: z.array(z.string().min(1)).min(1),
  priority: z.enum(["required", "optional"]),
});

export const loopSpecLiteSchema = z.object({
  schemaVersion: z.literal("0.1"),
  request: z.object({
    originalPrompt: z.string().min(1),
    taskType: z.literal("small_web_project"),
  }),
  objective: z.object({
    goal: z.string().min(1),
    deliverables: z.array(z.string().min(1)).min(1),
  }),
  scope: z.object({
    included: z.array(z.string().min(1)).min(1),
    excluded: z.array(z.string().min(1)),
    assumptions: z.array(z.string().min(1)),
    unresolvedDecisions: z.array(z.string().min(1)),
  }),
  environment: z.object({
    projectStatus: z.enum(["new", "existing"]),
    projectContext: z.string(),
    technologyPreferences: z.array(z.string().min(1)),
  }),
  workflow: z.object({
    phases: z.tuple([
      z.literal("plan"),
      z.literal("implement"),
      z.literal("verify"),
      z.literal("repair"),
    ]),
  }),
  acceptance: z.object({
    criteria: z.array(acceptanceCriterionSchema).min(1),
  }),
  safety: z.object({
    restrictedActions: z.array(z.string().min(1)),
    approvalRequired: z.array(z.string().min(1)),
  }),
  limits: z.object({
    maximumRepairAttempts: z.number().int().min(0).max(2),
    stopWhen: z.array(z.string().min(1)).min(1),
  }),
  finalReport: z.object({
    requiredFields: z.array(z.string().min(1)).min(1),
  }),
});

export type LoopSpecLite = z.infer<typeof loopSpecLiteSchema>;
export type AcceptanceCriterion = z.infer<typeof acceptanceCriterionSchema>;
export type DecisionSource = z.infer<typeof decisionSourceSchema>;
