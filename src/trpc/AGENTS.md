# tRPC

- This folder defines the app API boundary.
- Keep routers small and domain-focused, then compose them in the root `appRouter`.
- Validate procedure inputs with `zod`; add output validation only when it adds real safety.
- Keep `createTRPCContext` minimal, server-only, and request-scoped.
- Use the TanStack React Query integration pattern for Next.js App Router: client provider for Client Components, server proxy/caller for Server Components.
- Query client setup should keep `staleTime` above `0` and support dehydration of pending queries for RSC streaming.
- When a procedure needs multiple independent queries, execute them with `await Promise.all([...])`.
