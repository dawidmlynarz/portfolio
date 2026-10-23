# mlynarz.com — project rules for Claude Code

Portfolio of Dawid Młynarz (product designer). Astro + MDX, plain CSS, deployed on Cloudflare Pages from GitHub.
Replacing a Webflow site with a clean, Webflow-agnostic build. Keep the `/work/<slug>` URL pattern. Read `MIGRATION_PLAN.md` and `DECISIONS.md` first.

## Hard rules

1. **Tokens only.** No hex/rgb/hsl, no raw px for spacing or radius, no magic font sizes outside `src/styles/tokens.css`. Use semantic tokens (`--color-text`, `--space-4`), never primitives, in components.
2. **Reuse before creating.** Check `src/components/` (`layout/`, `ui/`, `blocks/`) first. Add a variant instead of a near-duplicate. Every new component or variant also goes on `/styleguide`. Class names are BEM (`block__element--modifier`).
3. **No Webflow leftovers.** No Webflow parity is required. Never copy Webflow classes, markup or generated CSS; build from current best practice. Anything in `/reference` (git-ignored) is loose reference only.
4. **CSS layers:** `reset, tokens, base, components, utilities`. Component CSS lives next to the component in an Astro scoped `<style>`, wrapped in `@layer components { … }` (unlayered CSS beats every layer). Stylelint enforces this and rule 1.
5. **Content is separate from presentation.** Case studies are MDX in `src/content/work/<slug>/index.mdx` (schema: `src/content.config.ts`), images in the same folder, imported in the MDX and passed to `<Figure>` (alt required). `Figure`, `ImageGrid`, `Metrics`, `Callout`, `Quote` are available in MDX without imports. Use `draft: true` until a case study is reviewed.
6. **Experiments are isolated.** Code under `src/experiments/<slug>/` may use any framework island and local styles, but may only read site tokens and must not change global CSS.
7. **Light and dark from day one.** Every new component must look right in both themes using semantic tokens only (`--color-*` use `light-dark()`). Check both before calling work done. Tokens mirror the Figma file `mlynarz.com — Foundations` by name; change them on both sides.
8. **Accessibility:** visible focus (`--color-focus`), semantic HTML, respect `prefers-reduced-motion` (including the liquid reveal and link underline).
9. **Performance:** ship zero JS by default; hydrate islands lazily (`client:visible`).

## Commands

`npm run dev` · `npm run build` · `npm run check` (astro check + stylelint + prettier)

## Definition of done for any change

Builds, `npm run check` passes, looked at in browser at 375 / 768 / 1440px, and `/styleguide` still renders.
Log non-obvious decisions in `DECISIONS.md`.
