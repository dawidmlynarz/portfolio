/**
 * The plans on /services. No prices on the site: every plan ends in "Book a call" and the price
 * is agreed on that call. The old rate-based prices are in git history (DECISIONS.md, 2026-11-02).
 */
export interface Plan {
  id: string;
  title: string;
  /** Small mono line above the title, e.g. "Retainer". */
  label: string;
  promise: string;
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
  },
  {
    id: "custom",
    title: "Custom project",
    label: "Project",
    promise:
      "A piece of work with a start and an end, like a design system build, an AI feature or a redesign. We agree the scope, timeline and price before anything starts, and you’ll have a one-page proposal within two business days of our call.",
  },
];
