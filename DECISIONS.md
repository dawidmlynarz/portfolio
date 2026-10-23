# Decisions

Non-obvious choices, newest first. One entry per decision: what, why, and what it rules out.

## 2026-10-23 · Liquid portrait reveal

**Rebuilt from the original Webflow embed, same motion model.** `src/scripts/liquid-reveal.ts` is a faithful TypeScript port of `liquid-reveal.js` (Oct 19, 2026): sprung head orbiting the face at rest, magnet + tendril towards the pointer, healing trail, droplets, drifting lobes, wobbling iso-surface edge, face-aware framing. Defaults are unchanged (size 22, soft 30, pull 55, wobble 55, heal 1.8 s, orbit 40) and exposed as typed props. Replaces the Phase B placeholder metaball effect.

What changed versus the embed, and why:

- **A real `<img>` underneath.** The embed rendered only a canvas, so the hero image was invisible without JS and late for LCP. Now the top image is a responsive `astro:assets` image (alt text, `fetchpriority` when eager); the canvas fades in over it once both images decode.
- **Theme-aware.** The embed flattened onto a hard-coded `#ffffff`. Both cutouts are now flattened onto the resolved `--color-bg` and re-flattened on `themechange` or an OS scheme change. In dark mode the black T-shirt dissolves into the background, which reads as intentional.
- **Smaller images.** 1.1 MB of PNG becomes ~126 KB of WebP with alpha at full size (1200px), smaller on phones. The canvas loads the photo/clay pair at the width actually drawn.
- **Clean-up.** Window listeners are tied to an `AbortController` and removed when the element leaves the page. The loop still pauses off screen and in hidden tabs.
- **Square on narrow screens.** Below 48em the box is 1:1 instead of the photo's 4:3, so the face reads ~35% larger; the framing keeps the face in frame at any ratio.
- **Reduced motion follows the original design**: no orbit, wobble or droplets; the liquid appears only while pointing (user-initiated) and snaps to the cursor. Supersedes the Phase B "does nothing" behaviour.

**New token `--duration-reveal` (600ms).** Canvas fade-in. Needs mirroring in Figma.

**Source images are 1200px.** Fine up to ~600 CSS px on retina; the hero column at 1440 is ~620px, so it is at the edge. 2400px versions of both cutouts (same framing) would make it crisp on large retina screens.

## 2026-10-23 · Phase B

**Components are proposed, not ported.** Nav, Hero and LiquidReveal are new designs built from the tokens (Dawid's call: "you propose"). Fonts and brand colors stay placeholders; components read tokens only, so swapping them later touches `tokens.css` alone.

**Class-based style scoping (`scopedStyleStrategy: "class"`).** With Astro's default attribute scoping, a parent's scoped rule (e.g. `.nav__inner` set on `<Container class="nav__inner">`) never reaches the child's root element. Class scoping passes the scope through `class`. This broke the Nav and Hero layouts until switched.

**BEM class names, enforced.** `block`, `block__element`, `block--modifier`, kebab-case parts (Stylelint `selector-class-pattern`). Scoping already prevents collisions; BEM keeps the markup readable.

**Link underline is a background, tuned by custom properties.** Every `a` gets the animated underline from `base.css`; components change `--underline-size` / `--underline-origin` (nav and quiet links: hidden at rest, grow on hover) instead of re-implementing it.

**Buttons use `--color-bg` as the text color on brand.** It gives white on blue in light and near-black on light blue in dark, both high contrast, without adding an `--color-on-brand` token to Figma. Add that token if the brand color ever stops contrasting with the background.

**New token `--blur-nav` (12px).** The nav's backdrop blur. Needs mirroring in Figma (Effects).

**Nav elevation without JS.** A scroll-driven animation (`animation-timeline: scroll(root)`) adds the border and shadow after the first `--space-16` of scroll. Browsers without support get the border always on. The timeline sits in a separate rule because the CSS minifier otherwise folds it into an `animation` shorthand containing `scroll()`, which browsers reject.

**Theme toggle cycles system → light → dark.** One button keeps the nav fitting at 375px; the accessible label states the current and next mode. Hidden without JS (the OS theme still applies). Fires a `themechange` event for theme-aware components.

**Nav wraps below 375px.** Name, three links and the toggle fit on one line from 375px; narrower screens (320px) wrap the menu under the name instead of overflowing.

**Placeholder images live in `src/assets/placeholders/`.** Generated abstract images for the styleguide; real images arrive in Phase C. The portrait is real (see below).

## 2026-10-23 · Phase A

**Repo is `dawidmlynarz/portfolio`, not `mlynarz-site`.** The session was already attached to it; the name has no effect on the site. The npm package name stays `mlynarz-site`.

**Clean build, no Webflow parity.** The site is built from best front-end practice, not reverse-engineered from Webflow. No Webflow inventory or export is required to proceed; if an export is ever added it lives in `/reference` (git-ignored) as loose reference only. URLs keep the `/work/<slug>` pattern so the domain keeps its search history; the redirect map in Phase E covers anything that changes.

**Unpublished Webflow navbar/typography changes: reverted.** The live site is the fallback during cutover, so it stays as published.

**Extensionless URLs, no trailing slash.** `build.format: "file"` + `trailingSlash: "never"` produces `/about.html`, which Cloudflare Pages serves at `/about`. Canonical URLs strip `.html` (see `BaseLayout.astro`).

**Indexing is opt-in per environment.** Only a build where `CF_PAGES_BRANCH === "main"` is indexable (`src/lib/site.ts`). Every other build emits `noindex` meta and a `Disallow: /` robots.txt. `public/_headers` also sends `X-Robots-Tag: noindex` on every `*.pages.dev` hostname, so even the production alias stays out of search; only `mlynarz.com` is indexed.

**Cascade layer order is pinned inline in `<head>`.** Layer order is decided by first appearance; bundle order is not guaranteed once pages get their own CSS chunks. A one-line inline `@layer` statement before any stylesheet removes that risk.

**Astro scoped styles must be wrapped in `@layer components`.** Unlayered CSS beats every layer, so a bare scoped `<style>` would silently override utilities. Enforced by `tooling/stylelint-require-layer.mjs`.

**"Tokens only" is enforced by Stylelint, not by review.** Outside `tokens.css`: no hex/named/`rgb()`/`hsl()`/`oklch()` colors, no raw px/rem/em on spacing, inset, radius or font-size, and no primitive tokens (`--neutral-*`, `--blue-*`). `calc()` on tokens and unitless `0` stay allowed.

**Only DM Sans is installed.** The plan listed Playfair Display, but `tokens.css` has no serif role and the type faces are placeholders until the new ones are chosen. Swap by installing a fontsource package, importing it in `global.css`, and changing `--font-heading` / `--font-body`.

**TypeScript 6, not 7.** `@astrojs/check` peers on the TS 6 JS API; npm resolved 6.0.x. Revisit when the Astro language server supports TS 7.
