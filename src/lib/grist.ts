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

/** Drop types, Common to Legendary. The type is the rarity. */
export const DROP_TYPES = {
  rule: { label: "Rule", rarity: "common", note: "One line for a system prompt or CLAUDE.md" },
  prompt: { label: "Prompt", rarity: "uncommon", note: "A reusable prompt with blanks to fill" },
  checklist: { label: "Checklist", rarity: "rare", note: "Checks to review work against" },
  spec: { label: "Spec", rarity: "epic", note: "A template or a section of a file" },
  skill: { label: "Skill", rarity: "legendary", note: "A whole agent skill, ready to install" },
} as const satisfies Record<string, { label: string; rarity: Rarity; note: string }>;
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
 * locked cards; the drop's own `drop` field wins once it's written. The Skill comes last.
 */
const PLAN: readonly DropType[] = [
  "rule",
  "prompt",
  "rule",
  "checklist",
  "prompt",
  "rule",
  "spec",
  "skill",
];

export const SEASONS = {
  s01: {
    number: 1,
    title: "Agentic UX",
    blurb: "How products should behave when an agent does the work.",
    starts: "2026-10-30",
    plan: PLAN,
  },
  s02: {
    number: 2,
    title: "AI-ready design systems",
    blurb: "Making a design system that agents read and use correctly.",
    starts: "2027-03-05",
    plan: PLAN,
  },
  s03: {
    number: 3,
    title: "Designing with agents",
    blurb: "How I work with AI tools day to day as a designer.",
    starts: "2027-07-09",
    plan: PLAN,
  },
} as const;
export type Season = keyof typeof SEASONS;
