export type RenderMetadata = {
  runId: string;
  adapterVersion: string;
  templateVersion: string;
  generatedAt: string;
};

export type CodexArtifactBundle = {
  projectSpec: string;
  acceptanceCriteria: string;
  agentTask: string;
  starterPrompt: string;
  metadata: RenderMetadata;
};
