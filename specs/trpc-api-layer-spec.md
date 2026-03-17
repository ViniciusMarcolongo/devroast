# tRPC como camada de API no Next.js

## Objetivo

Adicionar `tRPC` como camada principal de API/back-end do projeto, sobre o App Router atual, preservando a experiencia static-first e preparando o app para trocar mocks por dados reais do banco via Drizzle.

O setup deve seguir o cliente `@trpc/tanstack-react-query` com suporte correto a Server Components, SSR e hidratacao no cliente, conforme:

- `https://trpc.io/docs/client/tanstack-react-query/setup`
- `https://trpc.io/docs/client/tanstack-react-query/server-components`

## Escopo

Entra nesta fase:

- infraestrutura base de `tRPC` no projeto
- integracao com `@tanstack/react-query`
- provider global no `src/app/layout.tsx`
- handler HTTP em `src/app/api/trpc/[trpc]/route.ts`
- caller/proxy para uso em Server Components
- primeiros routers para roasts e leaderboard
- substituicao dos acessos diretos a mock/db nas paginas por `tRPC`

Nao entra nesta fase:

- auth
- server actions como interface principal de escrita
- websocket/subscriptions
- regras avancadas de cache/realtime

## Abordagem

### Decisao de arquitetura

- Usar `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query` e `@tanstack/react-query`.
- Usar o padrao de RSC recomendado pela documentacao: um client provider para Client Components e um caller/proxy separado para Server Components.
- Manter `Drizzle` como camada de acesso a dados; `tRPC` vira a fronteira da aplicacao, nao substitui `src/db/queries/roasts.ts`.

### Estrutura sugerida

- `src/trpc/init.ts`: cria contexto, helpers base e `createCallerFactory`
- `src/trpc/query-client.ts`: `makeQueryClient()` com `staleTime` e dehydrating configurados para SSR
- `src/trpc/client.tsx`: `TRPCReactProvider`, `useTRPC` e cliente HTTP com `httpBatchLink`
- `src/trpc/server.tsx`: `getQueryClient`, proxy para prefetch em RSC, helper `HydrateClient` e caller server-only
- `src/trpc/routers/_app.ts`: compoe `appRouter`
- `src/trpc/routers/roasts.ts`
- `src/trpc/routers/leaderboard.ts`
- `src/app/api/trpc/[trpc]/route.ts`

### Contexto do tRPC

O contexto inicial deve ser minimo e server-only:

- conexao com banco ja disponivel via `src/db/index.ts`
- headers/cookies apenas se forem necessarios para contexto futuro
- sem auth obrigatoria nesta primeira versao

Preferencia: expor um `createTRPCContext` simples e cacheado por request, alinhado ao guidance de RSC.

### Query Client e hidratacao

- Criar `makeQueryClient()` com `staleTime > 0` para evitar refetch imediato apos SSR.
- Configurar dehydrating para incluir queries pendentes, como sugerido na doc de Server Components.
- Reutilizar um singleton no browser e criar novo client por request no server.

### Integracao com Next App Router

- Montar `TRPCReactProvider` em `src/app/layout.tsx`.
- Criar endpoint fetch em `src/app/api/trpc/[trpc]/route.ts` usando `fetchRequestHandler`.
- Em Server Components, usar proxy/caller de `src/trpc/server.tsx` para `prefetch`, `fetchQuery` ou chamada direta, conforme o caso.

### Regra de uso por tipo de componente

- `Server Components`: preferir `prefetch(...queryOptions())` + `HydrateClient` quando o dado tambem sera consumido por Client Components.
- `Server Components`: usar caller direto apenas quando o dado for usado so no servidor e nao precisar hidratar cache no cliente.
- `Client Components`: usar `useQuery`, `useSuspenseQuery` e `useMutation` a partir de `useTRPC()`.

### Routers iniciais

`leaderboard`:

- `list`: recebe `limit` e `offset`
- usa `getLeaderboardPage` de `src/db/queries/roasts.ts`

`roasts`:

- `byShareSlug`: le um roast publico por slug
- `bySubmissionPublicId`: le roast por `publicId`
- `createSubmission`: cria envio inicial

Observacao: a operacao que completa o roast pode permanecer interna por enquanto se ainda nao houver pipeline real de processamento.

### Integracao nas telas atuais

- `src/app/page.tsx`: leaderboard deve sair de dados estaticos para prefetch via `tRPC`
- `src/app/leaderboard/page.tsx`: trocar array mockado por leitura via `tRPC`
- `src/app/roast/[id]/page.tsx`: trocar payload mockado por leitura real via `tRPC` ou caller server-side

### Convencoes

- inputs e outputs validados com `zod`
- routers pequenos e focados por dominio
- procedures nomeadas por intencao de produto, nao por detalhe tecnico
- tipos expostos a partir de `AppRouter`
- nenhuma pagina deve importar router server-side em client component; client usa apenas tipos e hooks/proxy publicos

## Validacao

- `pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod client-only server-only`
- `src/app/api/trpc/[trpc]/route.ts` responde queries do router principal
- `src/app/layout.tsx` monta o provider sem quebrar renderizacao inicial
- uma pagina com Server Component consegue fazer `prefetch` e hidratar um Client Component via React Query
- uma pagina server-only consegue usar caller direto sem depender do cache do cliente
- `src/app/leaderboard/page.tsx` e `src/app/roast/[id]/page.tsx` passam a ler dados reais atraves do novo boundary
- `pnpm exec biome check .`
- `pnpm exec tsc --noEmit`
