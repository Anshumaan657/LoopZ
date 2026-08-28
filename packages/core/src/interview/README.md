# Interview domain

Implemented Phase 3 responsibilities:

- Extract structured intent.
- Detect missing high-risk decisions.
- Classify supported MVP task types.
- Reject explicitly unsupported or unsafe requests.

Implemented Phase 4 responsibilities:

- Select one unanswered question at a time.
- Enforce a hard five-question budget and one question per risk category.
- Prioritize blocking risks before optional preferences.
- Validate answers and preserve their timestamps as user-provided decisions.
- Track contradictions, approval gates, and safety boundaries.
- Stop safely when authorization or production boundaries are unresolved.

Model-generated wording belongs behind deterministic question-selection rules.
