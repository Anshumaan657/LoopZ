# LoopSpec Lite 0.2 Migration

## Reason for the version change

Phase 5.2 creates and Phase 5.4 lets the user review candidate verification commands, but confirmed
LoopSpec 0.1 retained only criterion-level verification methods. That dropped reviewed commands before
task rendering. LoopSpec 0.2 makes `acceptance.verificationCommands` part of the confirmed, hashed
source of truth.

## Current write format

New contract foundations, reviews, confirmations, and provider-neutral tasks use schema version 0.2.
A confirmed 0.2 version cannot be created without one to twenty non-empty commands, each limited to
1,000 characters. These generous bounds prevent an unbounded command section while preserving
multiline commands and paths.

## Legacy read format

The original 0.1 LoopSpec, confirmed-version, and provider-neutral-task schemas remain exported and
have frozen JSON Schema artifacts. Mixed 0.1/0.2 version history remains readable and keeps sequential
version and uniqueness checks.

LoopZ never guesses commands for a 0.1 snapshot. A legacy version is labelled as requiring review and
reconfirmation before task generation. Saving the regenerated review and confirming it creates the
next 0.2 version; it does not mutate or overwrite the 0.1 record.

## Hash and task behavior

Verification commands are inside the 0.2 LoopSpec and therefore inside its canonical SHA-256 content
hash. Phase 6.1 accepts only current confirmed versions and carries the exact command list into the
provider-neutral task. Any command edit requires a new confirmed contract version and hash.

Provider-neutral compilation also rejects a structured task larger than 120,000 characters. This is
a final safety bound in addition to the existing 4,000-character intake limit and the new command
bounds. Phase 6.4 will benchmark and tune delivery-size behavior using real rendered outputs.
