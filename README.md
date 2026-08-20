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

This repository contains the proposed MVP foundation for review. Product features are intentionally not implemented yet.
