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
→ User returns fresh repair evidence
→ LoopZ completes the run or stops at a defined human-review boundary
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

The MVP engineering scope across Phases 1–9 is implemented. Confirmed versions compile through integrity gates into deterministic provider-neutral tasks, render as Codex-optimized or Universal compatibility prompts, and create a contract-linked run. Users can return execution evidence, receive a conservative criterion-level assessment, run up to two focused repair attempts, and finish with an immutable completed or blocked resolution. The repair chain preserves every evidence submission and assessment revision while detecting repeated failures and enforcing human-review boundaries. See [the implementation roadmap](docs/product/implementation-roadmap.md), [Phase 9.2](docs/architecture/phase-9.2-repair-delivery-return.md), [Phase 9.3](docs/architecture/phase-9.3-terminal-resolution.md), and [Phase 9.4](docs/architecture/phase-9.4-release-readiness.md).

Real participant fieldwork is still an external release dependency: 10–20 real task examples, at least five evidence-returning end-to-end runs, and the final exit/pivot review must be completed before claiming product or market validation. Browser storage is an MVP persistence mechanism, not durable server infrastructure. LoopZ assesses submitted evidence but does not independently rerun repositories. Use the [MVP release checklist](docs/validation/MVP_RELEASE_CHECKLIST.md) to record the remaining field and deployment gates.
