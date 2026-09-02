import { z } from "zod";

import { loopSpecLiteSchema, safetyActionSchema } from "./loopspec.js";

export const PROVIDER_NEUTRAL_TASK_SCHEMA_VERSION = "0.1" as const;

const taskReferenceSchema = z.string().regex(
  /^(REQ-[0-9]{3}|AC-[0-9]{3}|SCOPE-(IN|OUT)-[0-9]{3})$/,
);

function executionStepSchema<T extends string>(id: T) {
  return z
    .object({
      id: z.literal(id),
      instruction: z.string().trim().min(1),
      references: z.array(taskReferenceSchema),
    })
    .strict();
}

export const providerNeutralTaskSchema = z
  .object({
    schemaVersion: z.literal(PROVIDER_NEUTRAL_TASK_SCHEMA_VERSION),
    kind: z.literal("provider_neutral_execution_task"),
    taskKey: z.string().regex(/^task:[0-9a-f-]{36}:v[1-9][0-9]*$/),
    source: z
      .object({
        projectId: z.string().uuid(),
        contractVersionId: z.string().uuid(),
        contractVersion: z.number().int().min(1),
        contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
        confirmedAt: z.string().datetime(),
      })
      .strict(),
    contract: loopSpecLiteSchema,
    execution: z
      .object({
        steps: z.tuple([
          executionStepSchema("inspect"),
          executionStepSchema("plan"),
          executionStepSchema("implement"),
          executionStepSchema("verify"),
          executionStepSchema("repair"),
          executionStepSchema("report"),
        ]),
      })
      .strict(),
    runtimeApprovalGates: z.array(
      safetyActionSchema.extend({ runtimeApprovalStillRequired: z.literal(true) }).strict(),
    ),
  })
  .strict();

export type ProviderNeutralTask = z.infer<typeof providerNeutralTaskSchema>;
