# Phase 9.4 — End-to-end validation and release readiness

Phase 9.4 closes the MVP engineering roadmap by verifying that the Phase 9 components operate as one bounded state machine rather than as isolated screens.

## Verified automated journey

```text
awaiting_evidence
→ evidence_submitted
→ assessed (repair recommended)
→ repair_generated
→ awaiting_evidence
→ evidence_submitted
→ assessed (completion supported)
→ completed
```

The end-to-end test uses the real evidence, assessment, repair, run-resolution, and browser-persistence functions. It verifies that two evidence submissions and two assessment revisions remain immutable, one repair is preserved, and the terminal resolution points to the final assessment.

## Release boundaries

- Repair attempts are capped at two and evidence submissions at three.
- Identical unresolved evidence cannot generate another repair.
- Missing proof requests evidence without consuming a repair attempt.
- Blockers and safety contradictions terminate at human review.
- Completion requires submitted evidence assessed against every required criterion.
- Every artifact remains tied to one run, confirmed version, and contract hash.
- Local browser persistence can fail closed and is not presented as durable cloud storage.
- LoopZ assesses returned material but does not independently execute verification commands.

## Readiness definition

The repository is engineering-ready when `npm run check` and `npm run build` pass and the critical browser journey is manually exercised. Public MVP release still requires the field evidence in `docs/validation/MVP_RELEASE_CHECKLIST.md`; passing automated tests alone does not establish usefulness, token savings, or willingness to pay.
