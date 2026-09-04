import { z } from "zod";

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

export const intakeModeSchema = z.enum(["guided", "geek"]);

export const ideaIntakeSchema = z
  .object({
    originalPrompt: z.string().trim().min(20).max(4000),
    mode: intakeModeSchema,
    projectStatus: z.enum(["new", "existing", "unknown"]),
    projectContext: z.string().trim().max(2000),
    technologyPreferences: z.array(z.string().trim().min(1)).max(12),
  })
  .strict();

export const intakeSuitabilitySchema = z.enum([
  "ready_for_interview",
  "needs_clarification",
  "unsupported",
]);

export const missingInformationSchema = z
  .object({
    category: riskCategorySchema,
    reason: z.string().trim().min(1),
    blocking: z.boolean(),
    priority: z.number().int().min(1).max(5),
  })
  .strict();

export const intakeTaskTypeSchema = z.enum([
  "new_web_application",
  "landing_page",
  "existing_app_feature",
  "bug_fix",
]);

const intakeDecisionSchema = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      value: valueSchema,
      source: z.enum([
        "user_provided",
        "user_selected",
        "inferred",
        "recommended",
        "default",
      ]),
      confidence: z.number().min(0).max(1),
      explanation: z.string().trim().min(1),
      confirmedByUser: z.boolean(),
    })
    .strict();

export const extractedUserIntentSchema = z
  .object({
    originalPrompt: z.string().trim().min(1),
    taskType: intakeDecisionSchema(intakeTaskTypeSchema),
    goal: intakeDecisionSchema(z.string().trim().min(1)),
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

export const questionOptionSchema = z
  .object({
    value: z.string().trim().min(1),
    label: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
  })
  .strict();

export const interviewQuestionSchema = clarificationQuestionSchema
  .extend({
    answerKind: z.enum(["text", "choice"]),
    options: z.array(questionOptionSchema).max(6),
    placeholder: z.string().trim().min(1).optional(),
  })
  .superRefine((question, context) => {
    if (question.answerKind === "choice" && question.options.length < 2) {
      context.addIssue({
        code: "custom",
        message: "Choice questions require at least two options.",
        path: ["options"],
      });
    }

    if (question.answerKind === "text" && question.options.length > 0) {
      context.addIssue({
        code: "custom",
        message: "Text questions cannot define choice options.",
        path: ["options"],
      });
    }
  });

export const userAnswerSchema = z
  .object({
    questionId: z.string().regex(/^Q-[0-9]{3}$/),
    value: z.string().trim().min(1).max(2000),
    details: z.string().trim().max(2000).optional(),
    answeredAt: z.string().datetime(),
  })
  .strict();

export const interviewIssueSchema = z
  .object({
    questionId: z.string().regex(/^Q-[0-9]{3}$/),
    category: riskCategorySchema,
    kind: z.enum(["contradiction", "approval_gate", "safety_boundary"]),
    severity: z.enum(["warning", "blocking"]),
    message: z.string().trim().min(1),
  })
  .strict();

export const interviewSessionSchema = z
  .object({
    projectId: z.string().uuid(),
    intentTaskType: intakeTaskTypeSchema,
    status: z.enum(["in_progress", "ready_for_contract", "blocked"]),
    questionBudget: z.number().int().min(1).max(5),
    questions: z.array(interviewQuestionSchema).max(5),
    answers: z.array(userAnswerSchema).max(5),
    currentQuestionId: z.string().regex(/^Q-[0-9]{3}$/).nullable(),
    issues: z.array(interviewIssueSchema),
    startedAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type ExtractedUserIntent = z.infer<typeof extractedUserIntentSchema>;
export type IdeaIntake = z.infer<typeof ideaIntakeSchema>;
export type IntakeMode = z.infer<typeof intakeModeSchema>;
export type IntakeSuitability = z.infer<typeof intakeSuitabilitySchema>;
export type IntakeTaskType = z.infer<typeof intakeTaskTypeSchema>;
export type MissingInformation = z.infer<typeof missingInformationSchema>;
export type RiskCategory = z.infer<typeof riskCategorySchema>;
export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;
export type InterviewIssue = z.infer<typeof interviewIssueSchema>;
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type InterviewSession = z.infer<typeof interviewSessionSchema>;
export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type UserAnswer = z.infer<typeof userAnswerSchema>;
