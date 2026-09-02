# @loopz/universal-adapter

Provider-neutral compatibility rendering for coding agents that can accept a Markdown task.

This package produces:

- `UNIVERSAL_AGENT_TASK.md`
- `UNIVERSAL_STARTER_PROMPT.md`

The output is deliberately labelled `Universal — Compatibility Mode`. Results depend on the selected agent's tools, permissions, context capacity, and behavior. This is not a claim of dedicated optimization or support for every agent.

The renderer accepts only the integrity-checked provider-neutral execution task and preserves the same confirmed execution semantics as the Codex renderer. It is deterministic for fixed task and metadata inputs.
