# Phase 6.1: Provider-Neutral Task Compiler

## Outcome

Phase 6.1 converts one confirmed, content-hashed contract version into a deterministic provider-neutral
execution task. The result is structured data for later agent adapters, not provider-specific prompt
prose and not permission to run an agent.

## Generation gate

`@loopz/core/task` rejects task generation unless:

- The confirmed-version and LoopSpec runtime schemas pass.
- The complete LoopSpec passes semantic validation.
- Every material decision and provenance record is user-confirmed.
- Approval records exactly match the unique planned actions requiring approval.
- A fresh SHA-256 hash of the canonical LoopSpec matches the stored contract hash.

These checks prevent stale, edited, partially confirmed, or approval-inconsistent snapshots from
being rendered.

## Canonical task contents

The provider-neutral task preserves the complete confirmed LoopSpec without rewriting requirements.
It adds only execution metadata and policy:

- Project, contract-version, version-number, hash, and confirmation linkage.
- A deterministic task key derived from the confirmed version.
- Ordered inspect, plan, implement, verify, repair, and report instructions.
- Requirement, scope, and acceptance-criterion references for traceability.
- Runtime approval gates that remain required even when acknowledged during contract confirmation.

The same confirmed version always produces the same task. No timestamp, random identifier, provider
name, or repository claim is introduced during compilation.

## Verification boundary

LoopSpec Lite 0.1 preserves criterion-level verification methods and evidence requirements. The
Phase 5 acceptance draft's candidate shell-command list is not present in confirmed LoopSpec 0.1,
so Phase 6.1 does not reconstruct or invent commands. A future additive LoopSpec version may promote
verified commands according to the schema-versioning policy.

## Contract artifact

`@loopz/contracts/task` owns the strict `providerNeutralTaskSchema`. Its checked-in Draft 2020-12
JSON Schema is `packages/contracts/schemas/provider-neutral-task.schema.json`.

Phase 6.2 may render this canonical structure for a coding agent, but an adapter cannot add, remove,
or reinterpret requirements, criteria, restrictions, approvals, limits, or final-report obligations.
