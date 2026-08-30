import { z } from "zod";

export const LOOP_SPEC_SCHEMA_VERSION = "0.1" as const;

export const decisionSourceSchema = z.enum([
  "user_provided",
  "user_selected",
  "inferred",
  "recommended",
  "default",
]);

export const decisionSchema = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      value: valueSchema,
      source: decisionSourceSchema,
      confidence: z.number().min(0).max(1),
      explanation: z.string().trim().min(1),
      confirmedByUser: z.boolean(),
    })
    .strict();

export const taskTypeSchema = z.enum([
  "new_web_application",
  "landing_page",
  "existing_app_feature",
  "bug_fix",
]);

export const requirementIdSchema = z.string().regex(/^REQ-[0-9]{3}$/);
export const criterionIdSchema = z.string().regex(/^AC-[0-9]{3}$/);
export const decisionIdSchema = z.string().regex(/^DEC-[0-9]{3}$/);

export const requirementSchema = z
  .object({
    id: requirementIdSchema,
    description: z.string().trim().min(1),
    priority: z.enum(["required", "optional"]),
    provenance: decisionSchema(z.string().trim().min(1)),
  })
  .strict();

export const scopeItemSchema = z
  .object({
    id: z.string().regex(/^SCOPE-(IN|OUT)-[0-9]{3}$/),
    description: z.string().trim().min(1),
    provenance: decisionSchema(z.string().trim().min(1)),
  })
  .strict();

export const unresolvedDecisionSchema = z
  .object({
    id: decisionIdSchema,
    question: z.string().trim().min(1),
    risk: z.enum(["low", "medium", "high", "critical"]),
    blocking: z.boolean(),
  })
  .strict();

export const acceptanceCriterionSchema = z
  .object({
    id: criterionIdSchema,
    requirementIds: z.array(requirementIdSchema).min(1),
    requirement: z.string().trim().min(1),
    verificationMethod: z.string().trim().min(1),
    requiredEvidence: z.array(z.string().trim().min(1)).min(1),
    priority: z.enum(["required", "optional"]),
  })
  .strict();

export const safetyActionSchema = z
  .object({
    action: z.string().trim().min(1),
    category: z.enum([
      "destructive",
      "external_service",
      "production",
      "financial",
      "credentials",
      "other",
    ]),
    requiresApproval: z.boolean(),
  })
  .strict();

export const contractInterviewCategorySchema = z.enum([
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

export const contractFoundationSchema = z
  .object({
    schemaVersion: z.literal(LOOP_SPEC_SCHEMA_VERSION),
    status: z.literal("foundation_draft"),
    projectId: z.string().uuid(),
    compilation: z
      .object({
        sourceInterviewUpdatedAt: z.string().datetime(),
        compiledAt: z.string().datetime(),
      })
      .strict(),
    request: z
      .object({
        originalPrompt: z.string().trim().min(1),
        taskType: decisionSchema(taskTypeSchema),
      })
      .strict(),
    objective: z
      .object({
        goal: decisionSchema(z.string().trim().min(1)),
        deliverables: z.array(requirementSchema).min(1),
      })
      .strict(),
    scope: z
      .object({
        included: z.array(scopeItemSchema).min(1),
        excluded: z.array(scopeItemSchema),
        assumptions: z.array(decisionSchema(z.string().trim().min(1))),
      })
      .strict(),
    environment: z
      .object({
        projectStatus: decisionSchema(z.enum(["new", "existing"])),
        projectContext: decisionSchema(z.string().trim().min(1)),
        technologyPreferences: z.array(decisionSchema(z.string().trim().min(1))),
      })
      .strict(),
    interviewDecisions: z.array(
      z
        .object({
          questionId: z.string().regex(/^Q-[0-9]{3}$/),
          category: contractInterviewCategorySchema,
          question: z.string().trim().min(1),
          answer: z.string().trim().min(1),
          answeredAt: z.string().datetime(),
        })
        .strict(),
    ),
    pendingSections: z.tuple([
      z.literal("acceptance"),
      z.literal("safety"),
      z.literal("limits"),
      z.literal("final_report"),
    ]),
  })
  .strict();

export const acceptanceContractDraftSchema = contractFoundationSchema
  .omit({ status: true, pendingSections: true })
  .extend({
    status: z.literal("acceptance_draft"),
    acceptance: z
      .object({
        criteria: z.array(acceptanceCriterionSchema).min(1),
        verificationCommands: z.array(z.string().trim().min(1)).min(1),
      })
      .strict(),
    pendingSections: z.tuple([
      z.literal("safety"),
      z.literal("limits"),
      z.literal("final_report"),
    ]),
  })
  .strict();

export const loopSpecLiteSchema = z
  .object({
    schemaVersion: z.literal(LOOP_SPEC_SCHEMA_VERSION),
    request: z
      .object({
        originalPrompt: z.string().trim().min(1),
        taskType: decisionSchema(taskTypeSchema),
      })
      .strict(),
    objective: z
      .object({
        goal: decisionSchema(z.string().trim().min(1)),
        deliverables: z.array(requirementSchema).min(1),
      })
      .strict(),
    scope: z
      .object({
        included: z.array(scopeItemSchema).min(1),
        excluded: z.array(scopeItemSchema),
        assumptions: z.array(decisionSchema(z.string().trim().min(1))),
        unresolvedDecisions: z.array(unresolvedDecisionSchema),
      })
      .strict(),
    environment: z
      .object({
        projectStatus: decisionSchema(z.enum(["new", "existing"])),
        projectContext: decisionSchema(z.string().trim().min(1)),
        technologyPreferences: z.array(decisionSchema(z.string().trim().min(1))),
      })
      .strict(),
    workflow: z
      .object({
        phases: z.tuple([
          z.literal("plan"),
          z.literal("implement"),
          z.literal("verify"),
          z.literal("repair"),
        ]),
      })
      .strict(),
    acceptance: z
      .object({
        criteria: z.array(acceptanceCriterionSchema).min(1),
      })
      .strict(),
    safety: z
      .object({
        restrictedActions: z.array(z.string().trim().min(1)),
        approvalRequired: z.array(z.string().trim().min(1)),
        plannedActions: z.array(safetyActionSchema),
      })
      .strict(),
    limits: z
      .object({
        maximumRepairAttempts: z.number().int().min(1).max(2),
        stopWhen: z.array(z.string().trim().min(1)).min(1),
      })
      .strict(),
    finalReport: z
      .object({
        requiredFields: z.array(z.string().trim().min(1)).min(1),
        criterionIdReferencesRequired: z.literal(true),
        evidenceReferencesRequired: z.literal(true),
      })
      .strict(),
  })
  .strict();

export type LoopSpecLite = z.infer<typeof loopSpecLiteSchema>;
export type AcceptanceCriterion = z.infer<typeof acceptanceCriterionSchema>;
export type Requirement = z.infer<typeof requirementSchema>;
export type DecisionSource = z.infer<typeof decisionSourceSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type SafetyAction = z.infer<typeof safetyActionSchema>;
export type ContractFoundation = z.infer<typeof contractFoundationSchema>;
export type AcceptanceContractDraft = z.infer<typeof acceptanceContractDraftSchema>;
