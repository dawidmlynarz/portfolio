/**
 * Grist (/grist): human-written loot for AI tools. Every drop has one type, and the type sets the
 * rarity: bigger drops take more work, so they really are rarer. Seasons group drops by theme.
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
 * Drop types, Common to Legendary. The type is the rarity, and a rarer drop carries more around
 * it: `needs` lists the frontmatter fields an entry of that type must fill (src/content.config.ts).
 *   hint: every drop (one sentence: when to use it, what you get)
 *   steps: how to use it, from Prompt up
 *   example: a worked example in the body (## Example), from Spec up
 *   limits: when not to use it, Skill only
 */
export const DROP_TYPES = {
  rule: {
    label: "Rule",
    rarity: "common",
    note: "One line for a system prompt or CLAUDE.md",
    needs: [],
  },
  prompt: {
    label: "Prompt",
    rarity: "uncommon",
    note: "A reusable prompt with blanks to fill",
    needs: ["steps"],
  },
  checklist: {
    label: "Checklist",
    rarity: "rare",
    note: "Checks to review work against",
    needs: ["steps"],
  },
  spec: {
    label: "Spec",
    rarity: "epic",
    note: "A template or a section of a file",
    needs: ["steps", "example"],
  },
  skill: {
    label: "Skill",
    rarity: "legendary",
    note: "A whole agent skill, ready to install",
    needs: ["steps", "example", "limits"],
  },
} as const satisfies Record<
  string,
  {
    label: string;
    rarity: Rarity;
    note: string;
    needs: readonly ("steps" | "example" | "limits")[];
  }
>;
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
 * day (`starts` + (slot - 1) × 14 days). `plan` is the type each slot is meant to hold, shown on
 * locked cards; the drop's own `drop` field wins once it's written. A season ends on its Skill.
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
    plan: ["rule", "prompt", "checklist", "rule", "prompt", "checklist", "rule", "skill"],
  },
  s02: {
    number: 2,
    slug: "ai-ready-design-systems",
    title: "AI-ready design systems",
    blurb: "Making a design system that agents read and use correctly.",
    starts: "2026-10-02",
    plan: ["rule", "prompt", "rule", "checklist", "prompt", "rule", "spec", "skill"],
  },
  s03: {
    number: 3,
    slug: "designing-with-agents",
    title: "Designing with agents",
    blurb: "How I work with AI tools day to day as a designer.",
    starts: "2027-02-05",
    plan: ["rule", "prompt", "rule", "checklist", "prompt", "rule", "spec", "skill"],
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
    plan: readonly DropType[];
  }
>;
export type Season = keyof typeof SEASONS;
