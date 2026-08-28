# Contract generation domain

Coordinates provider-neutral contract generation from original request, confirmed answers, and task-profile defaults. Generated candidates must pass deterministic validation before user confirmation.

## Implemented in Phase 5.1

- Reject unsupported, incomplete, blocked, or mismatched intake/interview state.
- Preserve the original request, extracted goal, task classification, and provenance.
- Compile stable preliminary requirements and included/excluded scope IDs.
- Let repository clarification provide project status and context.
- Carry technology preferences, assumptions, and timestamped interview decisions forward.
- Mark acceptance, safety, limits, and final-report sections as explicitly pending.
- Produce identical output from identical source state.

The foundation draft is intentionally not executable. Phase 5.2 must add traceable acceptance
criteria, verification methods, and evidence requirements before it can become LoopSpec Lite.
