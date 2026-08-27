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

export type ExtractedUserIntent = z.infer<typeof extractedUserIntentSchema>;
export type IdeaIntake = z.infer<typeof ideaIntakeSchema>;
export type IntakeMode = z.infer<typeof intakeModeSchema>;
export type IntakeSuitability = z.infer<typeof intakeSuitabilitySchema>;
export type IntakeTaskType = z.infer<typeof intakeTaskTypeSchema>;
export type MissingInformation = z.infer<typeof missingInformationSchema>;
export type RiskCategory = z.infer<typeof riskCategorySchema>;
