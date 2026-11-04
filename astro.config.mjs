// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import protectedWork, { protectedSlugs } from "./tooling/protected-work.mjs";

// Pages that must never be indexed or listed in the sitemap.
const PRIVATE_PATHS = ["/styleguide", "/404", "/playground", "/grist/review"];
// Password-protected case studies: only their locked state is public, and it stays unindexed.
const PROTECTED_PATHS = protectedSlugs().map((slug) => `/work/${slug}`);

export default defineConfig({
  // Share images (src/lib/og.ts) render with resvg, a native module: leave it to Node, unbundled.
  vite: { ssr: { external: ["@resvg/resvg-js"] }, optimizeDeps: { exclude: ["@resvg/resvg-js"] } },
  // Code blocks (Grist examples) take the site's own styles, not a Shiki theme.
  markdown: { syntaxHighlight: false },
  // www is the host Google already indexes (Webflow redirected the apex to it).
  site: "https://www.mlynarz.com",
  trailingSlash: "never",
  build: { format: "file" },
  output: "static",
  // Class-based scoping so a parent's scoped styles reach a child component's root via `class`
  // (e.g. <Container class="nav__inner">). The default attribute strategy does not pass through.
  scopedStyleStrategy: "class",
  integrations: [
    mdx(),
    // React only for experiment islands (src/experiments); the site itself ships no framework JS.
    react({ include: ["**/experiments/**/*.tsx"] }),
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return (
          !PRIVATE_PATHS.some((path) => pathname.startsWith(path)) &&
          !PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
        );
      },
    }),
    protectedWork(),
  ],
  env: {
    schema: {
      // Set by Cloudflare Pages at build time. Only the production branch is indexable.
      CF_PAGES_BRANCH: envField.string({ context: "server", access: "public", optional: true }),
      // This deployment's own address (also set by Cloudflare Pages). Previews point their share
      // images and the Grist plugin marketplace here, so a branch link works before the page goes live.
      CF_PAGES_URL: envField.string({ context: "server", access: "public", optional: true }),
      // Cloudflare Web Analytics site token. Production only, and loaded only after consent (ConsentBanner).
      CF_WEB_ANALYTICS_TOKEN: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
    },
  },
});
