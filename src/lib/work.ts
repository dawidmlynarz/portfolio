import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction, showProtectedDrafts } from "@/lib/site";

export type Work = CollectionEntry<"work">;

const byOrder = (a: Work, b: Work) => a.data.order - b.data.order;

/** Listed on this build: published work, plus drafts on preview builds (for review). */
export const isListed = ({ data }: Work) => !data.draft || !isProduction;

/** Gets a page on this build. Protected drafts stay unlinked cards unless previews are behind Access. */
export const hasPage = (entry: Work) =>
  entry.data.page &&
  isListed(entry) &&
  (!entry.data.draft || !entry.data.protected || showProtectedDrafts);

export async function getListedWork() {
  return (await getCollection("work", isListed)).sort(byOrder);
}

export async function getPagedWork() {
  return (await getCollection("work", hasPage)).sort(byOrder);
}

export const workHref = (entry: Work) => `/work/${entry.id}`;

/** "Senior Product Designer at Newsweek (via XWP.co)" */
export const roleLine = ({ data }: Work) =>
  `${data.role} at ${data.company}${data.via ? ` (via ${data.via})` : ""}`;
