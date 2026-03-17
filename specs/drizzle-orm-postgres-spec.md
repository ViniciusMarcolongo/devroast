# Especificacao de dados para Drizzle ORM + Postgres

## Contexto

O `README.md` posiciona o Devroast como um app onde o usuario cola codigo, escolhe um modo de roast, recebe uma analise com personalidade e pode aparecer em um leaderboard publico. O layout no Pencil reforca isso com tres superficies principais:

- `Home`: editor de codigo, toggle de modo, CTA de envio e preview do leaderboard.
- `Roast Results`: score geral, verdict, quote principal, metadados do snippet, bloco do codigo enviado, cards de analise, diff sugerido e CTA de share.
- `Leaderboard`: ranking publico com score, linguagem, linhas e preview do snippet.

Hoje o projeto ainda esta static-first. A especificacao abaixo define o menor modelo relacional que suporta sair do mock e entrar em uma primeira integracao real com Postgres via Drizzle.

## Objetivo desta fase

Implantar uma base Postgres local com Docker Compose e estruturar o Drizzle para suportar:

- persistencia de envios de codigo
- persistencia do resultado do roast
- persistencia dos cards de analise
- persistencia do diff sugerido
- leitura do leaderboard publico
- compartilhamento simples de um roast por slug

## Principios de modelagem

- V1 sem auth obrigatoria; o fluxo pode ser anonimo.
- O leaderboard deve nascer a partir dos roasts publicados, sem precisar de uma tabela dedicada para ranking.
- O resultado do roast e uma entidade separada do envio, para permitir status assicrono e reprocessamento no futuro.
- Findings e diff lines ficam normalizados para facilitar ordenacao, renderizacao e evolucao da UI.
- Campos derivados baratos, como `line_count` e `char_count`, devem ser persistidos para evitar recalculo em toda leitura.

## Enums propostos

### `analysis_mode`

- `constructive`
- `roast`

Observacao: a copy final ainda pode mudar, mas o banco deve armazenar um modo sem depender do rotulo da interface.

### `submission_status`

- `pending`
- `processing`
- `completed`
- `failed`

### `result_visibility`

- `private`
- `unlisted`
- `public`

### `finding_kind`

- `issue`
- `strength`

### `finding_tone`

- `critical`
- `warning`
- `good`

### `diff_line_kind`

- `context`
- `add`
- `remove`

## Tabelas necessarias

### 1. `roast_submissions`

Representa o envio bruto vindo da home.

Campos sugeridos:

- `id` uuid primary key
- `public_id` text unique para uso seguro em URL/API
- `source_kind` text default `paste`
- `source_label` text nullable, para nome amigavel do snippet/arquivo quando existir
- `raw_code` text not null
- `detected_language` text nullable
- `selected_language` text nullable
- `active_language` text nullable
- `line_count` integer not null
- `char_count` integer not null
- `analysis_mode` enum `analysis_mode` not null
- `status` enum `submission_status` not null default `pending`
- `error_message` text nullable
- `created_at` timestamp with time zone not null default now
- `updated_at` timestamp with time zone not null default now

Motivacao:

- cobre o editor atual e a futura escolha de linguagem detectada/manual
- permite fila ou processamento assincrono depois
- preserva o input original mesmo se o resultado for recalculado

Indices sugeridos:

- unique em `public_id`
- index em `status, created_at`
- index em `created_at desc`

### 2. `roast_results`

Representa o output principal mostrado na tela de resultados.

Campos sugeridos:

- `id` uuid primary key
- `submission_id` uuid not null unique references `roast_submissions(id)` on delete cascade
- `score` numeric(3,1) not null
- `verdict` text not null
- `verdict_tone` enum `finding_tone` nullable
- `headline` text not null
- `summary` text nullable
- `improved_code` text nullable
- `visibility` enum `result_visibility` not null default `private`
- `share_slug` text unique nullable
- `is_featured` boolean not null default false
- `published_at` timestamp with time zone nullable
- `created_at` timestamp with time zone not null default now
- `updated_at` timestamp with time zone not null default now

Motivacao:

- suporta score ring, verdict badge, quote principal e CTA de share
- `visibility` resolve leaderboard publico vs roast privado
- `share_slug` resolve pagina publica sem expor PK interno

Indices sugeridos:

- unique em `submission_id`
- unique em `share_slug`
- index em `visibility, score, published_at`
- index em `is_featured, published_at`

### 3. `roast_findings`

Representa os cards da secao `detailed_analysis`.

Campos sugeridos:

- `id` uuid primary key
- `result_id` uuid not null references `roast_results(id)` on delete cascade
- `position` integer not null
- `kind` enum `finding_kind` not null
- `tone` enum `finding_tone` not null
- `title` text not null
- `description` text not null
- `start_line` integer nullable
- `end_line` integer nullable
- `created_at` timestamp with time zone not null default now

Motivacao:

- a tela atual mostra cards positivos e negativos; `kind` separa isso sem criar tabelas diferentes
- `position` garante a ordem visual
- linhas opcionais preparam highlight contextual depois

Indices sugeridos:

- unique em `result_id, position`
- index em `result_id`

### 4. `roast_diff_lines`

Representa a secao `suggested_fix` de forma linear e renderizavel.

Campos sugeridos:

- `id` uuid primary key
- `result_id` uuid not null references `roast_results(id)` on delete cascade
- `position` integer not null
- `kind` enum `diff_line_kind` not null
- `content` text not null
- `old_line_number` integer nullable
- `new_line_number` integer nullable
- `created_at` timestamp with time zone not null default now

Motivacao:

- o layout atual usa linhas `context`, `remove` e `add`
- essa estrutura atende tanto diff visual simples quanto evolucoes futuras

Indices sugeridos:

- unique em `result_id, position`
- index em `result_id`

## Tabelas que nao sao obrigatorias na V1

### `leaderboard_entries`

Nao recomendo criar agora. O leaderboard pode ser derivado de:

- `roast_results.visibility = 'public'`
- `roast_submissions.status = 'completed'`
- ordenacao por `score asc`, `published_at asc` ou `created_at asc`

Se performance ou congelamento historico virarem requisito, podemos adicionar depois:

- uma view SQL
- uma materialized view
- ou uma tabela de snapshots de ranking

### `users` ou `anonymous_sessions`

Tambem nao recomendo para a primeira integracao. Como o produto ainda esta em fase static-first e sem backend real conectado, vale manter o fluxo anonimo. Se mais tarde precisarmos de rate limit, ownership ou historico por visitante, isso pode entrar em outra iteracao.

## Relacionamentos

- `roast_submissions` 1:1 `roast_results`
- `roast_results` 1:N `roast_findings`
- `roast_results` 1:N `roast_diff_lines`

## Queries que o schema precisa suportar

### Criar um novo roast

1. Inserir em `roast_submissions` com `status = 'pending'`.
2. Atualizar para `processing` quando a analise iniciar.
3. Inserir `roast_results`, `roast_findings` e `roast_diff_lines` dentro de transacao.
4. Atualizar `roast_submissions.status` para `completed`.

### Ler pagina de resultado

- buscar `roast_results` por `share_slug` ou por `submission_id`
- carregar `roast_submissions`
- carregar `roast_findings` ordenados por `position`
- carregar `roast_diff_lines` ordenados por `position`

### Ler leaderboard

- join entre `roast_results` e `roast_submissions`
- filtro `visibility = 'public'`
- ordenacao principal por `score asc`
- pagina por `limit` e `offset`

## Decisoes de schema que valem desde ja

- Usar `uuid` como PK nas tabelas principais.
- Usar `public_id` ou `share_slug` para exposicao externa.
- Persistir `selected_language` e `detected_language` separadamente.
- Persistir `active_language` para simplificar leitura e ranking por linguagem.
- Persistir `line_count` para suportar UI de resultados e leaderboard sem recalculo.
- Guardar `improved_code` em `roast_results`, mesmo que o diff seja a representacao principal.

## Estrutura sugerida no codigo

- `drizzle.config.ts`
- `src/db/index.ts`
- `src/db/schema/enums.ts`
- `src/db/schema/roast-submissions.ts`
- `src/db/schema/roast-results.ts`
- `src/db/schema/roast-findings.ts`
- `src/db/schema/roast-diff-lines.ts`
- `src/db/schema/index.ts`
- `src/db/queries/roasts.ts`

## Docker Compose para Postgres local

Arquivo esperado: `docker-compose.yml`

Servico sugerido:

- imagem `postgres:17-alpine`
- container `devroast-postgres`
- porta local `5432:5432`
- volume nomeado para persistencia
- healthcheck com `pg_isready`
- variaveis `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

Env vars esperadas no projeto:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devroast`

Arquivos recomendados:

- `.env.example`
- `.gitignore` cobrindo `.env`

## Dependencias sugeridas

- `drizzle-orm`
- `drizzle-kit`
- `postgres`

Opcional depois:

- `drizzle-seed`
- `zod` para validar payloads de input/output

## Scripts sugeridos no `package.json`

- `db:up` -> `docker compose up -d`
- `db:down` -> `docker compose down`
- `db:logs` -> `docker compose logs -f postgres`
- `db:generate` -> `drizzle-kit generate`
- `db:migrate` -> `drizzle-kit migrate`
- `db:push` -> `drizzle-kit push`
- `db:studio` -> `drizzle-kit studio`

Observacao: para um projeto versionado e com colaboracao, `generate + migrate` costuma ser mais seguro do que depender so de `push`.

## To-dos de implantacao do Drizzle

- [ ] Adicionar `drizzle-orm`, `drizzle-kit` e `postgres` ao projeto.
- [ ] Criar `docker-compose.yml` com Postgres local e volume persistente.
- [ ] Criar `.env.example` com `DATABASE_URL`.
- [ ] Configurar `drizzle.config.ts` apontando para a pasta `src/db/schema`.
- [ ] Criar enums compartilhados em `src/db/schema/enums.ts`.
- [ ] Criar as tabelas `roast_submissions`, `roast_results`, `roast_findings` e `roast_diff_lines`.
- [ ] Declarar FKs, uniques e indices na primeira migracao.
- [ ] Criar `src/db/index.ts` com o client Drizzle.
- [ ] Criar query helpers para `createRoast`, `getRoastBySlug` e `getLeaderboardPage`.
- [ ] Definir uma estrategia de transacao para gravar resultado + findings + diff em conjunto.
- [ ] Adicionar seed minima para o leaderboard apenas se isso ajudar a substituir os mocks atuais.
- [ ] Decidir se a pagina de resultado usara `public_id` ou `share_slug` como identificador principal.
- [ ] Rodar migracoes localmente com o banco no Docker Compose.
- [ ] Validar leitura real no lugar dos mocks da home e do leaderboard.
- [ ] Rodar `pnpm exec biome check .` e `pnpm exec tsc --noEmit` apos a implantacao.

## Perguntas em aberto

- O modo binario atual deve ser `constructive` vs `roast` ou outro par de valores canonicos?
- Todo roast completo vira publico por padrao ou o usuario escolhe publicar no leaderboard?
- O leaderboard deve mostrar o codigo completo, um preview truncado ou apenas um nome amigavel do snippet?
- O produto vai precisar reprocessar o mesmo envio varias vezes? Se sim, talvez `roast_results` deixe de ser 1:1 e passe a ser 1:N por `submission`.

## Recomendacao final

Para a V1, o melhor corte e um schema com 4 tabelas centrais e 6 enums pequenos, sem tabela de usuarios e sem tabela dedicada de leaderboard. Isso cobre exatamente o que o README e o layout no Pencil ja prometem: enviar codigo, gerar roast, mostrar analise estruturada, sugerir diff, compartilhar resultado e montar ranking publico em cima dos roasts publicados.
