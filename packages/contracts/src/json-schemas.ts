import { z, type ZodType } from "zod";

import { assessmentSchema } from "./assessment.js";
import { evidenceSubmissionSchema } from "./evidence.js";
import { loopSpecLiteSchema } from "./loopspec.js";
import { repairTaskSchema } from "./repair.js";

type JsonSchemaArtifact = {
  filename: string;
  schema: Record<string, unknown>;
};

function createJsonSchema(
  schema: ZodType,
  id: string,
  title: string,
): Record<string, unknown> {
  const generated = z.toJSONSchema(schema, {
    target: "draft-2020-12",
    reused: "ref",
    unrepresentable: "any",
  });
  const { "~standard": _standard, ...jsonSchema } = generated;

  return {
    ...jsonSchema,
    $id: `https://loopz.dev/schemas/${id}`,
    title,
  };
}

export const contractJsonSchemas: JsonSchemaArtifact[] = [
  {
    filename: "loopspec-lite.schema.json",
    schema: createJsonSchema(
      loopSpecLiteSchema,
      "loopspec-lite.schema.json",
      "LoopSpec Lite 0.1",
    ),
  },
  {
    filename: "evidence-submission.schema.json",
    schema: createJsonSchema(
      evidenceSubmissionSchema,
      "evidence-submission.schema.json",
      "Evidence Submission 0.1",
    ),
  },
  {
    filename: "criterion-assessment.schema.json",
    schema: createJsonSchema(
      assessmentSchema,
      "criterion-assessment.schema.json",
      "Criterion Assessment 0.1",
    ),
  },
  {
    filename: "repair-task.schema.json",
    schema: createJsonSchema(
      repairTaskSchema,
      "repair-task.schema.json",
      "Repair Task 0.1",
    ),
  },
];
