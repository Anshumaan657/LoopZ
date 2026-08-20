# Benchmark plan

## Question

Does a LoopZ contract produce better completed work than the same rough request sent directly to Codex?

## Paired paths

```text
Baseline: rough request → Codex
Product:  rough request → LoopZ contract → Codex
```

## Hold constant

- Model and agent version.
- Repository starting state.
- Tool permissions.
- Time or turn limits.
- Acceptance criteria used for evaluation.

## Measure

- Required criteria passed.
- Evidence coverage.
- Unsupported completion claims.
- Clarification turns.
- Human corrections.
- Repair attempts.
- Time to acceptable completion.
- Agent-side tokens.
- Platform tokens.
- Total tokens.

## Evaluation rules

- Prefer deterministic tests.
- Do not use one model's overall opinion as the sole judge.
- Record all generator, schema, adapter, and evaluator versions.
- Preserve failed cases as regression fixtures.
