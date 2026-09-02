import { MAX_RENDERED_ARTIFACT_CHARACTERS } from "@loopz/contracts/artifact";
import type { ProviderNeutralTask } from "@loopz/contracts/task";

import { renderCodexArtifacts as renderUnchecked } from "./render";
import type { CodexArtifactBundle, CodexRenderOptions } from "./types";

export function renderCodexArtifacts(
  input: ProviderNeutralTask,
  options: CodexRenderOptions,
): CodexArtifactBundle {
  const bundle = renderUnchecked(input, options);
  for (const artifact of Object.values(bundle)) {
    if (artifact.content.length > MAX_RENDERED_ARTIFACT_CHARACTERS) {
      throw new Error(
        `The rendered Codex ${artifact.metadata.kind} exceeds the ${MAX_RENDERED_ARTIFACT_CHARACTERS.toLocaleString("en-US")}-character delivery limit. Reduce the confirmed contract scope and generate a new version.`,
      );
    }
  }
  return bundle;
}
