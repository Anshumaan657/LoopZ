# Consent and Privacy Script

This is a practical research script, not a substitute for jurisdiction-specific legal advice.

## Facilitator opening

> This session evaluates the LoopZ workflow, not your technical ability. Participation is voluntary. You may skip a question or stop at any time. We will capture your original request, answers, generated documents, coding-agent report, test or build output, corrections, and feedback. Please do not provide passwords, API keys, private keys, production credentials, personal customer data, or information you are not authorized to share.

## Required confirmations

Ask the participant to confirm:

- [ ] I understand the purpose of the study.
- [ ] I am participating voluntarily.
- [ ] I may stop without penalty.
- [ ] I have authority to share the task information and evidence I provide.
- [ ] I will remove secrets and unnecessary personal data.
- [ ] I understand that LoopZ will assess submitted evidence but may not independently rerun it.
- [ ] I consent to anonymized findings being used to improve LoopZ.

## Optional permissions

Keep each permission separate:

- [ ] LoopZ may retain my anonymized experiment data beyond the study.
- [ ] LoopZ may quote my anonymized feedback.
- [ ] LoopZ may use anonymized artifacts as a public case study.
- [ ] LoopZ may contact me for a second experiment.

No optional permission should be preselected.

## Data minimization

Collect only what is needed to evaluate the hypothesis. Replace:

- Names with `P-###` identifiers.
- Repository names with neutral descriptions.
- Client names with `[CLIENT]`.
- Domains and email addresses with placeholders.
- Tokens, keys, and credentials with `[REDACTED]`.

## Storage rules

- Keep identifying contact details separate from experiment artifacts.
- Store private experiment files under `.loopz/validation/`, which is ignored by Git.
- Never commit raw participant data.
- Record only anonymized aggregate findings in repository documentation.
- Define a deletion date for participants who do not consent to extended retention.

## Incident handling

If a participant submits a secret:

1. Stop processing the artifact.
2. Tell the participant what was detected.
3. Ask them to rotate or revoke it when appropriate.
4. Delete the unsafe copy.
5. Request a redacted replacement.
6. Record that a privacy incident occurred without storing the secret.

## Withdrawal

If a participant withdraws, remove their identifiable information and any experiment artifacts beyond what they explicitly permitted to retain. Record only the anonymized fact that a participant withdrew if necessary for dropout accounting.
