import { getCollection, type CollectionEntry } from "astro:content";
import { isProduction } from "@/lib/site";

export type Work = CollectionEntry<"work">;

const byOrder = (a: Work, b: Work) => a.data.order - b.data.order;

/** Case studies that have a page. */
export async function getPublishedWork() {
  return (await getCollection("work", ({ data }) => !data.draft)).sort(byOrder);
}

/** What the Work and Home lists show: published work, plus drafts on preview builds. */
export async function getListedWork() {
  const all = await getCollection("work", ({ data }) => !data.draft || !isProduction);
  return all.sort(byOrder);
}

export const workHref = (entry: Work) => `/work/${entry.id}`;

/** "Senior Product Designer at Newsweek (via XWP.co)" */
export const roleLine = ({ data }: Work) =>
  `${data.role} at ${data.company}${data.via ? ` (via ${data.via})` : ""}`;
