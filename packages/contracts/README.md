# @loopz/contracts

Versioned, provider-neutral data contracts shared by the web application, domain engine, and agent adapters.

Rules:

- Schema changes require an explicit version change.
- Criterion IDs remain stable after a run is created.
- User decisions include provenance.
- Provider-specific instructions do not belong here.
- JSON Schema exports in `schemas/` are interoperability artifacts; TypeScript runtime validation lives in `src/`.
