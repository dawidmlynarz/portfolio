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

Every other branch gets a preview URL, which is `noindex` (see `DECISIONS.md`).
