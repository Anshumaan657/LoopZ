# Architecture

LoopZ uses a small workspace with explicit dependency boundaries.

```text
┌─────────────────────────────┐
│ apps/web                    │
│ UI, HTTP, persistence       │
└─────────────┬───────────────┘
              │
       ┌──────┴─────────┐
       ▼                ▼
┌──────────────┐  ┌────────────────┐
│ packages/core│  │ codex-adapter  │
│ domain rules │  │ prompt/artifact│
└──────┬───────┘  └───────┬────────┘
       │                  │
       └────────┬─────────┘
                ▼
       ┌─────────────────┐
       │ contracts       │
       │ schemas + types │
       └─────────────────┘
```

## Principles

1. The confirmed LoopSpec version is the source of truth.
2. Generated prompts are disposable views of a versioned contract.
3. Provider-specific behavior stays outside the core domain.
4. Deterministic rules run before semantic model judgments.
5. Agent self-report is not proof without supporting evidence.
6. Every generated run records exact schema, generator, and adapter versions.
7. Repair tasks preserve completed work and operate only on unresolved criteria.
8. Every retry appends evidence and assessment history; it never overwrites the prior attempt.
9. Completion, safety stops, repeated failures, and exhausted repair budgets create explicit terminal outcomes.

## Planned infrastructure boundaries

The concrete database, model provider, analytics provider, and hosting platform remain implementation decisions. Domain code should depend on interfaces rather than vendor SDKs.

## Phase 9 references

- [9.1 focused repair compiler](phase-9.1-focused-repair-compiler.md)
- [9.2 repair delivery and evidence return](phase-9.2-repair-delivery-return.md)
- [9.3 completion, limits, and escalation](phase-9.3-terminal-resolution.md)
- [9.4 end-to-end and release readiness](phase-9.4-release-readiness.md)
