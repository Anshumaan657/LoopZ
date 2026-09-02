# Assessment feature

Phase 8 turns a Phase 7 evidence submission into an honest, criterion-level assessment.

- `assessment-results.tsx` loads the immutable run, contract, and latest evidence submission; creates the first assessment when needed; and renders the result with source evidence.
- `assessment-storage.ts` preserves sequential browser-local assessment revisions and advances the run to `assessed` atomically.
- Corrections create a new assessment revision. They never overwrite the original automated result.

The interface deliberately says **evidence assessment**, not independent verification. LoopZ does not access the repository or rerun the submitted commands in the MVP.
