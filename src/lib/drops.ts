/**
 * Grist drops: which ones this build shows, the raw loot text of each, and what's derived from the
 * frontmatter (rarity from the drop type, last-seen date, New).
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction } from "@/lib/site";
import { DROP_TYPES, SEASONS, type Season } from "@/lib/grist";

export type Drop = CollectionEntry<"grist">;

/** "New" lasts this long after `published`. */
const NEW_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

/** Built at this moment; dates are compared against it (a daily rebuild keeps it honest). */
const now = new Date();

/** Production shows published drops whose date has come; previews show everything. */
export const isListed = ({ data }: Drop) =>
  !isProduction || (!data.draft && data.published.getTime() <= now.getTime());

const byPublished = (a: Drop, b: Drop) =>
  a.data.published.getTime() - b.data.published.getTime() || a.id.localeCompare(b.id);

export async function getDrops() {
  return (await getCollection("grist", isListed)).sort(byPublished);
}

/** Listed drops grouped by season, in front-door order, skipping empty seasons. */
export async function getSeasons() {
  const drops = await getDrops();
  return (Object.keys(SEASONS) as Season[])
    .map((id) => ({ id, ...SEASONS[id], drops: drops.filter((d) => d.data.season === id) }))
    .filter((season) => season.drops.length > 0);
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
export const seasonPackHref = (season: Season) => `/grist/season-${SEASONS[season].number}.md`;

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
export const formatDay = (date: Date) => dayMonth.format(date);
export const formatDate = (date: Date) => dayMonthYear.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function derive({ data }: Drop) {
  const type = DROP_TYPES[data.drop];
  const lastSeen = data.sightings.at(-1)?.date;
  return {
    type,
    rarity: type.rarity,
    /** The latest of the publish date and the last sighting. */
    updated: lastSeen && lastSeen > data.published ? lastSeen : data.published,
    isNew: now.getTime() - data.published.getTime() < NEW_DAYS * DAY,
    /** Newest first. */
    sightings: [...data.sightings].reverse(),
  };
}

/** MDX comments are notes for the author, not the reader. */
export const toMarkdown = (body = "") => body.replace(/\{\/\*[\s\S]*?\*\/\}\s*/g, "").trim();

/** One drop as plain markdown: the twin, the season pack and llms-full all use it. */
export function dropMarkdown(drop: Drop, site: URL | undefined, heading = "#") {
  const { data } = drop;
  const { type, rarity } = derive(drop);
  const fence = "````";
  return [
    `${heading} ${data.title}`,
    "",
    `> ${data.summary}`,
    "",
    `- Drop: ${type.label} (${rarity})`,
    `- Season: ${SEASONS[data.season].number}, ${SEASONS[data.season].title}`,
    `- Published: ${isoDate(data.published)}`,
    `- URL: ${new URL(dropHref(drop), site).href}`,
    `- Written by a human: Dawid Młynarz`,
    "",
    toMarkdown(drop.body),
    "",
    `${heading}# The drop`,
    "",
    `${fence}markdown`,
    lootOf(drop),
    fence,
    ...(data.sightings.length
      ? [
          "",
          `${heading}# Sightings`,
          "",
          ...data.sightings.map(
            (s) => `- ${isoDate(s.date)}, ${s.product}: ${s.note}${s.url ? ` (${s.url})` : ""}`,
          ),
        ]
      : []),
    "",
  ].join("\n");
}
