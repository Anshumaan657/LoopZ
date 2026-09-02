# Phase 6.4: Delivery hardening

## Status

Implemented.

## Outcome

Task delivery now fails closed when any rendered artifact exceeds 200,000 characters. This renderer ceiling complements the Phase 6.1 provider-neutral task limit and prevents unexpectedly large copy/download outputs. The user is instructed to reduce scope and confirm a new version rather than receiving truncated instructions.

## Exact-delivery tests

Automated tests prove that:

- Clipboard delivery receives the exact string displayed by the task screen.
- Clipboard unavailability and permission rejection propagate as visible failures.
- Markdown download contains the exact string and filename selected by the user.
- Blob URLs are revoked after success and after a failed browser click.
- Neither renderer silently truncates oversized output.
- Markdown-sensitive confirmed content remains isolated by the Phase 6.2 renderer tests.

## Accessibility and responsive contracts

The format selector exposes tab-list, tab, selected-state, controlled-panel, and keyboard-focus semantics. Delivery feedback uses a polite live region and errors use an alert. The preview is keyboard-focusable, long content wraps safely, actions become full-width on narrow screens, and layout breakpoints cover tablet and phone widths. Reduced-motion preferences are respected.

These guarantees are covered by lightweight source-contract tests in the current Node-only Vitest setup. Full browser interaction and viewport testing remain part of Phase 9 end-to-end release validation.
