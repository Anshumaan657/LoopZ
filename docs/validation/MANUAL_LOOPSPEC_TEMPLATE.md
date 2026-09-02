# Manual LoopSpec Lite

**Experiment ID:** `[EXP-###]`  
**Participant ID:** `[P-###]`  
**Schema version:** `0.2`
**Template version:** `phase1-1.0`

```yaml
schema_version: "0.2"

request:
  original_prompt: |-
    [PASTE UNCHANGED ORIGINAL REQUEST]
  task_type: small_web_project

objective:
  goal: "[ONE OBSERVABLE OUTCOME]"
  deliverables:
    - "[DELIVERABLE 1]"

scope:
  included:
    - "[INCLUDED BEHAVIOUR]"
  excluded:
    - "[EXPLICIT NON-GOAL]"
  assumptions:
    - id: ASM-001
      value: "[ASSUMPTION]"
      source: user_provided | user_selected | inferred | recommended | default
      confidence: 0.0
      explanation: "[WHY THIS ASSUMPTION EXISTS]"
      confirmed_by_user: false
  unresolved_decisions: []

environment:
  project_status: new | existing
  project_context: "[SAFE REPOSITORY CONTEXT]"
  technology_preferences:
    - "[PREFERENCE OR EXISTING CONSTRAINT]"
  existing_commands:
    build: "[COMMAND OR UNKNOWN]"
    test: "[COMMAND OR UNKNOWN]"
    typecheck: "[COMMAND OR UNKNOWN]"

workflow:
  phases:
    - plan
    - implement
    - verify
    - repair

acceptance:
  criteria:
    - id: AC-001
      requirement: "[SPECIFIC OBSERVABLE REQUIREMENT]"
      verification_method: "[COMMAND OR INSPECTION]"
      required_evidence:
        - "[NAMED EVIDENCE]"
      priority: required
  verification_commands:
    - "[EXACT TEST, TYPECHECK, BUILD, OR INSPECTION COMMAND]"

safety:
  restricted_actions:
    - "Do not deploy to production."
    - "Do not expose, print, or commit secrets."
    - "Do not perform destructive data operations."
  approval_required:
    - "Adding a paid external service."
    - "Changing authentication or authorization boundaries."

limits:
  maximum_repair_attempts: 2
  stop_when:
    - "Required credentials or authorization are unavailable."
    - "The same material failure repeats after a repair attempt."
    - "Completing the task requires an excluded action."

final_report:
  required_fields:
    - run_id
    - summary
    - files_changed
    - commands_executed
    - test_results
    - acceptance_criterion_status
    - evidence_by_criterion
    - unresolved_work
    - changed_assumptions
    - blockers_and_risks
```

## Deterministic review

- [ ] Original prompt is unchanged.
- [ ] Goal is singular and observable.
- [ ] At least one deliverable exists.
- [ ] Included and excluded scope do not conflict.
- [ ] High-risk assumptions are confirmed.
- [ ] Every required feature maps to a criterion.
- [ ] Every criterion has a verification method.
- [ ] Every criterion has required evidence.
- [ ] Verification commands are exact, reviewed, and safe to run.
- [ ] Criterion IDs are unique and stable.
- [ ] Repair attempts are bounded.
- [ ] Restricted actions are explicit.
- [ ] Final report requires criterion-level evidence.

## User confirmation

- Confirmation status: `confirmed / corrected / unresolved / rejected`
- Confirmation timestamp:
- Corrections applied:
