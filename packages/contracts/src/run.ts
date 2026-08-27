import { z } from "zod";

export const RUN_SCHEMA_VERSION = "0.1" as const;

export const runStateSchema = z.enum([
  "draft",
  "contract_confirmed",
  "task_generated",
  "copied",
  "awaiting_evidence",
  "evidence_submitted",
  "assessed",
  "repair_generated",
  "completed",
  "blocked",
  "abandoned",
]);

export const runSchema = z
  .object({
    schemaVersion: z.literal(RUN_SCHEMA_VERSION),
    runId: z.string().min(1),
    projectId: z.string().min(1),
    loopSpecVersion: z.string().min(1),
    state: runStateSchema,
    repairAttempts: z.number().int().min(0).max(2),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

export type RunState = z.infer<typeof runStateSchema>;
export type Run = z.infer<typeof runSchema>;
