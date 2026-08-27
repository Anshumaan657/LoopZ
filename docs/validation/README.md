# Phase 1: Concierge Validation Kit

This directory contains everything required to run LoopZ manually with real participants before automating the product.

## Phase objective

Test whether a confirmed, evidence-based development contract improves coding-agent outcomes compared with a participant's original rough request.

Phase 1 is not complete merely because these templates exist. It is complete when the fieldwork targets and exit criteria in this kit have been met with real participants.

## Required fieldwork

- Recruit 5–10 eligible participants.
- Collect 10–20 genuine small-web-development tasks.
- Complete at least five end-to-end runs with returned evidence.
- Run paired baseline-versus-LoopZ comparisons whenever the repository can be reset fairly.
- Record all outcomes, including failures and abandoned runs.
- Finish with a written go, pivot, or stop decision.

Never fabricate participants, tasks, evidence, willingness-to-pay responses, or outcome metrics.

## Kit contents

| File | Purpose |
|---|---|
| `MVP_CHARTER.md` | Freezes the hypothesis, audience, promises, and exclusions |
| `PARTICIPANT_RECRUITMENT.md` | Screening criteria and copy-ready recruitment messages |
| `CONSENT_AND_PRIVACY.md` | Participant consent script and data-handling rules |
| `TASK_INTAKE_FORM.md` | Captures the original task without improving it |
| `INTERVIEW_SCRIPT.md` | Facilitator script for the five-question interview |
| `RISK_QUESTION_CATALOG.md` | Deterministic categories for choosing useful questions |
| `TASK_REJECTION_RULES.md` | Accept, narrow, reject, and escalation policy |
| `MANUAL_LOOPSPEC_TEMPLATE.md` | Provider-neutral source of truth for each task |
| `PROJECT_SPEC_TEMPLATE.md` | Plain-language confirmed project contract |
| `ACCEPTANCE_CRITERIA_TEMPLATE.md` | Requirement-to-verification-to-evidence mapping |
| `AGENT_TASK_TEMPLATE.md` | Copy-ready task given to the coding agent |
| `EVIDENCE_RETURN_TEMPLATE.md` | Structured output returned after execution |
| `ASSESSMENT_TEMPLATE.md` | Criterion-level evidence assessment |
| `REPAIR_TASK_TEMPLATE.md` | Bounded instructions for unresolved work |
| `PARTICIPANT_DEBRIEF.md` | Usefulness, reuse, and willingness-to-pay interview |
| `SESSION_CHECKLIST.md` | One-page control list for every concierge run |
| `ANALYSIS_GUIDE.md` | Metric definitions, paired-run discipline, and reporting rules |
| `EXIT_AND_PIVOT_REVIEW.md` | Final decision framework |
| `phase-1-experiment-tracker.xlsx` | Participants, tasks, criteria, questions, outcomes, and KPIs |

## Operating sequence

```text
Recruit and screen participant
        ↓
Obtain consent
        ↓
Capture original request unchanged
        ↓
Decide whether the task is eligible
        ↓
Ask up to five risk-based questions
        ↓
Create LoopSpec Lite
        ↓
Confirm plain-language scope
        ↓
Create acceptance contract and agent task
        ↓
Participant runs the task externally
        ↓
Collect report, tests, diff summary, and corrections
        ↓
Assess each criterion against submitted evidence
        ↓
Generate a bounded repair task when justified
        ↓
Debrief participant and update tracker
```

## Experiment folder convention

Create one private working folder per task. Do not commit participant data unless it has been explicitly approved and fully anonymized.

```text
.loopz/validation/<experiment-id>/
├── original-request.md
├── intake.md
├── interview.md
├── loopspec.md
├── project-spec.md
├── acceptance-criteria.md
├── agent-task.md
├── returned-evidence.md
├── assessment.md
├── repair-task-01.md
└── debrief.md
```

The `.loopz/` directory is ignored by Git.

## Experiment identifiers

- Participant: `P-001`, `P-002`, ...
- Experiment: `EXP-001`, `EXP-002`, ...
- Acceptance criterion: `AC-001`, `AC-002`, ...
- Repair attempt: `R-01`, `R-02`

Do not put participant names, email addresses, client names, repository names, or secrets in identifiers.

## Evidence language

Use these terms consistently:

- **Submitted evidence:** Information pasted or supplied by the participant.
- **Supported:** The submitted evidence reasonably supports the claim.
- **Unsupported claim:** The agent says the work is complete but supplies no required evidence.
- **Unverifiable:** The available evidence cannot establish the result.
- **Independently verified:** Reserved for evidence LoopZ or the facilitator reran directly in an authorized environment.

During Phase 1, most results will be assessments of submitted evidence, not independent verification.

## Bias controls

- Save the raw request before asking questions.
- Do not rewrite baseline prompts.
- Use the same starting repository state for paired runs.
- Keep the agent, model, permissions, and execution limit fixed when possible.
- Evaluate both paths against the same acceptance criteria.
- Record abandoned and failed runs.
- Do not coach the participant during the run unless the intervention is logged.
- Do not mark an agent assertion as proof.
- Write willingness-to-pay responses in the participant's own words.

## Daily closeout

After every session:

1. Complete every required tracker field.
2. Separate participant identity from experiment data.
3. Remove secrets and unnecessary proprietary content.
4. Save exact generator/template versions.
5. Record deviations from the protocol.
6. Add newly observed question and failure categories without rewriting historical results.

## Phase exit

Use `EXIT_AND_PIVOT_REVIEW.md` only after the minimum fieldwork is complete. The possible decisions are `proceed`, `proceed-with-changes`, `narrow`, `pivot`, or `stop`.
