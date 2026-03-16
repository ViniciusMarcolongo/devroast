# UI Component Standards

- Build generic, reusable visual primitives in this folder for use across multiple pages.
- Use `named exports` only. Never use `default export`.
- Prefer one component per file, with the main component name matching the file name when practical.
- Write components in TypeScript and extend native element props with `React.ComponentProps<"...">` or the appropriate intrinsic element type.
- Use `forwardRef` for interactive primitives such as `button`, `input`, `textarea`, and similar components.
- Keep the public API small and composable; prefer props and variants over one-off component forks.

## Styling

- Use Tailwind CSS for all styling.
- Use `tailwind-variants` when a component has multiple visual variants, sizes, or states.
- Use `tailwind-merge` through the shared `cn` helper from `@/lib/utils` to merge consumer `className` values safely.
- Prefer design tokens and theme variables defined in `src/app/globals.css` instead of scattering raw color values across components.
- Follow the visual language already defined by existing components before introducing new styles.

## Variants

- Define variant maps near the top of the file with `tv(...)`.
- Export the variant helper when useful, e.g. `export { buttonVariants }`.
- Export the prop type combining native props and variant props, e.g. `type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>`.
- Use sensible `defaultVariants` so the component works well with minimal usage.

## Accessibility

- Preserve native HTML semantics whenever possible.
- Do not remove focus styles; prefer accessible `focus-visible` treatments.
- Respect disabled states with both semantics and visual feedback.
- Keep interactive elements keyboard accessible by default.

## File conventions

- Import order: React/external libs first, then internal aliases.
- Use ASCII by default.
- Avoid comments unless they explain a non-obvious decision.
- Keep helpers local if they are component-specific; move them to `src/lib` only when shared.

## Example checklist

- Native props extended correctly
- `forwardRef` used when appropriate
- `named export` only
- Tailwind styles only
- `tailwind-variants` used when variants are needed
- `cn(...)` applied to merge `className`
- Accessible focus and disabled states included
- Build passes with `pnpm check` and `pnpm build`
