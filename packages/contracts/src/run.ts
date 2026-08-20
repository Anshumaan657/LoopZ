import { z } from "zod";

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

export type RunState = z.infer<typeof runStateSchema>;
