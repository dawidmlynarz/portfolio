/**
 * Grist drops: which ones this build shows, the raw loot text of each, the season grid with its
 * locked slots, and what's derived from the frontmatter (drop day from
 * the season slot, New).
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction } from "@/lib/site";
import {
  DROP_INTERVAL_DAYS,
  DROP_TYPES,
  SEASON_SLOTS,
  SEASONS,
  type DropType,
  type Rarity,
  type Season,
} from "@/lib/grist";

export type Drop = CollectionEntry<"grist">;

/** "New" lasts until the next drop. */
const NEW_DAYS = DROP_INTERVAL_DAYS;
const DAY = 24 * 60 * 60 * 1000;

/** Built at this moment; dates are compared against it (a daily rebuild keeps it honest). */
const now = new Date();

/** A slot's drop day: the season's first Friday plus two weeks per slot. */
export const dropDay = (season: Season, slot: number) =>
  new Date(Date.parse(SEASONS[season].starts) + (slot - 1) * DROP_INTERVAL_DAYS * DAY);

export const publishedOf = ({ data }: Drop) => dropDay(data.season, data.slot);

const hasDropped = (date: Date) => date.getTime() <= now.getTime();

/**
 * Listed (front door, feeds): drops whose day has come, on every build, so previews show the battle
 * pass as it really stands; production also leaves out drafts. A static build only knows "now" at
 * build time, so production rebuilds on drop days.
 */
export const isListed = (drop: Drop) =>
  hasDropped(publishedOf(drop)) && (!isProduction || !drop.data.draft);

/** Built as pages: the listed ones, plus on previews every draft and future slot, to review them. */
const isBuilt = (drop: Drop) => !isProduction || isListed(drop);

const byPublished = (a: Drop, b: Drop) =>
  publishedOf(a).getTime() - publishedOf(b).getTime() || a.id.localeCompare(b.id);

export async function getDrops() {
  return (await getCollection("grist", isListed)).sort(byPublished);
}

/** Every drop with a page on this build (see isBuilt). */
export async function getBuiltDrops() {
  return (await getCollection("grist", isBuilt)).sort(byPublished);
}

export type Slot =
  | { slot: number; date: Date; drop: Drop }
  | {
      slot: number;
      date: Date;
      drop?: undefined;
      /** The planned type and rarity, shown on the locked card. */
      type: DropType;
      rarity: Rarity;
      /** The first locked slot of a running season. */
      next: boolean;
      /** Its day has passed and nothing dropped: shown as late, not hidden. */
      late: boolean;
    };

/**
 * Every season with all eight slots, battle-pass style: listed drops fill their slot, the rest
 * stay locked. `open` is false until a season's first drop (or, on previews, its first draft); the
 * front door shows those as a short teaser instead of eight locked cards. Seasons with no listed
 * drops at all are left out of `drops` (season packs, llms.txt).
 */
export async function getSeasons() {
  const drops = await getDrops();
  return (Object.keys(SEASONS) as Season[]).map((id) => {
    const season = SEASONS[id];
    const own = drops.filter((d) => d.data.season === id);
    let nextFound = false;
    const slots: Slot[] = Array.from({ length: SEASON_SLOTS }, (_, i) => {
      const slot = i + 1;
      const date = dropDay(id, slot);
      const drop = own.find((d) => d.data.slot === slot);
      if (drop) return { slot, date, drop };
      const late = hasDropped(date);
      const next = !late && !nextFound;
      if (next) nextFound = true;
      const [type, rarity] = season.plan[i]!;
      return { slot, date, type, rarity, next, late };
    });
    return { id, ...season, drops: own, slots, open: own.length > 0, starts: dropDay(id, 1) };
  });
}

/** The loot itself: each folder's drop.md, as written. */
const RAW = import.meta.glob<string>("/src/content/grist/*/drop.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export function lootOf(drop: Drop) {
  const text = RAW[`/src/content/grist/${drop.id}/drop.md`];
  if (text === undefined)
    throw new Error(`Grist: ${drop.id} has no drop.md next to its index.mdx.`);
  return text.trim();
}

export const dropHref = (drop: Drop) => `/grist/${drop.id}`;
export const twinHref = (drop: Drop) => `/grist/${drop.id}.md`;
export const lootHref = (drop: Drop) => `/grist/${drop.id}/drop.md`;
export const seasonPackHref = (season: Season) => `/grist/season/${SEASONS[season].slug}.md`;

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
export const formatDay = (date: Date) => dayMonth.format(date);
export const formatDate = (date: Date) => dayMonthYear.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function derive(drop: Drop) {
  const type = DROP_TYPES[drop.data.drop];
  const published = publishedOf(drop);
  const age = now.getTime() - published.getTime();
  return {
    type,
    rarity: drop.data.rarity,
    published,
    isNew: age >= 0 && age < NEW_DAYS * DAY,
  };
}

/** MDX comments are notes for the author, not the reader. */
export const toMarkdown = (body = "") => body.replace(/\{\/\*[\s\S]*?\*\/\}\s*/g, "").trim();

/**
 * One drop as plain markdown: the twin, the season pack and llms-full all use it. Laid out for an
 * agent to act on: the hint (when to use it, what you get), the why, how to use it, the drop itself
 * in a fence, and its limits.
 */
export function dropMarkdown(drop: Drop, site: URL | undefined, heading = "#") {
  const { data } = drop;
  const { type, rarity, published } = derive(drop);
  const fence = "````";
  const h2 = `${heading}#`;
  return [
    `${heading} ${data.title}`,
    "",
    `> ${data.summary}`,
    "",
    `- Drop: ${type.label} (${rarity})`,
    `- Season: ${SEASONS[data.season].number}, ${SEASONS[data.season].title}`,
    `- Published: ${isoDate(published)}`,
    `- URL: ${new URL(dropHref(drop), site).href}`,
    `- Written by a human: Dawid Młynarz`,
    "",
    `**Hint:** ${data.hint}`,
    "",
    `${h2} Why`,
    "",
    toMarkdown(drop.body).replace(/^## /gm, `${h2}# `),
    "",
    ...(data.steps.length
      ? [`${h2} How to use it`, "", ...data.steps.map((step, i) => `${i + 1}. ${step}`), ""]
      : []),
    `${h2} The drop`,
    "",
    `${fence}markdown`,
    lootOf(drop),
    fence,
    "",
    ...(data.limits ? [`${h2} When not to use it`, "", data.limits, ""] : []),
  ].join("\n");
}
