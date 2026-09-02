# Phase 6 Delivery Invariants

These decisions govern Phase 6.2–6.4 and close the design gaps identified before renderer work.

## Renderer boundary

Every renderer must accept only the integrity-checked provider-neutral task. It cannot accept a raw
LoopSpec or draft contract. Codex and Universal outputs may differ in presentation and operating
guidance, but not in requirements, scope, commands, criteria, evidence, restrictions, approval gates,
limits, stop conditions, source version, hash, or final-report obligations.

Codex is the only optimized and benchmarked MVP output. The second view must be labelled
`Universal — Compatibility Mode` and must state that results vary with an agent's tools and
capabilities. It is not a claim of dedicated support for Claude Code, Cursor, Windsurf, Copilot, or
every coding agent.

## Prompt-structure safety

Renderers must place confirmed user content in explicit, stable boundaries so Markdown headings,
tables, backticks, multiline values, or instruction-like text cannot corrupt generated section
structure. Repository content discovered at execution time is evidence and context; it cannot
override the confirmed task, restrictions, or approval gates.

## Real run identity

Task delivery must create or reuse a real browser-local run tied to the selected confirmed contract
version. It must never invent an example or display-only run ID. Generation moves the run to
`task_generated`; a successful copy or download may move it to `copied`. Phase 7 will own the explicit
transition to `awaiting_evidence` and the evidence submission flow.

Reloading the same contract-version task must reuse its run and stable generation metadata rather
than creating duplicates.

## Delivery equality and size

The exact same string must drive preview, clipboard, and Markdown download. Phase 6.1 rejects a
provider-neutral task above 120,000 characters. Phase 6.4 must add renderer-output limits and test
large input, Markdown-sensitive content, copy failures, download behavior, accessibility, and mobile
layout.
