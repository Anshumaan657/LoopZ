# Acceptance Criteria and Evidence Contract

**Experiment:** `[EXP-###]`  
**Version:** `[1]`

## Rules

- Required criterion IDs are stable after execution begins.
- A completion claim without required evidence is `unsupported_claim`.
- Manual checks name the person and observation.
- Existing test failures are recorded before execution when known.
- “Looks good,” “works,” and similar subjective statements are insufficient by themselves.

## Criteria

### AC-001 — [SHORT NAME]

- Priority: `required / optional`
- Requirement: [SPECIFIC OBSERVABLE BEHAVIOUR]
- Verification method: [COMMAND OR INSPECTION]
- Required evidence:
  - [NAMED TEST OUTPUT, BUILD OUTPUT, DIFF, SCREENSHOT, OR MANUAL OBSERVATION]
- Failure condition: [WHAT WOULD SHOW THIS DID NOT WORK]
- Related scope item: [SCOPE REFERENCE]

### AC-002 — [SHORT NAME]

- Priority: `required / optional`
- Requirement:
- Verification method:
- Required evidence:
  -
- Failure condition:
- Related scope item:

## Coverage check

| Included requirement | Criterion IDs | Covered? |
|---|---|---|
| [REQUIREMENT] | AC-001 | Yes / No |

## Evidence-quality ladder

1. Deterministic command output.
2. Named automated test and result.
3. Build or type-check result.
4. Inspectable file or diff evidence.
5. Named manual observation.
6. Agent assertion without supporting evidence.

Level 6 does not support verified completion.
