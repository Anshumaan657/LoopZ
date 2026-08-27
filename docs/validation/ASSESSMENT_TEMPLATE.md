# Outcome Assessment

Complete this after the evidence-return package is received. The assessor evaluates evidence against the confirmed contract; they do not simply repeat the agent's claims.

## Experiment Summary

- Experiment ID:
- Assessor:
- Assessment date:
- Contract version:
- Agent/model:
- Final outcome: `pass` / `partial` / `fail` / `blocked` / `abandoned`
- Confidence: `high` / `medium` / `low`

## Criterion Assessment

| Criterion ID | Priority | Agent claim | Evidence inspected | Assessment | Confidence | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| AC-001 | must |  | EV-___ | pass / fail / blocked / unverified | high / medium / low |  |

## Coverage Metrics

- Required criteria:
- Supported passes:
- Failed criteria:
- Blocked criteria:
- Unverified criteria:
- Pass rate: `supported passes / required criteria`
- Evidence coverage: `criteria with inspectable evidence / required criteria`
- Human corrections:
- Repair attempts:

Never calculate pass rate by counting unsupported agent claims as passes.

## Workflow Comparison

Complete when the participant performed both an original-prompt run and a LoopZ-assisted run.

| Measure | Original prompt | LoopZ contract | Direction |
| --- | ---: | ---: | --- |
| Clarification turns inside coding agent |  |  | lower / same / higher |
| Human corrections |  |  | lower / same / higher |
| Repair attempts |  |  | lower / same / higher |
| Required criteria supported |  |  | better / same / worse |
| Evidence coverage |  |  | better / same / worse |
| Time to accepted outcome |  |  | lower / same / higher |
| Agent-side tokens or cost, if exposed |  |  | lower / same / higher / unknown |

## Failure Classification

Choose every applicable category:

- `scope-missed`
- `assumption-wrong`
- `acceptance-criterion-weak`
- `verification-missing`
- `agent-ignored-instruction`
- `repository-context-missing`
- `tool-or-environment-failure`
- `unsafe-action-blocked`
- `participant-changed-scope`
- `other`

For each category, record the causal evidence and the proposed change to the question set, contract, task template, or rejection rule.

## Independent Value Judgment

- Did assessment reveal something the agent report did not? `yes / no`
- If yes, what?
- Was a repair task justified? `yes / no`
- Would the result have been accepted without LoopZ assessment? `yes / no / unknown`
- Assessment decision: `accept` / `repair` / `escalate` / `stop`

