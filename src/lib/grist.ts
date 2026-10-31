/**
 * Grist (/grist): human-written loot for AI tools. Each drop has a type (its format: rule, prompt,
 * checklist, spec, skill) and a rarity (how deep it goes), set separately by hand: a simple
 * checklist can be Common and an advanced one Rare. Seasons group drops by theme.
 */

/** Tiers, lowest first. */
export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export type Rarity = (typeof RARITIES)[number];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

/**
 * What each tier means, for the README, and what a drop of that tier must carry around the loot
 * (`needs`, checked in src/content.config.ts). Every drop has a hint and a why.
 *   steps: how to use it, from Uncommon up
 *   example: a worked example in the body (## Example), from Epic up
 *   limits: when not to use it, Legendary only
 */
export const RARITY_INFO = {
  common: {
    note: "One idea you can use right away: a rule, a short prompt or a three-point checklist.",
    needs: [],
  },
  uncommon: {
    note: "A reusable tool with a little setup: a prompt with blanks, a checklist with steps.",
    needs: ["steps"],
  },
  rare: {
    note: "Goes deeper: a full review checklist, a detailed prompt, a simple skill.",
    needs: ["steps"],
  },
  epic: {
    note: "A template or system you fill in, with an example: a spec, a set of prompts, a bigger skill.",
    needs: ["steps", "example"],
  },
  legendary: {
    note: "A whole kit, ready to install: an advanced skill or a full spec, with examples and limits.",
    needs: ["steps", "example", "limits"],
  },
} as const satisfies Record<
  Rarity,
  { note: string; needs: readonly ("steps" | "example" | "limits")[] }
>;

/**
 * Where a drop stands for Dawid: used on real work, or something he's trying (curated or new to
 * him). Either way the words are his. Shown next to the date.
 */
export const STATUSES = {
  tested: { label: "Tested", note: "Used on real work" },
  trying: { label: "Trying", note: "Testing it now" },
} as const satisfies Record<string, { label: string; note: string }>;
export type Status = keyof typeof STATUSES;

/** Drop types: the format of the loot. Any type can be any rarity. */
export const DROP_TYPES = {
  rule: { label: "Rule", note: "One line for a system prompt or CLAUDE.md" },
  prompt: { label: "Prompt", note: "A prompt to paste, with blanks to fill" },
  checklist: { label: "Checklist", note: "Checks to review work against" },
  spec: { label: "Spec", note: "A template or a section of a file" },
  skill: { label: "Skill", note: "An agent skill, ready to install" },
} as const satisfies Record<string, { label: string; note: string }>;
export type DropType = keyof typeof DROP_TYPES;

/**
 * Gem pixel art, one string per row, drawn at 2px per pixel: a cut gem with a flat table, a
 * girdle line and shaded facets.
 * o outline · d facet line (shade) · m dark facet (fill + shade) · f fill · l lit facet (light)
 * w highlight (light, paler) · s sparkle (light) · . empty
 * Common to Rare share the gem; Epic adds sparkles; Legendary adds sparkles and a crown.
 */
const GEM = [
  "...ooooooo...",
  "..omdfffdwo..",
  ".ommdfffdlwo.",
  "odddddddddddo",
  ".omdfffffdlo.",
  "..omdfffdlo..",
  "...omdfdlo...",
  "....odfdo....",
  ".....ofo.....",
  "......o......",
];
const SPARKLED = GEM.map((row, y) => (y === 0 || y === 6 ? `s${row.slice(1, -1)}s` : row));

export const GEM_PIXELS: Record<Rarity, readonly string[]> = {
  common: GEM,
  uncommon: GEM,
  rare: GEM,
  epic: SPARKLED,
  legendary: ["...o..o..o...", ...SPARKLED],
};

/** Drops land every Friday. A season is eight drops; a week off follows it. */
export const DROP_INTERVAL_DAYS = 7;
export const SEASON_SLOTS = 8;

/**
 * Seasons in order, battle-pass style: each shows all eight slots, and a slot unlocks on its drop
 * day (`starts` + (slot - 1) × 7 days). `plan` is the type and rarity each slot is meant to hold,
 * shown on locked cards; the drop's own fields win once it's written.
 *
 * DEMO SCHEDULE for the preview: season 1 fully dropped, season 2 one drop in, seasons nine weeks
 * apart. Every drop except Human checkpoints is an imported draft (draft: true). Reset `starts` to
 * the real launch dates before Grist goes live (drop days are never backdated).
 */
export const SEASONS = {
  s01: {
    number: 1,
    slug: "ai-ready-design-system",
    title: "The AI-ready design system",
    blurb: "Make a design system that coding agents use correctly.",
    starts: "2026-08-28",
    plan: [
      ["rule", "common"],
      ["checklist", "rare"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["spec", "rare"],
      ["spec", "epic"],
      ["skill", "legendary"],
    ],
  },
  s02: {
    number: 2,
    slug: "designing-agents",
    title: "Designing agents",
    blurb: 'From "should this be an agent?" to a full review of an agent concept.',
    starts: "2026-10-30",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["checklist", "rare"],
      ["prompt", "rare"],
      ["rule", "common"],
      ["checklist", "epic"],
      ["skill", "legendary"],
    ],
  },
  s03: {
    number: 3,
    slug: "ai-design-workspace",
    title: "Your AI design workspace",
    blurb: "Set up context, rules and skills once, so AI tools work the way you do.",
    starts: "2027-01-01",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["spec", "epic"],
      ["spec", "rare"],
      ["prompt", "rare"],
      ["rule", "common"],
      ["skill", "legendary"],
    ],
  },
  s04: {
    number: 4,
    slug: "handoff-to-coding-agents",
    title: "Handoff to coding agents",
    blurb: "Hand a design to a coding agent and get back a build that matches it.",
    starts: "2027-03-05",
    plan: [
      ["rule", "common"],
      ["checklist", "uncommon"],
      ["spec", "rare"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["skill", "epic"],
    ],
  },
  s05: {
    number: 5,
    slug: "prototyping-with-coding-agents",
    title: "Prototyping with coding agents",
    blurb: "From a question worth testing to a coded prototype that's ready for a session.",
    starts: "2027-05-07",
    plan: [
      ["rule", "common"],
      ["spec", "rare"],
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["checklist", "rare"],
      ["skill", "epic"],
    ],
  },
  s06: {
    number: 6,
    slug: "shipping-agents",
    title: "Shipping agents",
    blurb: "From a reviewed concept to a behaviour spec and an eval kit that tests it.",
    starts: "2027-07-09",
    plan: [
      ["rule", "common"],
      ["spec", "epic"],
      ["rule", "common"],
      ["spec", "rare"],
      ["rule", "common"],
      ["spec", "rare"],
      ["checklist", "common"],
      ["skill", "legendary"],
    ],
  },
  s07: {
    number: 7,
    slug: "trust-and-memory",
    title: "Trust and memory",
    blurb: "Make an agent's explanations, voice and memory something people can rely on.",
    starts: "2027-09-10",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["checklist", "rare"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["spec", "epic"],
      ["skill", "legendary"],
    ],
  },
  s08: {
    number: 8,
    slug: "critique-with-ai",
    title: "Critique with AI",
    blurb: "Run critiques that end in decisions, with an AI partner that argues fairly.",
    starts: "2027-11-12",
    plan: [
      ["rule", "common"],
      ["spec", "rare"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["checklist", "uncommon"],
      ["prompt", "rare"],
      ["skill", "epic"],
    ],
  },
} as const satisfies Record<
  string,
  {
    number: number;
    /** Season pack file name: /grist/season/<slug>.md */
    slug: string;
    title: string;
    blurb: string;
    starts: string;
    plan: readonly (readonly [DropType, Rarity])[];
  }
>;
export type Season = keyof typeof SEASONS;
