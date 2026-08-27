# LoopSpec Lite 0.1

LoopSpec Lite is the provider-neutral source of truth for a confirmed LoopZ task. Coding-agent adapters may render it, but they must not add, remove, or reinterpret product requirements.

## Trace model

```text
Original prompt
  → decision provenance
  → REQ-### deliverables
  → AC-### acceptance criteria
  → EV-### returned evidence
  → criterion assessment
  → bounded repair task
```

Every required deliverable has a stable requirement ID. Every acceptance criterion references one or more requirement IDs. Evidence submissions identify criteria and evidence items independently, allowing assessments and repair tasks to reference the same stable IDs.

## Contract groups

- `request`: unchanged original prompt and classified task type
- `objective`: confirmed goal and version-stable deliverables
- `scope`: included items, exclusions, assumptions, and unresolved decisions
- `environment`: project status, context, and technology preferences
- `workflow`: fixed plan, implement, verify, and repair phases
- `acceptance`: criterion requirements, verification methods, and required evidence
- `safety`: restrictions, approval gates, and classified planned actions
- `limits`: repair budget and stop conditions
- `finalReport`: mandatory result fields and criterion/evidence references

Important product decisions use this provenance structure:

```yaml
value: <decision value>
source: user_provided | user_selected | inferred | recommended | default
confidence: 0.0-1.0
explanation: <why this value exists>
confirmedByUser: true | false
```

## Supported task types

- New web application
- Landing page
- Existing-application feature
- Bug fix

These values describe the MVP contract boundary, not every future LoopZ use case.

## Generation gate

A schema-valid LoopSpec is not automatically generation-ready. The deterministic validator must also confirm that:

- IDs are unique.
- Required deliverables are covered by criteria.
- Criterion requirement references exist.
- Included and excluded scope do not directly conflict.
- No blocking or high-risk decision remains unresolved.
- Sensitive planned actions require human approval.

Only a confirmed LoopSpec that passes both schema and semantic validation should be sent to an adapter.
