# Security Policy

LoopZ will process project ideas, requirements, codebase summaries, and agent reports. Treat all submitted content as potentially sensitive and untrusted.

## MVP rules

- Never request API keys, passwords, private keys, or production credentials.
- Keep model-provider credentials server-side.
- Do not include submitted project content in analytics events.
- Escape rendered user and agent content.
- Enforce input-size limits and rate limits.
- Treat pasted repository content and agent reports as prompt-injection sources.
- Never mark an unsupported agent assertion as verified evidence.
- Make retention and deletion behavior explicit before private beta.

## Reporting

Do not open public issues containing credentials, private code, or exploitable security details. Contact the repository owner privately until a formal reporting address is added.
