# Phase 5.3: Risks, Contradictions, and Approval Gates

## Outcome

Phase 5.3 turns a valid Phase 5.2 `acceptance_draft` into a provider-neutral
`safety_draft`. The draft preserves the complete request, scope, acceptance
criteria, evidence requirements, commands, provenance, and timestamps while
adding:

- Fixed MVP restrictions.
- Classified planned actions.
- Concrete human-approval gates.
- Structured, source-referenced findings.
- Deterministic blocker validation.

The public domain functions are exported from `@loopz/core/generation`:

```ts
import {
  compileSafetyContract,
  validateSafetyContractDraft,
} from "@loopz/core/generation";

const draft = compileSafetyContract(acceptanceDraft);
const validation = validateSafetyContractDraft(draft);
```

Compilation is deterministic and does not mutate its input. Unchanged input
produces the same planned actions, findings, IDs, and output order.

## Safety draft contract

The `safety_draft` adds these sections:

```text
safety
  restrictedActions[]
  approvalRequired[]
  plannedActions[]
contractChecks
  findings[]
pendingSections
  limits
  final_report
```

Every finding has a stable `FIND-###` ID, a kind (`risk`, `contradiction`,
`approval_gate`, or `safety_boundary`), warning/blocking severity, a readable
message, and one or more source references. IDs reflect deterministic finding
order; editing or reordering source content can change them before contract
confirmation and versioning.

## Restrictions and approval categories

The MVP always instructs the eventual agent not to:

- Expose, print, commit, or transmit secrets.
- Deploy to or modify production.
- Perform irreversible deletion or destructive migrations without approval and
  a recovery plan.
- Initiate real financial activity without approval.
- Call external services or communicate externally beyond confirmed scope and
  approval gates.

The compiler identifies planned actions in the existing LoopSpec categories:

- `destructive`: deletion, purge, truncation, database reset, and explicitly
  destructive migrations.
- `external_service`: APIs, webhooks, third parties, and external email/SMS.
- `production`: confirmed staging or production deployment actions.
- `financial`: real payments and payment behavior whose prototype/real boundary
  was never confirmed.
- `credentials`: API keys, tokens, secrets, credentials, private keys, or
  passwords needed by a deliverable.

Every generated sensitive action sets `requiresApproval: true`, appears verbatim
in `approvalRequired`, and produces an `approval_gate` warning. An approval gate
does not mean approval has already been granted. It means the future agent must
stop at that action until a human grants it. Phase 5.4 will expose these gates for
review; runtime approval state is outside Phase 5.3.

Payment prototypes described as prototype, mock, simulated, or non-functional
do not create a financial action. Mock/local-fake integration answers do not add
an additional interview-derived external action, although an explicit external
service deliverable remains visible for review.

## Contradictions and blockers

Deterministic checks currently detect:

- The same normalized item in included and excluded scope: blocking.
- A payment deliverable after the interview excludes payments: warning.
- An authentication deliverable after the interview excludes authentication:
  warning.
- Missing or uncertain authorization: blocking.
- Confirmed production deployment: blocking under the MVP boundary.
- A production request without a confirmed deployment boundary: blocking.
- Real patient/medical, card-number, or bank-credential data: blocking under the
  MVP boundary.

Warnings remain reviewable and do not make the structured draft invalid.
Blocking findings produce `scope_conflict` or
`blocking_decision_unresolved`. The draft may still be rendered for correction,
but it cannot pass validation or advance toward execution.

Safety validation also re-runs Phase 5.2 semantic validation. An acceptance
mapping, coverage, priority, command, or evidence failure cannot disappear merely
because a safety section was added.

For sensitive planned actions, validation returns `approval_required` when the
action disables approval or its exact action is absent from the approval list.
Duplicate finding IDs return `duplicate_finding_id`; removal of a baseline
restriction returns `safety_restriction_missing`. Malformed objects return
`schema_invalid` issues.

## Deliberate limitations

Detection is a deterministic, conservative ruleset—not an LLM judgment, legal
review, full policy engine, or guarantee that all risky software behavior has
been found. It recognizes explicit wording and confirmed interview answers.
Subtle semantic conflicts, domain-specific risks, indirect side effects, and
novel command behavior still require human review.

The restriction list and an approval flag do not themselves sandbox or execute
an AI agent. This phase generates a non-executable draft. Agent rendering,
runtime permission enforcement, credential storage, deployment, and external
calls are not implemented here.

## Verification and phase boundary

Tests cover deterministic compilation, input immutability, source-referenced
approval findings, action categories, prototype-payment exclusions, known
clarification contradictions, scope conflicts, authorization, production,
regulated data, missing/disabled gates, malformed schemas, and propagation of
Phase 5.2 failures.

Run from the repository root:

```bash
npm run check
npm run build
```

Phase 5.4 will build the contract-review experience for editing scope, reviewing
warnings, correcting blockers, and inspecting approval gates. Phase 5.5 will add
confirmation, immutable versions, and persistence.
