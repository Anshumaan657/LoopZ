# @loopz/codex-adapter

Codex-specific rendering for the first MVP.

Implemented artifacts:

- `PROJECT_SPEC.md`
- `ACCEPTANCE_CRITERIA.md`
- `AGENT_TASK.md`
- Copy-ready starter prompt

Every artifact records schema, generator, adapter, and template versions. The adapter renders a confirmed LoopSpec; it must not invent or silently change product requirements.

`renderCodexArtifacts` is deterministic when its LoopSpec and metadata inputs are fixed. Semantic readiness remains the responsibility of the provider-neutral validator before rendering.
