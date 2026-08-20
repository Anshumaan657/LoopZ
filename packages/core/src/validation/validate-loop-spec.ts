import {
  loopSpecLiteSchema,
  type LoopSpecLite,
} from "@loopz/contracts";

export type ValidationIssue = {
  code: string;
  message: string;
  path: string;
};

export type LoopSpecValidation =
  | { valid: true; value: LoopSpecLite; issues: [] }
  | { valid: false; issues: ValidationIssue[] };

export function validateLoopSpec(input: unknown): LoopSpecValidation {
  const parsed = loopSpecLiteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map((issue) => ({
        code: "schema_invalid",
        message: issue.message,
        path: issue.path.join("."),
      })),
    };
  }

  const ids = parsed.data.acceptance.criteria.map((criterion) => criterion.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicates.length > 0) {
    return {
      valid: false,
      issues: [
        {
          code: "duplicate_criterion_id",
          message: `Criterion IDs must be unique: ${[...new Set(duplicates)].join(", ")}`,
          path: "acceptance.criteria",
        },
      ],
    };
  }

  return { valid: true, value: parsed.data, issues: [] };
}
