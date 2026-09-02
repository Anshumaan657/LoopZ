import type { RenderedArtifactMetadata } from "@loopz/contracts";

export type UniversalRenderOptions = {
  runId: string;
  generatedAt: string;
  generatorVersion?: string;
  adapterVersion?: string;
  templateVersion?: string;
};

export type UniversalArtifact = {
  filename: string;
  content: string;
  metadata: RenderedArtifactMetadata;
};

export type UniversalArtifactBundle = {
  agentTask: UniversalArtifact;
  starterPrompt: UniversalArtifact;
};

export const UNIVERSAL_OUTPUT_FORMAT = "universal" as const;
