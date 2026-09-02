import { z, type ZodType } from "zod";

import { assessmentSchema, assessmentV01Schema } from "./assessment.js";
import { evidenceSubmissionSchema, evidenceSubmissionV01Schema } from "./evidence.js";
import { loopSpecLiteSchema, loopSpecLiteV01Schema } from "./loopspec.js";
import { repairTaskSchema, repairTaskV01Schema } from "./repair.js";
import { providerNeutralTaskSchema, providerNeutralTaskV01Schema } from "./task.js";

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
    filename: "loopspec-lite-v0.1.schema.json",
    schema: createJsonSchema(
      loopSpecLiteV01Schema,
      "loopspec-lite-v0.1.schema.json",
      "LoopSpec Lite 0.1 (Legacy)",
    ),
  },
  {
    filename: "loopspec-lite.schema.json",
    schema: createJsonSchema(
      loopSpecLiteSchema,
      "loopspec-lite.schema.json",
      "LoopSpec Lite 0.2",
    ),
  },
  {
    filename: "provider-neutral-task-v0.1.schema.json",
    schema: createJsonSchema(
      providerNeutralTaskV01Schema,
      "provider-neutral-task-v0.1.schema.json",
      "Provider-Neutral Execution Task 0.1 (Legacy)",
    ),
  },
  {
    filename: "provider-neutral-task.schema.json",
    schema: createJsonSchema(
      providerNeutralTaskSchema,
      "provider-neutral-task.schema.json",
      "Provider-Neutral Execution Task 0.2",
    ),
  },
  {
    filename: "evidence-submission-v0.1.schema.json",
    schema: createJsonSchema(
      evidenceSubmissionV01Schema,
      "evidence-submission-v0.1.schema.json",
      "Evidence Submission 0.1 (Legacy)",
    ),
  },
  {
    filename: "evidence-submission.schema.json",
    schema: createJsonSchema(
      evidenceSubmissionSchema,
      "evidence-submission.schema.json",
      "Evidence Submission 0.2",
    ),
  },
  {
    filename: "criterion-assessment-v0.1.schema.json",
    schema: createJsonSchema(
      assessmentV01Schema,
      "criterion-assessment-v0.1.schema.json",
      "Criterion Assessment 0.1 (Legacy)",
    ),
  },
  {
    filename: "criterion-assessment.schema.json",
    schema: createJsonSchema(
      assessmentSchema,
      "criterion-assessment.schema.json",
      "Criterion Assessment 0.2",
    ),
  },
  {
    filename: "repair-task-v0.1.schema.json",
    schema: createJsonSchema(
      repairTaskV01Schema,
      "repair-task-v0.1.schema.json",
      "Repair Task 0.1 (Legacy)",
    ),
  },
  {
    filename: "repair-task.schema.json",
    schema: createJsonSchema(
      repairTaskSchema,
      "repair-task.schema.json",
      "Repair Task 0.2",
    ),
  },
];
