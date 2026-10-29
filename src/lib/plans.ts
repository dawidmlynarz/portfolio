/**
 * The plans on /services. Prices come from one internal hourly rate in USD, which is never shown
 * on the site: change the rate or the hours and every fixed price follows.
 */
const HOURLY_RATE = 120;
const HOURS_PER_DAY = 8;

/** Rounds to the nearest $100, so prices read as decided rather than calculated. */
const price = (hours: number) => Math.round((hours * HOURLY_RATE) / 100) * 100;

export interface Plan {
  id: string;
  title: string;
  /** Small mono line above the title, e.g. "Retainer". */
  label: string;
  promise: string;
  /** USD. Undefined means the plan is quoted per project. */
  price?: number;
  /** Billing unit for structured data: once, or per month. */
  billing?: "once" | "month";
  /** The line under the price, e.g. "Fixed price · 2 weeks". */
  terms: string;
  includes: string[];
  /** The plan the page leads with: shown wide, above the others. */
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "embedded-lead",
    title: "Embedded design lead",
    label: "Retainer",
    promise:
      "Senior design leadership inside your team, month to month. I set the direction, keep the quality up and do the hands-on work with your people.",
    // Two days a week, averaged over a year: 16 hours × 52 weeks ÷ 12 months.
    price: price((2 * HOURS_PER_DAY * 52) / 12),
    billing: "month",
    terms: "Per month · three months to start",
    includes: [
      "Product direction and design reviews on the work that matters",
      "Hands-on design, from first sketch to shipped",
      "A design system your team and your AI tools can build on",
      "In your Slack, Figma and repo, around two days a week",
    ],
    featured: true,
  },
  {
    id: "design-audit",
    title: "Design audit",
    label: "Fixed price",
    promise: "Two weeks, one clear answer: what’s holding the product back, and what to fix first.",
    // Six working days over two weeks.
    price: price(6 * HOURS_PER_DAY),
    billing: "once",
    terms: "Fixed price · 2 weeks",
    includes: [
      "Your design system, or one AI or agent flow",
      "Findings ranked by impact, and a roadmap to act on",
      "A walkthrough with your team",
    ],
  },
  {
    id: "custom",
    title: "Custom project",
    label: "Project",
    promise:
      "A piece of work with a start and an end: a design system build, an AI feature, a redesign.",
    terms: "Quoted per project",
    includes: [
      "Scope, timeline and price agreed upfront",
      "A one-page proposal within two business days",
    ],
  },
];

/** "$5,800" */
export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
