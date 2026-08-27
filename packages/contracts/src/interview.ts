import { z } from "zod";

import { decisionSchema, taskTypeSchema } from "./loopspec.js";

export const riskCategorySchema = z.enum([
  "authorization",
  "primary_flow",
  "roles_and_access",
  "authentication",
  "data_handling",
  "payments",
  "external_integrations",
  "repository_context",
  "deployment",
  "verification",
  "scope",
  "visual_behavior",
]);

export const extractedUserIntentSchema = z
  .object({
    originalPrompt: z.string().trim().min(1),
    taskType: decisionSchema(taskTypeSchema),
    goal: decisionSchema(z.string().trim().min(1)),
    requestedCapabilities: z.array(z.string().trim().min(1)),
    constraints: z.array(z.string().trim().min(1)),
    unknowns: z.array(z.string().trim().min(1)),
  })
  .strict();

export const clarificationQuestionSchema = z
  .object({
    id: z.string().regex(/^Q-[0-9]{3}$/),
    category: riskCategorySchema,
    prompt: z.string().trim().min(1),
    rationale: z.string().trim().min(1),
    blocking: z.boolean(),
    priority: z.number().int().min(1).max(5),
  })
  .strict();

export const userAnswerSchema = z
  .object({
    questionId: z.string().regex(/^Q-[0-9]{3}$/),
    value: z.string().trim().min(1),
    answeredAt: z.string().trim().min(1),
  })
  .strict();

export type ExtractedUserIntent = z.infer<typeof extractedUserIntentSchema>;
export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;
export type UserAnswer = z.infer<typeof userAnswerSchema>;
export type RiskCategory = z.infer<typeof riskCategorySchema>;
