# Security Policy

LoopZ will process project ideas, requirements, codebase summaries, and agent reports. Treat all submitted content as potentially sensitive and untrusted.

## MVP rules

- Never request API keys, passwords, private keys, or production credentials.
- **MVP persistence is browser-localStorage only — no server-side storage, no durable cloud infrastructure.**
- **No server-side model execution or secret storage — MODEL_API_KEY and DATABASE_URL are reserved for post-MVP phases.**
- Do not include submitted project content in analytics events.
- Escape rendered user and agent content.
- Enforce input-size limits (see evidence-limits.ts: MAX_EVIDENCE_TOTAL_CHARACTERS 180,000).
- Treat pasted repository content and agent reports as prompt-injection sources.
- Never mark an unsupported agent assertion as verified evidence.
- Make retention and deletion behavior explicit before private beta.
- Return links contain UUIDv4 run IDs but are not authentication. They work only with matching data stored in the same browser origin and should not be treated as shareable links.

## MVP Limitations (documented for transparency)

- **No rate limiting** — localStorage operations are client-side only; abuse is limited by browser quota.
- **No server-side credential detection** — users must not paste secrets; a client-side warning is implemented in evidence return.
- **No signed return URLs or accounts** — run IDs in URL paths resolve only against matching browser-local data.
- **No durable audit log** — browser storage can be cleared by user at any time; no server-side trace.
- **Evidence assessment is conservative** — LoopZ evaluates submitted material only; it does not independently rerun tests or inspect repositories.

## Reporting

Do not open public issues containing credentials, private code, or exploitable security details. Contact the repository owner privately until a formal reporting address is added.
