# Regression fixtures

Fixtures should represent real concierge-study examples after sensitive content is removed.

Each fixture records:

- Input request.
- Confirmed LoopSpec version.
- Expected deterministic validation result.
- Returned evidence when applicable.
- Expected criterion statuses.

Phase 2 includes:

- A complete schema-valid LoopSpec fixture.
- A schema-invalid fixture.
- A schema-valid but semantically invalid scope-conflict fixture.
- Evidence that intentionally contains an unsupported success claim.
