/**
 * Each drop's share image (/grist/<slug>/og.png), from its rarity's template (src/lib/og.ts).
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getBuiltDrops, type Drop } from "@/lib/drops";
import { dropImage } from "@/lib/og";

export const getStaticPaths = (async () => {
  const drops = await getBuiltDrops();
  return drops.map((drop) => ({ params: { slug: drop.id }, props: { drop } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await dropImage(props.drop as Drop), { headers: { "Content-Type": "image/png" } });
