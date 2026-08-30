# Phase 5.2: Acceptance Criteria and Evidence

## Outcome

Phase 5.2 turns a Phase 5.1 `foundation_draft` into an `acceptance_draft` with
traceable criteria, verification methods, evidence requirements, and candidate
verification commands. It does not execute commands or independently verify a build.

The public domain functions are exported from `@loopz/core/generation`:

```ts
import {
  compileAcceptanceContract,
  validateAcceptanceContractDraft,
} from "@loopz/core/generation";

const draft = compileAcceptanceContract(foundation);
const result = validateAcceptanceContractDraft(draft);
```

## Compilation behavior

- Preserve the foundation's original request, scope, provenance, environment,
  interview decisions, and compilation timestamps without mutating the input.
- Generate one criterion per deliverable, including optional deliverables.
- Assign `AC-001` identifiers in deliverable order and reference the original
  `REQ-001` identifiers. IDs and output are deterministic for unchanged input;
  reordering deliverables can change criterion IDs.
- Preserve each deliverable's required/optional priority.
- Include a behavior-specific verification method, focused evidence, relevant
  command output, and a changed-file summary for each criterion.
- Mark safety, execution limits, and final-report sections as pending.

The classifier uses requirement text and the task's bug-fix classification. It
supports authentication, payments, integrations, deletion, forms, persistence,
interfaces, regression fixes, and a generic fallback. These are heuristic draft
criteria, not a complete understanding of arbitrary software requirements.

Payment prototypes (including the plural “Payments”) explicitly prohibit real
transactions. Deletion criteria check the requested removal or retention outcome
after reload/re-query and protect unrelated data, rather than requiring deleted
data to remain. Input-validation errors use valid/invalid-input checks, not
regression checks merely because the requirement contains the word “error”.
Explicit bug-fix tasks still require regression evidence.

## Verification command extraction

Commands are read from the interview's verification answer in source order.
Supported command starts are npm/pnpm/yarn/bun commands, npx, pytest,
`python -m pytest`, `python3 -m pytest`, Cargo test/build/check, and `go test`.

Examples:

| Interview answer | Extracted commands |
| --- | --- |
| `Run go test ./...` | `go test ./...` |
| `Run python -m pytest tests/test_profile.py` | `python -m pytest tests/test_profile.py` |
| `Run npm test -- --runInBand` | `npm test -- --runInBand` |
| `Run pytest and then inspect the profile.` | `pytest` |

Paths, extensions, selectors, flags, quoted arguments, and argument case are
preserved. Exact duplicate commands are removed. Python's module invocation is
not also emitted as a separate pytest invocation. Separators and common prose
connectors end the current command; the original interview answer remains in
the verification method for review.

This is a bounded text extractor, not a shell parser or command-safety validator.
For unambiguous input, use one command per line with quoted arguments where
needed. Arbitrary prose, shell control flow, environment assignments, escaping,
and unsupported tools require review. Extracted commands are not authorization
to execute them, and separator handling does not preserve shell semantics.

When no supported command is extracted, context-based candidates are generated:
Rust uses Cargo test/build, Python uses pytest, Go uses `go test ./...`, and
JavaScript uses the detected package manager's test/build commands (npm by
default). The compiler does not inspect the repository or prove those commands
exist. Candidates must be checked during contract review before execution;
their presence is not evidence of a successful build.

## Validation

The strict acceptance-draft schema requires nonempty criteria, verification
commands, verification methods, and evidence requirements. Semantic validation
rejects duplicate requirement/criterion IDs, unknown requirement references,
uncovered required deliverables, and priority mismatches. Schema violations
(including empty command/evidence lists) return `schema_invalid` issues.

`compileAcceptanceContract` rejects malformed foundations and throws if its
generated draft fails validation. `validateAcceptanceContractDraft` accepts
unknown input and returns structured issues instead.

## Verification and phase boundary

Regression tests cover prototype payments, deletion outcomes, form validation,
explicit bug fixes, complete Go/Python commands, quoted arguments, prose
boundaries, ordering, deduplication, deterministic compilation, requirement
mapping, missing evidence, and semantic validation failures.

Run from the repository root:

```bash
npm run check
npm run build
```

This phase is a domain-layer implementation. It does not add the contract-review
screen, persistence/versioning, approval enforcement, agent execution, or
returned-evidence assessment. It does not make the draft an executable LoopSpec
Lite contract. Phase 5.3 adds risk, contradiction, and approval handling; later
subphases add user review and confirmation/versioning. Generated criteria and
command candidates still require that review.
