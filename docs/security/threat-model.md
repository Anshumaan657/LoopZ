# MVP threat model

## Assets

- User project ideas and client requirements.
- Generated contracts and agent tasks.
- Returned code summaries, test output, and agent reports.
- Model-provider credentials.
- Run return links.

## Trust boundaries

- Browser to LoopZ server.
- LoopZ server to model provider.
- User-pasted repository context.
- User-pasted agent output.
- Analytics and monitoring providers.

## Primary threats

- Prompt injection through pasted content.
- Accidental credential submission.
- Unauthorized access through guessed return links.
- Sensitive content leaking into logs or analytics.
- False completion claims treated as verification.
- Oversized or malicious input.
- Repeated model requests causing unexpected cost.

## MVP controls

- Structured model output and schema validation.
- Server-only secrets.
- Signed, high-entropy return identifiers.
- Input-size and rate limits.
- Credential-pattern warnings.
- Content-safe logging.
- Explicit retention and deletion behavior.
- Deterministic evidence-presence checks.
- Repair limits and no-progress detection.
