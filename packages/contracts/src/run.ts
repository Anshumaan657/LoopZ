import { z } from "zod";

export const RUN_LEGACY_SCHEMA_VERSION = "0.1" as const;
export const RUN_SCHEMA_VERSION = "0.2" as const;

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

const runBaseShape = {
  runId: z.string().min(1),
  projectId: z.string().min(1),
  loopSpecVersion: z.string().min(1),
  state: runStateSchema,
  repairAttempts: z.number().int().min(0).max(2),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
};

export const runV01Schema = z
  .object({
    schemaVersion: z.literal(RUN_LEGACY_SCHEMA_VERSION),
    ...runBaseShape,
  })
  .strict();

export const runSchema = z
  .object({
    schemaVersion: z.literal(RUN_SCHEMA_VERSION),
    ...runBaseShape,
    runId: z.string().uuid(),
    projectId: z.string().uuid(),
    loopSpecVersion: z.literal("0.2"),
    contractVersionId: z.string().uuid(),
    contractVersion: z.number().int().min(1),
    contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    generatedAt: z.string().datetime(),
    selectedOutputFormat: z.enum(["codex", "universal"]),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export const anyRunSchema = z.discriminatedUnion("schemaVersion", [runV01Schema, runSchema]);

export type RunState = z.infer<typeof runStateSchema>;
export type Run = z.infer<typeof runSchema>;
export type RunV01 = z.infer<typeof runV01Schema>;
export type AnyRun = z.infer<typeof anyRunSchema>;
