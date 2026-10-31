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

/** Drops land every other Friday. A season is eight drops; a two-week break follows it. */
export const DROP_INTERVAL_DAYS = 14;
export const SEASON_SLOTS = 8;

/**
 * Seasons in order, battle-pass style: each shows all eight slots, and a slot unlocks on its drop
 * day (`starts` + (slot - 1) × 14 days). `plan` is the type and rarity each slot is meant to hold,
 * shown on locked cards; the drop's own fields win once it's written.
 *
 * DEMO SCHEDULE for the preview: season 1 fully dropped, season 2 three drops in. Reset `starts`
 * to the real launch dates before Grist goes live (drop days are never backdated).
 */
export const SEASONS = {
  s01: {
    number: 1,
    slug: "agentic-ux",
    title: "Agentic UX",
    blurb: "How products should behave when an agent does the work.",
    starts: "2026-06-26",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["checklist", "common"],
      ["rule", "common"],
      ["skill", "legendary"],
    ],
  },
  s02: {
    number: 2,
    slug: "ai-ready-design-systems",
    title: "AI-ready design systems",
    blurb: "Making a design system that agents read and use correctly.",
    starts: "2026-10-02",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["checklist", "rare"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["spec", "epic"],
      ["skill", "rare"],
    ],
  },
  s03: {
    number: 3,
    slug: "designing-with-agents",
    title: "Designing with agents",
    blurb: "How I work with AI tools day to day as a designer.",
    starts: "2027-02-05",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["checklist", "rare"],
      ["prompt", "uncommon"],
      ["rule", "common"],
      ["spec", "epic"],
      ["skill", "legendary"],
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
