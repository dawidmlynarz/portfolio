/**
 * A skill's or workflow's files as a folder, zipped (/grist/<slug>.zip). A skill unzips to a folder
 * named after the skill, holding SKILL.md, ready for .claude/skills/.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { folderOf, getBuiltDrops, isFolder, lootFilesOf, type Drop } from "@/lib/drops";
import { zip } from "@/lib/zip";

export const getStaticPaths = (async () => {
  const drops = await getBuiltDrops();
  return drops.filter(isFolder).map((drop) => ({ params: { slug: drop.id }, props: { drop } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const drop = props.drop as Drop;
  const folder = folderOf(drop);
  const files = lootFilesOf(drop).map(({ path, text }) => ({ path: `${folder}/${path}`, text }));
  return new Response(zip(files), { headers: { "Content-Type": "application/zip" } });
};
