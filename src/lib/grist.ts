/**
 * Grist (/grist): human-curated loot for AI tools, battle tested by Dawid. Each drop has a type (its
 * format: rule, prompt, checklist, spec, skill, workflow) and a rarity (how deep it goes), set
 * separately by hand: a simple checklist can be Common and an advanced one Rare. One exception:
 * a Mythic is always a workflow. Seasons group drops by theme.
 */

/** Tiers, lowest first. */
/**
 * How a tier is drawn next to its name: "tile" (Dawid's tile icons, TileIcon) or "gem" (the pixel
 * gems, Gem). Switching back to "gem" is this one line; each style has its own text colours.
 */
export const RARITY_ICON: "tile" | "gem" = "tile";

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
export type Rarity = (typeof RARITIES)[number];

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
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
    note: "One idea you can use straight away, like a rule or a short prompt.",
    needs: [],
  },
  uncommon: {
    note: "Needs a little setup. A prompt with blanks to fill, or a checklist with steps.",
    needs: ["steps"],
  },
  rare: {
    note: "Goes deeper. A full review checklist, a longer prompt or a simple skill.",
    needs: ["steps"],
  },
  epic: {
    note: "A template you fill in, with a worked example. Usually a spec or a bigger skill.",
    needs: ["steps", "example"],
  },
  legendary: {
    note: "A whole kit to install, with examples and a note on when not to use it.",
    needs: ["steps", "example", "limits"],
  },
  mythic: {
    note: "Several skills and a reviewer agent chained into one workflow. It stops for your approval along the way, and comes with a sample run.",
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

/** Drop types: the format of the loot. Any type can be any rarity, except that a Mythic is always a
 * workflow (src/content.config.ts). A workflow's loot is a folder of files (loot/), not drop.md. */
export const DROP_TYPES = {
  rule: { label: "Rule", note: "One line for a system prompt or CLAUDE.md" },
  prompt: { label: "Prompt", note: "A prompt to paste, with blanks to fill" },
  checklist: { label: "Checklist", note: "Checks to review work against" },
  spec: { label: "Spec", note: "A template or a section of a file" },
  skill: { label: "Skill", note: "An agent skill, ready to install" },
  workflow: {
    label: "Workflow",
    note: "Skills and a reviewer agent that hand off to each other, with checkpoints",
  },
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

/** Mythic has no pixel gem: in gem mode it still shows its tile icon (RarityLabel). */
export type GemRarity = Exclude<Rarity, "mythic">;
export const GEM_PIXELS: Record<GemRarity, readonly string[]> = {
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
    title: "The AI-ready Design System",
    blurb: "Make a design system that coding agents use correctly.",
    starts: "2026-08-28",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["spec", "epic"],
      ["spec", "legendary"],
      ["rule", "uncommon"],
      ["prompt", "rare"],
      ["skill", "legendary"],
    ],
  },
  s02: {
    number: 2,
    slug: "designing-agents",
    title: "Designing Agents",
    blurb: 'From "should this be an agent?" to a full review of an agent concept.',
    starts: "2026-11-13",
    plan: [
      ["rule", "common"],
      ["rule", "uncommon"],
      ["checklist", "rare"],
      ["prompt", "uncommon"],
      ["spec", "epic"],
      ["prompt", "rare"],
      ["spec", "epic"],
      ["skill", "legendary"],
    ],
  },
  s03: {
    number: 3,
    slug: "scoping-ai-work",
    title: "Scoping AI Work",
    blurb:
      "Workshops, estimates and statements of work for AI projects, from the first call to a signed scope.",
    starts: "2027-01-15",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["spec", "epic"],
      ["spec", "rare"],
      ["prompt", "uncommon"],
      ["skill", "epic"],
      ["workflow", "mythic"],
    ],
  },
  s04: {
    number: 4,
    slug: "ai-design-workspace",
    title: "Your AI Design Workspace",
    blurb: "Set up context, rules and skills once, so AI tools work the way you do.",
    starts: "2027-03-19",
    plan: [
      ["rule", "common"],
      ["prompt", "uncommon"],
      ["spec", "rare"],
      ["rule", "uncommon"],
      ["spec", "epic"],
      ["prompt", "rare"],
      ["rule", "uncommon"],
      ["skill", "legendary"],
    ],
  },
  s05: {
    number: 5,
    slug: "handoff-to-coding-agents",
    title: "Handoff to Coding Agents",
    blurb: "Hand a design to a coding agent and get back a build that matches it.",
    starts: "2027-05-21",
    plan: [
      ["rule", "common"],
      ["checklist", "uncommon"],
      ["spec", "rare"],
      ["prompt", "epic"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["skill", "epic"],
      ["workflow", "mythic"],
    ],
  },
  s06: {
    number: 6,
    slug: "shipping-agents",
    title: "Shipping Agents",
    blurb: "From a reviewed concept to a behaviour spec and an eval kit that tests it.",
    starts: "2027-07-23",
    plan: [
      ["rule", "common"],
      ["rule", "uncommon"],
      ["spec", "epic"],
      ["spec", "rare"],
      ["rule", "uncommon"],
      ["spec", "rare"],
      ["checklist", "uncommon"],
      ["skill", "legendary"],
    ],
  },
  s07: {
    number: 7,
    slug: "trust-and-memory",
    title: "Trust and Memory",
    blurb: "Make an agent's explanations, voice and memory something people can rely on.",
    starts: "2027-09-24",
    plan: [
      ["rule", "common"],
      ["checklist", "rare"],
      ["rule", "uncommon"],
      ["spec", "epic"],
      ["checklist", "rare"],
      ["prompt", "uncommon"],
      ["checklist", "rare"],
      ["skill", "legendary"],
    ],
  },
  s08: {
    number: 8,
    slug: "critique-with-ai",
    title: "Critique with AI",
    blurb: "Run critiques that end in decisions, with an AI partner that argues fairly.",
    starts: "2027-11-26",
    plan: [
      ["rule", "common"],
      ["rule", "uncommon"],
      ["checklist", "rare"],
      ["spec", "epic"],
      ["prompt", "uncommon"],
      ["prompt", "rare"],
      ["checklist", "uncommon"],
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

/** A season's full name, in Title Case with an en dash: "Season 1 – The AI-ready Design System". */
export const seasonName = (season: Season) =>
  `Season ${SEASONS[season].number} – ${SEASONS[season].title}`;
