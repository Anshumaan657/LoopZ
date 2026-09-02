# JSON Schema exports

This directory contains generated JSON Schema representations of the versioned runtime contracts:

- `loopspec-lite.schema.json` (current 0.2)
- `loopspec-lite-v0.1.schema.json` (legacy, read-only)
- `provider-neutral-task.schema.json` (current 0.2)
- `provider-neutral-task-v0.1.schema.json` (legacy, read-only)
- `evidence-submission.schema.json` (current 0.2)
- `evidence-submission-v0.1.schema.json` (legacy, read-only)
- `criterion-assessment.schema.json`
- `repair-task.schema.json` (current 0.2)
- `repair-task-v0.1.schema.json` (legacy, read-only)

Do not hand-edit generated schemas. The source definitions live in `src/`.

Regenerate and verify them with:

```bash
npm run generate:schemas --workspace @loopz/contracts
npm run test --workspace @loopz/contracts
```
