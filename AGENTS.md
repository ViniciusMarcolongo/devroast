# Devroast

- App purpose: roast pasted code with a sharp terminal-style UI and clear output surfaces.
- Product focus: static-first UX, clean flows, reusable primitives, no fake backend wiring.
- Planning rule: create or update a spec in `specs/` before implementing a new feature.
- Stack: Next.js App Router, React 19, Tailwind CSS v4, `tailwind-variants`, Base UI, Shiki.
- Backend rule: `tRPC` is the default API layer for app-facing reads and writes; `Drizzle` stays the data layer behind it.
- Visual rules: preserve the dark terminal language from Pencil, monospace-first hierarchy, subtle borders, green accent only where it carries meaning.
- Component rules: prefer composition for UI pieces with internal structure; keep data-driven widgets simple when composition adds noise.
- Layout rules: shared navbar lives in `src/app/layout.tsx`; page content stays centered with a max width unless the pattern truly needs full bleed.
- Code rules: use named exports, keep APIs small, use `cn(...)` for class merging, avoid comments unless they add real clarity.
- Validation: run `pnpm exec biome check .` and `pnpm exec tsc --noEmit` after meaningful UI or backend refactors.
