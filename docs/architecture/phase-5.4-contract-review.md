# Phase 5.4: Contract Review and Editing

## Outcome

The project contract route now compiles the saved intake and completed interview through Phases
5.1–5.3 and presents the resulting safety draft in plain language. Users can review and edit the
goal, deliverable wording and priority, included/excluded scope wording, existing assumptions,
acceptance behavior, verification methods, required evidence, and verification commands.

Stable requirement, scope, criterion, and finding IDs are visible and cannot be changed through the
review UI. Phase 5.4 also prevents list-shape changes: users cannot silently add, remove, or reorder
traceable objects. Broader structural editing remains outside the MVP.

## Domain boundary

`@loopz/contracts/review` defines the strict editable payload. `@loopz/core/review` converts a safety
draft to that payload and applies edits without mutating the source. Changed provenance is marked as
user-provided, high confidence, edited during review, and not yet confirmed.

Every save reconstructs the Phase 5.2 acceptance draft, regenerates Phase 5.3 actions/findings, and
reruns deterministic validation. An edit that makes included and excluded scope identical is saved
for correction but cannot advance to confirmation. Phase 5.2 coverage and evidence rules continue to
apply.

## Browser persistence

The UI loads `loopz:project:<projectId>`, validates the intake and interview, reruns deterministic
analysis, and compiles a new contract if no saved review exists. The reviewed safety draft and update
timestamp are stored back in the same browser-local project record. Reset discards reviewed edits and
regenerates from the saved intake and interview.

This persistence is intentionally browser-local for the MVP. It is not a server database, account
sync, collaboration layer, or tamper-resistant store.

## Phase boundary

A successfully saved, valid review unlocks `/projects/:id/contract/confirm`. Phase 5.4 does not claim
that approval gates have been approved and does not create a version. Phase 5.5 performs explicit
confirmation and creates the immutable application-level snapshot.
