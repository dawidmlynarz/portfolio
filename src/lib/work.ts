import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction } from "@/lib/site";

export type Work = CollectionEntry<"work">;

const byOrder = (a: Work, b: Work) => a.data.order - b.data.order;

/** Built on this build: published work, plus drafts on preview builds (for review). */
const isBuilt = ({ data }: Work) => !data.draft || !isProduction;

/** Gets a page on this build. Protected ones are locked behind the password (DECISIONS.md). */
export const hasPage = (entry: Work) => entry.data.page && isBuilt(entry);

/** Listed as a card on this build. Unlisted work has a page but no card anywhere. */
export const isListed = (entry: Work) => isBuilt(entry) && !entry.data.unlisted;

/** Has a page that other pages may link to (cards, Next up, Services, the marquee). */
export const isLinked = (entry: Work) => hasPage(entry) && !entry.data.unlisted;

export async function getListedWork() {
  return (await getCollection("work", isListed)).sort(byOrder);
}

/** Case studies with a page that other pages link to. */
export async function getPagedWork() {
  return (await getCollection("work", isLinked)).sort(byOrder);
}

/** Every case study with a page on this build, unlisted ones included. */
export async function getBuiltPages() {
  return (await getCollection("work", hasPage)).sort(byOrder);
}

/** Case studies with a page behind the password. */
export async function getProtectedWork() {
  return (await getBuiltPages()).filter((entry) => entry.data.protected);
}

export const workHref = (entry: Work) => `/work/${entry.id}`;

/** "Senior Product Designer at Newsweek (via XWP.co)" */
export const roleLine = ({ data }: Work) =>
  `${data.role} at ${data.company}${data.via ? ` (via ${data.via})` : ""}`;
