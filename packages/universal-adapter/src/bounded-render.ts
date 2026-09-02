import { MAX_RENDERED_ARTIFACT_CHARACTERS } from "@loopz/contracts/artifact";
import type { ProviderNeutralTask } from "@loopz/contracts/task";

import { renderUniversalArtifacts as renderUnchecked } from "./render";
import type { UniversalArtifactBundle, UniversalRenderOptions } from "./types";

export function renderUniversalArtifacts(
  input: ProviderNeutralTask,
  options: UniversalRenderOptions,
): UniversalArtifactBundle {
  const bundle = renderUnchecked(input, options);
  for (const artifact of Object.values(bundle)) {
    if (artifact.content.length > MAX_RENDERED_ARTIFACT_CHARACTERS) {
      throw new Error(
        `The rendered Universal ${artifact.metadata.kind} exceeds the ${MAX_RENDERED_ARTIFACT_CHARACTERS.toLocaleString("en-US")}-character delivery limit. Reduce the confirmed contract scope and generate a new version.`,
      );
    }
  }
  return bundle;
}
