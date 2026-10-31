/** A workflow drop's files as a folder, zipped (/grist/<slug>.zip). Only workflows get one. */
import type { APIRoute, GetStaticPaths } from "astro";
import { getBuiltDrops, lootFilesOf, type Drop } from "@/lib/drops";
import { zip } from "@/lib/zip";

export const getStaticPaths = (async () => {
  const drops = await getBuiltDrops();
  return drops
    .filter((drop) => drop.data.drop === "workflow")
    .map((drop) => ({ params: { slug: drop.id }, props: { drop } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const drop = props.drop as Drop;
  const files = lootFilesOf(drop).map(({ path, text }) => ({ path: `${drop.id}/${path}`, text }));
  return new Response(zip(files), { headers: { "Content-Type": "application/zip" } });
};
