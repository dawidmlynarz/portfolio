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
    id: "product-strategy",
    title: "Product Strategy",
    promise: "Clarity on what to build, and why, before anything is designed.",
    description:
      "Research, opportunity mapping and a roadmap tied to business goals, including where AI genuinely helps your product and where it doesn't.",
    deliverables: [
      "Discovery, user research and problem framing",
      "Opportunity and AI use-case mapping",
      "Product vision, roadmap and success metrics",
      "Fast prototypes to test ideas with real users",
      "Experiments and A/B tests that prove the impact",
    ],
    proof: ["nerdwallet", "beatstars-product-design", "google-wordpress-plugin"],
  },
  {
    id: "design-systems",
    title: "Design Systems",
    promise: "AI-ready systems your team and your AI tools can build with.",
    description:
      "Tokens, components and documentation structured so people and AI coding agents ship consistent, accessible, on-brand UI, fast.",
    deliverables: [
      "Audit of the existing interface and components",
      "Design tokens and theming (light, dark, multi-brand)",
      "Component libraries in Figma, matched one to one in code",
      "Machine-readable docs and rules for AI coding agents",
      "Governance and contribution that keep it alive",
    ],
    proof: ["newsweek-design-system", "beatstars-design-system", "csspeeper"],
  },
  {
    id: "agentic-ux",
    title: "Agentic UX",
    promise: "Agents and AI features people understand, control and trust.",
    description:
      "Interaction design for agents and conversational products: clear limits, visible reasoning, human checkpoints and safe hand-offs.",
    deliverables: [
      "Agent and conversational interface design",
      "Trust patterns: sources, confidence and controls",
      "Human-in-the-loop checkpoints and hand-offs",
      "Error, refusal and recovery states",
      "Prototypes built on real models",
    ],
    proof: ["newsweek-ai-experience"],
  },
];
