# App Router

- Prefer Server Components by default in this folder.
- App-facing data should come through `tRPC`, not direct page-level imports from `src/db/queries`.
- When server-fetched data is also consumed by Client Components, prefetch with the server `tRPC` proxy and hydrate it into React Query.
- Use a direct server caller only when the data stays on the server and does not need client cache hydration.
- When a server component needs multiple independent reads, use `await Promise.all([...])` instead of sequential awaits.
- Keep the shared app shell in `src/app/layout.tsx`; page content should stay centered unless the pattern truly needs full bleed.
