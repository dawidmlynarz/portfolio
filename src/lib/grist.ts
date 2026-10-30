/**
 * Grist (/grist): rarity tiers and statuses. Dawid sets each quest's rarity by hand; level-ups are a
 * changelog and don't change it.
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

export const STATUSES = {
  "side-quest": { label: "Side quest", icon: "feather" },
  fresh: { label: "Fresh", icon: "leaf" },
  "battle-tested": { label: "Battle-tested", icon: "shield" },
} as const;
export type Status = keyof typeof STATUSES;

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
