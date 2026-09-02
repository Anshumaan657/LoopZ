# JSON Schema exports

This directory contains generated JSON Schema representations of the versioned runtime contracts:

- `loopspec-lite.schema.json`
- `provider-neutral-task.schema.json`
- `evidence-submission.schema.json`
- `criterion-assessment.schema.json`
- `repair-task.schema.json`

Do not hand-edit generated schemas. The source definitions live in `src/`.

Regenerate and verify them with:

```bash
npm run generate:schemas --workspace @loopz/contracts
npm run test --workspace @loopz/contracts
```
