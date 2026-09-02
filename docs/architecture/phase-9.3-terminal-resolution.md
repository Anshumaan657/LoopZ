# Phase 9.3 — Completion, limits, and escalation

Every assessed run now has one supported next action: complete, focused repair, submit more evidence, or stop for human review.

- `completed_with_evidence` can create an immutable completed resolution.
- Failed or partially supported work can repair while budget remains.
- Unsupported evidence returns to evidence intake without consuming a repair attempt.
- Human blockers and unsafe execution stop as blocked resolutions.
- Unresolved work after two repairs stops with `repair_limit_reached`.
- Repeated failure fingerprints refuse another repair and require human review.

Terminal resolutions preserve the assessment ID, contract version and hash, reason, explanation, and timestamp. Run and resolution persistence is atomic and terminal runs cannot be corrected or resumed silently.
