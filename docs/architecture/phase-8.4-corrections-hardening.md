# Phase 8.4 — Corrections, audit trail, and hardening

Assessment corrections are append-only revisions. A correction records who changed what implicitly as a local user action, the previous and corrected statuses, the reason, and the timestamp. The previous automated assessment remains available in browser storage.

## Persistence safeguards

- Maximum ten assessment versions per run.
- Unique assessment IDs and strictly sequential version numbers.
- An unbroken `previousAssessmentId` chain.
- Exact run, contract hash, evidence submission, and criterion-set matching.
- Rollback of assessment history and both run pointers if persistence fails.
- Deleting a local run also deletes its evidence and assessment history.

The UI includes keyboard focus styling, responsive layouts, explicit loading/error states, source-evidence inspection, and an audit trail. Core, storage, contract-schema, and UI guard tests cover the critical boundaries.
