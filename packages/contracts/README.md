# @loopz/contracts

Versioned, provider-neutral data contracts shared by the web application, domain engine, and agent adapters.

Rules:

- Schema changes require an explicit version change.
- Criterion IDs remain stable after a run is created.
- User decisions include provenance.
- Provider-specific instructions do not belong here.
- JSON Schema exports in `schemas/` are interoperability artifacts; TypeScript runtime validation lives in `src/`.

Implemented Phase 2 contracts:

- LoopSpec Lite and decision provenance
- Extracted intent, clarification questions, and user answers
- Rendered artifact metadata
- Run states and run records
- Evidence submissions and evidence items
- Criterion assessments
- Bounded repair tasks
- Provider-neutral execution tasks linked to confirmed contract versions
- Stable validation issues

Current LoopSpec, confirmed-version, provider-neutral-task, and evidence-submission writes use 0.2.
Reviewed verification commands remain inside the hashed contract, and returned evidence is tied to
that immutable contract identity. Explicit 0.1 schemas remain available for legacy reads.

See `docs/architecture/loopspec-lite.md`, `validation-rule-catalog.md`, and `schema-versioning-policy.md` for the contract rules.
