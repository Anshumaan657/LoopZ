# Phase 5.5: Confirmation, Versioning, and Persistence

## Outcome

Phase 5.5 converts a valid reviewed `safety_draft` into complete LoopSpec Lite, requires explicit
acknowledgment of every planned approval-gated action, hashes the canonical contract content, and
stores an append-only confirmed version in the browser.

## Confirmed contract compilation

`@loopz/core/confirmation` first reruns Phase 5.3 and complete LoopSpec semantic validation. It then:

- Marks reviewed goal, scope, environment, and requirement provenance as user-confirmed.
- Uses the ordered workflow `plan → implement → verify → repair`.
- Carries reviewed criteria and the complete safety section forward.
- Sets a maximum of two repair attempts.
- Stops on human approval, unavailable access/evidence, repeated failure, scope expansion, or a
  restricted action.
- Requires a criterion/evidence-linked final report with changed files, verification output,
  blockers, assumptions, approvals, and remaining work.

The acceptance draft's candidate command list is represented by each criterion's reviewed
verification method in LoopSpec Lite. Future schema work may promote commands to their own confirmed
LoopSpec field; Phase 5.5 does not silently extend schema version `0.1`.

## Approval acknowledgment

Every planned action with `requiresApproval: true` must be acknowledged exactly once. Missing,
duplicate, or unknown action acknowledgments reject confirmation. Approval records preserve the
action, safety category, and confirmation timestamp. They record user acknowledgment at contract
confirmation; the eventual coding agent must still stop at runtime approval gates.

## Immutable application versions

A confirmed snapshot contains:

- UUID version and project IDs.
- Monotonic project-local version number.
- User confirmation timestamp.
- SHA-256 hash of canonical, key-sorted LoopSpec content.
- Approval records.
- The complete validated LoopSpec Lite object.

The core function is deterministic when IDs, timestamp, version number, approvals, and draft are
unchanged. The UI creates fresh IDs and timestamps. Application persistence refuses duplicate version
numbers or IDs and appends new snapshots rather than overwriting existing ones.

## Persistence boundary

Versions are stored at `loopz:project:<projectId>:versions` using strict runtime parsing. This proves
application-level version behavior for the MVP, but browser storage is neither truly immutable nor
durable: users can clear or manually alter it. Server persistence, accounts, synchronization,
authorization, audit signatures, migrations, retention, and recovery remain later infrastructure
work and must not be claimed by the MVP.

## User flow

The valid saved review unlocks `/projects/:id/contract/confirm`. After all acknowledgments and final
certification, the page displays version metadata and content hash, preserves version history, and
links to task generation with the confirmed version ID.

Phase 5.5 completes contract generation and confirmation. It does not yet replace the placeholder
task route, execute an agent, or assess returned evidence.
