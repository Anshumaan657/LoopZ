# Phase 5.1: Contract Compilation Foundation

## Outcome

Phase 5.1 compiles the accepted Phase 3 intake and completed Phase 4 interview into a deterministic,
provider-neutral contract foundation. It establishes what the user asked for, what is included or
excluded, and which environment constraints must be preserved.

## Preconditions

Compilation is rejected when:

- The intake is unsupported.
- The interview is incomplete or blocked.
- A selected clarification question has no answer.
- A blocking interview issue remains.
- The project ID, task classification, or original prompt does not match across source records.

## Foundation contents

The `foundation_draft` contains:

- Original prompt and classified task type.
- Extracted goal with its original provenance.
- Stable preliminary requirements using `REQ-001` identifiers.
- Included and excluded scope using `SCOPE-IN-001` and `SCOPE-OUT-001` identifiers.
- User constraints represented as assumptions or explicit exclusions.
- Project status, repository context, and technology preferences.
- Every interview question and answer with its timestamp.
- Source-interview and compilation timestamps.

Original-request items remain unconfirmed until contract review. Direct interview answers are marked
as user-confirmed decisions.

## Determinism

IDs are assigned from normalized source order. The default compilation timestamp is the source
interview’s update timestamp. Compiling unchanged source state therefore produces byte-equivalent
structured output, which will make version comparison and regeneration predictable.

## Intentional boundary

The foundation is not yet LoopSpec Lite and cannot be sent to an AI coding agent. It explicitly
marks these sections as pending:

- Acceptance criteria and evidence
- Safety controls and approval gates
- Execution and repair limits
- Final-report requirements

Phase 5.2 will generate the requirement-to-criterion and evidence layer without inventing placeholder
acceptance criteria in this phase.
