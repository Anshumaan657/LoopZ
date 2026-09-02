# MVP user flow

```text
Landing / idea input
        ↓
Suitability and risk classification
        ↓
Up to five clarification questions
        ↓
Plain-language contract confirmation
        ↓
Codex-optimized or Universal compatibility task + downloadable artifacts
        ↓
User runs Codex elsewhere
        ↓
Return link + evidence submission
        ↓
Criterion-level evidence assessment
        ↓
Completed ─ or ─ focused repair task
                       ↓
              Fresh repair evidence
                       ↓
              Reassessment (maximum 2 repairs)
                       ↓
              Completed ─ or ─ human review
```

## Planned routes

| Route | Responsibility |
|---|---|
| `/` | Explain LoopZ and start a project |
| `/projects/new` | Capture the rough request |
| `/projects/:id/interview` | Ask risk-based questions |
| `/projects/:id/contract` | Confirm scope and acceptance criteria |
| `/projects/:id/contract/confirm` | Acknowledge approval gates and create a confirmed version |
| `/projects/:id/task` | Choose Codex or Universal compatibility view, then copy/download the generated task |
| `/runs/:id/evidence` | Return agent output and evidence |
| `/runs/:id/assessment` | Review criterion status and choose the supported next action |
| `/runs/:id/repair` | Copy or download a bounded repair task and begin fresh evidence return |

Every route preserves user progress and communicates what the platform can and cannot verify. Completed and blocked outcomes are recorded against the exact assessment and confirmed contract hash.
