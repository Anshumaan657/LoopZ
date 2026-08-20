# ADR 0001: Workspace boundaries

**Status:** Proposed  
**Decision date:** 2026-08-21

## Context

LoopZ must evolve its web experience, provider-neutral contract format, deterministic validation, and agent adapters independently. Combining these concerns in one application directory would make provider changes and evaluation difficult to isolate.

## Decision

Use npm workspaces with four initial units:

- `apps/web`
- `packages/contracts`
- `packages/core`
- `packages/codex-adapter`

`contracts` owns versioned data shapes. `core` owns provider-neutral rules. `codex-adapter` renders Codex-specific artifacts. `web` owns delivery and persistence.

## Consequences

- Contract evolution becomes explicit and testable.
- Agent adapters can be benchmarked independently.
- The MVP carries small workspace-management overhead.
- Cross-package imports must follow the documented dependency direction.
