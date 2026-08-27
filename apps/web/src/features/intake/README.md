# Intake feature

Phase 3 implements the first usable LoopZ workflow at `/projects/new`:

- Guided and Geek idea-entry modes.
- Deterministic classification into the four supported MVP task profiles.
- Intent, capability, constraint, and missing-information extraction.
- Explicit rejection of unsupported or unsafe requests.
- A local draft project record that carries the unchanged request and analysis to the
  clarification route.

Drafts use browser local storage until persistent project storage is introduced. The Phase 4
interview will replace the current clarification-route placeholder and turn the detected gaps
into a bounded set of risk-based questions.

Owns rough-request capture, task suitability messaging, and the transition into structured intent extraction.
