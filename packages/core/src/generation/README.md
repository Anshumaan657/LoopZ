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

## Implemented in Phase 5.2

- Generate stable requirement-linked acceptance criteria.
- Preserve explicit verification commands and infer reviewable candidates when absent.
- Define criterion-specific evidence requirements.
- Validate coverage, references, priority, commands, and evidence.

## Implemented in Phase 5.3

- Detect direct scope conflicts and known clarification contradictions.
- Classify approval gates, warnings, and blocking safety boundaries.
- Generate planned actions for destructive, external-service, production/staging, financial,
  and credential-sensitive work.
- Require each sensitive action to have an explicit human-approval gate.
- Preserve a fixed MVP restriction set and source references for findings.
- Carry Phase 5.2 validation failures forward.

The `safety_draft` remains intentionally non-executable. Contract review must resolve blocking
findings, inspect heuristic warnings and actions, and confirm approval gates. Later phases add
limits, final-report requirements, user confirmation, versioning, and persistence before it can
become LoopSpec Lite.
