# Phase 6.2: Codex and Universal task renderers

## Status

Implemented.

## Outcome

One integrity-checked provider-neutral task can now be rendered into two delivery views without changing its confirmed meaning:

- **Codex** — the MVP's optimized and benchmarkable format.
- **Universal — Compatibility Mode** — a provider-neutral fallback whose results depend on the target agent's capabilities.

Universal output does not claim dedicated support for Claude Code, Cursor, Windsurf, Copilot, or every coding agent.

## Trust boundary

Both renderers parse `ProviderNeutralTask` at runtime. A raw LoopSpec, draft contract, legacy task, or malformed object is rejected before rendering. This keeps semantic validation, confirmation integrity, and contract hashing in the Phase 6.1 compiler rather than duplicating those decisions inside adapters.

## Preserved semantics

Both task prompts contain:

- Source task key, project ID, contract version ID and number, contract hash, and confirmation time.
- Original request, objective, project context, technology preferences, and assumptions.
- Every requirement and included/excluded scope item by stable ID.
- The six execution-loop steps and their references.
- Exact verification commands.
- Every acceptance criterion, verification method, and required evidence item.
- Restrictions, approval policy, and runtime approval gates.
- Repair limit, stop conditions, and final-report obligations.

Codex also receives separate project-specification and acceptance-contract artifacts. Each rendered artifact records an `outputFormat` in its metadata, and the format is part of its artifact ID to prevent collisions between views.

## Prompt-structure safety

Confirmed free text is normalized and placed in indented Markdown data blocks. Headings, backticks, multiline text, HTML-like strings, and instruction-like content supplied by a user therefore remain visibly quoted data instead of becoming generated control sections.

The copy-ready starter prompt wraps the complete task between explicit beginning and ending markers. The embedded task is the canonical string Phase 6.3 must use for preview and clipboard delivery.

## Verification

Tests cover:

- Provider-neutral input enforcement.
- Deterministic output for fixed inputs.
- Output-format metadata and collision-resistant artifact IDs.
- Preservation of requirements, scope, commands, criteria, evidence, safety boundaries, limits, and source hashes.
- Compatibility-mode labelling and absence of Codex-specific claims in Universal output.
- Markdown-sensitive content isolation.

Phase 6.3 will connect these pure renderers to a real browser-local run and the task preview/copy/download interface. Phase 6.4 owns output-size limits and full delivery UX hardening.
