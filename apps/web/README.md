# @loopz/web

The LoopZ user interface and server delivery layer.

## Feature boundaries

```text
src/features/intake       Rough request capture and suitability
src/features/interview    Risk-based clarification
src/features/contract     Plain-language contract confirmation
src/features/artifacts    Generated task preview and download
src/features/evidence     Returned report and evidence intake
src/features/assessment   Criterion-level outcome display
src/features/repair       Focused repair handoff
```

Feature folders may compose `@loopz/core`, `@loopz/contracts`, and the selected adapter. They must not duplicate provider-neutral domain rules.
