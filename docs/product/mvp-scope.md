# MVP scope

## Product promise

LoopZ transforms software ideas and development requests into confirmed, verifiable tasks for AI coding agents. It reduces unnecessary token usage and repetitive back-and-forth by translating the user’s intent into a single, detailed, execution-ready prompt for the coding agent to follow. After execution, LoopZ assesses the returned evidence, identifies what is incomplete or incorrect, and generates focused repair instructions when required

## Primary user

Freelancers and technical indie builders who already know how to run a coding agent.

## Supported workflow

1. Submit rough request.
2. Answer up to five risk-based questions.
3. Confirm goal, scope, assumptions, and acceptance criteria.
4. Generate a Codex-optimized task or a Universal compatibility task and repository artifacts.
5. Run the task outside LoopZ.
6. Return the final report and evidence.
7. Receive criterion-level assessment.
8. Generate up to two focused repair tasks.

## Supported task profile

A small web application or clearly bounded feature whose completion can be evaluated through tests or inspectable evidence.

## Non-goals

- Running coding agents.
- Writing to user repositories.
- Deployment.
- Supporting every agent.
- Complex regulated systems.
- Expert workflow editing.
- Multi-agent orchestration.
- Guaranteed completion or token savings.

## MVP terminal states

- Completed with submitted evidence.
- Partially completed.
- More evidence required.
- Repair recommended.
- Human input required.
- Unsafe or out of scope.
- Repair limit reached.
