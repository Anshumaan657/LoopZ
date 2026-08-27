import { z } from "zod";

export const validationIssueCodeSchema = z.enum([
  "schema_invalid",
  "duplicate_requirement_id",
  "duplicate_criterion_id",
  "unknown_requirement_reference",
  "required_requirement_uncovered",
  "scope_conflict",
  "blocking_decision_unresolved",
  "approval_required",
]);

export const validationIssueSchema = z
  .object({
    code: validationIssueCodeSchema,
    message: z.string().min(1),
    path: z.string(),
  })
  .strict();

export type ValidationIssue = z.infer<typeof validationIssueSchema>;
export type ValidationIssueCode = z.infer<typeof validationIssueCodeSchema>;
