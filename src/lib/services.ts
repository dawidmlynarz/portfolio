/**
 * The three services, shared by the Home summary and the /services page.
 * `proof` lists case-study slugs; entries without a page are skipped when rendered.
 */
export interface Service {
  id: string;
  title: string;
  promise: string;
  description: string;
  deliverables: string[];
  proof: string[];
}

export const SERVICES: Service[] = [
  {
    id: "product-design",
    title: "Product Design",
    promise: "From a fuzzy problem to a shipped, measurable product.",
    description:
      "Research, flows, interface and prototypes, end to end, working inside your team and shipping with engineering.",
    deliverables: [
      "Discovery, research and problem framing",
      "User flows and information architecture",
      "Interface design and interactive prototypes",
      "Usability testing and A/B experiments",
      "Hand-off and QA alongside engineering",
    ],
    proof: ["nerdwallet", "beatstars-product-design", "google-wordpress-plugin"],
  },
  {
    id: "design-systems",
    title: "Design Systems",
    promise: "Systems that let teams ship faster and stay consistent.",
    description:
      "Tokens, components and documentation that scale across products and brands, built to be read by people and by AI tools.",
    deliverables: [
      "Audit of the existing interface and components",
      "Design tokens and theming (light, dark, multi-brand)",
      "Component libraries in Figma, matched in code",
      "Documentation, contribution and governance",
      "System docs structured for AI coding tools",
    ],
    proof: ["newsweek-design-system", "beatstars-design-system", "csspeeper"],
  },
  {
    id: "ai-agentic-ux",
    title: "AI and Agentic UX",
    promise: "AI features people understand, control and trust.",
    description:
      "Strategy and interface for conversational products, agents and AI workflows: clear limits, visible reasoning and safe hand-offs to people.",
    deliverables: [
      "AI opportunity mapping and product strategy",
      "Conversational and agent interface design",
      "Trust patterns: sources, controls and limits",
      "Human-in-the-loop workflows and hand-offs",
      "Prototypes built on real models",
    ],
    proof: ["newsweek-ai-experience"],
  },
];
