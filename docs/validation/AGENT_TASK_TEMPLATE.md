# Coding-Agent Task

**Run ID:** `[EXP-###-RUN-#]`  
**LoopSpec version:** `[VERSION]`  
**Template version:** `phase1-agent-task-1.0`

## Objective

[CONFIRMED GOAL]

## Source of truth

Use the attached or pasted:

- `PROJECT_SPEC.md`
- `ACCEPTANCE_CRITERIA.md`

Do not silently expand scope. If repository facts contradict the contract, report the conflict before making a high-impact assumption.

## Working method

### 1. Discover

- Inspect the repository structure and existing instructions.
- Identify the existing stack and relevant commands.
- Confirm the task is compatible with the repository.
- Do not modify files during discovery unless necessary to gather authorized information.

### 2. Plan

- Map each required acceptance criterion to implementation work.
- Identify protected behaviour and regression checks.
- Surface blockers before implementation.

### 3. Implement

- Make the smallest coherent change that satisfies the confirmed contract.
- Follow existing repository conventions.
- Avoid unrelated refactors.
- Do not add paid services, expose secrets, deploy, or perform destructive operations.

### 4. Verify

- Run the relevant automated checks.
- Assess every acceptance criterion by ID.
- Preserve exact command results or concise evidence.
- Do not treat your own statement of completion as evidence.

### 5. Repair

- If checks fail, repair only from observed evidence.
- Do not repeat the same unsuccessful change without a new hypothesis.
- Stop when an approval, credential, excluded action, or human decision is required.

## Required boundaries

- Maximum repair attempts inside this run: `[LIMIT]`.
- Production deployment is prohibited.
- Destructive data operations are prohibited.
- External purchases and communications require human approval.
- Secrets must not appear in output or commits.

## Final report

Return exactly these sections:

```markdown
# Final Report

## Run metadata
- Run ID:
- LoopSpec version:

## Summary

## Files changed

## Commands executed
| Command | Result | Exit status |
|---|---|---|

## Acceptance criteria
### AC-001
- Status: completed / partial / failed / blocked / not_attempted
- Evidence:
- Notes:

## Test and build results

## Unresolved work

## Assumptions changed during implementation

## Blockers and risks

## Recommended next action
```

Do not claim the task is complete unless every required criterion has corresponding evidence. If evidence is missing, say so explicitly.
