# LoopZ

LoopZ turns a rough software request into a verifiable development contract for an AI coding agent, then assesses the returned evidence and creates a focused repair task when required.

## MVP workflow

```text
Rough request
→ Risk-based clarification
→ Confirmed scope and acceptance criteria
→ Codex-optimized or Universal compatibility task and repository artifacts
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
  universal-adapter/    Provider-neutral compatibility task rendering
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
Current implementation commits use the condensed [nine-phase implementation roadmap](docs/product/implementation-roadmap.md).

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
web → universal-adapter → contracts
```

## Current status

The MVP foundation, Phase 1 validation kit, Phase 2 domain contracts, Phase 3 idea intake, Phase 4 clarification, the complete Phase 5 contract workflow, and all of Phase 6 are implemented. Confirmed versions compile through integrity gates into deterministic provider-neutral tasks, then render as a Codex-optimized package or a clearly labelled Universal compatibility prompt. The `/projects/:id/task` route creates or reuses a real contract-linked run and uses one exact, size-bounded string for preview, copy, and download. Delivery failures, accessibility semantics, and responsive behavior are covered by the Phase 6.4 hardening suite. See [Phase 6.1](docs/architecture/phase-6.1-provider-neutral-task-compiler.md), [Phase 6.2](docs/architecture/phase-6.2-dual-task-renderers.md), [Phase 6.3](docs/architecture/phase-6.3-task-delivery.md), and [Phase 6.4](docs/architecture/phase-6.4-delivery-hardening.md).

Real participant fieldwork is still an external validation dependency: 10–20 real task examples, at least five evidence-returning end-to-end runs, and the final exit/pivot review must be completed before claiming product-market validation. Browser storage is an MVP persistence mechanism, not durable server infrastructure. The task-delivery UI, evidence-return, assessment, and repair phases remain to be implemented.
