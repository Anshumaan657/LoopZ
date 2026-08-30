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

The MVP foundation, Phase 1 validation kit, Phase 2 domain contracts, Phase 3 idea intake, Phase 4 risk-based clarification, Phase 5.1 contract-compilation foundation, and Phase 5.2 acceptance/evidence compiler are implemented. The usable interface currently runs from `/projects/new` through the project-specific interview route; the Phase 5 compilers are domain functions, not a completed contract-review UI. See [Phase 3 intake](docs/architecture/phase-3-idea-intake.md), [Phase 4 clarification](docs/architecture/phase-4-clarification-interview.md), [Phase 5.1 compilation](docs/architecture/phase-5.1-contract-foundation.md), and [Phase 5.2 acceptance and evidence](docs/architecture/phase-5.2-acceptance-evidence.md).

Real participant fieldwork is still an external validation dependency: 10–20 real task examples, at least five evidence-returning end-to-end runs, and the final exit/pivot review must be completed before claiming product-market validation. The remaining Phase 5 work adds safety and approval handling, contract review, and confirmation/versioning before these drafts become execution contracts.
