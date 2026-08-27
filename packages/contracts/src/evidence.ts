import { z } from "zod";

import { criterionIdSchema } from "./loopspec.js";

export const EVIDENCE_SUBMISSION_SCHEMA_VERSION = "0.1" as const;

export const evidenceIdSchema = z.string().regex(/^EV-[0-9]{3}$/);

export const evidenceItemSchema = z
  .object({
    id: evidenceIdSchema,
    type: z.enum([
      "command_output",
      "test_output",
      "diff_summary",
      "screenshot",
      "file_reference",
      "agent_report",
      "user_observation",
    ]),
    description: z.string().trim().min(1),
    content: z.string().trim().min(1).optional(),
    uri: z.string().trim().min(1).optional(),
    command: z.string().trim().min(1).optional(),
    exitCode: z.number().int().optional(),
  })
  .strict()
  .refine((item) => item.content !== undefined || item.uri !== undefined, {
    message: "Evidence must include content or a URI",
  });

export const criterionEvidenceSchema = z
  .object({
    criterionId: criterionIdSchema,
    claim: z.string().trim().min(1),
    evidenceIds: z.array(evidenceIdSchema),
  })
  .strict();

export const evidenceSubmissionSchema = z
  .object({
    schemaVersion: z.literal(EVIDENCE_SUBMISSION_SCHEMA_VERSION),
    submissionId: z.string().min(1),
    runId: z.string().min(1),
    submittedAt: z.string().min(1),
    finalReport: z.string().trim().min(1),
    evidenceItems: z.array(evidenceItemSchema),
    criteria: z.array(criterionEvidenceSchema).min(1),
    userNotes: z.string(),
  })
  .strict();

export type EvidenceSubmission = z.infer<typeof evidenceSubmissionSchema>;
export type CriterionEvidence = z.infer<typeof criterionEvidenceSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
