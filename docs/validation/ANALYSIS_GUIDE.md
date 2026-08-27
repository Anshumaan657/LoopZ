# Phase 1 Analysis Guide

Analyze outcomes per experiment before aggregating them. Small-sample concierge research should reveal mechanisms and recurring risks; it should not be presented as statistically conclusive.

## Primary Measures

- End-to-end return rate: evidence packages returned / eligible tasks started
- Required-criterion pass rate: supported required passes / required criteria
- Evidence coverage: criteria with inspectable evidence / required criteria
- Clarification-turn difference: LoopZ run minus original-prompt run
- Human-correction difference: LoopZ run minus original-prompt run
- Time-to-accepted-outcome difference, when measured consistently
- Specific reuse rate: participants supplying or scheduling another real task / debriefed participants

Agent token or cost data is secondary because providers expose it inconsistently. Report it only when the same measurement basis exists for both workflows.

## Comparison Discipline

For paired runs, keep the task, repository starting state, agent/model, permissions, and evaluator as similar as practical. Record every meaningful difference. Do not claim causality when the baseline and LoopZ runs began from different code states.

## Coding Findings

Tag each question and failure using the shared category codes. Add a new category only when existing categories cannot describe the event. Review category definitions after every five tasks so terminology remains stable.

## Decision Strength

Use this evidence order:

1. Successful completion with independently inspectable evidence
2. Participant returns with a second real task
3. Concrete willingness-to-pay action or accepted price test
4. Observed reduction in correction or clarification burden
5. Stated preference or satisfaction

## Reporting Rules

- Report counts alongside percentages.
- Preserve failures and abandonments in denominators.
- Separate `fail`, `blocked`, and `unverified`.
- Identify missing data instead of treating it as zero.
- State material confounders.
- Do not claim total token savings unless both workflows have comparable provider-reported usage.

