# Phase 7.2: Evidence intake contract and form

## Status

Implemented.

## Outcome

LoopZ now has a plain-language evidence-return form for the coding agent identity, complete final report, command output, diff summary, user-observed problems, manual checks, notes, and a reported status for every acceptance criterion.

Criterion selections are explicitly labelled as agent claims rather than verified outcomes. The form shows the required evidence beside each criterion so users can see what may be missing before submission.

## Contract evolution

Evidence Submission 0.2 binds returned evidence to a UUID run, immutable contract version ID, and contract hash. Claims use the bounded states `passed`, `failed`, `blocked`, and `unverified`. Legacy Evidence Submission 0.1 remains readable through an explicit union and is never silently treated as 0.2.
