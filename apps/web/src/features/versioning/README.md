# Contract confirmation and browser versions

Phase 5.5 requires a saved, valid Phase 5.4 review. The confirmation screen shows the final summary,
stop rules, and each action-specific approval gate. The user must acknowledge every generated action
and certify the complete review before LoopZ creates a version.

Confirmed versions are strict, content-hashed LoopSpec Lite snapshots stored under
`loopz:project:<projectId>:versions`. The store is append-only through the application API: a version
number or ID cannot be overwritten. Editing the review and confirming again creates the next version.

The store accepts mixed legacy 0.1 and current 0.2 history. Legacy versions remain visible but must be
reviewed and reconfirmed before task generation because they do not contain verification commands.

This MVP store is browser-local and can still be cleared or altered with browser developer tools. It
does not provide server durability, multi-device synchronization, authentication, access control, or
cryptographic proof of who clicked confirmation.
