# Evidence Return Package

Use this file when a participant returns from their coding agent. Keep raw evidence unchanged and redact secrets before storing it.

## Experiment

- Experiment ID:
- Participant ID:
- Return date:
- Coding agent and model:
- Repository or project identifier:
- Commit or working-tree state before the run:
- Commit or working-tree state after the run:

## Required Return Items

- [ ] The agent's complete final report
- [ ] Commands the agent says it ran
- [ ] Raw test, lint, type-check, or build output
- [ ] Screenshots or recordings required by visual criteria
- [ ] List of files changed
- [ ] Human corrections made after the run
- [ ] Any unanswered questions, blockers, or approval requests
- [ ] Approximate run time and agent usage/cost, when available

## Agent Final Report

Paste the report verbatim below.

```text

```

## Verification Evidence

Add one row per command or manual check. Do not replace raw output with a summary.

| Evidence ID | Criterion IDs | Command or check | Result | Raw evidence location | Independently rerun? |
| --- | --- | --- | --- | --- | --- |
| EV-001 | AC-001 |  | pass / fail / blocked |  | yes / no |

## Human Corrections

| Correction ID | What the participant changed | Why it was needed | Related criterion | Material? |
| --- | --- | --- | --- | --- |
| HC-001 |  |  | AC-___ | yes / no |

## Missing Evidence

| Criterion ID | Expected evidence | Why it is missing | Can it still be collected? |
| --- | --- | --- | --- |
| AC-___ |  |  | yes / no |

## Handling Rules

1. A claimed pass without supporting evidence is `unverified`, not `pass`.
2. A command that was not run must not be recorded as successful.
3. Preserve failures; they are validation data, not noise.
4. Store raw participant material under the ignored `.loopz/validation/<experiment-id>/` directory.
5. Record only sanitized, aggregate findings in tracked repository documents.

