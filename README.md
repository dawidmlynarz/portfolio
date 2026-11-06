# mlynarz.com

Portfolio of Dawid Młynarz. Astro + MDX, plain CSS (tokens + cascade layers), deployed on Cloudflare Pages.

- `MIGRATION_PLAN.md`: phases, cutover, open decisions
- `CLAUDE.md`: project rules
- `DECISIONS.md`: why things are the way they are

## Develop

```sh
nvm use          # Node 22
npm ci
npm run dev      # http://localhost:4321
npm run check    # astro check + stylelint + prettier, must pass before merging
npm run build    # static output in dist/
```

## Structure

```
src/
  styles/     global.css (entry) → reset, tokens, base; layer order: reset, tokens, base, components, utilities
  components/
    layout/   Container, Stack, Grid, Section
    ui/       Link, Button, Tag, Figure
    blocks/   Nav, ThemeToggle, Footer, Hero, LiquidReveal
  layouts/    BaseLayout.astro (head, meta, theme bootstrap) · SiteLayout.astro (nav, main, footer)
  lib/        site.ts: site constants, nav, production detection · tokens.ts: token keys for props
  assets/     images processed by astro:assets
  pages/      routes (file = URL); /styleguide shows every token and component
public/       static files; _headers for Cloudflare Pages
tooling/      repo-local lint plugins
```

## Deploy (Cloudflare Pages)

Workers & Pages → Create → Pages → Connect to Git → this repo.

| Setting                | Value           |
| ---------------------- | --------------- |
| Production branch      | `main`          |
| Framework preset       | Astro           |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Env var `NODE_VERSION` | `22`            |

Optional, production only: `CF_WEB_ANALYTICS_TOKEN` (Cloudflare Web Analytics site token) adds the analytics beacon.

Every other branch gets a preview URL, which is `noindex` (see `DECISIONS.md`).

## Weekly drop rebuild

Grist drops unlock on Fridays, but the site is static, so a drop only goes live when `main` rebuilds. `.github/workflows/drop-day.yml` asks Cloudflare for a production build every Friday at 00:17, 05:07 and 09:37 UTC. GitHub sometimes skips a scheduled run, so there are three tries. Pushing to `main` rebuilds too, so this only matters on weeks without a push.

One-time setup:

1. Cloudflare dashboard, Workers & Pages, the project, Settings, Builds, Deploy hooks, Add deploy hook. Name it `Drop day`, branch `main`, Save, then copy the URL.
2. GitHub repo, Settings, Secrets and variables, Actions, New repository secret. Name `CLOUDFLARE_DEPLOY_HOOK`, value the URL from step 1.
3. GitHub repo, Settings, General, Default branch must be `main`. Scheduled workflows only run from the default branch.
4. Actions tab, Drop day rebuild, Run workflow, to test it. A new production deployment shows up in Cloudflare within a few seconds. If a Friday drop isn't live by late morning, this button is also the manual fix.

The hook URL is the only credential. Anyone with it can start a build, so keep it in the secret. If it leaks, delete the hook in Cloudflare and make a new one.
