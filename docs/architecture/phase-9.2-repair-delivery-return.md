# Phase 9.2 — Repair delivery and evidence return

`/runs/[runId]/repair` compiles or resumes the repair tied to the latest assessment. It shows the attempt budget, unresolved and preserved criterion counts, and the exact copy-ready Markdown task.

## State sequence

```text
assessed → repair_generated → awaiting_evidence → evidence_submitted → assessed
```

Copy or download is required before repair evidence return. New evidence and assessments append to their existing histories, preserving the original attempt. Repair persistence updates both run indexes atomically and rolls back on failure.

The evidence screen distinguishes initial execution from repair evidence and keeps all criterion IDs stable across attempts.
