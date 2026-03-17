# Editor com Syntax Highlight e Deteccao Automatica de Linguagem

## Contexto

O `CodeEditorShell` atual em `src/components/code-editor-shell.tsx` usa um `textarea` simples, sem syntax highlight e sem qualquer deteccao de linguagem. A homepage em `src/app/page.tsx` ja posiciona esse editor como o principal ponto de entrada do produto, entao a experiencia precisa continuar rapida, clara e alinhada com a linguagem visual terminal-first do projeto.

Objetivo: permitir que o usuario cole um trecho de codigo e veja o highlight aplicado automaticamente com base na linguagem detectada, com opcao de override manual da linguagem diretamente na homepage.

## Requisitos de produto

- Colar codigo no editor e obter highlight automaticamente.
- Permitir override manual da linguagem pelo usuario.
- Preservar fluxo estatico-first, sem backend.
- Manter boa experiencia de paste, selecao, teclado e scroll.
- Preservar a identidade visual atual do produto.
- Funcionar bem em desktop e de forma aceitavel em mobile.
- Evitar bundle excessivo na homepage.

## Pesquisa de opcoes

### 1. CodeMirror 6

Pontos fortes:

- Melhor equilibrio entre UX real de editor e peso de bundle.
- Boa experiencia de selecao, colagem, indentacao, undo/redo e navegacao por teclado.
- Permite lazy-load de extensoes de linguagem.
- Funciona bem em client components no App Router.
- Facil de combinar com um seletor manual de linguagem.
- Theming suficientemente flexivel para reproduzir o visual terminal do projeto.

Pontos fracos:

- Deteccao automatica nao vem pronta; precisa de uma camada propria.
- Integracao inicial e mais complexa do que `textarea` puro.
- Mobile e bom o bastante para um fluxo de paste-first, mas nao tao natural quanto um `textarea` nativo.

Conclusao: melhor opcao principal.

### 2. Monaco Editor

Pontos fortes:

- Excelente experiencia desktop.
- Muito poderoso para cenarios tipo IDE.

Pontos fracos:

- Bundle e custo de integracao muito maiores.
- Overkill para um produto cujo fluxo principal e colar codigo e enviar para roast.
- Pior ajuste para mobile e para uma homepage performance-sensitive.

Conclusao: nao recomendado como primeira implementacao.

### 3. Textarea + overlay highlight

Pontos fortes:

- Leve e muito confiavel para paste, IME, selecao e acessibilidade.
- Mais proximo do padrao usado pelo Ray.so.
- Facil preservar a shell visual atual.

Pontos fracos:

- Sincronizar caret, scroll, selecao e layout entre `textarea` e camada destacada adiciona fragilidade.
- Manter isso polido no tempo tende a ficar mais caro do que parece.
- Se o objetivo evoluir para um editor melhor, vira limite rapidamente.

Conclusao: bom fallback se quisermos uma V1 extremamente enxuta.

### 4. Shiki como base do editor

Pontos fortes:

- Qualidade visual excelente para highlight read-only.
- Ja existe dependencia de `shiki` no projeto.

Pontos fracos:

- Shiki resolve renderizacao, nao experiencia de edicao.
- Ainda seria necessario outra camada de input/editing.
- Rodar highlight completo no cliente para toda digitacao exige cuidado com performance.

Conclusao: manter Shiki para renderizacao read-only e componentes de exibicao; nao usaria Shiki sozinho como motor principal do editor.

## O que o Ray.so faz e o que vale reaproveitar

Baseado na analise do repositorio `raycast/ray-so`:

- O Ray.so nao usa Monaco nem CodeMirror como editor principal.
- Ele usa `textarea` nativo para input e uma camada separada para exibir o codigo highlightado.
- O highlight e feito com Shiki.
- A deteccao automatica de linguagem e feita com `highlight.js`.
- O usuario pode sobrescrever manualmente a linguagem; quando limpa esse override, volta para auto-detect.
- O editor e client-side e usa lazy-loading de linguagens.

Licoes uteis para este projeto:

- Separar deteccao de linguagem de renderizacao de highlight e uma boa ideia.
- Override manual precisa ter prioridade total sobre auto-detect.
- Lazy-load de linguagens e importante para nao pesar a homepage.
- O fluxo de paste precisa continuar nativo e sem atrito.

Ponto de cautela:

- O approach do Ray.so funciona muito bem para um editor custom leve, mas exige mais manutencao de UX do que um editor dedicado como CodeMirror 6.

## Recomendacao

### Recomendacao principal

Adotar `CodeMirror 6` como motor do editor da homepage.

Arquitetura recomendada:

- `CodeMirror 6` para input/editing.
- Deteccao automatica client-side de linguagem em uma camada separada.
- Override manual de linguagem na UI da homepage.
- Lazy-load apenas das linguagens suportadas inicialmente.
- `Shiki` continua como renderer principal para blocos read-only e possiveis superficies de output.

### Fallback recomendado

Se a meta for uma V1 muito rapida e com o menor risco possivel, usar:

- `textarea` nativo como input.
- preview highlightado separado ou sobreposto.
- deteccao automatica simples.
- seletor manual de linguagem.

Esse fallback entrega o fluxo principal, mas nao deve ser visto como a melhor base caso o editor va crescer.

## Especificacao funcional

### Fluxo principal

1. Usuario abre a homepage.
2. Editor carrega rapido com placeholder atual ou versao refinada dele.
3. Usuario cola ou digita codigo.
4. Sistema tenta detectar a linguagem automaticamente.
5. Highlight e aplicado conforme a linguagem ativa.
6. Usuario pode trocar a linguagem manualmente por um seletor.
7. Ao escolher linguagem manualmente, o auto-detect deixa de mandar no estado.
8. Usuario pode voltar para modo automatico.

### Regras de estado

- `code`: texto bruto do editor.
- `detectedLanguage`: resultado heuristico atual.
- `selectedLanguage`: override manual, inicialmente `null`.
- `activeLanguage`: `selectedLanguage ?? detectedLanguage ?? "plaintext"`.
- `isDetecting`: opcional, caso a deteccao seja assincrona ou lazy.

### Regras de negocio

- Auto-detect roda quando o codigo muda.
- Manual override sempre vence auto-detect.
- Snippets curtos ou ambiguos devem cair em `plaintext` ou linguagem mais segura, nunca em uma aposta agressiva demais.
- O arquivo rotulado na shell pode refletir a linguagem ativa, mas isso deve ser derivado do estado e nao digitado manualmente.
- Se o usuario trocar a linguagem manualmente, essa escolha deve permanecer ate ele selecionar `Auto` novamente.

## Deteccao de linguagem

### Estrategia recomendada

Usar uma camada de deteccao heuristica client-side, desacoplada do renderer.

Diretrizes:

- Suportar inicialmente apenas um conjunto curado de linguagens com alto valor para o produto.
- Mapear aliases e extensoes para um id canonico interno.
- Debounce curto na deteccao apos input/paste para evitar trabalho excessivo em cada tecla.
- Ter fallback seguro para `plaintext`.
- Nao tentar suportar dezenas de linguagens no primeiro corte.

Linguagens sugeridas para V1:

- `javascript`
- `typescript`
- `tsx`
- `jsx`
- `python`
- `json`
- `bash`
- `sql`
- `html`
- `css`
- `java`
- `go`
- `rust`

Observacao: a lista exata deve ser decidida com base no perfil esperado de usuarios e no custo de bundle por linguagem.

## UX do seletor de linguagem

### Recomendacao

Adicionar um seletor pequeno e claro perto do header da shell do editor ou na barra inferior de controles.

Estados sugeridos:

- `Auto` (default)
- linguagens suportadas em lista pesquisavel ou compacta

Comportamento:

- `Auto` mostra tambem a linguagem detectada ao lado, por exemplo: `Auto (TypeScript)`.
- Quando houver override manual, mostrar apenas a linguagem selecionada.
- Se a deteccao estiver incerta, mostrar `Auto (Plain text)`.

## Consideracoes tecnicas

### SSR e App Router

- O editor deve ser um client component.
- Se necessario, o editor pode ser carregado com `dynamic(..., { ssr: false })` para isolar custos de runtime e evitar ruído de hidratacao.
- A homepage ainda deve renderizar estrutura estavel antes da inicializacao completa do editor.

### Performance

- Lazy-load das linguagens do editor.
- Lazy-load ou carga sob demanda do modulo de deteccao, se fizer sentido.
- Evitar recalcular highlight completo sem necessidade em snippets grandes.
- Definir limite de tamanho para comportamento mais sofisticado; acima disso, degradar graciosamente.

### Acessibilidade

- Preservar rotulos claros e foco visivel.
- Manter navegacao por teclado funcional.
- Garantir contraste dentro do tema terminal atual.
- Em mobile, garantir altura minima utilizavel e nao depender de hover.

### Mobile

- O editor nao precisa replicar experiencia desktop completa.
- Prioridade em mobile: colar, ler, rolar, editar pequenos ajustes e selecionar linguagem.
- Se alguma feature avancada piorar a experiencia touch, preferir simplificacao.

## Riscos e tradeoffs

- Auto-detect nunca sera perfeito para snippets curtos ou ambiguos.
- CodeMirror melhora muito a edicao, mas adiciona dependencia e complexidade de integracao.
- Se tentarmos suportar linguagens demais logo de inicio, o bundle e a manutencao pioram.
- Se tentarmos usar apenas Shiki para tudo, a experiencia de editor tende a ficar pior do que o necessario.

## Decisao proposta

Escolha proposta para implementacao:

- Editor: `CodeMirror 6`
- Deteccao: camada heuristica client-side separada
- Override manual: obrigatorio desde a primeira versao
- Highlight read-only fora do editor: continuar com `shiki`

## Escopo sugerido de implementacao

### Fase 1

- Substituir o `textarea` atual por editor com highlight.
- Implementar auto-detect com fallback para `plaintext`.
- Implementar seletor manual de linguagem.
- Suportar conjunto reduzido de linguagens.
- Manter shell visual existente.

### Fase 2

- Refinar heuristicas de deteccao.
- Adicionar persistencia local da ultima linguagem manual escolhida, se fizer sentido.
- Melhorar UX de snippets grandes.
- Revisar nomenclatura do arquivo exibido conforme linguagem ativa.

### Fase 3

- Explorar share state por URL, se isso fizer sentido para o produto.
- Explorar preview highlightado separado ou exportavel.

## To-dos de implementacao

- [ ] Confirmar lista de linguagens suportadas na V1.
- [ ] Decidir biblioteca final de deteccao heuristica.
- [ ] Definir se o editor entra direto na homepage ou via dynamic import sem SSR.
- [ ] Modelar estado `code`, `detectedLanguage`, `selectedLanguage` e `activeLanguage`.
- [ ] Definir API interna de mapeamento entre ids de linguagem, aliases e rotulo exibido.
- [ ] Integrar editor ao visual atual de shell terminal.
- [ ] Implementar seletor `Auto` + override manual.
- [ ] Garantir lazy-load das linguagens suportadas.
- [ ] Definir fallback para snippets muito grandes ou linguagens nao reconhecidas.
- [ ] Validar UX de paste, teclado e scroll em desktop.
- [ ] Validar UX minima em mobile.
- [ ] Rodar `pnpm exec biome check .` e `pnpm exec tsc --noEmit` apos a implementacao.

## Perguntas em aberto

- Quais linguagens sao obrigatorias na V1 e quais podem esperar?
- O produto deve priorizar mais fidelidade visual do highlight ou mais leveza na homepage?
- O seletor de linguagem deve ficar no header da shell, no rodape do editor ou em outro ponto da homepage?
- Queremos persistir a linguagem manual escolhida entre sessoes ou manter comportamento efemero?

## Conclusao

A melhor base para esta feature e `CodeMirror 6` com deteccao automatica separada e override manual explicito. O approach do Ray.so valida duas decisoes importantes: manter deteccao separada do renderer e tratar o input como uma experiencia altamente confiavel. Para este projeto, `CodeMirror 6` entrega um equilibrio melhor entre qualidade de edicao, performance, flexibilidade e manutencao futura do que um overlay custom com `textarea`.
