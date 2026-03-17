# Shame leaderboard da homepage

## Objetivo

Substituir o preview estatico da homepage por um shame leaderboard real com os 3 piores roasts publicos, exibindo tambem metricas de rodape como total de roasts.

O bloco deve usar Server Components e `Suspense` para mostrar skeleton enquanto os dados carregam.

## Escopo

- query de homepage via `tRPC`
- leitura dos 3 piores resultados publicos
- rodape com total de roasts
- renderizacao server-side na homepage
- loading state com skeleton
- codigo completo com syntax highlight em cada item
- preview recolhido com expand/collapse por linha

Nao entra:

- pagina completa do leaderboard
- filtros, paginacao ou interacao client-side
- hydration com React Query para esse bloco

## Abordagem

- Expor uma procedure em `tRPC` para o preview da homepage.
- Buscar os dados no server com caller direto, porque esse bloco nao precisa compartilhar cache com Client Components.
- Renderizar o leaderboard em um Server Component dedicado, envolvido por `Suspense`.
- Usar `sourceLabel` como label principal do snippet, com fallback para a primeira linha truncada do codigo.
- Exibir 3 entradas ordenadas pelos menores scores e mostrar no rodape algo como `showing worst 3 of X roasts`.
- Cada item deve renderizar o snippet completo com `CodeBlock` e syntax highlight.
- O estado de expand/collapse deve ficar em um Client Component pequeno, usando Base UI sempre que houver primitive adequado.
- No estado fechado, o snippet fica com `max-height` e fade visual; no aberto, mostra o codigo completo.

## Validacao

- homepage mostra 3 entradas reais do banco
- fallback skeleton aparece durante o carregamento
- dados chegam via `tRPC`
- rodape mostra o total de roasts publicos/completos
- cada item pode expandir e recolher sem perder syntax highlight
- `pnpm exec biome check .`
- `pnpm exec tsc --noEmit`
