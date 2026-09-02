# Phase 7.4: Evidence persistence and hardening

## Status

Implemented.

## Outcome

The run-specific evidence route now recovers the immutable contract, displays every confirmed criterion, compiles the returned material, stores it in browser-local history, and advances the run from `awaiting_evidence` to `evidence_submitted`. Reloading shows the existing submission instead of creating a duplicate.

## Integrity and bounds

- Submission, run, contract-version, and contract-hash identities must match.
- Duplicate submission IDs cannot overwrite history.
- Evidence history is bounded to three submissions, matching the initial run plus the maximum two repair attempts.
- Individual fields and the total return are size-bounded and never silently truncated.
- Corrupted storage and inconsistent run/evidence state fail closed.
- Persistence attempts restore prior evidence history if the accompanying run update fails.

## Privacy and deletion

The MVP warns users to remove credentials, personal data, and secrets. Evidence stays in the current browser until browser storage is cleared or the user explicitly confirms deletion. Deletion targets only the selected run, its contract-version run pointer, and its evidence history; unrelated project data remains intact.

## Phase boundary

Phase 7 records claims and returned evidence but does not call them verified. Phase 8 owns criterion-level evidence assessment and confidence-limited outcomes.
