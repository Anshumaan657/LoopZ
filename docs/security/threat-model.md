# MVP threat model

## Assets

- User project ideas and client requirements.
- Generated contracts and agent tasks.
- Returned code summaries, test output, and agent reports.
- Run return links.

## Trust boundaries

- Browser UI to same-origin `localStorage` cache.
- Firebase Authentication session to Cloud Firestore.
- Firestore Security Rules to per-user documents under `/users/{uid}`.
- User-pasted repository context.
- User-pasted agent output.

## Primary threats

- Prompt injection through pasted content.
- Accidental credential submission.
- Sensitive content remaining in a signed-in browser session or Firestore history.
- Another person using an unlocked signed-in browser profile.
- Misconfigured or weakened Firestore Security Rules.
- False completion claims treated as verification.
- Oversized or malicious input.
- Browser storage quota exhaustion or corrupted local data.

## MVP controls

- Structured deterministic output and schema validation.
- No model-provider or Firebase Admin credentials in the web application. Firebase Web configuration is public by design.
- UUIDv4 identifiers validated at dynamic route boundaries.
- Firebase Authentication on workflow routes and UID-scoped Firestore Security Rules for cloud history.
- Local workflow state is cleared on sign-out and before switching between previously identified accounts on the same browser.
- Input-size limits; there is no application-level per-user rate limiting in the MVP.
- Credential-pattern detection blocks evidence submission until suspected secrets are removed.
- Explicit retention and deletion behavior.
- Deterministic evidence-presence checks.
- Repair limits and no-progress detection.

## Deferred controls

Signed shareable return links, server-side rate limiting, immutable audit logs, Firebase App Check, and server-side secret scanning require post-MVP infrastructure.
