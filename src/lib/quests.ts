/**
 * Grist quests: which ones this build shows, and everything derived from their frontmatter
 * (version, date label, New, level-up list). Rarity is set by hand in frontmatter.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction } from "@/lib/site";
import { VOLUMES, type Volume } from "@/lib/grist";

export type Quest = CollectionEntry<"grist">;

/** "New" lasts this long after `started`. */
const NEW_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

/** Built at this moment; dates are compared against it (a daily rebuild keeps it honest). */
const now = new Date();

/** Production shows published quests that have started; previews show everything. */
export const isListed = ({ data }: Quest) =>
  !isProduction || (!data.draft && data.started.getTime() <= now.getTime());

const byStarted = (a: Quest, b: Quest) =>
  a.data.started.getTime() - b.data.started.getTime() || a.data.order - b.data.order;

export async function getQuests() {
  return (await getCollection("grist", isListed)).sort(byStarted);
}

/** Listed quests grouped by volume, in front-door order, skipping empty volumes. */
export async function getVolumes() {
  const quests = await getQuests();
  return (Object.keys(VOLUMES) as Volume[])
    .map((id) => ({ id, ...VOLUMES[id], quests: quests.filter((q) => q.data.volume === id) }))
    .filter((volume) => volume.quests.length > 0);
}

export const questHref = (quest: Quest) => `/grist/${quest.id}`;
export const twinHref = (quest: Quest) => `/grist/${quest.id}.md`;

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
export const formatDay = (date: Date) => dayMonth.format(date);
export const formatDate = (date: Date) => dayMonthYear.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function derive({ data }: Quest) {
  const last = data.levelUps.at(-1);
  return {
    rarity: data.rarity,
    version: last?.version ?? "1.0",
    /** "Published 9 Nov" or "Levelled up 23 Nov". */
    dateLabel: last
      ? `Levelled up ${formatDay(last.date)}`
      : `Published ${formatDay(data.started)}`,
    updated: last?.date ?? data.started,
    isNew: now.getTime() - data.started.getTime() < NEW_DAYS * DAY,
    /** Newest first, ending with "Started". */
    levelUps: [
      { version: "1.0", date: data.started, grew: "Started." },
      ...data.levelUps,
    ].reverse(),
  };
}
