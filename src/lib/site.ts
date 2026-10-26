import { CF_PAGES_BRANCH, SHOW_PROTECTED_DRAFTS } from "astro:env/server";

export const SITE = {
  name: "Dawid Młynarz",
  title: "Dawid Młynarz — Senior Product Designer",
  /** Default meta description (pages override it). */
  description:
    "Dawid Młynarz, senior product designer with 15 years of experience. Agentic UX, AI-ready design systems and product strategy for teams like Newsweek, NerdWallet, Google and BeatStars.",
  jobTitle: "Senior Product Designer",
  locale: "en",
  ogLocale: "en_GB",
  email: "hello@mlynarz.com",
  /** Social share image in public/ (1200×630). */
  ogImage: {
    src: "/og.png",
    width: 1200,
    height: 630,
    alt: "Dawid Młynarz – Senior Product Designer. Designing digital products that meet business goals and delight people.",
  },
} as const;

export const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/dawid-mlynarz/", label: "LinkedIn" },
  { href: "https://dribbble.com/dawidmlynarz/", label: "Dribbble" },
] as const;

/** Primary navigation. Contact is not in it: the hero, the footer and the mobile menu carry the email. */
export const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
] as const;

/** Cloudflare Pages production branch. Every other branch is a noindex preview. */
export const PRODUCTION_BRANCH = "main";

export const isProduction = CF_PAGES_BRANCH === PRODUCTION_BRANCH;

/** Previews are behind Cloudflare Access, so formerly password-protected drafts may be built. */
export const showProtectedDrafts = !isProduction && SHOW_PROTECTED_DRAFTS;
