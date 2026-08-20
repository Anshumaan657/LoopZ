# Contributing

## Before changing the product

Read:

1. `revised-mvp-roadmap.md`
2. `docs/product/mvp-scope.md`
3. `docs/architecture/README.md`

Changes outside the documented MVP boundary require an architecture or product decision record before implementation.

## Local workflow

```bash
npm install
npm run check
npm run build
```

## Package boundaries

- Put versioned data contracts in `packages/contracts`.
- Put provider-neutral domain logic in `packages/core`.
- Put Codex-specific rendering in `packages/codex-adapter`.
- Keep page composition and HTTP concerns in `apps/web`.
- Put stable regression examples in `tests/fixtures`.
- Put controlled agent comparisons in `tests/evals`.

## Completion standard

A feature is complete only when:

- Its behavior is covered by tests.
- Contract changes are versioned.
- User-facing assumptions are visible.
- Required evidence is defined.
- Error and terminal states are handled.
- Documentation is updated.

## Git safety

- Keep commits focused.
- Do not commit `.env` files, credentials, or user project content.
- Do not modify generated contract versions after a run has used them.
