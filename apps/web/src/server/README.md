# Server delivery layer

Planned responsibilities:

- Persistence adapters.
- Model-provider adapters.
- Secure configuration.
- HTTP route handlers.
- Rate limiting and observability.

Vendor SDKs must remain behind interfaces so provider changes do not leak into domain packages.
