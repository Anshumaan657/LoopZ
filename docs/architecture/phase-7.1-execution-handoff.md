# Phase 7.1: Execution handoff

## Status

Implemented.

## Outcome

After a successful task copy or download, the user can explicitly begin evidence return. This moves the existing run from `copied` to `awaiting_evidence` and navigates to `/runs/:runId/evidence`. Opening evidence return before task delivery is rejected.

## Run lookup

Run persistence now maintains both the existing contract-version key and a validated run-ID index. The evidence route can therefore recover the exact project ID, immutable contract version ID and hash, generation metadata, and selected output format from its hard-to-guess UUID without reconstructing context from URL parameters.

Unknown, corrupted, or mismatched run IDs fail closed. Re-entering an already-awaiting run is idempotent, while all other invalid state transitions are rejected.
