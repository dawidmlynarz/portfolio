import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction } from "@/lib/site";

export type Work = CollectionEntry<"work">;

const byOrder = (a: Work, b: Work) => a.data.order - b.data.order;

/** Listed on this build: published work, plus drafts on preview builds (for review). */
export const isListed = ({ data }: Work) => !data.draft || !isProduction;

/** Gets a page on this build. Protected ones are locked behind the password (DECISIONS.md). */
export const hasPage = (entry: Work) => entry.data.page && isListed(entry);

export async function getListedWork() {
  return (await getCollection("work", isListed)).sort(byOrder);
}

export async function getPagedWork() {
  return (await getCollection("work", hasPage)).sort(byOrder);
}

/** Case studies with a page behind the password. */
export async function getProtectedWork() {
  return (await getPagedWork()).filter((entry) => entry.data.protected);
}

export const workHref = (entry: Work) => `/work/${entry.id}`;

/** "Senior Product Designer at Newsweek (via XWP.co)" */
export const roleLine = ({ data }: Work) =>
  `${data.role} at ${data.company}${data.via ? ` (via ${data.via})` : ""}`;
