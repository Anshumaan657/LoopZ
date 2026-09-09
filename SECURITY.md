# Security Policy

LoopZ will process project ideas, requirements, codebase summaries, and agent reports. Treat all submitted content as potentially sensitive and untrusted.

## MVP rules

- Never request API keys, passwords, private keys, or production credentials.
- Signed-in workflow history is mirrored to Cloud Firestore under the authenticated user's private document path. Browser `localStorage` remains the working cache and legacy-draft import source.
- **No server-side model execution or secret storage — MODEL_API_KEY and DATABASE_URL are reserved for post-MVP phases.**
- Do not include submitted project content in analytics events.
- Escape rendered user and agent content.
- Enforce input-size limits (see evidence-limits.ts: MAX_EVIDENCE_TOTAL_CHARACTERS 180,000).
- Treat pasted repository content and agent reports as prompt-injection sources.
- Never mark an unsupported agent assertion as verified evidence.
- Make retention and deletion behavior explicit before private beta.
- Run routes require a signed-in Firebase account and matching workflow state. UUIDv4 run IDs are identifiers, not authorization credentials or shareable access tokens.

## MVP Limitations (documented for transparency)

- **No application-level rate limiting** — Firebase applies platform quotas, but LoopZ does not yet enforce per-user workflow limits.
- **No server-side credential detection** — users must not paste secrets; a client-side warning is implemented in evidence return.
- **No signed sharing links** — authentication protects a user's own history, but run links are not designed for sharing with another account.
- **No immutable audit log** — Firestore provides durable account history, not an append-only compliance log.
- **Client-side route guards** — Firebase Authentication controls the UI session and Firestore Security Rules enforce cloud-data ownership. This is not a server-session architecture.
- **Evidence assessment is conservative** — LoopZ evaluates submitted material only; it does not independently rerun tests or inspect repositories.

## Reporting

Do not open public issues containing credentials, private code, or exploitable security details. Contact the repository owner privately until a formal reporting address is added.
