# Phase 6.3: Run-backed task delivery

## Status

Implemented.

## Outcome

The task route now loads a selected confirmed contract version, compiles its integrity-checked provider-neutral task, and renders both Phase 6.2 formats. The user can switch between Codex and `Universal — Compatibility Mode`, inspect the complete prompt, copy it, or download it as Markdown.

## Real run identity

The first successful generation creates a browser-local Run 0.2 record in `task_generated`. The record is tied to the project ID, contract version ID and number, LoopSpec version, and contract hash. Its run ID and generation timestamp are reused whenever that contract-version task is reloaded.

A selected output format is persisted. A successful clipboard write or download advances `task_generated` to `copied`; failures do not advance state. Phase 7 owns the later `awaiting_evidence` transition.

Legacy Run 0.1 records remain readable through an explicit union, while new task delivery writes only Run 0.2.

## Delivery equality

The selected renderer's `starterPrompt.content` is the sole source for the on-screen preview, clipboard write, and Markdown Blob. LoopZ does not reconstruct or shorten the text for any delivery action.

## Failure behavior

Missing versions, legacy contracts, integrity failures, corrupted storage, denied clipboard access, and failed downloads are surfaced without fabricating a run or claiming a successful copy. Universal output is visibly described as compatibility mode rather than dedicated provider support.
