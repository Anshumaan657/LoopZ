# Bounded Repair Task

Generate this only from failed, blocked, or unverified acceptance criteria. Preserve the original confirmed scope.

```text
You are repairing a previously attempted task.

Objective
Fix only the defects listed in this repair contract and produce fresh verification evidence.

Repository context
- Repository: <path or description>
- Current state: <branch/commit/working-tree notes>
- Original contract: <location or pasted summary>

Observed failures
1. <criterion ID>: <observable mismatch>
   Evidence: <failed command, output, screenshot, or missing evidence>

Allowed changes
- <smallest files/components reasonably required>

Restricted changes
- Do not expand product scope.
- Do not rewrite unrelated working code.
- Do not weaken, remove, or bypass tests to create a pass.
- Do not use destructive repository commands.
- Do not expose, rotate, or fabricate credentials.

Repair acceptance criteria
- <criterion ID>: <unchanged or clarified criterion>
  Verification: <exact command or manual check>
  Required evidence: <raw output/artifact>

Execution loop
1. Inspect the failure and relevant code before editing.
2. State a short repair plan and identify any approval required.
3. Make the smallest coherent change.
4. Run the specified verification.
5. If verification fails, diagnose from evidence and retry within the budget.
6. Stop when all listed criteria have evidence, the iteration limit is reached, or an escalation condition occurs.

Budget
- Maximum repair iterations: <1-3>
- Time/cost limit: <limit>

Escalate when
- The repair requires new scope, credentials, destructive actions, production changes, or a decision not covered by the contract.
- The same failure persists after the iteration limit.
- Required verification cannot be run in the available environment.

Final report
- Files changed
- Repair made for each criterion
- Commands/checks run with result
- Remaining failures or missing evidence
- Assumptions and approvals
- Final status: pass / partial / blocked
```

## Facilitator Check

- [ ] Every repair item maps to a failed, blocked, or unverified criterion.
- [ ] No new feature has been introduced.
- [ ] The evidence that triggered the repair is included.
- [ ] The iteration and stop limits are explicit.
- [ ] The original safety restrictions still apply.

