# MVP threat model

## Assets

- User project ideas and client requirements.
- Generated contracts and agent tasks.
- Returned code summaries, test output, and agent reports.
- Run return links.

## Trust boundaries

- Browser UI to same-origin `localStorage`.
- User-pasted repository context.
- User-pasted agent output.

## Primary threats

- Prompt injection through pasted content.
- Accidental credential submission.
- Sensitive content remaining in shared browser storage.
- Another person using the same browser profile opening a known run URL.
- False completion claims treated as verification.
- Oversized or malicious input.
- Browser storage quota exhaustion or corrupted local data.

## MVP controls

- Structured deterministic output and schema validation.
- No model-provider or database credentials in the web application.
- UUIDv4 identifiers validated at dynamic route boundaries.
- Input-size limits; there is no server-side rate limiting in the browser-only MVP.
- Credential-pattern detection blocks evidence submission until suspected secrets are removed.
- Explicit retention and deletion behavior.
- Deterministic evidence-presence checks.
- Repair limits and no-progress detection.

## Deferred controls

Authenticated ownership, signed shareable return links, server-side rate limiting, durable audit logs, and server-side secret scanning require post-MVP infrastructure.
