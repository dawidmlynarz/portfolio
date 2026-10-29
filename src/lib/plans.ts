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
  /** What's included, as a list. Only the featured plan has one; the others say it in `promise`. */
  includes?: string[];
  /** The plan the page leads with: shown wide, above the others. */
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "embedded-lead",
    title: "Embedded Design Lead",
    label: "Retainer",
    promise:
      "Design leadership inside your team, month to month. I set the direction, keep the quality up and do the hands-on work with your people.",
    // Two days a week, averaged over a year: 16 hours × 52 weeks ÷ 12 months.
    price: price((2 * HOURS_PER_DAY * 52) / 12),
    billing: "month",
    terms: "Per month · 2–3 days a week · three months to start",
    includes: [
      "Product direction and design reviews on the work that matters",
      "Hands-on design, from first sketch to shipped",
      "A design system your team and your AI tools can build on",
      "In your Slack, Figma and repo, two to three days a week",
    ],
    featured: true,
  },
  {
    id: "design-audit",
    title: "Design audit",
    label: "Fixed price",
    promise:
      "Two weeks, one clear answer: what’s holding the product back, and what to fix first. I go through your design system, or one AI or agent flow, rank what I find by impact and turn it into a roadmap you can act on. We finish with a walkthrough for your team.",
    // Six working days over two weeks.
    price: price(6 * HOURS_PER_DAY),
    billing: "once",
    terms: "Fixed price · 2 weeks",
  },
  {
    id: "custom",
    title: "Custom project",
    label: "Project",
    promise:
      "A piece of work with a start and an end, like a design system build, an AI feature or a redesign. We agree the scope, timeline and price before anything starts, and you’ll have a one-page proposal within two business days of our call.",
    terms: "Quoted per project",
  },
];

/** "$5,800" */
export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
