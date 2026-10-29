import { CF_PAGES_BRANCH, CF_WEB_ANALYTICS_TOKEN } from "astro:env/server";

export const SITE = {
  name: "Dawid Młynarz",
  /** Spelling without the Polish ł, as people often type it. */
  alternateName: "Dawid Mlynarz",
  title: "Dawid Młynarz — Senior Product Designer & Design Systems",
  /** Default meta description (pages override it). */
  description:
    "Senior Product Designer with 15 years of experience. I design AI-ready design systems and agentic UX for teams like Newsweek, NerdWallet and Google.",
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
  /** Scheduling page (a Google Calendar appointment schedule) for "Book a call". Empty means
   * calls to action lead to /contact instead. */
  bookingUrl: "https://calendar.app.google/xwy6zFUPrCpY1yFP9",
  /** Social share image in public/ (1200×630), used by every page. */
  ogImage: {
    src: "/og.jpg",
    width: 1200,
    height: 630,
    alt: "Dawid Młynarz, in black and white, beside the line: Transforming AI capability into products people actually trust. Agentic UX, AI-ready design systems, product strategy.",
  },
} as const;

export const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/dawid-mlynarz/", label: "LinkedIn" },
  { href: "https://dribbble.com/dawidmlynarz/", label: "Dribbble" },
  { href: "https://www.behance.net/dawidmlynarz", label: "Behance" },
  { href: "https://www.instagram.com/dawidmlynarz/", label: "Instagram" },
] as const;

/** The social links in the open menu (the footer lists them all). */
export const MENU_SOCIAL_LINKS = SOCIAL_LINKS.filter(({ label }) => label !== "Behance");

/** Where "Book a call" leads: the scheduling page once it is set, /contact until then. */
export const BOOKING_HREF: string = SITE.bookingUrl || "/contact";

/** Primary navigation. Calls to action lead to /contact, which carries the email; "Book a call" on
 * /services leads to BOOKING_HREF. */
export const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Cloudflare Pages production branch. Every other branch is a noindex preview. */
export const PRODUCTION_BRANCH = "main";

export const isProduction = CF_PAGES_BRANCH === PRODUCTION_BRANCH;

/** Cloudflare Web Analytics runs on production only, and only when a token is set. */
export const webAnalyticsToken = isProduction ? CF_WEB_ANALYTICS_TOKEN : undefined;

/** Search results cut titles at about 60 characters and descriptions at about 160. */
export const SEO_LIMITS = { title: 60, description: 160 } as const;
