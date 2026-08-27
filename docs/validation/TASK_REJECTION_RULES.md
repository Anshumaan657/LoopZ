# Task Acceptance and Rejection Rules

## Accept

Accept when all are true:

- The participant owns or is authorized to modify the project.
- The task is a small web application or bounded feature.
- The intended outcome can be assessed within the study window.
- Required context can be shared safely.
- No real secrets or unnecessary personal data are required.
- The participant can return execution evidence.
- Production deployment is not required.

## Accept after narrowing

Narrow when the task is legitimate but too large.

Examples:

- “Build an entire marketplace” → one listing-and-request workflow.
- “Create a full SaaS” → one authenticated CRUD workflow.
- “Clone Airbnb” → one search-and-booking prototype without payments.
- “Modernize the whole repository” → one bounded feature or migration slice.

Record both the original request and the accepted slice.

## Request redaction

Pause and request a cleaned version when content includes:

- API keys or credentials.
- Customer names, emails, addresses, or IDs not needed for the test.
- Private repository URLs.
- Proprietary client information unnecessary to the task.
- Production logs containing sensitive values.

## Reject

Reject tasks involving:

- Unauthorized access, surveillance, credential theft, or evasion.
- Destructive production operations.
- Real production payments during the study.
- Safety-critical medical, financial, legal, industrial, or critical-infrastructure decisions.
- Malware or harmful security activity.
- Live secrets that cannot be safely replaced.
- Entire multi-platform products that cannot be fairly bounded.
- A participant who cannot return any outcome evidence.

## Escalate for review

Escalate when:

- Authorization is ambiguous.
- The repository contains regulated or highly sensitive data.
- The task requires a paid or external action not already authorized.
- The experiment could affect real users.
- The participant asks to bypass an agent's permission or safety system.

## Rejection message

> This task is outside the current LoopZ validation boundary because `[REASON]`. The study supports small, authorized web-development tasks that can be tested without production, destructive, or sensitive operations. If you can provide a smaller safe version—such as `[SAFE ALTERNATIVE]`—we can reassess it.

## Decision codes

| Code | Meaning |
|---|---|
| `ACCEPT` | Eligible as submitted |
| `NARROW` | Eligible after reducing scope |
| `REDACT` | Eligible after removing unsafe content |
| `REJECT_SCOPE` | Too large or not a web task |
| `REJECT_SAFETY` | Unsafe or unauthorized |
| `REJECT_EVIDENCE` | No usable return evidence possible |
| `ESCALATE` | Requires owner review |
