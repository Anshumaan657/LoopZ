# Phase 3: Idea Intake and Intent Extraction

## Outcome

Phase 3 turns a rough software request into a structured intake analysis before LoopZ asks any
clarification questions. It preserves the original request, identifies the likely task profile,
extracts intent, finds material gaps, and prevents unsupported work from moving forward.

## Supported task profiles

- New web application
- Landing page
- Existing-application feature
- Bounded bug fix

Native mobile, desktop, game-development, blockchain, high-risk regulated decision systems, and
explicitly unsafe requests are rejected in the MVP.

## User modes

Guided mode accepts one plain-language request and keeps technical decisions for the later
interview. Geek mode adds project status, repository or stack context, and technology preferences.
Super Geek remains outside the MVP until real usage proves the need for raw contract controls.

## Processing contract

The intake analyzer validates input, classifies the task, records inferred values with provenance
and confidence, detects missing information by risk category, and returns one of:

- `ready_for_interview`
- `needs_clarification`
- `unsupported`

The initial analyzer is deterministic. This keeps the baseline testable and gives later
model-assisted extraction a measurable reference instead of making correctness depend entirely on
an opaque prompt.

## Temporary persistence

The browser stores an accepted draft under `loopz:project:<projectId>`. The record contains the
original intake, structured analysis, generated project ID, and creation timestamp. Durable server
storage and authenticated ownership are deliberately deferred to a later MVP phase.

## Phase boundary

Phase 3 identifies what is missing; Phase 4 selects and asks the smallest useful clarification
question set. The current continuation link points to that already-scaffolded interview route.
