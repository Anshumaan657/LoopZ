import { z } from "zod";

export const artifactKindSchema = z.enum([
  "project_spec",
  "acceptance_criteria",
  "agent_task",
  "starter_prompt",
]);

export const artifactOutputFormatSchema = z.enum(["codex", "universal"]);

export const renderedArtifactMetadataSchema = z
  .object({
    artifactId: z.string().min(1),
    runId: z.string().min(1),
    kind: artifactKindSchema,
    outputFormat: artifactOutputFormatSchema,
    schemaVersion: z.string().min(1),
    generatorVersion: z.string().min(1),
    adapterVersion: z.string().min(1),
    templateVersion: z.string().min(1),
    generatedAt: z.string().min(1),
  })
  .strict();

export type ArtifactKind = z.infer<typeof artifactKindSchema>;
export type ArtifactOutputFormat = z.infer<typeof artifactOutputFormatSchema>;
export type RenderedArtifactMetadata = z.infer<
  typeof renderedArtifactMetadataSchema
>;
