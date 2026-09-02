# @loopz/core

Provider-neutral domain logic.

```text
interview/   intent extraction contracts, risk rules, and question policy
validation/  deterministic LoopSpec and evidence rules
generation/  provider-neutral contract generation orchestration
evidence/    criterion matching and evidence normalization
repair/      bounded targeted-repair planning
runs/        valid run-state transitions
task/        confirmed-version integrity checks and provider-neutral execution compilation
```

This package must not import web-framework, persistence-vendor, analytics, or agent-provider SDKs.
