/** The loot alone (/grist/<slug>/drop.md): drop.md exactly as written, for agents that fetch a URL. */
import type { APIRoute, GetStaticPaths } from "astro";
import { getBuiltDrops, lootOf, type Drop } from "@/lib/drops";

export const getStaticPaths = (async () => {
  const drops = await getBuiltDrops();
  return drops.map((drop) => ({ params: { slug: drop.id }, props: { drop } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(`${lootOf(props.drop as Drop)}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
