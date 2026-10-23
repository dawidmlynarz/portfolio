import { CF_PAGES_BRANCH } from "astro:env/server";

export const SITE = {
  name: "Dawid Młynarz",
  title: "Dawid Młynarz — Product Designer",
  description: "Portfolio of Dawid Młynarz, product designer.",
  locale: "en",
} as const;

/** Cloudflare Pages production branch. Every other branch is a noindex preview. */
export const PRODUCTION_BRANCH = "main";

export const isProduction = CF_PAGES_BRANCH === PRODUCTION_BRANCH;
