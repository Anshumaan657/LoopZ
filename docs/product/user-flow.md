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
Codex task + downloadable artifacts
        ↓
User runs Codex elsewhere
        ↓
Return link + evidence submission
        ↓
Criterion-level evidence assessment
        ↓
Completed ─ or ─ focused repair task
```

## Planned routes

| Route | Responsibility |
|---|---|
| `/` | Explain LoopZ and start a project |
| `/projects/new` | Capture the rough request |
| `/projects/:id/interview` | Ask risk-based questions |
| `/projects/:id/contract` | Confirm scope and acceptance criteria |
| `/projects/:id/task` | Copy/download the generated task |
| `/runs/:id/evidence` | Return agent output and evidence |
| `/runs/:id/assessment` | Review status and generate repair task |

Every route must preserve user progress and communicate what the platform can and cannot verify.
