# Decisions

Non-obvious choices, newest first. One entry per decision: what, why, and what it rules out.

## 2026-10-26 · v2 revision 1: black and white, simpler work, Services page

Changes from Dawid's review of the first v2 pass:

- **No colour.** The palette is true neutral greys from white to near-black. `--color-brand*` now resolve to the ink. The cobalt tokens became an inverse surface: `--color-inverse-bg`, `--color-on-inverse` and `--color-on-inverse-muted` (black in light mode, white in dark), used by the story panel, the mobile menu, buttons and text selection.
- **Case studies are simple tiles on a creative grid** (`WorkGrid` + `WorkCard`). Each tile has a cover, a "Company · Year" line and the outcome title, with no tags or summary. Desktop repeats a four-tile rhythm: wide 4:3, a narrow square set lower, a narrow square indented, then a wide 4:3 set lower. Home shows four tiles and a "View all work" button. Work shows all of them.
- **Removed:**
  - the follow-the-mouse "View case" cursor;
  - the work counter;
  - the numbers section on Home (`Metrics` stays for case studies);
  - the hover colour on services;
  - the Dribbble shots section, along with `ShotsMarquee` and its images;
  - Contact from the main nav.
- **Contact** now sits in the hero after LinkedIn and Dribbble (same link style), in the mobile menu's footer row, and in the sign-off.
- **A dedicated `/services` page.** Data lives in `src/lib/services.ts`, shared with Home. `Services` gained a `detailed` variant that lists deliverables. The page closes with three ways of working together (project, embedded, full-time role), which serves both clients and employers. Services sits in the nav between Work and About.
- **Link hover.** The underline no longer disappears; the hairline thickens to three times its width with an ease-out. Components that hide the line at rest still draw it in on hover.
- **Client logos** are larger (`--space-12` tall) and use the text colour (black, or white in dark mode).

## 2026-10-26 · v2 redesign, first pass (branch `v2`)

Built on `v2` so `main` stays live until the redesign is ready to swap in. The direction comes from the reference synthesis ("calm precision, one loud moment").

- **Audience and offers.** The site speaks to clients and employers. It has three offers: Product Design, Design Systems, and AI and Agentic UX.
- **Type: Geist and Geist Mono** (free, self-hosted with fontsource). Headings use weight 500; the boldness comes from size. h1 is now 40 → 88px and h2 is 30 → 56px. Captions use the mono face. Metric-matched fallbacks keep the font swap shift-free.
- **Colour: cool green-tinted neutrals and cobalt** (`--blue-600` #234AE8). New semantic tokens `--color-brand-bg`, `--color-on-brand` and `--color-on-brand-muted` cover the cobalt surfaces. Figma `mlynarz.com — Foundations` still needs these values.
- **Navigation is a floating top pill.** It holds the M mark, Work, About, a cobalt Contact chip and the theme toggle. The name moved out of the nav into the story. On mobile the pill shows the mark and a Menu button, which opens a full-screen cobalt sheet (a native popover). Close sits where Menu was.
- **Home tells a story.** The order is:
  1. A two-tone hero with the liquid portrait.
  2. A cobalt "About" panel that grows over the held hero, where the about-me statement (with the name) lights up word by word.
  3. Numbers. Two are placeholders (`XX`) until real figures arrive.
  4. Services, each linked to the case studies that prove it.
  5. Work told by outcomes, with a "View case" cursor.
  6. Clients.
  7. Explorations.
  8. A sign-off whose last words cycle.
- **Motion layer replaces "zero JS by default".** One module (`src/scripts/motion.ts`) runs Lenis, GSAP, ScrollTrigger and SplitText on every page, about 50 KB gzipped. It runs only when `html.motion` is set, which happens before first paint unless the visitor prefers reduced motion. Elements marked `[data-reveal]` wait hidden until the script sets them up, and a 3s CSS failsafe shows them if it never does.
- **Page transitions use native cross-document View Transitions.** The old page sinks back and dims, the new one rises as a sheet, and a work cover morphs into the case-study cover (`view-transition-name: cover-<slug>`). The nav stays put. Browsers without support, and reduced motion, get a normal page load.
- **Left for the next passes:** the case-study template (Astapable-style opening), the About story, the "How I work" section, and real numbers.

## 2026-10-26 · Mobile nav is a hamburger menu

Below 48em the bar shows the M mark, the name and a menu button. Work, About, Contact and the theme toggle open in a sheet under the bar. The sheet is a native `popover`, so it needs no JS: Esc and outside clicks close it, and the button exposes its expanded state. The bar now has a fixed height (`--nav-block-size`), so the sheet can sit right below it. Browsers without popover support hide the button and keep the inline menu, which wraps. This replaces the earlier "nav wraps below 375px" behaviour.

## 2026-10-26 · Homepage brought in line with the original site

Compared against the Webflow homepage. The structure is matched and the markup is still written from scratch:

- the split hero, with the portrait bleeding to the right edge
- client logos spread across the row
- the case studies as a one-column list: the text first, then a 3:2 cover that zooms on hover, plus Industry and Business/Model tags
- the "Selected work" shot marquee
- the large email under "Contact me"
- the M logo mark and an email pill in the nav
- a floating back-to-top button

XWP is listed with no page (the new `page: false` field), as on Webflow. These were left out on purpose:

- the "Home" nav link (the logo links home)
- the Resume link (it pointed to `#`)
- the padlocks (the work is public now)
- the hidden profile photo
- the serif heading font (fonts are placeholders)

The clay portrait is now on top, and the liquid reveals the photo.

**Hero photo nudge.** The canvas crop now matches the `<img>` exactly: cover, positioned at the face centre, unrounded box size. There is also a metric-matched fallback for DM Sans and a font preload, so the swap no longer shifts the layout (CLS was 0.22 at 1440px, now 0).

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
