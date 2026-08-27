import { z } from "zod";

import { riskCategorySchema } from "./intake.js";

export * from "./intake.js";

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

export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;
export type UserAnswer = z.infer<typeof userAnswerSchema>;
