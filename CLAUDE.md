# mlynarz.com — project rules for Claude Code

Portfolio of Dawid Młynarz (product designer). Astro + MDX, plain CSS, deployed on Cloudflare Pages from GitHub.
Replacing a Webflow site with a clean, Webflow-agnostic build. Keep the `/work/<slug>` URL pattern. Read `MIGRATION_PLAN.md` and `DECISIONS.md` first.

## Hard rules

1. **Tokens only.** No hex/rgb/hsl, no raw px for spacing or radius, no magic font sizes outside `src/styles/tokens.css`. Use semantic tokens (`--color-text`, `--space-4`), never primitives, in components.
2. **Reuse before creating.** Check `src/components/` (`layout/`, `ui/`, `blocks/`) first. Add a variant instead of a near-duplicate. Every new component or variant also goes on `/styleguide`. Class names are BEM (`block__element--modifier`).
3. **No Webflow leftovers.** No Webflow parity is required. Never copy Webflow classes, markup or generated CSS; build from current best practice. Anything in `/reference` (git-ignored) is loose reference only.
4. **CSS layers:** `reset, tokens, base, components, utilities`. Component CSS lives next to the component in an Astro scoped `<style>`, wrapped in `@layer components { … }` (unlayered CSS beats every layer). Stylelint enforces this and rule 1.
5. **Content is separate from presentation.** Case studies are MDX in `src/content/work/<slug>/index.mdx` (schema: `src/content.config.ts`), images in the same folder, imported in the MDX and passed to `<Figure>` (alt required). `Figure`, `Video`, `BeforeAfter`, `ImageGrid`, `Metrics`, `Callout`, `Quote` are available in MDX without imports. Use `draft: true` until a case study is reviewed; `protected: true` locks a case study behind the password (`CASE_STUDY_PASSWORD`, a Cloudflare Pages secret): only its blurred locked state is public, and the content is served by `functions/work/_middleware.ts`.
6. **Experiments are isolated.** Code under `src/experiments/<slug>/` may use any framework island and local styles, but may only read site tokens and must not change global CSS.
7. **Light and dark from day one.** Every new component must look right in both themes using semantic tokens only (`--color-*` use `light-dark()`). Check both before calling work done. Tokens mirror the Figma file `mlynarz.com — Foundations` by name; change them on both sides.
8. **Accessibility:** visible focus (`--color-focus`), semantic HTML, respect `prefers-reduced-motion` (including the liquid reveal and link underline).
9. **Performance:** no framework JS by default; hydrate islands lazily (`client:visible`). Motion lives in one module, `src/scripts/motion.ts` (GSAP); scrolling stays native. Keep it lean, and make sure everything it animates is complete without it (no JS, reduced motion).

## Writing in Dawid's voice (all copy on the site)

Applies to every word a visitor reads: page and UI copy, case studies, Grist (except the loot text written for AI tools), alt text, meta descriptions and share images. Dawid has asked for this many times; follow it without being reminded.

- **Start from his words.** When he gives text, keep it. Change as few words as possible, and when a change helps (clarity, SEO), work the words into his own sentence instead of rebuilding it. Show the change next to his original.
- **Punctuation: full stops and commas.** Split a long sentence into two instead of joining clauses.
  - No colons inside a sentence ("Grist is X: a Y"). A colon is fine only as a label in UI ("Season 1:") or before a code block.
  - No em dashes (—) and no en dashes (–) as dashes. A number range may keep the en dash already in the design.
  - No semicolons.
  - Hyphens only inside compound words ("human-curated", "one-line"), never as punctuation.
- **Sound like a person talking.** First person, plain verbs, short and long sentences mixed, a little uneven. Contractions are fine.
- **Avoid AI tells:** "not X, it's Y" and "X instead of Y" punchlines, tidy triplets everywhere, aphorisms as the last line, rhetorical questions, bold on every paragraph, takeaways that restate the page, and the words "seamless", "leverage", "delve", "robust", "game-changer", "the turning point", "the biggest lever".
- **Before shipping any copy,** reread it for `:` `—` `–` `;` and the words above, and fix them.

## Writing case studies

- Write only what Dawid did, in his voice (first person, plain, like the NerdWallet and BeatStars pages). Facts come from him; anything not from him is flagged before it ships.
- Numbers: never invent one silently. If Dawid asks for an estimate, label it "(estimate)" on the page and note it in a one-line MDX comment.
- Follow "Writing in Dawid's voice" above, with specific details from the work.
- `<Metrics>` takes at most three numbers.
- A `<Quote>` sits between two paragraphs of text, never right before or after a `Figure`, `Video`, `BeforeAfter` or `ImageGrid`.

## Writing Grist drops

Use the `grist-entry` skill (`.claude/skills/grist-entry/`) and its `voice.md`, on top of "Writing in Dawid's voice". Dawid writes the Why; Claude formats and flags what it added with a `CLAUDE:` comment, which production builds refuse to publish. Every drop says `status: tested` or `trying`.

## Commands

`npm run dev` · `npm run build` · `npm run check` (astro check + stylelint + prettier)

## Definition of done for any change

Builds, `npm run check` passes, looked at in browser at 375 / 768 / 1440px, and `/styleguide` still renders.
Log non-obvious decisions in `DECISIONS.md`.
