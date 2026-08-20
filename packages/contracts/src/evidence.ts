import { z } from "zod";

export const criterionEvidenceSchema = z.object({
  criterionId: z.string().regex(/^AC-[0-9]{3}$/),
  claim: z.string().min(1),
  evidence: z.array(z.string().min(1)),
});

export const evidenceSubmissionSchema = z.object({
  runId: z.string().min(1),
  finalReport: z.string().min(1),
  testOutput: z.string(),
  diffSummary: z.string(),
  userNotes: z.string(),
  criteria: z.array(criterionEvidenceSchema),
});

export type EvidenceSubmission = z.infer<typeof evidenceSubmissionSchema>;
export type CriterionEvidence = z.infer<typeof criterionEvidenceSchema>;
