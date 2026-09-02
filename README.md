# LoopZ

LoopZ turns a rough software request into a verifiable development contract for an AI coding agent, then assesses the returned evidence and creates a focused repair task when required.

## MVP workflow

```text
Rough request
→ Risk-based clarification
→ Confirmed scope and acceptance criteria
→ Codex-ready task and repository artifacts
→ User runs the task outside LoopZ
→ User returns the final report and evidence
→ LoopZ assesses every acceptance criterion
→ LoopZ generates a bounded repair task when needed
```

## MVP boundaries

The first release targets freelancers and technical indie builders working on small web applications or bounded web features. It supports one tested Codex adapter and does not run coding agents directly.

Not included in the first release:

- Direct agent execution
- Repository write access
- Production deployment
- Multiple public agent adapters
- Advanced or raw LoopSpec editing
- Multi-agent or fleet orchestration

See [docs/product/mvp-scope.md](docs/product/mvp-scope.md) for the full boundary.

## Workspace map

```text
apps/
  web/                 User-facing web application and server routes
packages/
  contracts/           Versioned schemas and shared domain types
  core/                Provider-neutral interview, validation, evidence, and repair logic
  codex-adapter/        Codex-specific artifact and task rendering
tests/
  fixtures/            Stable valid and invalid contract/evidence examples
  evals/               Raw-prompt versus LoopZ benchmark cases
docs/
  architecture/        System boundaries and architectural decisions
  product/             MVP scope, user flow, and terminology
  research/            Concierge-study protocol and findings
  validation/          Complete Phase 1 operating kit and experiment tracker
  security/            Threat model and privacy boundaries
  evaluation/          Benchmark and measurement design
```

The existing project brief and revised roadmap remain at the repository root as source planning documents.

## Development

Requirements:

- Node.js 22 or newer
- npm 10 or newer

```bash
npm install
cp .env.example .env.local
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

## Architectural rule

The web application may depend on the domain packages. Provider-neutral packages must never import the web application or Codex-specific adapter.

```text
web → core → contracts
web → codex-adapter → contracts
```

## Current status

The MVP foundation, Phase 1 validation kit, Phase 2 domain contracts, Phase 3 idea intake, Phase 4 clarification, the complete Phase 5 contract workflow, and Phase 6.1 provider-neutral task compiler are implemented. Confirmed versions now compile through hash, semantic, confirmation, and approval-integrity gates into deterministic execution tasks. The usable interface still runs from `/projects/new` through `/projects/:id/contract/confirm`; provider rendering and the task preview remain Phase 6.2–6.3 work. See [Phase 5.4 contract review](docs/architecture/phase-5.4-contract-review.md), [Phase 5.5 confirmation and versioning](docs/architecture/phase-5.5-confirmation-versioning.md), and [Phase 6.1 task compilation](docs/architecture/phase-6.1-provider-neutral-task-compiler.md).

Real participant fieldwork is still an external validation dependency: 10–20 real task examples, at least five evidence-returning end-to-end runs, and the final exit/pivot review must be completed before claiming product-market validation. Browser storage is an MVP persistence mechanism, not durable server infrastructure. The task-rendering, evidence-return, assessment, and repair phases remain to be implemented.
