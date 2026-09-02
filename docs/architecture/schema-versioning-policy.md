# Contract Schema Versioning Policy

LoopZ contracts are durable data. Generated tasks, returned evidence, assessments, and repairs must remain interpretable after the product changes.

## Version fields

- Current LoopSpec and confirmed-version payloads carry `schemaVersion: 0.2`; explicit 0.1 schemas are
  retained for legacy reads.
- Rendered artifacts carry schema, generator, adapter, and template versions.
- Run records identify the LoopSpec version used to create the run.
- Evidence, assessments, and repairs identify their parent records using stable IDs.

## Pre-1.0 rules

- Patch-level implementation changes that do not alter accepted payloads keep the schema version.
- Backward-compatible optional fields may advance `0.1` to `0.2` when consumers need to distinguish them.
- Removing, renaming, changing the meaning of, or making a field required is breaking and requires a new schema version.
- Existing schema definitions are never silently rewritten to accept a different meaning.

## Change procedure

1. Describe the contract change and whether it is additive or breaking.
2. Add the new runtime schema alongside the previous version when persisted data exists.
3. Add valid, invalid, and migration fixtures.
4. Regenerate checked-in JSON Schema artifacts.
5. Update adapters and golden outputs explicitly.
6. Add a migration or document why old records remain read-only.
7. Release only after old-version behavior remains covered by tests.

## Applied migration: 0.1 to 0.2

LoopSpec 0.2 adds required `acceptance.verificationCommands` so reviewed commands survive confirmation,
hashing, and task generation. New writes use 0.2. Legacy 0.1 snapshots remain readable but cannot be
silently upgraded because no command list exists in their confirmed content; users must reconfirm them.

Evidence Submission 0.2 adds UUID run and submission identity, immutable contract-version identity,
coding-agent attribution, and bounded criterion claim states. New returns use 0.2. Legacy 0.1 evidence
remains readable through its explicit schema and is not silently rewritten.

## Stable identifiers

Requirement, criterion, evidence, assessment, and repair IDs must not be reused for a different meaning. Once a run is created, changing a requirement or criterion creates a new LoopSpec version rather than mutating the historical contract.

## Generated JSON Schemas

Zod contracts in `packages/contracts/src` are the runtime source of truth. JSON Schema files in `packages/contracts/schemas` are generated interoperability artifacts. CI tests fail when the checked-in files differ from current runtime schemas.
