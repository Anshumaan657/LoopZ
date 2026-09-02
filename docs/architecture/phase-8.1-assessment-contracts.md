# Phase 8.1 — Assessment contracts and normalization

Phase 8.1 upgrades criterion assessment to schema version `0.2` while retaining the `0.1` contract as a readable legacy artifact.

## Added guarantees

- UUID-linked run, contract-version, evidence-submission, and assessment identities.
- Sequential assessment versions and previous-version references.
- Stable criterion status, agent claim, priority, evidence strength, missing-evidence, contradiction, and confidence fields.
- Explicit correction records with previous and corrected statuses, reason, and timestamp.
- Generated JSON Schemas for both legacy and current assessment formats.

Evidence normalization ranks deterministic command or test output above inspectable file evidence, manual observations, and agent assertions. Original evidence content remains unchanged.
