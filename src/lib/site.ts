import { CF_PAGES_BRANCH, SHOW_PROTECTED_DRAFTS } from "astro:env/server";

export const SITE = {
  name: "Dawid Młynarz",
  title: "Dawid Młynarz — Senior Product Designer",
  description:
    "Dawid Młynarz, Senior Product Designer. 15 years of building products, from early concepts to delightful, user-friendly design systems and AI experiences.",
  locale: "en",
  email: "hello@mlynarz.com",
} as const;

export const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/dawid-mlynarz/", label: "LinkedIn" },
  { href: "https://dribbble.com/dawidmlynarz/", label: "Dribbble" },
] as const;

/** Primary navigation. Contact is a mailto link (see MIGRATION_PLAN open decision 2). */
export const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
] as const;

/** Cloudflare Pages production branch. Every other branch is a noindex preview. */
export const PRODUCTION_BRANCH = "main";

export const isProduction = CF_PAGES_BRANCH === PRODUCTION_BRANCH;

/** Previews are behind Cloudflare Access, so formerly password-protected drafts may be built. */
export const showProtectedDrafts = !isProduction && SHOW_PROTECTED_DRAFTS;
