# Decisions

Non-obvious choices, newest first. One entry per decision: what, why, and what it rules out.

## 2026-10-26 · About hero: the "mindblown" experiment

The About page opens with Dawid's approved HTML prototype, ported 1:1 as an isolated experiment in `src/experiments/mindblown/` (component, scoped CSS, `init(root)`/`destroy()` script, card copy in `content.ts`). The centred "Get to know me" intro sits on the same dotted backdrop above the stage, so the old intro paragraph is gone; everything else on the page follows the stripe unchanged.

- Theme colours map by role to semantic tokens (ink → `--color-text`, paper → `--color-bg`, mute → `--color-text-muted`, dots → `--color-border-subtle` mixed into the background, stripe → inverse surface), so the section follows light/dark. The portrait is a sticker: its white outline and the brain, scissors and hole art keep fixed local colours in both themes. Confetti colours are local.
- Type uses the site face and type tokens by role (labels `--text-small`, tags/kicker `--text-caption`, popover title and stripe `--text-h3`, body `--text-body`). Gochi Hand (self-hosted via Fontsource, loaded only on this page), the handwritten sizes and the big stat number stay local.
- Stylelint relaxes hex, `rgb()` and raw lengths for `src/experiments/**` only; layers, BEM and the primitive ban still apply. Everything is under `.mindblown`, so nothing leaks into the site.
- Uses the site's GSAP 3.15 instead of the prototype's 3.12.5. The popover panel has `data-lenis-prevent` so it scrolls natively under Lenis.
- Not on `/styleguide`: it is a one-off page section, not a reusable component.
- Review round 1: the intro now sits inside the stage and fades out when the head opens; the stage is only as tall as intro plus head. Thoughts no longer use fixed slots: on every open they scatter at random in a band around the head (widening only if they don't fit), clear of the face, lid and notes. Phones (stage under 720px) show 6 random thoughts in a 3-column grid. Above 1000px the pills and their dots are 50% bigger.
- Review round 2: 10 random thoughts on desktop, 4 on phones (also scattered at random, at the desktop size); both hand-written hints sit right of the head above the shoulder; the hole spans the full cut; stars sit between ribbon items with equal space; the popover close is a plain X; client logos are off the About page.
- The prototype relied on content-box sizing, so the stage keeps it. No CSS `translate` next to `transform` in this file: the production minifier drops it (that is what moved the hole and made the brain sit low).

## 2026-10-26 · Work tiles cropped to 4:3

Every case-study cover in the work grid is cropped to 4:3 (`object-fit: cover`, centred), so tiles of different widths read as one set. This replaces "covers keep their original ratio" from v2 revision 2. The case-study page still shows the cover uncropped. If a cover crops badly, set a per-entry focal point (an `object-position` field in the schema) rather than changing the ratio.

## 2026-10-26 · Client logos as an endless marquee

Above the footer on Home, the logos loop endlessly, full width, at every screen size (`ClientLogos marquee`).

- **How it loops:** pure CSS. The list renders twice (the copy is `aria-hidden`, with its own SVG ids) and slides left by one copy over `--duration-marquee` (40s). Each copy ends with the same gap it has between logos (`--space-24`, or `--space-16` below 48em), so the seam is invisible.
- **Polish:** the edges fade into the page with a mask, and hovering pauses it.
- **Reduced motion:** one static, centred, wrapping row.

## 2026-10-26 · Logos back above the footer

On Dawid's call, the About story is back to its original form: the panel grows, the statement lights up word by word, and nothing else is in it (260svh track, no "More about me"). The client logos are a "Trusted by teams at" section again, the last one on Home before the footer, spread across the width in the text colour. `ClientLogos` lost its strip variant and `StoryIntro` its `after` slot, since nothing uses them now.

## 2026-10-26 · v2 revision 2: logo highlight, mobile bar, fade, SEO

- **Logos light up one by one** (superseded: see "Logos back above the footer") in the About story after the statement, using the same dim-to-bright treatment as the words. The repeated, sliding strip is gone. From 62em the ten logos fit the width (32px tall, 40px from 80em). Below that, the one finite line slides along as the logos light up (or swipes, without motion). `.story__inner` uses `minmax(0, 1fr)`, so the wide line can't widen the text column.
- **Mobile nav is a full-width bar**: the M on the left and a two-line menu button on the right. The menu opens with the theme switch's "ink spread", now shared as `src/scripts/spread.ts`. It grows from the button and closes by shrinking back into it. The sheet repeats the bar, so the close button replaces the menu button in place. Without JS it is still a native popover.
- **Content changes:**
  - "More about me" is removed from the story.
  - The hero label reads "Agentic UX • AI-ready design systems • Product strategy".
  - Services are now Product Strategy, Design Systems (AI-ready in the copy) and Agentic UX.
- **Covers keep their original aspect ratio.** The grid only varies tile width and offset.
- **Portrait on load:** the liquid intro is replaced by a plain opacity fade (0 → 100%, `--duration-fade`), triggered when the static image has decoded, with a 3s failsafe.
- **SEO:**
  - The default description now leads with the three services.
  - Open Graph and Twitter tags include image, size, type, alt and locale. The site-wide image is Dawid's `og.png`. Case studies use `og:type` article and a 1200×630 crop of their cover.
  - JSON-LD: WebSite + Person on Home, CreativeWork on case studies.
  - New favicon set from the M mark: `favicon.svg`, `favicon.ico` (16/32), `apple-touch-icon.png`, 192/512 icons and `site.webmanifest`, plus `theme-color`.

## 2026-10-26 · Logo strip in the story, liquid load reveal, nav pill polish

- **New client logos.** There are ten, from Dawid's set, on a shared 48px artboard: Newsweek, Google, Twitch, Pearson, HolidayCheck, Pantheon, BeatStars, XWP, X-Team and Zazmic. Passion is gone. Only black is recoloured to `currentColor`, because white appears solely inside their masks and clip paths. Mask and clip ids get a per-copy suffix so repeated logos stay valid.
- **The logos live in the About story on Home** (`ClientLogos strip` in the `after` slot of `StoryIntro`). The strip is three copies on one line, and once the words have lit up the motion layer slides it left to right by one copy's width. The story track is now 380svh to give it room. The standalone "Trusted by teams at" section was removed. Without motion the strip is a plain row.
- **Liquid load reveal.** On load, the portrait pours in from the face: a liquid blob with drifting lobes grows over two seconds (ease in-out), using the same iso-surface and wobble as the hover liquid. The orbiting liquid then fades in. The static image waits hidden under the motion layer, and a 3s failsafe shows it if the script never gets ready. Reduced motion skips the intro.
- **Descenders in line reveals.** SplitText's line masks were exactly one line tall and cut the "g" in "Transforming" at 0.98 leading. The masks now bleed `--line-mask-bleed` (0.16em) below, with a matching negative margin, so spacing is unchanged.
- **Nav pill.** Every item is `--nav-item-size` (40px) tall, with an even `--space-1` inset all round. The theme switch matches the M circle. On hover the M no longer scales; it rolls up out of the circle while its twin rolls in from below.

## 2026-10-26 · Theme: light by default, switched only by the visitor

- **Two states, no system mode.** The toggle switches between light and dark, and the OS preference is ignored. `:root` is `color-scheme: light` and only `data-theme="dark"` turns dark, so `light-dark()` tokens keep working. The choice is saved in `localStorage` and applied before first paint. The toggle is an `aria-pressed` "Dark mode" button, and its sun and moon icons turn into each other.
- **Transition: "ink spread".** The new theme grows as a circle from the toggle over the old one (a same-document View Transition, `theme-spread` in base.css, `--duration-page`). Named transition elements are flattened for this transition so everything switches together. `themechange` carries `waitUntil` so the liquid portrait can repaint with the right clay before the new state is captured (capped at 400 ms). With reduced motion, or no View Transitions, the switch is instant.
- **Light clay updated** to Dawid's latest `clay.avif` from Webflow (same framing).
- **Fix:** the mobile menu sheet inherited `pointer-events: none` from the floating nav wrapper, so its links, Close and theme toggle could not be tapped. It now takes pointer input like the pill.

## 2026-10-26 · Black clay for the dark theme

`LiquidReveal` takes an optional `clayDark` image (`portrait-clay-dark.avif`, Dawid's `clay-black.avif` from Webflow, same 2400×1792 framing). It blends into the black page where the white clay looked cut out.

- **Static image:** both clays are rendered, and CSS shows the one for the current theme. Both are `loading="lazy"` with high fetch priority, so the hidden one is never fetched.
- **Canvas:** it loads only the clay its theme needs and swaps on `themechange` or an OS scheme flip, fetching the other variant the first time it is needed.

## 2026-10-26 · Portrait sources: 2400px AVIF from Webflow

The liquid reveal now uses the higher-quality pair Dawid uploaded to Webflow (`realphoto.avif`, `clay.avif`). They are 2400×1792 with transparency and use the same framing as the old 1200px PNGs (the alpha masks match), so the face crop is unchanged. Both layers are now served as AVIF at quality 70 rather than WebP, since WebP re-encodes of the new sources were larger. The largest photo variant is 140 KB.

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
