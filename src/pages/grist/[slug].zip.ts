/**
 * A skill's or workflow's files as a folder, zipped (/grist/<slug>.zip). A skill unzips to a folder
 * named after the skill, holding SKILL.md, ready for .claude/skills/. Every zip carries a LICENSE.md.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import {
  folderOf,
  getBuiltDrops,
  isFolder,
  licenseFileOf,
  lootFilesOf,
  type Drop,
} from "@/lib/drops";
import { siteBase } from "@/lib/site";
import { zip } from "@/lib/zip";

export const getStaticPaths = (async () => {
  const drops = await getBuiltDrops();
  return drops.filter(isFolder).map((drop) => ({ params: { slug: drop.id }, props: { drop } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
  const drop = props.drop as Drop;
  const folder = folderOf(drop);
  const files = [...lootFilesOf(drop), licenseFileOf(drop, siteBase(site))].map(
    ({ path, text }) => ({ path: `${folder}/${path}`, text }),
  );
  return new Response(zip(files), { headers: { "Content-Type": "application/zip" } });
};
