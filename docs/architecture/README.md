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

## Planned infrastructure boundaries

The concrete database, model provider, analytics provider, and hosting platform remain implementation decisions. Domain code should depend on interfaces rather than vendor SDKs.
