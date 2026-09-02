import { z } from "zod";

import { criterionIdSchema } from "./loopspec";

export const EVIDENCE_SUBMISSION_LEGACY_SCHEMA_VERSION = "0.1" as const;
export const EVIDENCE_SUBMISSION_SCHEMA_VERSION = "0.2" as const;

export const evidenceIdSchema = z.string().regex(/^EV-[0-9]{3}$/);
export const evidenceClaimSchema = z.enum(["passed", "failed", "blocked", "unverified"]);

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

export const criterionEvidenceV01Schema = z
  .object({
    criterionId: criterionIdSchema,
    claim: z.string().trim().min(1),
    evidenceIds: z.array(evidenceIdSchema),
  })
  .strict();

export const criterionEvidenceSchema = z
  .object({
    criterionId: criterionIdSchema,
    claim: evidenceClaimSchema,
    evidenceIds: z.array(evidenceIdSchema),
  })
  .strict();

export const evidenceReturnDraftSchema = z
  .object({
    codingAgent: z.string().trim().min(1),
    finalReport: z.string().trim().min(1),
    commandOutput: z.string(),
    diffSummary: z.string(),
    userObservedProblems: z.string(),
    manualChecks: z.string(),
    userNotes: z.string(),
    criterionClaims: z.array(
      z.object({ criterionId: criterionIdSchema, claim: evidenceClaimSchema }).strict(),
    ).min(1),
  })
  .strict();

export const evidenceSubmissionV01Schema = z
  .object({
    schemaVersion: z.literal(EVIDENCE_SUBMISSION_LEGACY_SCHEMA_VERSION),
    submissionId: z.string().min(1),
    runId: z.string().min(1),
    submittedAt: z.string().min(1),
    finalReport: z.string().trim().min(1),
    evidenceItems: z.array(evidenceItemSchema),
    criteria: z.array(criterionEvidenceV01Schema).min(1),
    userNotes: z.string(),
  })
  .strict();

export const evidenceSubmissionSchema = z
  .object({
    schemaVersion: z.literal(EVIDENCE_SUBMISSION_SCHEMA_VERSION),
    submissionId: z.string().uuid(),
    runId: z.string().uuid(),
    contractVersionId: z.string().uuid(),
    contractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    submittedAt: z.string().datetime(),
    codingAgent: z.string().trim().min(1),
    finalReport: z.string().trim().min(1),
    evidenceItems: z.array(evidenceItemSchema).min(1),
    criteria: z.array(criterionEvidenceSchema).min(1),
    userNotes: z.string(),
  })
  .strict();

export const anyEvidenceSubmissionSchema = z.discriminatedUnion("schemaVersion", [
  evidenceSubmissionV01Schema,
  evidenceSubmissionSchema,
]);

export type EvidenceReturnDraft = z.infer<typeof evidenceReturnDraftSchema>;
export type EvidenceSubmission = z.infer<typeof evidenceSubmissionSchema>;
export type EvidenceSubmissionV01 = z.infer<typeof evidenceSubmissionV01Schema>;
export type CriterionEvidence = z.infer<typeof criterionEvidenceSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type EvidenceClaim = z.infer<typeof evidenceClaimSchema>;
