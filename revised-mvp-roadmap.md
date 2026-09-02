# Revised MVP Roadmap: Requirements-to-Verification Platform

**Document purpose:** Copy-ready roadmap for planning, review, and implementation  
**Recommended build style:** Solo founder or small team  
**Estimated duration:** 10–12 weeks, including validation and private beta  
**Working product category:** Verifiable AI development contract builder

> **Numbering note:** This document preserves the original 0–12 planning model. Current implementation
> commits and architecture notes use the condensed 1–9 map in
> [`docs/product/implementation-roadmap.md`](docs/product/implementation-roadmap.md).

---

## 1. MVP mission

Build the smallest product that can prove this statement:

> A structured, evidence-based development contract helps a coding agent complete a small web-development task with fewer misunderstandings, clearer verification, and more targeted repairs than a rough prompt alone.

The MVP must do more than generate an impressive prompt. It must connect the full lightweight cycle:

```text
Rough request
→ Risk-based clarification
→ Confirmed scope
→ Verifiable agent task
→ Agent executes elsewhere
→ User returns evidence
→ Platform assesses completion
→ Platform generates a targeted repair task when needed
```

## 2. Initial target user

### Primary customer

Freelancers and technical indie builders who use an AI coding agent to build small web projects or features.

### Why this user comes first

- They regularly receive incomplete or messy requirements.
- Misunderstood scope costs them time and money.
- They can operate a coding agent and understand basic project failures.
- They can judge whether the generated contract is useful.
- They have repeated projects, creating a path to retention.
- They are more likely to pay than students or complete beginners.

### Users not optimized for in the MVP

- Completely non-technical founders who need deployment and debugging support.
- Enterprise engineering organizations.
- Teams managing fleets of autonomous agents.
- Users building regulated, safety-critical, or production infrastructure systems.

## 3. Initial task profile

Support one profile first:

> **A small web application or clearly bounded web feature.**

Examples:

- A booking page for a tutor marketplace.
- An admin dashboard feature.
- A customer feedback form with storage and validation.
- A small authenticated CRUD application.
- A landing page with a working contact form.

Reject or warn on unsuitable tasks:

- Large multi-platform products.
- Banking, healthcare, or other high-risk production systems.
- Complex infrastructure migrations.
- Vague requests to reproduce an entire established product.
- Projects requiring many external integrations.
- Requests involving destructive or unauthorized actions.

## 4. Initial coding-agent target

Support and benchmark one coding agent in the first public MVP.

Recommended internal development target:

> **Codex first**, because the product can be developed and repeatedly tested against it during implementation.

The internal LoopSpec must remain provider-neutral, but the first rendered task should be optimized and tested for one agent. A second adapter should be added only after the complete workflow works reliably.

## 5. MVP definition of done

The MVP is complete only when a user can:

1. Describe a small web project in ordinary language.
2. Answer no more than five high-impact questions.
3. Review and correct a plain-language scope summary.
4. Generate a structured project contract.
5. Copy one Codex-ready implementation task.
6. Download repository-ready Markdown artifacts.
7. Execute the task in Codex outside the platform.
8. Return with the agent's final report and verification evidence.
9. Receive a criterion-by-criterion completion assessment.
10. Generate a targeted repair task for incomplete requirements.
11. Repeat the evidence check after the repair attempt.
12. Provide lightweight feedback about the outcome.

## 6. Explicit MVP exclusions

Do not include:

- Directly running Codex or another agent.
- Repository write access.
- Production deployment.
- Multi-agent orchestration.
- Fleet management.
- Advanced or Expert Mode.
- Raw LoopSpec editing.
- Multiple public adapters.
- A generic “works perfectly everywhere” prompt.
- Team workspaces and organization policies.
- An extension marketplace.
- A public API.
- Numerical readiness scores such as 88/100.
- Guaranteed token-saving claims.
- Estimated time-saved claims without measured evidence.

---

# Roadmap overview

| Phase | Name | Expected duration | Primary outcome |
|---|---|---:|---|
| 0 | Freeze the MVP thesis | 2–3 days | Signed-off product boundaries |
| 1 | Concierge validation | 7–10 days | Evidence that users value the workflow |
| 2 | Define LoopSpec Lite and contracts | 3–5 days | Versioned schemas and validation rules |
| 3 | Prototype and test the UX | 4–6 days | Validated end-to-end user journey |
| 4 | Build the technical foundation | 4–6 days | Deployable application skeleton |
| 5 | Build intake and adaptive questioning | 5–8 days | Reliable requirements interview |
| 6 | Build contract generation and validation | 5–8 days | Confirmed, validated LoopSpec Lite |
| 7 | Build the Codex compiler and artifacts | 4–6 days | Copy-ready task and downloadable files |
| 8 | Build execution handoff and return flow | 4–6 days | Traceable run and evidence submission |
| 9 | Build evidence assessment | 7–10 days | Criterion-level completion report |
| 10 | Build targeted repair generation | 4–6 days | Versioned repair loop |
| 11 | Build analytics and evaluation harness | 5–8 days | Measurable product and benchmark data |
| 12 | Harden, beta test, and launch | 7–10 days | Safe private-beta MVP |

Some work can overlap, but each phase has an exit gate. Do not advance merely because the scheduled time has passed.

---

# Phase 0: Freeze the MVP thesis

## Objective

Prevent the project from expanding back into a universal agent platform before the central hypothesis is tested.

## Decisions to freeze

- Primary user: freelancers and technical indie builders.
- Initial task profile: small web application or bounded web feature.
- Initial agent: Codex.
- Initial output: contract, acceptance criteria, Codex task, and verification instructions.
- Return mechanism: user pastes the final report and evidence.
- Core differentiator: requirement-to-evidence traceability and targeted repair.
- Public claim: reduce unnecessary clarification and rework.
- Claims not allowed: guaranteed completion or guaranteed token savings.

## Work items

- Write a one-sentence problem statement.
- Write a one-sentence product promise.
- Define suitable and unsuitable tasks.
- Define the exact first customer.
- Create a feature inclusion and exclusion list.
- Decide what evidence a user must return after an agent run.
- Define the minimum successful user journey.
- Create a decision log for future scope requests.

## Deliverables

- `MVP_CHARTER.md`
- `TARGET_USER.md`
- `SCOPE_AND_NON_GOALS.md`
- Initial success metrics
- Product terminology guide

## Exit criteria

- Every proposed feature can be evaluated against the frozen MVP thesis.
- The team can explain the product in under 30 seconds.
- Everyone agrees that Expert Mode, direct execution, and multiple adapters are excluded.
- The project has one measurable primary workflow.

## Failure signal

If the product still requires phrases such as “for anyone,” “any task,” or “any agent,” the scope is not narrow enough.

---

# Phase 1: Concierge validation

## Objective

Test the workflow manually before spending weeks automating it.

## Why this phase is mandatory

The largest risk is not technical feasibility. The largest risk is that users can obtain an equally useful result by asking an existing AI assistant to improve their prompt.

## Participant profile

Recruit 5–10 people who:

- Build small web projects.
- Already use Codex, Claude Code, Cursor, or another coding agent.
- Have a real task they intend to complete.
- Can return with the agent's final report or test output.

## Manual experiment workflow

For every participant:

1. Collect their original rough request unchanged.
2. Ask a maximum of five risk-based questions.
3. Produce a plain-language scope summary.
4. Ask the user to confirm or correct it.
5. Manually create LoopSpec Lite.
6. Generate the Codex-ready task and acceptance contract.
7. Have the user run it in their coding agent.
8. Collect the final report, test output, and corrections required.
9. Assess each acceptance criterion.
10. Generate a manual repair task when needed.
11. Interview the participant about usefulness and willingness to reuse it.

## Data to capture

- Original prompt.
- Questions asked.
- User answers.
- Assumptions made.
- Confirmed scope.
- Generated contract.
- Generated agent task.
- Coding agent and model used.
- Agent final report.
- Test output or other evidence.
- Human corrections.
- Repair attempts.
- Final completion status.
- Whether the user would use it again.
- Whether the user would pay and why.

## Deliverables

- 10–20 real task examples.
- At least five completed end-to-end runs.
- Common missing-requirement categories.
- Common clarification questions.
- Common agent failure patterns.
- Initial task rejection rules.
- Evidence requirements for the automated product.
- Revised MVP assumptions.

## Exit criteria

- Users understand the confirmed scope without technical assistance.
- The resulting contract is visibly more actionable than the original request.
- At least several participants ask to reuse the process on another task.
- The return-and-assess step provides genuine value, not merely a restatement of the agent report.
- The team can identify the smallest recurring question set.
- At least one plausible willingness-to-pay signal appears.

## Pivot criteria

Reconsider the product if:

- Users do not return after copying the task.
- The coding agent already performs the same clarification adequately.
- Users value only the original planning document but not verification.
- The contract adds more time than it saves.
- No participant wants to reuse the workflow.

---

# Phase 2: Define LoopSpec Lite and system contracts

## Objective

Create a minimal, versioned source of truth that supports generation, validation, rendering, evidence assessment, and repair.

## LoopSpec Lite structure

```yaml
schema_version: "0.1"

request:
  original_prompt:
  task_type:

objective:
  goal:
  deliverables: []

scope:
  included: []
  excluded: []
  assumptions: []
  unresolved_decisions: []

environment:
  project_status:
  project_context:
  technology_preferences: []

workflow:
  phases:
    - plan
    - implement
    - verify
    - repair

acceptance:
  criteria:
    - id:
      requirement:
      verification_method:
      required_evidence:
      priority:

safety:
  restricted_actions: []
  approval_required: []

limits:
  maximum_repair_attempts:
  stop_when: []

final_report:
  required_fields: []
```

## Additional schemas

Define structured schemas for:

- Extracted user intent.
- Clarification question.
- User answer.
- Decision provenance.
- Validation issue.
- Rendered artifact metadata.
- Evidence submission.
- Criterion assessment.
- Repair task.
- Run status.

## Decision provenance

Every important decision should include:

```yaml
value:
source: user_provided | user_selected | inferred | recommended | default
confidence:
explanation:
confirmed_by_user:
```

## Deterministic validation rules

At minimum:

- Goal must not be empty.
- At least one deliverable must exist.
- Every required feature must map to an acceptance criterion.
- Every acceptance criterion must define a verification method.
- Every acceptance criterion must define required evidence.
- Required criterion IDs must be unique and stable.
- Included and excluded scope must not directly conflict.
- Unresolved high-risk decisions must block final generation.
- Repair attempts must be bounded.
- Destructive or external actions must require approval.
- The final report must reference criterion IDs.

## Deliverables

- `loopspec-lite.schema.json`
- `evidence-submission.schema.json`
- `criterion-assessment.schema.json`
- `repair-task.schema.json`
- Validation rule catalog
- Example valid and invalid fixtures
- Schema-versioning policy

## Exit criteria

- All concierge examples can be represented without using arbitrary free-form fields everywhere.
- Invalid examples fail predictable rules.
- Schema changes are versioned.
- The validator can run without calling an LLM.
- The complete trace from requirement to evidence can be represented.

---

# Phase 3: Prototype and test the UX

## Objective

Validate that the workflow is understandable before implementing production interfaces.

## Screens to prototype

### Screen 1: Idea intake

- Large plain-language text input.
- Examples of suitable requests.
- Optional “I already have a project” choice.
- Clear privacy note.

### Screen 2: Clarification

- One question at a time.
- Progress indicator only when the number of questions is known.
- Recommended answer and “I’m not sure.”
- Ability to go back without losing answers.

### Screen 3: Confirmed contract

- Goal.
- Deliverables.
- Included scope.
- Excluded scope.
- Assumptions.
- Unresolved decisions.
- “Change” action for every section.

### Screen 4: Generated task

- Copy-ready Codex task.
- Downloadable project artifacts.
- Clear execution instructions.
- Run ID and return link.

### Screen 5: Return evidence

- Paste final report.
- Paste test results.
- Paste diff summary.
- Describe problems encountered.
- Explain what information is required and why.

### Screen 6: Completion assessment

- Completed criteria.
- Incomplete criteria.
- Unverifiable criteria.
- Risks and missing evidence.
- Copy targeted repair task.

## Usability tests

Test with at least five target users.

Observe whether users can:

- Describe a suitable task.
- Answer questions without technical confusion.
- Identify incorrect assumptions.
- Understand included versus excluded scope.
- Copy and run the task.
- Understand what evidence to return.
- Interpret completed, incomplete, and unverifiable states.

## Deliverables

- Low-fidelity wireframes.
- Clickable prototype.
- Tested wording for buttons and questions.
- Usability findings.
- Revised screen sequence.
- Accessibility checklist.

## Exit criteria

- Most test users reach the generated task without facilitator help.
- Users understand that the platform does not directly build the application.
- Users understand why they must return evidence.
- Users can distinguish “incomplete” from “unverifiable.”
- The median guided journey feels short enough to complete in one sitting.

---

# Phase 4: Build the technical foundation

## Objective

Create a secure, observable application foundation without prematurely building advanced product features.

## Required system components

- Web client.
- Server-side API.
- Relational data store.
- Structured model-generation service.
- Schema-validation module.
- Prompt and artifact renderer.
- Event and analytics capture.
- Error monitoring.
- Rate limiting.
- Secure configuration and secret storage.

## Minimum data model

### Project

- ID.
- Original request.
- Task profile.
- Current status.
- Creation and update timestamps.

### Interview session

- Extracted intent.
- Questions.
- Answers.
- Decisions and provenance.
- Completion status.

### LoopSpec version

- Project ID.
- Schema version.
- LoopSpec payload.
- Content hash.
- Generator version.
- Validation result.

### Artifact

- Artifact type.
- Adapter version.
- Rendered content.
- Content hash.

### Run

- Run ID.
- LoopSpec version.
- Agent target.
- Copy timestamp.
- Current terminal state.

### Evidence submission

- Run ID.
- Final report.
- Test output.
- Diff summary.
- User notes.
- Submission timestamp.

### Criterion assessment

- Acceptance-criterion ID.
- Status.
- Evidence reference.
- Explanation.
- Confidence.

### Repair version

- Parent run.
- Unresolved criterion IDs.
- Repair prompt.
- Repair-attempt number.

## Privacy requirements

- Tell users what data is stored.
- Do not ask users to paste secrets.
- Detect and warn about likely credentials.
- Provide deletion controls or an expiration policy.
- Separate operational analytics from submitted project content.
- Do not use private content for training without explicit permission.

## Deliverables

- Deployed development environment.
- Database migrations.
- API skeleton.
- Structured logging.
- Error monitoring.
- Rate limiting.
- Environment configuration.
- Continuous integration checks.
- Basic security review.

## Exit criteria

- A project can be created and retrieved.
- Every generation has traceable versions and hashes.
- Errors can be diagnosed without exposing sensitive content.
- Secrets remain server-side.
- Schema migrations and application tests run automatically.

---

# Phase 5: Build intake and adaptive questioning

## Objective

Convert a rough request into a reliable set of confirmed product decisions without creating an unlimited chatbot conversation.

## Architecture

Use a hybrid interview engine:

```text
User request
→ Structured intent extraction
→ Deterministic risk scan
→ Select highest-value unanswered question
→ Generate plain-language wording
→ Store answer and provenance
→ Repeat until safe to proceed or question budget is reached
```

## Intent extraction

Extract:

- Intended users.
- Primary workflow.
- Required features.
- Explicit exclusions.
- Existing project status.
- Technology preferences.
- Authentication requirements.
- Data-storage requirements.
- External services.
- Deployment expectations.
- Evidence of completion.
- Ambiguities and contradictions.

## Risk categories

Ask follow-up questions only when the answer changes:

- User roles or permissions.
- Core user workflow.
- Authentication.
- Sensitive or personal data.
- Payments.
- Data ownership.
- External APIs.
- Deployment.
- Destructive actions.
- Verification strategy.

## Question-selection rules

- Maximum of five initial questions.
- Ask one question at a time.
- Prefer selectable answers when appropriate.
- Always allow “Recommend for me.”
- Always allow “I’m not sure.”
- Do not ask a question already answered in the original request.
- Do not ask low-impact preference questions before high-risk questions.
- Do not silently resolve security-sensitive ambiguity.
- If five questions are insufficient, show unresolved decisions rather than pretending certainty.

## Contradiction handling

Detect contradictions such as:

- “No accounts” and “users manage private dashboards.”
- “No database” and “store user submissions permanently.”
- “No external services” and “send email verification.”

Ask the user to resolve the conflict explicitly.

## Deliverables

- Intent-extraction prompt and schema.
- Deterministic risk rules.
- Question templates.
- Question-selection engine.
- Contradiction detector.
- Interview state machine.
- Test fixtures based on concierge examples.

## Exit criteria

- The same request produces stable core extraction results.
- Questions are not repeated.
- High-impact uncertainty is surfaced.
- The engine stops predictably.
- Question count stays within the configured budget.
- Every decision records provenance.

---

# Phase 6: Build contract generation and validation

## Objective

Generate LoopSpec Lite, validate it, and let the user approve the actual contract before prompt rendering.

## Generation process

```text
Original request
+ extracted intent
+ user answers
+ task-profile defaults
→ LoopSpec Lite candidate
→ deterministic validation
→ targeted model repair for schema/content issues
→ validation again
→ user confirmation
```

## Contract sections shown to the user

- What will be built.
- Who it is for.
- Core user workflow.
- Required deliverables.
- Included features.
- Explicit non-goals.
- Assumptions.
- Unresolved decisions.
- How completion will be checked.
- Actions requiring approval.

## Validation indicators

Do not display one misleading total score. Show dimensions:

```text
Requirements coverage: Complete
Verification coverage: 4 of 5 criteria
Unresolved decisions: 1 high-impact issue
Security review: Authentication decision required
Scope risk: Medium
```

## Acceptance-criterion quality rules

Each required criterion must be:

- Specific.
- Observable.
- Connected to one or more requirements.
- Verifiable by a command or inspection.
- Associated with required evidence.
- Stable through later repair versions.

Avoid vague criteria such as:

- “The app should look good.”
- “The code should be clean.”
- “Everything should work.”

Prefer:

- “Submitting a valid contact form stores the message and displays a success confirmation.”
- “Submitting an invalid email displays an inline validation error and does not create a record.”
- “The existing automated test suite passes without newly introduced failures.”

## Deliverables

- LoopSpec generator.
- Contract confirmation UI.
- Deterministic validator.
- Validation issue renderer.
- Acceptance-criterion coverage checker.
- Assumption and unresolved-decision editor.
- Version creation after every confirmed change.

## Exit criteria

- Every required feature maps to stable criterion IDs.
- High-risk unresolved decisions block generation.
- The user can correct assumptions without restarting.
- The final confirmed LoopSpec passes deterministic validation.
- Contract versions are immutable after use in a run.

---

# Phase 7: Build the Codex compiler and project artifacts

## Objective

Compile the confirmed LoopSpec into clear, repository-ready instructions that Codex can execute and report against.

## Required outputs

### `PROJECT_SPEC.md`

Contains:

- Goal.
- User and problem.
- Required deliverables.
- Included and excluded scope.
- Assumptions.
- Technology constraints.

### `ACCEPTANCE_CRITERIA.md`

Contains:

- Stable criterion IDs.
- Requirement.
- Verification method.
- Required evidence.
- Required versus optional status.

### `AGENT_TASK.md`

Contains:

- Agent role and objective.
- Repository discovery instructions.
- Planning, implementation, verification, and bounded repair phases.
- Protected actions.
- Stop conditions.
- Final-report contract.
- Run ID and LoopSpec version.

### Copy-ready prompt

Contains the minimum necessary instruction to begin the task and use the generated artifacts. When files cannot be placed in the repository, the prompt includes the required contract inline.

## Final-report contract

Require the agent to report:

```text
Run ID
LoopSpec version
Summary of work completed
Files changed
Commands executed
Test results
Acceptance criterion status by ID
Evidence for each completed criterion
Unresolved criteria
Assumptions changed during implementation
Risks or blockers
Recommended next action
```

## Adapter versioning

Every generated output records:

- LoopSpec version.
- Adapter name.
- Adapter version.
- Template version.
- Content hash.
- Generation timestamp.

## Deliverables

- Codex adapter.
- Markdown renderers.
- Copy button.
- Downloadable artifact bundle.
- Prompt preview.
- Snapshot tests for output stability.
- Adapter fixture suite.

## Exit criteria

- A confirmed LoopSpec produces all required artifacts.
- Output contains stable criterion IDs and return instructions.
- The generated task does not contain contradictory requirements.
- The prompt requires evidence rather than self-declared completion.
- Output is tested on real Codex tasks from Phase 1.

---

# Phase 8: Build execution handoff and return flow

## Objective

Connect copied instructions to a traceable run and give the user an obvious reason to return.

## Run creation

When the user copies or downloads the task:

- Create a run ID.
- Freeze the LoopSpec version.
- Freeze the adapter version.
- Record the copy or download event.
- Generate a signed or hard-to-guess return link.
- Show exact instructions for returning evidence.

## Generated call to return

The task should tell the coding agent to finish with a structured report. The user-facing page should say:

> When your coding agent finishes, return here and paste its final report and test evidence. We will check the result against your original requirements and create a focused repair task if anything remains incomplete.

## Evidence input fields

- Agent final report.
- Test or build output.
- Diff or file-change summary.
- User-observed problems.
- Optional notes about manual checks.

## Run states

```text
draft
contract_confirmed
task_generated
copied
awaiting_evidence
evidence_submitted
assessed
repair_generated
completed
blocked
abandoned
```

## Deliverables

- Run-state machine.
- Unique return URLs.
- Return reminder in generated artifacts.
- Evidence-submission interface.
- Resume existing run.
- Copy/download analytics.
- Expiration and deletion policy.

## Exit criteria

- A copied task maps to exactly one immutable contract version.
- The user can return without reconstructing project context.
- Evidence is associated with the correct run and criterion IDs.
- Duplicate submissions do not corrupt history.
- Abandoned runs can be identified without misclassifying them as failures.

---

# Phase 9: Build evidence assessment

## Objective

Assess whether the returned evidence supports completion of each acceptance criterion without overstating certainty.

## Important limitation

Without direct repository access, the platform cannot independently rerun tests. It can evaluate submitted evidence, identify missing evidence, detect contradictions, and avoid treating an agent's unsupported claim as proof.

The product should call this **evidence assessment**, not guaranteed independent verification.

## Assessment pipeline

```text
Evidence submission
→ Parse structured final report
→ Match criterion IDs
→ Check required evidence presence
→ Detect contradictions
→ Perform semantic evidence review
→ Assign criterion status
→ Generate overall run state
```

## Criterion states

- `verified_by_submitted_evidence`
- `partially_supported`
- `unsupported_claim`
- `failed`
- `blocked`
- `not_attempted`
- `unverifiable`
- `not_applicable`

## Assessment hierarchy

Prefer evidence in this order:

1. Deterministic command output.
2. Test result with named test and status.
3. Build or type-check output.
4. Inspectable file or diff evidence.
5. Manual user observation.
6. Agent assertion without supporting evidence.

Agent assertion alone must not produce a verified status.

## Results interface

Show:

- Completed and supported criteria.
- Incomplete criteria.
- Missing evidence.
- Contradictions.
- Changed assumptions.
- Risks introduced during implementation.
- Overall terminal state.
- Recommended next action.

## Overall terminal states

- `completed_with_evidence`
- `partially_completed`
- `repair_recommended`
- `blocked_human_input_required`
- `unverifiable_more_evidence_required`
- `unsafe_or_out_of_scope`

## Deliverables

- Final-report parser.
- Evidence normalizer.
- Criterion matcher.
- Required-evidence checker.
- Semantic assessment prompt and schema.
- Contradiction detector.
- Criterion-results interface.
- Manual correction mechanism.
- Assessment audit trail.

## Exit criteria

- Unsupported claims are visibly labeled.
- Every result traces back to a criterion and submitted evidence.
- The system can explain why evidence is insufficient.
- Users can correct incorrectly parsed evidence.
- Assessment results are reproducible enough for regression testing.
- The platform never says “verified” when it only received an unsupported assertion.

---

# Phase 10: Build targeted repair generation

## Objective

Generate a minimal next task that addresses unresolved criteria without asking the agent to rebuild or reconsider completed work.

## Repair input

- Original confirmed LoopSpec.
- Current implementation summary.
- Completed criterion IDs.
- Incomplete criterion IDs.
- Failed commands or tests.
- Missing evidence.
- Changed assumptions.
- User-observed problems.
- Previous repair attempts.

## Repair-task requirements

The repair task must:

- Preserve already completed behaviour.
- Address only unresolved criteria and regressions.
- Include failure evidence.
- Require rerunning relevant tests.
- Require regression checks for completed criteria.
- Prohibit declaring completion without evidence.
- Stop when blocked or when the repair limit is reached.
- Produce the same structured final-report format.

## Repair limits

- Default maximum: two repair tasks per original run in the MVP.
- After the limit, return `human_review_required`.
- Do not generate identical repair instructions repeatedly.
- Detect no-progress cycles using unresolved criteria and repeated failures.

## Version chain

```text
Original contract v1
→ Run 1
→ Assessment 1
→ Repair task 1
→ Run 2
→ Assessment 2
→ Repair task 2, completion, or escalation
```

## Deliverables

- Repair-task generator.
- Repair-version model.
- Completed-work preservation rules.
- No-progress detector.
- Repair-limit enforcement.
- Copy and return experience for repairs.
- Repair prompt fixture tests.

## Exit criteria

- Repair instructions mention only unresolved work and necessary regression checks.
- Completed criteria are preserved.
- Repair versions are traceable to their parent assessment.
- Repair count is enforced.
- Repeated failures produce escalation rather than infinite loops.

---

# Phase 11: Build analytics and the evaluation harness

## Objective

Measure whether the product improves outcomes and create the data foundation for future defensibility.

## Product events

Track:

- Idea submitted.
- Interview started and completed.
- Question answered, skipped, or abandoned.
- Contract viewed and edited.
- High-risk assumption confirmed.
- Task generated.
- Prompt copied.
- Artifact downloaded.
- Return page opened.
- Evidence submitted.
- Assessment completed.
- Repair generated.
- Run completed, blocked, or abandoned.
- User feedback submitted.

## Generation trace

Store, with appropriate privacy controls:

```text
Original request
→ extraction version and result
→ questions and answers
→ decision provenance
→ LoopSpec version
→ validation results
→ adapter version
→ rendered artifacts
→ returned evidence
→ criterion assessment
→ repair versions
→ final outcome
```

## Benchmark design

Create paired experiments:

### Baseline

```text
Raw user request → Codex
```

### Product path

```text
Same request → platform contract → Codex
```

Keep constant where possible:

- Coding agent.
- Model.
- Repository starting state.
- Tool access.
- Time or turn limit.
- Evaluation criteria.

## Metrics

### Quality

- Required criteria passed.
- Verification-evidence coverage.
- Incorrect or missing features.
- Regressions introduced.
- Unsupported completion claims.

### Efficiency

- Clarification turns.
- Human corrections.
- Repair attempts.
- Time to acceptable completion.
- Coding-agent tokens.
- Platform tokens.
- Total tokens.

### Product

- Idea-to-copy conversion.
- Time to copied task.
- Return-evidence rate.
- Repair usage.
- Completion rate.
- Repeat project creation.
- Willingness to pay.

## Evaluation rules

- Do not use an LLM's overall opinion as the only evaluator.
- Use stable acceptance criteria.
- Prefer deterministic tests.
- Record evaluator and prompt versions.
- Blind the final evaluator to baseline versus product path when practical.
- Preserve failed examples in the regression suite.

## Deliverables

- Event taxonomy.
- Product analytics dashboard.
- Generation trace viewer for developers.
- Benchmark task set.
- Baseline runner procedure.
- Results-report template.
- Privacy and consent controls.
- Regression-evaluation suite.

## Exit criteria

- Every run can be traced to exact generator and adapter versions.
- The team can calculate return rate and completion rate.
- At least 10 representative paired tasks are evaluated.
- Product claims can be connected to measured evidence.
- Failed tasks automatically become regression candidates.

---

# Phase 12: Harden, beta test, and launch

## Objective

Turn the working product into a safe, understandable private beta and decide whether to continue, change direction, or stop.

## Reliability work

- End-to-end tests for the complete journey.
- Schema-validation tests.
- Golden-output tests for artifact rendering.
- Interview-state recovery.
- Duplicate-submission handling.
- Model timeout and retry handling.
- Rate limiting.
- Error messages that preserve user progress.
- Browser and mobile layout checks.
- Accessibility checks.

## Security work

- Prompt-injection testing on pasted project content.
- Secret and credential detection.
- Authorization checks for return links.
- Input-size limits.
- Output escaping.
- Data deletion and expiration.
- Dependency and vulnerability review.
- Logging review to prevent sensitive-content leakage.
- Abuse and prohibited-task handling.

## Private beta

Invite 10–20 target users.

Require participants to have a real project task and agree to return outcome evidence.

Observe:

- Whether they understand the product.
- Whether they reach the copy step.
- Whether they run the task.
- Whether they return evidence.
- Whether assessment changes their next action.
- Whether repair prompts are useful.
- Whether they create a second project.

## Launch gates

Do not publicly launch until:

- The complete end-to-end journey works without manual database fixes.
- High-risk unresolved decisions block generation.
- Unsupported agent claims are not marked verified.
- At least 10 paired benchmark tasks have results.
- Users have completed real tasks through the workflow.
- At least several users return for a second task or clearly request continued access.
- Costs per completed run are measured.
- Privacy and deletion behaviour are documented.
- The product has clear limits and does not promise guaranteed completion.

## Deliverables

- Private-beta release.
- Onboarding and help content.
- Privacy policy and data controls.
- Known-limitations page.
- Benchmark report.
- Cost-per-run report.
- User-feedback synthesis.
- Go, pivot, or stop decision memo.

## Exit criteria

Choose one:

### Go

Users complete real work, return evidence, value the assessment, and request continued use.

### Pivot

Users value one part—such as scope creation, repository artifacts, or evidence checking—but not the complete workflow.

### Stop

Existing coding agents produce equivalent results, users do not return evidence, or willingness to reuse is too weak.

---

# Recommended 12-week sequence

## Weeks 1–2: Validate before automating

- Phase 0: Freeze thesis.
- Phase 1: Concierge validation.
- Collect real tasks and evidence.
- Revise the question categories and LoopSpec Lite.

## Week 3: Define the system

- Phase 2: Schemas and validator rules.
- Phase 3: UX prototype.
- Test the prototype with target users.

## Week 4: Foundation

- Phase 4: Application, database, logging, and security skeleton.
- Finalize versioning and traceability.

## Weeks 5–6: From rough request to confirmed contract

- Phase 5: Intent extraction and adaptive questions.
- Phase 6: Contract generation, validation, and confirmation.

## Week 7: Generate the agent task

- Phase 7: Codex adapter and Markdown artifacts.
- Test against concierge examples.

## Week 8: Bring the user back

- Phase 8: Run IDs, return links, and evidence submission.

## Weeks 9–10: Assess and repair

- Phase 9: Criterion-level evidence assessment.
- Phase 10: Targeted repair generation.

## Week 11: Measure

- Phase 11: Analytics and benchmark harness.
- Run paired baseline evaluations.

## Week 12: Private beta

- Phase 12: Security, reliability, beta onboarding, and launch decision.

---

# Core testing strategy

## Unit tests

- LoopSpec schema validation.
- Question-selection rules.
- Contradiction detection.
- Criterion-ID stability.
- Requirement-to-criterion mapping.
- Evidence-presence rules.
- Run-state transitions.
- Repair-attempt limits.

## Fixture tests

Maintain examples for:

- Valid small web project.
- Missing authentication decision.
- Contradictory scope.
- Unverifiable design requirement.
- Unsupported agent completion claim.
- Failed tests with claimed success.
- Partial implementation.
- Blocked external API integration.
- Repeated repair failure.

## Golden-output tests

Store approved versions of:

- Project specification.
- Acceptance criteria.
- Codex task.
- Final-report contract.
- Repair task.

Review intentional template changes and increment the adapter version.

## End-to-end tests

1. Submit idea.
2. Complete questions.
3. Confirm contract.
4. Generate task.
5. Copy task.
6. Return evidence.
7. Receive assessment.
8. Generate repair.
9. Return second evidence submission.
10. Reach a terminal state.

## Adversarial tests

- User pastes secret keys.
- User input tries to override system policies.
- Agent final report claims success without evidence.
- Evidence contains contradictory test output.
- User submits an oversized report.
- Return URL is guessed or reused improperly.
- A repair request attempts a restricted action.

---

# MVP success metrics

## Primary success metric

> Percentage of real runs that reach a supported completion assessment with less human clarification or repair than the raw-prompt baseline.

## Supporting metrics

- Percentage reaching generated task.
- Median time from idea to copied task.
- Percentage returning evidence.
- Acceptance-criterion coverage.
- Supported versus unsupported completion claims.
- Repair-task success rate.
- Average clarification turns.
- Average human corrections.
- Coding-agent token usage.
- Total token usage.
- Cost per completed run.
- Percentage creating a second project.
- Willingness to pay.

## Metrics that must not become goals

- Prompt length.
- Number of LoopSpec fields populated.
- Number of questions asked.
- A model-generated quality score.
- Number of adapters.
- Number of generated projects without execution evidence.

---

# Post-MVP roadmap

Only begin these after the MVP proves repeatable value.

## Post-MVP Phase A: Repository awareness

Allow users to provide repository context through selected files, a repository connection, or an authorized integration.

Use it to:

- Detect the existing stack.
- Identify existing test commands.
- Respect project conventions.
- Define protected files.
- Generate repository-specific acceptance checks.
- Improve repair instructions.

## Post-MVP Phase B: Second agent adapter

Add Claude Code or the most requested agent.

Requirements:

- Separate versioned adapter.
- Same benchmark task set.
- Agent-specific final-report contract.
- Adapter regression suite.

## Post-MVP Phase C: Advanced controls

Expose selected controls to technical users:

- Stack choices.
- Testing preferences.
- Scope editing.
- Approval gates.
- Repair limits.
- Artifact customization.

Do not expose the full raw schema until repeated user requests justify it.

## Post-MVP Phase D: Direct verification

With authorized repository or CI access:

- Rerun tests.
- Inspect diffs.
- Validate build artifacts.
- Compare results with submitted agent reports.
- Increase confidence beyond evidence pasted by the user.

## Post-MVP Phase E: Direct agent execution

Only after the generated task and evidence loop are proven:

- Start agent runs.
- Stream progress.
- Pause and resume.
- Request approvals.
- Enforce budgets.
- Maintain sandbox isolation.

## Post-MVP Phase F: Teams and governance

- Shared project templates.
- Organization policies.
- Approved stacks.
- Audit logs.
- Team evidence dashboards.
- Multiple concurrent runs.
- Cost allocation.
- Identity and permissions.

---

# Copy-ready implementation checklist

## Product validation

- [ ] Freeze target user and task profile.
- [ ] Recruit 5–10 design partners.
- [ ] Collect 10–20 real tasks.
- [ ] Complete at least five manual end-to-end runs.
- [ ] Document repeated questions and failure patterns.
- [ ] Confirm users value evidence assessment and repair.

## Product contracts

- [ ] Define LoopSpec Lite v0.1.
- [ ] Define evidence-submission schema.
- [ ] Define criterion-assessment schema.
- [ ] Define repair-task schema.
- [ ] Create deterministic validation rules.
- [ ] Create valid and invalid fixtures.

## User experience

- [ ] Prototype idea intake.
- [ ] Prototype adaptive questions.
- [ ] Prototype contract confirmation.
- [ ] Prototype generated-task page.
- [ ] Prototype evidence return.
- [ ] Prototype assessment and repair.
- [ ] Test with at least five users.

## Foundation

- [ ] Create web application skeleton.
- [ ] Create database and migrations.
- [ ] Add secure server-side model access.
- [ ] Add structured logging and monitoring.
- [ ] Add rate limiting.
- [ ] Define privacy and deletion behaviour.
- [ ] Add continuous integration.

## Interview engine

- [ ] Build intent extraction.
- [ ] Build risk scanner.
- [ ] Build question selector.
- [ ] Add question budget.
- [ ] Add contradiction detection.
- [ ] Store decision provenance.

## Contract engine

- [ ] Generate LoopSpec Lite.
- [ ] Validate deterministically.
- [ ] Map requirements to criteria.
- [ ] Map criteria to evidence.
- [ ] Block unresolved high-risk decisions.
- [ ] Add user confirmation and correction.

## Agent output

- [ ] Build Codex adapter.
- [ ] Generate `PROJECT_SPEC.md`.
- [ ] Generate `ACCEPTANCE_CRITERIA.md`.
- [ ] Generate `AGENT_TASK.md`.
- [ ] Require structured final report.
- [ ] Add copy and download.
- [ ] Version and hash every output.

## Return loop

- [ ] Create immutable run versions.
- [ ] Generate return URLs.
- [ ] Build evidence-submission form.
- [ ] Parse final reports.
- [ ] Match evidence to criteria.
- [ ] Label unsupported claims.
- [ ] Show terminal state.

## Repair loop

- [ ] Generate targeted repair task.
- [ ] Preserve completed work.
- [ ] Add regression checks.
- [ ] Enforce repair limit.
- [ ] Detect no progress.
- [ ] Escalate when blocked.

## Measurement

- [ ] Track the full generation trace.
- [ ] Track copy and return events.
- [ ] Track completion and abandonment.
- [ ] Create paired baseline tasks.
- [ ] Measure agent-side and total tokens.
- [ ] Measure criteria passed and repairs.
- [ ] Publish only supported claims.

## Beta readiness

- [ ] Complete end-to-end tests.
- [ ] Complete adversarial tests.
- [ ] Review privacy and security.
- [ ] Test deletion and expiration.
- [ ] Document limitations.
- [ ] Recruit 10–20 beta users.
- [ ] Measure real completed runs.
- [ ] Write go, pivot, or stop memo.

---

# Final roadmap principle

The MVP should not be judged by how sophisticated its prompt appears.

It should be judged by this chain:

```text
User intent
→ Confirmed requirements
→ Verifiable acceptance criteria
→ Agent execution
→ Submitted evidence
→ Honest completion assessment
→ Focused repair
→ Measurable outcome
```

If any link in that chain is missing, the MVP has returned to being a prompt generator rather than a requirements-to-verification product.
