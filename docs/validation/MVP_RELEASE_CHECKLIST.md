# LoopZ MVP release checklist

This checklist separates implementation readiness from real-user validation. Record evidence beside each item before calling the MVP publicly validated.

## Engineering gates

- [ ] `npm run check` passes from the repository root.
- [ ] `npm run build` passes from the repository root.
- [ ] The browser journey works from rough request through confirmed task delivery.
- [ ] Initial evidence can be submitted and assessed against every criterion.
- [ ] A failed criterion produces a bounded repair tied to the correct run and contract hash.
- [ ] Copy or download is required before repair evidence return.
- [ ] Fresh repair evidence creates a new immutable submission and assessment revision.
- [ ] Evidence-backed completion creates a completed terminal resolution.
- [ ] Human blocker, safety violation, repeated failure, and exhausted repair budget create blocked outcomes.
- [ ] Reloading each workflow screen preserves the current run state.
- [ ] Corrupted, mismatched, oversized, or duplicate browser data fails closed with a useful message.
- [ ] Privacy, secret-removal, and “submitted evidence is not independently verified” notices remain visible.

## Manual compatibility matrix

| Environment | Intake → task | Evidence → assessment | Repair → resolution | Evidence recorded |
|---|---:|---:|---:|---|
| Chrome desktop | [ ] | [ ] | [ ] | |
| Safari desktop | [ ] | [ ] | [ ] | |
| Firefox desktop | [ ] | [ ] | [ ] | |
| Mobile viewport | [ ] | [ ] | [ ] | |

## Phase 1 field gates

- [ ] 10–20 real task examples are recorded.
- [ ] At least five participants complete the full evidence-returning workflow.
- [ ] Common missing requirements and clarification questions are classified.
- [ ] Common coding-agent failure patterns and rejection rules are documented.
- [ ] Several participants explicitly ask to reuse LoopZ.
- [ ] At least one credible willingness-to-pay signal is recorded with its reason.
- [ ] Return-and-assess adds value beyond restating the coding agent's report.
- [ ] The exit/pivot review is completed without hiding negative results.

## Claims gate

- [ ] Any token-efficiency claim is supported by benchmark data rather than prompt length alone.
- [ ] Marketing says LoopZ assesses submitted evidence; it does not claim to independently verify a repository.
- [ ] Engineering completion, product validation, and production readiness are described separately.

## Release decision

- Decision: [ ] release  [ ] limited pilot  [ ] revise  [ ] pivot
- Decision date:
- Owner:
- Evidence links:
- Remaining risks:
