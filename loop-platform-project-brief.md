# Loop Compiler Platform — Complete Project Brief

**Status:** Concept draft for review  
**Working category:** AI build-instruction generator / loop compiler  
**Product name:** To be decided

## 1. Executive summary

The product is a web platform that converts a rough software idea into a complete, copy-ready execution loop for AI coding agents such as Codex, Claude Code, Cursor, and similar tools.

A user should be able to describe an idea in ordinary language—for example, “I want a website where local tutors can create profiles and students can book lessons.” The platform then clarifies the idea, fills technical gaps, defines what should be built, creates measurable completion criteria, adds testing and repair instructions, and generates one structured prompt that the user can copy into their preferred coding agent.

The platform is not merely a prompt improver. It acts as a **loop compiler**:

```text
Rough idea
    ↓
Product clarification
    ↓
Structured internal LoopSpec
    ↓
Safety and completeness validation
    ↓
Agent-specific compilation
    ↓
Copy-ready execution loop
```

The central value proposition is:

> Describe what you want to build. Receive complete, copy-ready instructions for your AI coding agent—so its time and tokens go toward building, testing, and finishing instead of repeatedly figuring out what you mean.

## 2. The problem

AI coding agents are increasingly capable, but they still depend heavily on the quality and completeness of the task they receive.

Most beginners and many working developers struggle with:

- Turning a broad idea into clear requirements.
- Identifying missing product decisions.
- Selecting an appropriate technology stack.
- Defining what is inside and outside the first version.
- Creating machine-checkable acceptance criteria.
- Instructing an agent to test, repair, and verify its work.
- Setting permissions, budgets, stopping rules, and human approval gates.
- Avoiding repeated clarification and correction cycles inside an expensive coding-agent session.
- Adapting one idea to the different working conventions of Codex, Claude Code, Cursor, and other agents.

The typical experience looks like this:

```text
Rough prompt
→ Partial implementation
→ User discovers missing requirements
→ Agent changes direction
→ Existing work is rebuilt
→ Tests reveal more misunderstandings
→ Additional prompting and token consumption
```

This is especially difficult for non-technical founders, students, junior developers, freelancers, and people building their first product.

## 3. The proposed solution

The platform separates **product thinking** from **product execution**.

The platform handles:

- Clarifying the idea.
- Identifying missing requirements.
- Making or recommending technical decisions.
- Defining scope and non-goals.
- Creating a phased implementation workflow.
- Creating acceptance criteria and verification steps.
- Adding repair, stopping, and escalation rules.
- Compiling the result for the selected AI coding agent.

The external coding agent handles:

- Inspecting or creating the repository.
- Writing and changing files.
- Installing approved dependencies.
- Running tests and verification commands.
- Repairing failures within defined limits.
- Producing a final evidence-backed report.

The first version of the platform will generate instructions but will not run the coding agent itself.

## 4. Target customers

### Primary initial users

- Non-technical or semi-technical founders.
- Students learning to build software with AI.
- Junior developers who need help structuring work.
- Freelancers creating prototypes and client projects.
- Product designers who want to turn an idea into an implementation brief.
- Indie hackers and solo builders.

### Secondary users

- Experienced developers who want reusable agent runbooks.
- Engineering teams standardizing how coding agents receive work.
- Agencies creating consistent implementation specifications.
- Technical leads defining safety, verification, and approval rules.

### Recommended initial focus

The initial audience should be people who may not know how to design an agent loop but can still inspect the resulting product and decide whether it meets their needs. Completely non-technical users may require additional deployment, hosting, and troubleshooting assistance that should not be included in the earliest MVP.

## 5. Product positioning

### Recommended category

- Loop compiler
- AI build-instruction generator
- Agent runbook builder
- AI execution-plan builder

### Recommended homepage message

> **Turn your idea into instructions an AI coding agent can actually finish.**
>
> Describe what you want to build. We clarify the requirements, plan the work, add tests and verification, and generate one complete prompt for Codex, Claude Code, Cursor, or another coding agent.

### Supporting message

> Spend your coding-agent tokens on implementation—not repeatedly explaining and refining your idea.

### Claims to avoid

The product should not initially claim:

- Guaranteed reduction in total token consumption.
- Identical output across different models or agents.
- Guaranteed completion of every software project.
- Fully autonomous production deployment.
- Replacement of software engineering knowledge or human review.

## 6. Complete user journey

### Screen 1: Describe the idea

The first screen should contain one large, friendly input:

> **What would you like to build?**

Example placeholder:

> I want a mobile-friendly website where local tutors create profiles and students request lessons.

Primary button:

> **Help me build it**

Future enhancements may include voice input, example prompts, and templates. The MVP should begin with a text input.

### Screen 2: Choose the level of control

After the idea is submitted, ask:

> **How would you like to create your AI build instructions?**

#### Guide me — Recommended

> Answer a few simple questions. We will recommend the technical setup.

#### Let me customize

> Choose the technologies, features, workflow, and checks yourself.

The interface should ask how much control the user wants rather than asking whether the user is technical or a “geek.” This avoids embarrassing beginners and avoids relying on inaccurate self-assessment.

### Mode A: Guided

Guided Mode is the default experience.

It asks approximately three to five questions, one at a time. Questions use ordinary language and selectable answers wherever possible.

Examples:

- Who will use this product?
- What is the most important action users should perform?
- Should users create accounts?
- What should the first version include?
- What visual style do you prefer?
- Are you starting from scratch or using an existing project?

Every technical or uncertain question should offer:

- Recommend the best option.
- I am not sure.
- Skip for now.

The system should only ask a question when its answer materially changes architecture, core functionality, security, cost, or the likelihood of successful implementation.

### Mode B: Advanced

Advanced Mode exposes controls such as:

- Target coding agent.
- Application or task type.
- Technology stack.
- Features and non-goals.
- Database preference.
- Authentication approach.
- Design direction.
- Testing preferences.
- Deployment destination.
- Existing versus new repository.

AI recommendations remain available. Advanced users should be able to accept individual recommended settings rather than configure everything manually.

### Mode C: Expert Controls

Expert Controls are opened from Advanced Mode using a clear control such as:

> **Open Expert Controls**

or:

```text
Control level: Advanced | Expert
```

Expert Mode exposes:

- Adding, deleting, and reordering loop phases.
- Phase goals, inputs, actions, outputs, and exit conditions.
- Verification commands and evidence requirements.
- Independent verifier configuration.
- Allowed tools and restricted actions.
- Protected files and directories.
- Network and secret-handling policies.
- Maximum iterations and repair attempts.
- Token, time, and cost budgets.
- State and memory rules.
- Context-compaction rules.
- Human approval gates.
- Stop, failure, and escalation conditions.
- Terminal states.
- Raw LoopSpec editing.
- Agent-specific adapter settings.

Expert Mode should provide live validation and recommendations. More configuration does not automatically produce a better loop.

### Mode switching

Users must be able to switch modes without losing previous answers:

- Guided users can select “I want more control.”
- Advanced users can open Expert Controls.
- Expert users can return to a simplified view.
- Expert changes should automatically update the plain-language project summary.

### Screen 3: Confirm understanding

Before generating the final prompt, show a plain-language summary:

```text
You want to build:
A marketplace connecting students with local tutors.

People will be able to:
✓ Create tutor and student accounts
✓ Search for tutors
✓ View tutor profiles
✓ Request lessons
✓ Manage upcoming lessons

Not included in the first version:
– Online payments
– Video calling
– Tutor background checks

Decisions recommended for you:
– A mobile-friendly web application
– Secure email-based login
– A simple and affordable technical setup
```

Every section should have a **Change** action.

Primary button:

> **Create my AI build instructions**

### Screen 4: Deliver the copy-ready loop

The primary output is one complete prompt:

```text
Your AI build instructions are ready

Optimized for: [Codex ▼]

[Complete generated prompt]

[ Copy complete prompt ]  [ Download ]
```

Below the button, show short platform-specific directions:

```text
1. Open Codex inside your project folder.
2. Start a new task.
3. Paste the copied instructions.
4. Review approval requests before allowing important actions.
```

The internal YAML or JSON should remain hidden unless the user selects **View advanced details**.

## 7. The internal LoopSpec

The platform should maintain one provider-neutral, versioned internal specification. It should not store only the final prose prompt.

```yaml
schema_version: "0.1"

request:
  original_prompt:
  task_type:
  target_agent:
  ambiguity_level:

objective:
  goal:
  deliverables: []
  success_definition:

requirements:
  functional: []
  non_functional: []
  constraints: []
  assumptions: []
  open_questions: []

scope:
  included: []
  excluded: []
  allowed_paths: []
  protected_paths: []

environment:
  project_status:
  repository_context:
  technology:
  available_commands: []

permissions:
  allowed_tools: []
  restricted_actions: []
  network_access:
  secrets_policy:
  sandbox_or_worktree:
  human_approval_gates: []

workflow:
  phases:
    - id:
      objective:
      inputs: []
      actions: []
      outputs: []
      verify:
      exit_when:
      on_failure:

acceptance:
  criteria:
    - id:
      requirement:
      verification_method:
      required_evidence:
      priority:

verification:
  commands: []
  manual_checks: []
  prohibited_shortcuts: []
  independent_verifier:
  evidence_location:

state:
  state_file:
  update_after_each_phase: true
  retain: []
  context_compaction_rules:

budgets:
  maximum_iterations:
  maximum_repair_attempts:
  time_limit_minutes:
  token_or_cost_limit:

termination:
  success_when:
  failure_when:
  no_progress_detection:
  stop_conditions: []
  terminal_states:
    - completed
    - blocked
    - budget_exhausted
    - approval_required
    - verification_failed
    - unsafe_to_continue

escalation:
  triggers: []
  required_human_information:
  resume_instructions:

final_output:
  format:
  include:
    - work_completed
    - files_changed
    - verification_results
    - unresolved_issues
    - assumptions
    - recommended_next_steps
```

### Decision provenance

Every important value should record where it came from:

```yaml
technology:
  framework:
    value: "recommended-framework"
    source: "system_recommendation"
    confidence: 0.86
    explanation: "Recommended because the project requires..."
```

Possible sources:

- `user_provided`
- `user_selected`
- `inferred_from_prompt`
- `system_recommendation`
- `default`
- `not_applicable`

This makes assumptions visible and enables intelligent follow-up questions.

## 8. Task profiles

One fixed workflow should not be forced onto every request. The platform should apply a profile and customize the phases.

Initial profiles:

- New web application.
- Existing application feature.
- Bug fix.
- Landing page.
- API or backend service.
- Code review.
- Repository migration or upgrade.
- Prototype or proof of concept.

Future profiles:

- Mobile application.
- Data analysis.
- Research task.
- Security review.
- Infrastructure change.
- Incident investigation.

Example default build workflow:

```text
Discovery
→ Planning
→ Implementation
→ Testing
→ Bounded repair
→ Final review
```

Each phase must define its inputs, outputs, verification, exit condition, and failure behaviour.

## 9. Agent adapters

The same internal LoopSpec should compile into different external prompts.

```text
LoopSpec
├── Codex adapter
├── Claude Code adapter
├── Cursor adapter
└── Generic-agent adapter
```

Agent-specific versions may differ in:

- Project-instruction file conventions.
- Tool and permission language.
- State-continuation instructions.
- Testing and command-execution behaviour.
- Context management.
- Human approval mechanisms.
- Preferred final-report format.

The product should not promise that one universal prompt produces identical results across all agents.

## 10. Loop validation

Before presenting the final prompt, run a deterministic validation layer.

Suggested validation categories:

- Goal clarity.
- Deliverable completeness.
- Scope clarity.
- Assumption visibility.
- Acceptance-criteria coverage.
- Verification quality.
- Permission safety.
- State and memory strategy.
- Repair limits.
- Stop and escalation conditions.
- Agent compatibility.

Example output:

```text
Loop readiness: 88/100

✓ Goal is clearly defined
✓ Every required feature has an acceptance criterion
✓ Repair attempts are bounded
⚠ Deployment requires a human approval gate
✕ One acceptance criterion has no verification method
```

The most important invariant is:

> A loop cannot declare success unless every required acceptance criterion has corresponding verification evidence.

## 11. Safety principles

All modes, including Expert Mode, should use safe defaults.

Actions requiring explicit human approval should include:

- Production deployment.
- Database deletion or destructive migration.
- Repository deletion.
- Purchasing services.
- Publishing external content.
- Sending external messages.
- Changing billing settings.
- Accessing or changing production credentials.
- Irreversible infrastructure operations.

Recommended defaults:

- Work in an isolated branch, sandbox, or worktree.
- Never expose secrets in prompts or reports.
- Use bounded retries.
- Stop when no progress is detected.
- Treat agent self-reports as insufficient evidence.
- Require tests or inspectable artifacts.
- Escalate uncertainty rather than invent missing high-risk details.

Expert users may customize policies, but the interface should clearly warn them when they weaken a safety control.

## 12. Token-efficiency proposition

### Intended benefit

Without the platform, users often consume their coding-agent allowance during product clarification, planning, corrections, and repeated implementation attempts.

With the platform, the workflow becomes:

```text
Rough idea
→ Platform clarification
→ Complete execution loop
→ Coding agent implementation and verification
```

Potential agent-side savings come from:

- Fewer clarification turns.
- Less repeated planning.
- Fewer misunderstood implementations.
- Reduced context repetition.
- Bounded repair attempts.
- Clear completion criteria.
- Deterministic verification.

### Required claim distinction

The platform may initially claim that it reduces the amount of **coding-agent usage spent on clarification and replanning**.

It should not claim a guaranteed reduction in **total tokens**, because platform-side clarification and generation also consume tokens.

### Benchmark design

Compare the same tasks through two paths:

1. A raw user prompt sent directly to a coding agent.
2. The same prompt processed into a LoopSpec and then sent to the same coding agent.

Measure:

- Coding-agent tokens.
- Platform tokens.
- Total tokens.
- Time to completion.
- Clarification turns.
- Repair attempts.
- Human interventions.
- Acceptance criteria passed.
- Final task completion rate.

Evidence from these benchmarks can later support quantified marketing claims.

## 13. MVP scope

### Build in version one

- Landing page and idea input.
- Guided and Advanced paths.
- Expert Controls for core LoopSpec fields.
- Three to five adaptive clarification questions.
- Plain-language confirmation screen.
- Internal versioned LoopSpec.
- Initial task profiles.
- Codex, Claude Code, and Generic adapters.
- Loop validator and readiness score.
- Copy-ready final prompt.
- Downloadable Markdown output.
- User accounts or anonymous project persistence, depending on implementation cost.
- Basic feedback collection after generation.

### Do not build in version one

- Running coding agents on the platform's infrastructure.
- Direct production deployments.
- Multi-agent fleet management.
- Enterprise governance.
- A large template marketplace.
- Automated billing optimization across providers.
- Guaranteed full-product completion.
- Support for every possible coding agent.

The MVP should prove that users can produce more complete agent instructions quickly and that those instructions improve outcomes.

## 14. Suggested technical architecture

```text
Web client
    ↓
Project and interview API
    ↓
Intent and ambiguity analyzer
    ↓
Adaptive question generator
    ↓
LoopSpec generator
    ↓
Schema and safety validator
    ↓
Task-profile engine
    ↓
Agent adapter compiler
    ↓
Prompt preview, copy, and download
```

Suggested logical components:

- Authentication and project storage.
- Structured generation using a strict schema.
- Versioned LoopSpec definitions.
- Task-profile registry.
- Agent-adapter registry.
- Deterministic validation rules.
- Prompt rendering templates.
- Analytics and experiment tracking.
- Evaluation harness for benchmark tasks.

The internal structured representation must be stored separately from the rendered prompt so prompts can be regenerated when adapters or templates improve.

## 15. Business model possibilities

### Free

- Limited loop generations.
- Guided Mode.
- Generic adapter.
- Basic validation.

### Pro

- Advanced and Expert Modes.
- Codex and Claude-specific adapters.
- Saved projects and versions.
- More task profiles.
- Deeper validation.
- Downloadable project instruction files.
- Loop comparison and optimization.

### Team

- Shared templates.
- Organization policies.
- Approved technology stacks.
- Mandatory safety gates.
- Centralized audit history.
- Team-specific agent adapters.
- Usage and outcome analytics.

Pricing should be finalized only after measuring generation cost, user willingness to pay, and the value of agent-side usage saved.

## 16. Competitive advantage and defensibility

Prompt generation alone is easy to copy. The defensible product should be built around:

- A strong provider-neutral LoopSpec.
- High-quality adaptive requirements interviews.
- Task-specific profiles.
- Agent-specific compilers.
- Deterministic validation rules.
- Real execution-outcome data.
- Benchmarks connecting loop design to completion rate, cost, and human intervention.
- Versioned best practices that improve over time.
- Team policies and reusable organizational knowledge.

The long-term moat is not “we write longer prompts.” It is:

> We know which loop structures reliably produce successful outcomes for specific task types and agents, and we can prove it with evidence.

## 17. Product metrics

### Activation

- Percentage of visitors who submit an idea.
- Percentage who reach the confirmation screen.
- Percentage who generate a loop.
- Time from idea submission to copied prompt.

### User experience

- Abandonment per clarification question.
- Usage of “recommend for me.”
- Mode selected and mode-switching behaviour.
- Percentage of generated prompts copied or downloaded.
- User confidence before and after generation.

### Outcome quality

- Acceptance criteria passed.
- Coding-agent completion rate.
- Clarification turns after paste.
- Repair attempts.
- Human interventions.
- Time and token usage.
- User-reported satisfaction with the resulting product.

### Retention

- Projects generated per user.
- Repeat use within seven and thirty days.
- Saved or reused task profiles.
- Upgrades from Guided to Advanced or Expert.

## 18. Major risks and mitigations

### Risk: The result is only a very long prompt

**Mitigation:** Maintain a structured LoopSpec, deterministic validation, task profiles, and agent-specific compilation.

### Risk: Users expect guaranteed software completion

**Mitigation:** Communicate that the product creates a clearer, verifiable execution path rather than guaranteeing identical results.

### Risk: The beginner interview becomes another complex form

**Mitigation:** Ask one question at a time, limit the initial question budget, offer recommendations, and show a plain-language confirmation.

### Risk: Generated technical choices are unsuitable

**Mitigation:** Record assumptions and confidence, explain important recommendations, and require confirmation for high-impact decisions.

### Risk: Expert Mode creates unsafe loops

**Mitigation:** Use warnings, validation, approval requirements, and secure defaults even when deep customization is enabled.

### Risk: Token-saving claims are unproven

**Mitigation:** Separate coding-agent token savings from total token savings and run controlled benchmarks.

### Risk: Agent platforms change rapidly

**Mitigation:** Keep the LoopSpec provider-neutral and maintain adapters as versioned modules.

### Risk: Platform-side model costs become high

**Mitigation:** Use a question budget, structured outputs, caching, reusable defaults, smaller models for classification, and premium pricing for expensive workflows.

## 19. Roadmap

### Phase 1: Validate demand

- Interview target users.
- Test clickable UX concepts.
- Manually generate loops for real project ideas.
- Compare raw prompts against structured loops.
- Identify the highest-value task profiles.

### Phase 2: Build the MVP

- Implement Guided, Advanced, and Expert experiences.
- Implement LoopSpec v0.1.
- Add initial adapters and profiles.
- Add prompt preview, copy, download, and feedback.
- Run internal loop-quality evaluations.

### Phase 3: Prove outcomes

- Create a representative benchmark set.
- Measure task completion, tokens, retries, and intervention.
- Improve question selection and loop validation.
- Publish honest performance evidence.

### Phase 4: Repository awareness

- Allow users to connect or upload project context.
- Generate repository-specific verification commands.
- Produce instruction files and protected-path rules.
- Detect frameworks and existing project conventions.

### Phase 5: Direct execution

- Integrate supported agent SDKs or command-line runtimes.
- Stream progress and verification evidence.
- Add pause, resume, approval, and cancellation controls.
- Maintain secure isolation and credential handling.

### Phase 6: Team and fleet capabilities

- Shared policies and templates.
- Multiple concurrent loops.
- Budgets, audit logs, identity, permissions, and kill switches.
- Cross-agent coordination and organizational governance.

## 20. Key product principles

1. Hide technical complexity without hiding important assumptions.
2. Ask only questions that materially improve the result.
3. Let beginners accept recommendations and experts override them.
4. Never confuse a detailed prompt with a reliable loop.
5. Require evidence before declaring success.
6. Bound retries, costs, and dangerous actions.
7. Preserve one provider-neutral source of truth.
8. Compile for each agent rather than promising universal identical behaviour.
9. Measure real outcomes, not prompt length.
10. Make the first successful experience possible within a few minutes.

## 21. Concise pitch

> AI coding agents can build impressive software, but most people do not know how to give them complete, testable instructions. This platform turns a rough idea into a structured execution loop: it clarifies requirements, recommends technical decisions, defines phases and acceptance criteria, adds testing and repair rules, and compiles everything into one copy-ready prompt for Codex, Claude Code, Cursor, or another agent. Beginners receive a guided experience, developers can customize the setup, and experts can control the entire loop. The goal is to reduce clarification and rework inside coding-agent sessions while improving completion quality and verification.

## 22. Questions for external reviewers and other AI agents

1. Is the core problem painful enough that users will pay for a separate platform?
2. Is “loop compiler” understandable, or should the product use a simpler category name?
3. Which initial customer segment has the strongest need and shortest path to purchase?
4. Which three task profiles should the MVP support first?
5. What is the smallest LoopSpec that still produces meaningfully better results?
6. Should the first version generate only prompts, or also project instruction files?
7. How should loop quality be scored without relying entirely on another model's opinion?
8. How can the platform collect execution results after users copy prompts elsewhere?
9. What benchmark would convincingly demonstrate better completion or lower agent-side token usage?
10. Which safety controls must remain mandatory in Expert Mode?
11. How should provider-specific adapters be tested as agent products evolve?
12. What feature would create the strongest defensibility beyond prompt generation?
13. What assumptions in this brief are most likely to be wrong?
14. What should be removed from the MVP to ship faster?
15. What would make a user return after generating their first loop?

---

This document is a concept brief, not a final technical specification. The recommended next step is to obtain critical feedback, narrow the initial customer and task profile, validate the workflow with real users, and then convert the chosen MVP into a product requirements document and implementation plan.
