/**
 * Grist (/grist): rarity tiers, statuses and quest types. Everything shown about a quest's rank is
 * derived from these lists, never stored in frontmatter.
 */

/** Tiers in order. A quest's rarity is the tier at index min(levelUps, 4). */
export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export type Rarity = (typeof RARITIES)[number];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const STATUSES = {
  fresh: { label: "Fresh", icon: "leaf" },
  "battle-tested": { label: "Battle-tested", icon: "shield" },
} as const;
export type Status = keyof typeof STATUSES;

export const QUEST_TYPES = {
  "side-quest": { label: "Side quest", icon: "feather" },
  demo: { label: "Demo", icon: "pointer" },
  "deep-dive": { label: "Deep dive", icon: "book-open" },
  kit: { label: "Kit", icon: "braces" },
} as const;
export type QuestType = keyof typeof QUEST_TYPES;

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

/** Volumes in front-door order. */
export const VOLUMES = {
  "agentic-ux": { number: "I", title: "Agentic UX" },
  "ai-ready-design-systems": { number: "II", title: "AI-ready design systems" },
} as const;
export type Volume = keyof typeof VOLUMES;
