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
    title: "Embedded lead",
    label: "Retainer",
    promise:
      "I join your team two days a week as its design lead. You get senior judgment on the decisions that matter, without hiring for it.",
    // Two days a week, averaged over a year: 16 hours × 52 weeks ÷ 12 months.
    price: price((2 * HOURS_PER_DAY * 52) / 12),
    billing: "month",
    terms: "Per month · 2 days a week",
    includes: [
      "Two set days a week, in your Slack, Figma and repo",
      "Product direction, design reviews and hands-on design",
      "I look after the design system, so it keeps up with the product",
      "Your designers get someone to learn from",
      "Three months to start, then month to month",
    ],
    featured: true,
  },
  {
    id: "design-audit",
    title: "Design audit",
    label: "Fixed price",
    promise: "Two weeks to find what’s holding the product back, and what to fix first.",
    // Six working days over two weeks.
    price: price(6 * HOURS_PER_DAY),
    billing: "once",
    terms: "Fixed price · 2 weeks",
    includes: [
      "One focus: your design system, or an AI or agent flow",
      "A written report, findings ranked by impact",
      "A roadmap your team can start on the following Monday",
      "A walkthrough call with your team",
    ],
  },
  {
    id: "custom",
    title: "Custom project",
    label: "Project",
    promise:
      "Something with a clear start and end: a design system build, an AI feature, a redesign.",
    terms: "Quoted per project",
    includes: [
      "Scope, timeline and price agreed before I start",
      "A one-page proposal within two business days of our call",
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
