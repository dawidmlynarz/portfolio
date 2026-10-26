# Decisions

Non-obvious choices, newest first. One entry per decision: what, why, and what it rules out.

## 2026-10-26 · No display role: the type scale starts at h1

`--text-display`, `--leading-display`, `--tracking-display` and the `.text-display` class are removed. The largest size is now `--text-h1` (34 → 64px); the Home and generic Hero headlines are plain `h1`s. Figma: remove the display style/variables from `mlynarz.com — Foundations` to keep both sides in sync.

## 2026-10-26 · All case studies published; UI Design Showcase dropped

Dawid published the remaining drafts (BeatStars Product Design, BeatStars Design System, CSS Peeper) and chose to skip UI Design Showcase entirely: its content and images were removed. Its old Webflow URL redirects to `/work` (301, `public/_redirects`) so existing links don't 404. Drafts, `protected` and `SHOW_PROTECTED_DRAFTS` remain for future work.

## 2026-10-26 · Formerly protected case studies made public

Dawid chose to publish Newsweek Design System, NerdWallet, Google Material Design and Pantheon, which were password-protected on Webflow. `protected` was removed and `draft: false` set. Pantheon has facts and cover only (its Webflow page was a placeholder). The `protected` flag and `SHOW_PROTECTED_DRAFTS` stay available for future private work.

## 2026-10-23 · Phase C (batch)

**All case studies migrated as drafts.** Newsweek Design System, NerdWallet, BeatStars Product Design, Google Material Design for WordPress, BeatStars Design System and CSS Peeper have their full Webflow text and every original image (50, full resolution). Pantheon's Webflow page was a "Work in Progress" placeholder, so it has card data and facts only; CSS Peeper keeps the part before its "Work in Progress" block. `UI Design Showcase` is migrated too, to keep its URL, but stays a draft: it ends with a confidentiality notice saying it was prepared for a job application under NDA.

**Converted by script, reviewed by hand.** Webflow nodes were converted to MDX (headings, lists, bold/italic, links, images with captions), then each page was read through. Fixes are limited to source glitches: misplaced bold markers, a duplicated closing paragraph, `#` placeholder links unlinked, one link with a stray `#`, a duplicated "Background" heading, Pantheon's tags copied onto CSS Peeper, and typos ("Simultaneousely", "the Newsweek"). Bold label paragraphs ("Key achievements", "Objectives"…) became `###` subheadings.

**Alt text written for every image** from the images themselves (Webflow had none). Captions come from the showcase's "👆" lines.

**Drafts get pages on previews; protected drafts don't.** Preview builds now build and link drafts so they can be reviewed at their real URL (still `noindex`). Case studies that were password-protected on Webflow carry `protected: true` and stay unlinked cards on previews, because preview URLs are publicly reachable. Setting `SHOW_PROTECTED_DRAFTS=true` (only for a preview environment behind Cloudflare Access) builds them too. Production never builds drafts.

**`lead` field.** The page intro under the headline differs from the card summary on most Webflow pages, so case studies have an optional `lead`.

**Card tags vs page tags.** Pages use the tags from their own Webflow header; CSS Peeper keeps its card tags because its header carried Pantheon's.

## 2026-10-23 · Phase C (pilot)

**Content comes from Webflow, read-only, through its API.** Page text was read with the Webflow connector; images were downloaded from the originals on `s3.amazonaws.com/webflow-prod-assets` (full resolution, up to 3840px). Webflow's CDN (`cdn.prod.website-files.com`) and the live site are blocked by this environment's network policy, so the published HTML was not used. Nothing in Webflow was changed.

**One folder per case study.** `src/content/work/<slug>/index.mdx` with its images beside it; the folder name is the slug, so URLs stay `/work/<slug>`. The schema lives in `src/content.config.ts` (cover alt text is required).

**Drafts carry card data only (superseded by the batch below).** The XWP design-ops card has no case-study page on Webflow and is not migrated.

**MDX components need no imports.** `Figure`, `ImageGrid`, `Metrics`, `Callout` and `Quote` are passed to every case study by `src/pages/work/[slug].astro`; MDX files only import their own images. `BeforeAfter` and `Process` from the plan are deferred until a case study needs them.

**Prose breakout grid.** Text sits at `--measure`; `data-width="wide" | "full"` children (figures, image grids, metrics) break out to the page width or the viewport edge.

**Newsweek AI pilot: AI sections only.** The Webflow page repeats the Newsweek Design System story from "Objectives" onward (and duplicates a paragraph); Dawid chose to migrate only the AI-specific sections. Its two images are from the redesign, not the AI product. Copy is otherwise verbatim except "a century" / "an AI-native" in the headline.

**Home hero bleeds right.** Matching the Webflow hero: headline left, portrait on the right running to the viewport edge (60% of the width, full hero height) on desktop; full-bleed square below the text on mobile. `LiquidReveal fit="fill"` with face-aware framing handles any box.

**Client logos are inlined and recoloured.** Black fills become `currentColor` (muted text), white knock-outs become the page background, so they work in dark mode. The Pearson "P" was an embedded black PNG; it is now used as an alpha mask over a `currentColor` rect.

**Stylelint: allow `:global()`, drop `no-descending-specificity`.** `:global()` is how scoped styles reach MDX content; the specificity-order rule fights BEM modifiers, and cascade layers already set precedence.

**Unresolved, for Dawid:** the Webflow "Resume" link pointed to `#` and is left out; "INTJ" was styled as a link without a target.

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
