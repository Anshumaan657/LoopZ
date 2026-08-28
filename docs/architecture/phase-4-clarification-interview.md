# Phase 4: Risk-Based Clarification Interview

## Outcome

Phase 4 converts the unresolved decisions from Phase 3 into the smallest useful interview. The
interview asks one question at a time, records the user’s answers, and either unlocks contract
generation or stops with an explicit human-action requirement.

## Deterministic selection policy

The engine combines Phase 3 missing-information signals with a small set of additional risk rules
for authorization, roles, deployment, scope size, and subjective visual requirements. It then:

1. Keeps only one question per risk category.
2. Puts blocking risks before non-blocking questions.
3. Uses the documented risk-category priority order.
4. Selects no more than five questions.
5. Assigns stable interview-local IDs from `Q-001` onward.

Question wording is currently deterministic. Model-assisted wording may be introduced later, but a
model must not control category selection, question count, validation, or stop conditions.

## Session states

```text
in_progress ── answer saved ──> in_progress
      │
      ├── final answer ───────> ready_for_contract
      │
      └── blocking answer ────> blocked
```

Every answer stores its question ID, normalized value, and timestamp. This provides explicit
user-decision provenance for Phase 5 contract generation.

## Issues and contradictions

The engine records three issue kinds:

- `contradiction`: the clarified answer changes an earlier inference or requested capability.
- `approval_gate`: an allowed feature, such as real payments, requires later human approval.
- `safety_boundary`: the answer crosses an MVP boundary and blocks continuation.

Missing project authorization, production deployment, and real regulated or payment credential
data block the interview. Scope contradictions and real-payment approval requirements are retained
as warnings so the next phase can reflect them in the contract.

## Persistence

The interview is saved into the Phase 3 browser draft under `loopz:project:<projectId>`. Reloading
the project route resumes a valid session. Durable storage, authenticated ownership, and
cross-device recovery remain deferred.

## Phase boundary

Phase 4 resolves and records decisions. Phase 5 will compile the accepted intake, user answers,
warnings, and approval gates into the plain-language scope and acceptance contract.
