# Devroast

Devroast is an app for pasting code, getting roasted, and understanding why the code deserves it.

It combines a terminal-inspired interface with quick code review feedback, a shame leaderboard, and a product voice that feels blunt without losing usefulness.

## What it does

- lets you paste code into an editor-style input
- prepares the flow for roast mode and future analysis results
- shows a public leaderboard of the most questionable snippets
- uses reusable UI primitives designed from Pencil

## Current state

This version is still static-first.

- the homepage and leaderboard are already navigable
- the code editor is interactive
- the roast action is intentionally not connected to an API yet
- the UI and component system are being shaped before backend integration

## Product feel

Devroast is built to feel like:

- a code review tool with personality
- a terminal interface without becoming hard to use
- a playful product that still respects clarity and structure

## Screens today

- `Home` - paste code, choose roast mode, and start the review flow
- `Leaderboard` - browse the worst code on the internet, ranked by shame

## Coming next

- actual roast results based on pasted code
- richer analysis output and diffs
- API integration for submissions and leaderboard data

## Local development

```bash
pnpm dev
```

Then open `http://localhost:3000`.
