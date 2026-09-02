# Phase 7.3: Evidence compilation and criterion mapping

## Status

Implemented.

## Outcome

A deterministic provider-neutral compiler now converts the evidence-return draft into Evidence Submission 0.2. It verifies the run state, project and contract identity, contract hash, and exact criterion set before producing a submission.

## Mapping rules

- The complete final report is preserved as agent-report evidence.
- Command output, diff summaries, user observations, and manual checks become separate evidence items only when supplied.
- A final report is linked to a criterion only when it names that stable criterion ID.
- Other evidence types are linked using the criterion's confirmed verification method and required-evidence language.
- A `passed` claim with no linked evidence remains a claim with an empty evidence list; it is not silently upgraded to proof.
- Unknown report IDs, missing or duplicate claims, mismatched sources, altered hashes, and invalid run states are rejected.

Phase 8 will judge whether each linked item actually supports the criterion. Phase 7 only preserves, normalizes, and maps the submitted material.
