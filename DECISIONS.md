# Decisions

Non-obvious choices, newest first. One entry per decision: what, why, and what it rules out.

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
