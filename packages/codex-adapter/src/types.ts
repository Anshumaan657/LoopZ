import type {
  ArtifactKind,
  RenderedArtifactMetadata,
} from "@loopz/contracts";

export type CodexRenderOptions = {
  runId: string;
  generatedAt: string;
  generatorVersion?: string;
  adapterVersion?: string;
  templateVersion?: string;
};

export type CodexArtifact = {
  filename: string;
  content: string;
  metadata: RenderedArtifactMetadata;
};

export type CodexArtifactBundle = {
  projectSpec: CodexArtifact;
  acceptanceCriteria: CodexArtifact;
  agentTask: CodexArtifact;
  starterPrompt: CodexArtifact;
};

export const CODEX_OUTPUT_FORMAT = "codex" as const;

export const CODEX_ARTIFACT_FILENAMES: Record<ArtifactKind, string> = {
  project_spec: "PROJECT_SPEC.md",
  acceptance_criteria: "ACCEPTANCE_CRITERIA.md",
  agent_task: "AGENT_TASK.md",
  starter_prompt: "STARTER_PROMPT.md",
};
