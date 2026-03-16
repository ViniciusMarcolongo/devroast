# Devroast

Devroast e um app para colar codigo, levar uma roastada e entender por que aquele trecho merece vergonha publica.

Ele combina uma interface inspirada em terminal com feedback rapido de revisao de codigo, um leaderboard de vergonhas e uma personalidade mais afiada sem perder utilidade.

## O que faz

- permite colar codigo em um editor com cara de terminal
- prepara o fluxo para escolher o modo de roast e futuros resultados de analise
- mostra um leaderboard publico com os snippets mais questionaveis
- usa componentes reutilizaveis desenhados a partir do Pencil

## Estado atual

Esta versao ainda e static-first.

- a home e o leaderboard ja podem ser navegados
- o editor de codigo ja e interativo
- a acao principal de roast ainda nao esta conectada a uma API
- a base visual e o sistema de componentes estao sendo consolidados antes da integracao com backend

## Sensacao do produto

O Devroast foi pensado para parecer:

- uma ferramenta de code review com personalidade
- uma interface de terminal sem sacrificar clareza
- um produto divertido que ainda respeita legibilidade e estrutura

## Telas atuais

- `Home` - cole seu codigo, escolha o roast mode e comece o fluxo de analise
- `Leaderboard` - veja os piores codigos da internet, ranqueados por vergonha

## Proximos passos

- resultados reais de roast com base no codigo enviado
- saidas de analise e diffs mais ricos
- integracao com API para envios e dados do leaderboard

## Desenvolvimento local

```bash
pnpm dev
```

Depois, abra `http://localhost:3000`.
