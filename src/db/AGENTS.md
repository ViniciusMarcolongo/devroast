# Data Layer

- `Drizzle` is the persistence layer, not the app API boundary.
- Keep table definitions, relations, and query helpers here; expose them to the UI through `tRPC` procedures.
- Prefer small query helpers grouped by domain instead of page-specific database access.
- Keep writes transactional when they span submission, result, findings, or diff records.
