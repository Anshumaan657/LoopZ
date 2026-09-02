# Phase 9.1 — Focused repair contract and compiler

Phase 9.1 turns a repair-eligible Phase 8 assessment into one bounded, copy-ready repair task. It does not mutate the run or deliver the prompt; those are Phase 9.2 responsibilities.

## Source chain

Every repair is tied to exactly one:

- Run and confirmed contract version.
- Contract content hash.
- Evidence submission.
- Parent assessment revision.
- Repair-attempt number.

Repair schema `0.2` adds this traceability, structured unresolved criteria, preserved criterion IDs, a source-evidence fingerprint, generated time, and bounded instructions. Schema `0.1` remains readable as a legacy contract.

## Eligibility

The compiler generates a repair only for `failed` and `partially_supported` criteria. It refuses:

- Work already completed with evidence.
- Human blockers.
- Unsafe or out-of-scope execution.
- Unsupported claims or missing evidence that require evidence return instead of code changes.
- Attempts beyond the confirmed maximum of two.
- A repeated unresolved-state and evidence fingerprint indicating no progress.

## Prompt guarantees

The generated task includes only unresolved criteria, explicitly preserves supported criteria, carries bounded triggering-evidence excerpts, requires the original verification commands and regression checks, repeats restrictions and approval gates, and demands fresh criterion-level evidence.

User-controlled requirements and evidence are indented and labelled as quoted data so they cannot replace the repair task's authority or safety boundaries.
