# LoopSpec Validation Rule Catalog

The validator is deterministic and must not call an LLM. Stable issue codes allow the web application, analytics, fixtures, and future migrations to identify failures without parsing human-readable messages.

| Code | Rule | Layer | Generation impact |
| --- | --- | --- | --- |
| `schema_invalid` | Required fields, formats, enums, limits, or strict-object boundaries fail | Zod runtime schema | Block |
| `duplicate_requirement_id` | Each `REQ-###` ID must be unique | Semantic validator | Block |
| `duplicate_criterion_id` | Each `AC-###` ID must be unique | Semantic validator | Block |
| `unknown_requirement_reference` | Every criterion requirement reference must identify an existing deliverable | Semantic validator | Block |
| `required_requirement_uncovered` | Every required deliverable must map to at least one criterion | Semantic validator | Block |
| `scope_conflict` | Normalized scope text cannot be both included and excluded | Semantic validator | Block |
| `blocking_decision_unresolved` | Blocking, high-risk, and critical decisions must be resolved | Semantic validator | Block |
| `approval_required` | Destructive, external-service, production, financial, and credential actions require approval | Semantic validator | Block |

## Schema-enforced rules

The runtime contracts additionally enforce:

- Non-empty goal, original request, project context, deliverables, verification methods, and evidence requirements
- Stable `REQ-###`, `AC-###`, `DEC-###`, `Q-###`, and `EV-###` formats
- Four ordered workflow phases
- One or two maximum repair attempts
- At least one stop condition
- Criterion IDs and evidence references in the final report contract
- Strict objects so unknown fields do not silently enter the contract

## Rule-change policy

- A wording-only message change does not require a schema version change.
- Changing a code's meaning is breaking; create a new code instead.
- A rule that rejects previously valid LoopSpecs requires a schema-version review and migration plan.
- Fixture tests must cover every new blocking rule.
