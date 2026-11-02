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
  RARITIES,
  SEASONS,
  STATUSES,
  seasonName,
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

/** A slot's drop day: the season's first Friday plus a week per slot. */
export const dropDay = (season: Season, slot: number) =>
  new Date(Date.parse(SEASONS[season].starts) + (slot - 1) * DROP_INTERVAL_DAYS * DAY);

export const publishedOf = ({ data }: Drop) => dropDay(data.season, data.slot);

const hasDropped = (date: Date) => date.getTime() <= now.getTime();

/**
 * Listed (front door, feeds, See also): drops whose day has come. A static build only knows "now"
 * at build time, so production rebuilds on drop days. Production also leaves out drafts. Previews
 * keep them, so the front door there looks the way it will once they're reviewed. Every drop,
 * unlocked, is on the sandbox (/grist/sandbox, previews only).
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
  const drops = (await getCollection("grist", isBuilt)).sort(byPublished);
  if (isProduction) drops.forEach(assertWritten);
  return drops;
}

/**
 * A published drop carries no notes for the author: `CLAUDE:` marks text Claude added that Dawid
 * hasn't confirmed, `TEST DATA` marks placeholders. Production refuses to build with either left in.
 */
const AUTHOR_NOTES = /CLAUDE:|TEST DATA/;
function assertWritten(drop: Drop) {
  const sample = sampleOf(drop)?.text ?? "";
  if (
    AUTHOR_NOTES.test(drop.body ?? "") ||
    AUTHOR_NOTES.test(lootOf(drop)) ||
    AUTHOR_NOTES.test(sample)
  )
    throw new Error(
      `Grist: ${drop.id} still has a CLAUDE: or TEST DATA note. Confirm or rewrite it, or set draft: true.`,
    );
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
 * drops at all are left out of `drops` (season packs, llms.txt). `all` fills every slot that has a
 * drop written, dropped or not, for the sandbox.
 */
export async function getSeasons({ all = false } = {}) {
  const drops = all ? await getBuiltDrops() : await getDrops();
  await checkBalance();
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

/**
 * Rarity balance, per season, over every slot: the written drop's tier, or the plan's while the slot
 * is empty. Previews warn; production refuses to build. See DECISIONS.md, "rarity balance".
 */
export function balanceProblems(tiers: readonly Rarity[]) {
  const count = (tier: Rarity) => tiers.filter((t) => t === tier).length;
  const problems: string[] = [];
  if (count("common") !== 1) problems.push(`${count("common")} Common (wants exactly 1)`);
  for (const tier of ["uncommon", "rare", "epic"] as const)
    if (count(tier) < 1 || count(tier) > 3) problems.push(`${count(tier)} ${tier} (wants 1 to 3)`);
  tiers.forEach((tier, i) => {
    if (i > 0 && tier === tiers[i - 1]) problems.push(`slots ${i} and ${i + 1} are both ${tier}`);
  });
  const top = Math.max(...tiers.map((t) => RARITIES.indexOf(t)));
  if (RARITIES.indexOf(tiers.at(-1)!) !== top) problems.push("slot 8 isn't the season's top tier");
  if (count("legendary") > 2) problems.push(`${count("legendary")} Legendary (wants 2 at most)`);
  if (count("mythic") > 1) problems.push(`${count("mythic")} Mythic (wants 1 at most)`);
  if (count("mythic") && count("legendary")) problems.push("Mythic and Legendary together");
  return problems;
}

let balanceChecked = false;
async function checkBalance() {
  if (balanceChecked) return;
  balanceChecked = true;
  const all = await getCollection("grist");
  for (const id of Object.keys(SEASONS) as Season[]) {
    const tiers = SEASONS[id].plan.map(
      ([, rarity], i) =>
        all.find((d) => d.data.season === id && d.data.slot === i + 1)?.data.rarity ?? rarity,
    );
    const problems = balanceProblems(tiers);
    if (!problems.length) continue;
    const message = `Grist: season ${SEASONS[id].number} is out of balance: ${problems.join("; ")}.`;
    if (isProduction) throw new Error(message);
    console.warn(message);
  }
}

/** The loot itself: each folder's drop.md, as written. */
const RAW = import.meta.glob<string>("/src/content/grist/*/drop.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** A workflow's loot: every file under its loot/ folder, as written. */
const LOOT_FILES = import.meta.glob<string>("/src/content/grist/*/loot/**/*", {
  query: "?raw",
  import: "default",
  eager: true,
});

export interface LootFile {
  /** Path inside the drop's folder, e.g. "skills/straw-man/SKILL.md". */
  path: string;
  text: string;
  /** Ships in the .zip only, not shown on the page or in the markdown (a Figma plugin's code). */
  bundled: boolean;
}

/**
 * The loot as files. A drop with a loot/ folder (every workflow, and a skill that ships reference
 * files) gives its files, the entry file first (README.md for a workflow, SKILL.md for a skill),
 * then by path. Every other drop has one file, drop.md. A one-file skill's drop.md is its SKILL.md.
 */
export function lootFilesOf(drop: Drop): LootFile[] {
  const prefix = `/src/content/grist/${drop.id}/loot/`;
  const entry =
    drop.data.drop === "workflow"
      ? "README.md"
      : drop.data.drop === "skill"
        ? "SKILL.md"
        : "drop.md";
  const files = Object.entries(LOOT_FILES)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, text]) => {
      const inner = path.slice(prefix.length);
      return { path: inner, text: text.trim(), bundled: inner.startsWith(PLUGIN_FOLDER) };
    })
    .sort((a, b) => (a.path === entry ? -1 : b.path === entry ? 1 : a.path.localeCompare(b.path)));
  if (files.length) return files;
  if (drop.data.drop === "workflow")
    throw new Error(`Grist: workflow ${drop.id} has no files in loot/.`);
  const text = RAW[`/src/content/grist/${drop.id}/drop.md`];
  if (text === undefined)
    throw new Error(`Grist: ${drop.id} has no drop.md (or loot/ folder) next to its index.mdx.`);
  return [
    {
      path: drop.data.drop === "skill" ? "SKILL.md" : "drop.md",
      text: text.trim(),
      bundled: false,
    },
  ];
}

/** A sample run: what the drop gives back, as written in output.md next to index.mdx. */
const OUTPUTS = import.meta.glob<string>("/src/content/grist/*/output.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The drop's sample output, if it has one, with the input it was run on (`sampleInput`). */
export function sampleOf(drop: Drop) {
  const text = OUTPUTS[`/src/content/grist/${drop.id}/output.md`]?.trim();
  if (!text) return undefined;
  if (!drop.data.sampleInput)
    throw new Error(`Grist: ${drop.id} has an output.md but no sampleInput in its frontmatter.`);
  return { input: drop.data.sampleInput, text };
}

/** A Figma plugin that ships with a drop lives in loot/figma-plugin/, zip only. */
const PLUGIN_FOLDER = "figma-plugin/";
export const hasPlugin = (drop: Drop) =>
  lootFilesOf(drop).some((file) => file.path === `${PLUGIN_FOLDER}manifest.json`);

/** The loot as one text: drop.md, or several files one after another under their paths. */
export function lootOf(drop: Drop) {
  const files = lootFilesOf(drop).filter((file) => !file.bundled);
  if (files.length === 1) return files[0]!.text;
  return files.map(({ path, text }) => `<!-- file: ${path} -->\n\n${text}`).join("\n\n");
}

/** Skills, workflows and drops with a plugin download as a folder (zipped); the rest as one markdown file. */
export const isFolder = (drop: Drop) =>
  drop.data.drop === "skill" || drop.data.drop === "workflow" || hasPlugin(drop);

/**
 * The folder a zip unpacks to. A skill's must match the `name` in its SKILL.md, so it drops
 * straight into .claude/skills/. A workflow's is the drop's own slug.
 */
export function folderOf(drop: Drop) {
  if (drop.data.drop !== "skill") return drop.id;
  const skill = lootFilesOf(drop).find((file) => file.path === "SKILL.md");
  return skill?.text.match(/^name:\s*(\S+)/m)?.[1] ?? drop.id;
}

/** The next drop day on the schedule, in any season, or undefined once the last season is out. */
export function nextDropDay() {
  const days = (Object.keys(SEASONS) as Season[]).flatMap((id) =>
    Array.from({ length: SEASON_SLOTS }, (_, i) => dropDay(id, i + 1)),
  );
  return days.filter((day) => !hasDropped(day)).sort((a, b) => a.getTime() - b.getTime())[0];
}

/** How many cards See also shows on a drop page. */
const SEE_ALSO = 4;

/**
 * See also, for every drop: Dawid's picks (`related`) first, then the nearest drops in the same
 * season, then drops of the same type from other seasons, then the newest. Only listed drops, so
 * every card leads to a live page.
 */
export function seeAlso(drop: Drop, listed: Drop[]) {
  const others = listed.filter((d) => d.id !== drop.id);
  const picked: Drop[] = [];
  const add = (d?: Drop) => {
    if (d && !picked.includes(d) && picked.length < SEE_ALSO) picked.push(d);
  };
  drop.data.related.forEach((slug) => add(others.find((d) => d.id === slug)));
  others
    .filter((d) => d.data.season === drop.data.season)
    .sort(
      (a, b) =>
        Math.abs(a.data.slot - drop.data.slot) - Math.abs(b.data.slot - drop.data.slot) ||
        b.data.slot - a.data.slot,
    )
    .forEach(add);
  others.filter((d) => d.data.drop === drop.data.drop).forEach(add);
  [...others].reverse().forEach(add);
  return picked;
}

export const dropHref = (drop: Drop) => `/grist/${drop.id}`;
export const twinHref = (drop: Drop) => `/grist/${drop.id}.md`;
export const lootHref = (drop: Drop) => `/grist/${drop.id}/drop.md`;
/** A skill's or workflow's files as a folder, zipped (/grist/<slug>.zip). */
export const zipHref = (drop: Drop) => `/grist/${drop.id}.zip`;
export const seasonPackHref = (season: Season) => `/grist/season/${SEASONS[season].slug}.md`;

/** One date format everywhere on Grist, always with the year: "Nov 6, 2026". */
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
export const formatDate = (date: Date) => dateFormat.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function derive(drop: Drop) {
  const type = DROP_TYPES[drop.data.drop];
  const published = publishedOf(drop);
  const age = now.getTime() - published.getTime();
  return {
    type,
    rarity: drop.data.rarity,
    status: STATUSES[drop.data.status],
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
  const { type, rarity, status, published } = derive(drop);
  const fence = "````";
  const h2 = `${heading}#`;
  return [
    `${heading} ${data.title}`,
    "",
    `> ${data.summary}`,
    "",
    `- Drop: ${type.label} (${rarity})`,
    `- ${seasonName(data.season)}`,
    `- Status: ${status.label} (${status.note.toLowerCase()})`,
    `- Published: ${isoDate(published)}`,
    `- URL: ${new URL(dropHref(drop), site).href}`,
    `- Curated by: Dawid Młynarz`,
    "",
    `**Hint:** ${data.hint}`,
    "",
    `${h2} Why`,
    "",
    toMarkdown(drop.body).replace(/^## /gm, `${h2}# `),
    "",
    ...(data.learnedFrom.length
      ? [
          `*Learned from:* ${data.learnedFrom
            .map(({ title, url }) => (url ? `[${title}](${url})` : title))
            .join("; ")}`,
          "",
        ]
      : []),
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
