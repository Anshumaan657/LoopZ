# Contract confirmation and browser versions

Phase 5.5 requires a saved, valid Phase 5.4 review. The confirmation screen shows the final summary,
stop rules, and each action-specific approval gate. The user must acknowledge every generated action
and certify the complete review before LoopZ creates a version.

Confirmed versions are strict, content-hashed LoopSpec Lite snapshots stored under
`loopz:project:<projectId>:versions`. The store is append-only through the application API: a version
number or ID cannot be overwritten. Editing the review and confirming again creates the next version.

This MVP store is browser-local and can still be cleared or altered with browser developer tools. It
does not provide server durability, multi-device synchronization, authentication, access control, or
cryptographic proof of who clicked confirmation.
