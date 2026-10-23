// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Pages that must never be indexed or listed in the sitemap.
const PRIVATE_PATHS = ["/styleguide", "/404"];

export default defineConfig({
  site: "https://mlynarz.com",
  trailingSlash: "never",
  build: { format: "file" },
  output: "static",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !PRIVATE_PATHS.some((path) => new URL(page).pathname.startsWith(path)),
    }),
  ],
  env: {
    schema: {
      // Set by Cloudflare Pages at build time. Only the production branch is indexable.
      CF_PAGES_BRANCH: envField.string({ context: "server", access: "public", optional: true }),
    },
  },
});
