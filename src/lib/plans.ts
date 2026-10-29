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
  promise: string;
  /** USD. Undefined means the plan is quoted per project. */
  price?: number;
  /** Billing unit for structured data: once, or per month. */
  billing?: "once" | "month";
  /** The line under the price, e.g. "Fixed price · 2 weeks". */
  terms: string;
  includes: string[];
}

export const PLANS: Plan[] = [
  {
    id: "design-audit",
    title: "Design audit",
    promise: "A clear view of what’s holding your product back, and what to fix first.",
    // Six working days over two weeks.
    price: price(6 * HOURS_PER_DAY),
    billing: "once",
    terms: "Fixed price · 2 weeks",
    includes: [
      "One focus: your design system, or an AI or agent experience",
      "Review of the Figma library and coded components, or one core agent journey",
      "A written report with findings ranked by impact",
      "A roadmap your team can start on straight away",
      "A walkthrough call with your team",
    ],
  },
  {
    id: "embedded-lead",
    title: "Embedded lead",
    promise: "A senior design lead inside your team, without a full-time hire.",
    // Two days a week, averaged over a year: 16 hours × 52 weeks ÷ 12 months.
    price: price((2 * HOURS_PER_DAY * 52) / 12),
    billing: "month",
    terms: "Per month · 2 days a week",
    includes: [
      "Two set days a week in your tools, rituals and codebase",
      "Product direction, design reviews and hands-on design",
      "Ownership of your design system",
      "Mentoring for the designers you already have",
      "Three months minimum, then month to month",
    ],
  },
  {
    id: "custom",
    title: "Custom",
    promise: "A defined project, shaped around what your team needs.",
    terms: "Quoted per project",
    includes: [
      "A design system build, an AI feature or a redesign",
      "Scope, timeline and price agreed before any work starts",
      "A short proposal from me within a few days of the call",
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
