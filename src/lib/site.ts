import { CF_PAGES_BRANCH, CF_WEB_ANALYTICS_TOKEN, SHOW_PROTECTED_DRAFTS } from "astro:env/server";

export const SITE = {
  name: "Dawid Młynarz",
  /** Spelling without the Polish ł, as people often type it. */
  alternateName: "Dawid Mlynarz",
  title: "Dawid Młynarz — Freelance Product Designer & Design Systems",
  /** Default meta description (pages override it). */
  description:
    "Freelance product designer with 15 years of experience. I design AI-ready design systems and agentic UX for teams like Newsweek, NerdWallet and Google.",
  jobTitle: "Senior Product Designer",
  locale: "en",
  ogLocale: "en_GB",
  /** ISO 3166 country code, for structured data. */
  country: "PL",
  /** Topics Dawid wants to be known for (structured data). */
  knowsAbout: [
    "AI-ready design systems",
    "Agentic UX",
    "Product strategy",
    "Design systems",
    "Product design",
  ],
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
/** Cloudflare Web Analytics runs on production only, and only when a token is set. */
export const webAnalyticsToken = isProduction ? CF_WEB_ANALYTICS_TOKEN : undefined;

/** Search results cut titles at about 60 characters and descriptions at about 160. */
export const SEO_LIMITS = { title: 60, description: 160 } as const;

export const showProtectedDrafts = !isProduction && SHOW_PROTECTED_DRAFTS;
