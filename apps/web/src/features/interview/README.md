# Clarification interview

Phase 4 turns Phase 3 missing-information signals into a bounded interview:

- Selects at most five unique risk categories.
- Prioritizes blocking authorization, access, authentication, integration, and deployment risks.
- Presents one question at a time.
- Validates choice and text answers.
- Saves timestamps, progress, warnings, and blocking issues in the local project draft.
- Unlocks the project-specific contract route only after the interview reaches
  `ready_for_contract`.

Question wording is deterministic in the MVP. A future model may improve phrasing, but it must not
override the deterministic selection, budget, or stop rules.
