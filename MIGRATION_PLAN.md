# Webflow → self-hosted migration plan (mlynarz.com)

Stack: **Astro + MDX + plain CSS (tokens + cascade layers), GitHub, Cloudflare Pages.**
Scope found in Webflow: 14 pages (Home, About, Work index, 10 case studies, 404, 401 password), **no CMS collections**.
Companion files: `src/styles/tokens.css` (token system), `CLAUDE.md` (rules for Claude Code), `DECISIONS.md` (decision log).
Repo: `dawidmlynarz/portfolio`. **Status: Phase A done, awaiting review.**

> **Update (2026-10-23):** no Webflow parity is required. The site is a clean, Webflow-agnostic build; the Webflow export, inventory and token audit (section 4) are optional background, not inputs. URL pattern and domain cutover are unchanged.

## 0. Principles

- The old site stays live until the new one is approved. Cutover is a DNS switch, reversible in minutes.
- Content (MDX), tokens, and components are separate, so the planned redesign changes tokens and components, never the writing.
- Do not port Webflow CSS. Port intent into tokens and components.
- Same URLs (`/work/<slug>`), so no SEO loss.

## 1. Your setup tasks (before Claude Code starts)

1. ~~**GitHub:** create a private repo.~~ Done: `dawidmlynarz/portfolio`.
2. ~~**Cloudflare:** create a free account.~~ Done. Do NOT move the domain yet.
3. **Content source:** the case-study text and full-resolution original images are still needed for Phase C (export from Webflow or provide directly). Webflow code/CSS is not needed.
4. **Registrar and DNS inventory:** find where `mlynarz.com` is registered and where its DNS lives. Screenshot all DNS records, especially MX, SPF, DKIM, and DMARC records for `hello@mlynarz.com`.
5. ~~**Decide the Webflow state.**~~ Decided: revert the unpublished navbar and typography changes.
6. Collect: analytics IDs, any forms or embeds, the favicon, and the OG image.

## 2. Phases

### Phase A: Technical foundation

- Scaffold Astro (TypeScript strict), MDX, sitemap, `astro:assets`.
- Tooling: Prettier, Stylelint (ban raw colors and spacing outside tokens), `astro check`, one `npm run check` script.
- `CLAUDE.md`, `DECISIONS.md`, `.editorconfig`.
- Connect the repo to Cloudflare Pages. Every branch gets a preview URL. Previews are `noindex`.
- Self-host fonts (DM Sans variable, Playfair Display) via fontsource. Never load Google Fonts at runtime.

### Phase B: Design system

- `src/styles/tokens.css`, `base.css`, `reset.css` with layers `reset, tokens, base, components, utilities`.
- Layout primitives: Container, Stack, Grid, Section.
- UI: Link (animated underline is the default `a`), Button, Tag, Figure.
- Blocks: Nav (sticky, as designed), Footer, Hero, LiquidReveal (self-contained, respects reduced motion).
- `/styleguide` route (noindex, excluded from sitemap) rendering tokens and all components with variants.
- Gate: styleguide reviewed and approved before pages are built.

### Phase C: Pages and case studies

- Home (split hero + liquid reveal), About, Work index, 404.
- Content collection `work` with Zod schema: title, company, role, year, tags, cover (+alt), summary, metrics, draft.
- `CaseStudy` layout plus MDX components: Figure, ImageGrid, BeforeAfter, Metrics, Quote, Callout, Process, NextProject.
- **Pilot:** migrate Newsweek AI first. Review. Then migrate the other 9 in a batch.
- `/401` password page: drop it, or protect specific pages with Cloudflare Access (decide).

### Phase D: Experiments section

See section 5. Set up the structure now, build experiments later.

### Phase E: QA

- Per page at 375 / 768 / 1440px; keyboard navigation; reduced motion; Lighthouse (aim for green on all four).
- SEO: titles, descriptions, OG images, canonical URLs, `sitemap.xml`, `robots.txt`.
- Redirect map for any URL that differs from the old site (`public/_redirects`). Test every old URL.
- Analytics and forms ported (if any).

## 3. Domain cutover

Cloudflare Pages needs the domain's DNS on Cloudflare for an apex domain, so DNS moves first and the site moves second.

**T-7 days: prepare DNS (no visible change)**

1. Add `mlynarz.com` to Cloudflare. Recreate **every** existing record exactly, including email (MX, SPF, DKIM, DMARC) and the current Webflow records.
2. Lower TTLs at the current DNS provider to 300s.
3. At the registrar, switch nameservers to Cloudflare. Verify the site and email still work.

**Cutover day** 4. Final content freeze. Run the full QA checklist on the preview URL. Get your approval. 5. In Cloudflare Pages, add the custom domains `mlynarz.com` and `www.mlynarz.com`. Replace the Webflow DNS records with the Pages ones. Redirect one hostname to the other. 6. Test: every URL, the 404, HTTPS, the redirects, and email send/receive. 7. Submit the sitemap in Google Search Console.

**Rollback:** point the apex/www records back at Webflow (keep the old values saved). Takes minutes at TTL 300s.

**After:** keep the Webflow plan for 2–4 weeks as a fallback, then cancel. Remove the domain from Webflow only at that point.

## 4. Token audit (Webflow → agnostic)

Source: 1 variable collection, 38 variables.

| Finding                                                                                                          | Action                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Webflow naming leaks: `neutral 1` (spaces), `colors--background-primary` (double dash from slashes)              | Rename to a clean convention: primitives `--neutral-500`, semantic `--color-bg`                              |
| Neutral scale numbered darkest-to-lightest (1 = darkest) and mixed formats (named, hex, hsla)                    | Numeric 50–950 scale, lightest first, all hex                                                                |
| `font/display` and `font/serif` are both Playfair Display                                                        | Merge into `--font-serif`                                                                                    |
| Only 2 border roles used; subtle line `#ebebeb` is a raw primitive                                               | Add `--color-border-subtle`; add `--color-focus` and a focus-visible style                                   |
| `neutral 2` (#7a7a7a) is 4.3:1 on white                                                                          | Fine for borders; never use for text                                                                         |
| `radius/pill` = 100px                                                                                            | Use 9999px; check whether `radius/xl` (48px) is used anywhere                                                |
| Spacing jumps oddly (8, 16, 32, 40) and section spacing is fixed 60/80/100                                       | 4px-based scale; make section spacing fluid with `clamp()`                                                   |
| Missing token families                                                                                           | Add typography (weights, leading, fluid scale), layout (gutter, container, measure), shadow, motion, z-index |
| Literals hardcoded outside variables (nav border `#ebebeb`, shadow, 88% white blur, 350ms easing, scroll script) | Promote to tokens                                                                                            |
| `blue darker` is really "brand hover"                                                                            | Rename to `--color-brand-strong`                                                                             |

Palette stays minimal: white, an 8-step neutral ramp (6 used today), one brand blue plus its darker state. Dark mode can be added later by redefining the semantic tokens only. See `tokens.css`.

## 5. Experiments section: architecture

Plain CSS is not a bottleneck here because tokens are CSS custom properties, which work in any framework.

- Each experiment lives in `src/experiments/<slug>/` with its own page, scoped styles, and (if needed) a framework island (React, Svelte, vanilla) hydrated with `client:visible`. Only the page that needs it pays for it.
- Experiments consume **semantic tokens** so they match the site, and may define local tokens under `[data-experiment="<slug>"]` for their own look.
- Frontmatter-driven index (title, cover, tags, date, status) mirroring the case-study pattern.
- Risky or very different experiments can use a full-bleed layout without site chrome, or an iframe sandbox.
- If Tailwind is ever wanted for a specific experiment, v4 reads CSS variables via `@theme`, so adopting it later does not require rewriting the tokens.

## 6. Decisions

**Decided**

- **Dark mode from day one.** Implemented with `color-scheme: light dark` + `light-dark()` semantic tokens, OS preference by default, manual toggle (light / dark / system) persisted in localStorage, inline head script to prevent flash. The liquid reveal and logo must be theme-aware.
- **Softer text color** (`#161616` instead of pure black).
- **Typography:** role-based fluid scale (display, h1–h4, lead, body, small, caption), 375 → 1440px. Defined in `tokens.css` and mirrored in Figma.
- **Font face and brand colors are placeholders.** Dawid is choosing them. Treat `--font-heading`, `--font-body` and the primitives as the only things that change.

**Figma ↔ code consistency** (Figma file: https://www.figma.com/design/vzoYNuNujywTubNYgLt10d)
Figma variable collections Primitives / Color (Light, Dark) / Type (Mobile 375, Desktop 1440) / Layout use the same names as the CSS tokens. Any token change is made in both places. Optional later: automate with a tokens plugin.

**Still open**

1. `/401` password page: drop or Cloudflare Access.
2. Contact: `mailto` only, or a form (Formspree / Cloudflare handler).
3. How long to keep Webflow as a fallback after cutover (suggested 2–4 weeks).

## 7. First prompt for Claude Code

"Read MIGRATION_PLAN.md and CLAUDE.md. Start Phase A: scaffold the Astro project in this repo using the stack and rules described, put tokens.css in src/styles/, set up tooling (Prettier, Stylelint token rules, astro check), self-hosted fonts, and the Cloudflare Pages-ready build. Then stop and show me the result before Phase B."
