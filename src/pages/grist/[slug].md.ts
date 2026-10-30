/**
 * Markdown twin of each drop (/grist/<slug>.md), for handing a whole entry to an AI tool: the note,
 * the drop and the sightings as plain markdown (src/lib/drops.ts, dropMarkdown).
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { dropMarkdown, getBuiltDrops, type Drop } from "@/lib/drops";

export const getStaticPaths = (async () => {
  const drops = await getBuiltDrops();
  return drops.map((drop) => ({ params: { slug: drop.id }, props: { drop } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) =>
  new Response(dropMarkdown(props.drop as Drop, site), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
