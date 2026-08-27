# Risk-Based Question Catalog

Use this catalog to select questions deterministically. Do not ask every question. Choose at most five categories whose answers most affect the task.

## Priority order

1. Authorization and safety
2. Core user workflow
3. User roles and permissions
4. Sensitive data and authentication
5. External services, payments, and deployment
6. Existing repository constraints
7. Verification and evidence
8. Low-risk presentation preferences

## Authorization and ownership

Use when the participant may not own or control the affected system.

- Do you own this project or have permission to modify it?
- Is the agent allowed to change every relevant file, or are some areas protected?
- Does this task touch production data, accounts, or infrastructure?

High-risk unresolved answers block the task.

## Core user workflow

Use when the primary action or success path is unclear.

- What is the single most important action a user must complete?
- What should happen immediately after that action succeeds?
- What should the user see when it fails?

## User roles and permissions

Use when different people may see or do different things.

- Who are the user types?
- What can each user type view, create, change, or delete?
- Is any information private to one user or organization?

## Authentication

Use when identity or private access is implied.

- Is sign-in required for the first version?
- Which sign-in methods are required?
- What should happen when a user loses access?
- Are there existing authentication conventions that must be preserved?

Do not recommend a new authentication system when an existing project already has one without first inspecting the project context.

## Data and privacy

Use when information must be saved or could identify people.

- What data must be stored?
- Does the task handle personal, financial, health, or confidential data?
- Who can access the stored data?
- How long should the data remain?

High-risk regulated data is outside the MVP unless safely reduced to a non-production prototype with no real sensitive data.

## Payments

Use when pricing, checkout, subscriptions, or paid services are implied.

- Is real payment processing required, or only a non-functional prototype?
- Which party charges and receives payment?
- What happens after success, cancellation, or failure?
- Is using a paid service authorized?

Real payments require explicit scope and human approval gates.

## External services

Use when email, SMS, maps, storage, AI, or third-party APIs are implied.

- Which external services are required?
- Are credentials already available?
- Can the task be completed with a local or mocked integration?
- What should happen when the service is unavailable?

## Existing repository

Use for brownfield tasks.

- What framework and package manager does the project already use?
- Which commands currently build and test it?
- Which files or behaviours must not change?
- Are there existing conventions for authentication, data access, and UI?

## Deployment

Use when the participant expects a live result.

- Is deployment part of this experiment?
- Which environment is allowed: local, preview, staging, or production?
- Who must approve deployment?
- What rollback or recovery is required?

Production deployment is excluded from Phase 1 execution.

## Verification

Use when success cannot yet be observed objectively.

- What result would prove the task works?
- Which existing tests or commands should pass?
- Which behaviours require a manual check?
- What evidence can the agent return?

## Scope boundary

Use when the request contains multiple products or large feature sets.

- What is the smallest useful outcome for this experiment?
- Which requested capabilities can be postponed?
- What must explicitly not be changed?

## Visual direction

Use only after functional and risk questions are resolved.

- Is there an existing design system or reference to follow?
- Which screen sizes matter?
- What visual result can be inspected objectively?

Avoid criteria such as “looks professional” without an agreed reference or inspectable requirements.

## Question category codes

Use these in the tracker:

| Code | Category |
|---|---|
| `AUTHZ` | Authorization and ownership |
| `FLOW` | Core workflow |
| `ROLE` | Roles and permissions |
| `AUTHN` | Authentication |
| `DATA` | Data and privacy |
| `PAY` | Payments |
| `EXT` | External services |
| `REPO` | Existing repository |
| `DEPLOY` | Deployment |
| `VERIFY` | Verification |
| `SCOPE` | Scope boundary |
| `VISUAL` | Visual direction |

## Recurrence analysis

After every five completed experiments, count:

- How often each category was asked.
- How often it changed the contract.
- How often the same issue later caused failure.
- Which questions participants struggled to answer.

The smallest recurring high-value set becomes the automated interview policy in Phase 2.
