// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import protectedWork, { protectedSlugs } from "./tooling/protected-work.mjs";

// Pages that must never be indexed or listed in the sitemap.
const PRIVATE_PATHS = ["/styleguide", "/404", "/playground"];
// Password-protected case studies: only their locked state is public, and it stays unindexed.
const PROTECTED_PATHS = protectedSlugs().map((slug) => `/work/${slug}`);

export default defineConfig({
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
      // Cloudflare Web Analytics site token. Production only; no cookies, no consent banner needed.
      CF_WEB_ANALYTICS_TOKEN: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
    },
  },
});
