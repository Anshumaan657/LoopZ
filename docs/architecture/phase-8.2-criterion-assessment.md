# Phase 8.2 — Criterion assessment engine

The provider-neutral assessment compiler validates that the run, confirmed contract, contract hash, evidence submission, and complete criterion set refer to the same immutable execution.

For every acceptance criterion it:

1. Resolves linked evidence IDs.
2. Normalizes evidence type and strength.
3. Detects deterministic success and failure signals.
4. Compares the submitted claim with the linked output.
5. Checks required evidence categories.
6. Assigns one criterion status with an explanation and confidence.

An agent assertion without non-agent evidence is always `unsupported_claim`. A failed command overrides a pass claim and records a contradiction. Reported execution of a recognizable restricted production, credential, or destructive action yields `unsafe_or_out_of_scope`.

The compiler is deterministic and conservative. It performs evidence assessment; it does not claim to rerun tests or independently verify a repository.
