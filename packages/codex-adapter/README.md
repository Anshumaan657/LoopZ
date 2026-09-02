# @loopz/codex-adapter

Codex-optimized rendering for the first MVP.

Implemented artifacts:

- `PROJECT_SPEC.md`
- `ACCEPTANCE_CRITERIA.md`
- `AGENT_TASK.md`
- Copy-ready starter prompt

Every artifact records its output format plus schema, generator, adapter, and template versions. The adapter accepts only the integrity-checked provider-neutral execution task; it cannot render a raw or draft LoopSpec.

`renderCodexArtifacts` is deterministic when its task and metadata inputs are fixed. All confirmed requirements, scope, commands, criteria, evidence obligations, safety boundaries, limits, and source-integrity fields are preserved. Confirmed user text is rendered as indented data so Markdown-sensitive content cannot replace generated task structure.
