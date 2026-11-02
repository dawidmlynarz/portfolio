/** Season pack (/grist/season/<slug>.md, e.g. agentic-ux.md): every listed drop of a season in one markdown file. */
import type { APIRoute, GetStaticPaths } from "astro";
import { dropMarkdown, getSeasons } from "@/lib/drops";
import { seasonName } from "@/lib/grist";

export const getStaticPaths = (async () => {
  const seasons = (await getSeasons()).filter((season) => season.drops.length > 0);
  return seasons.map((season) => ({
    params: { season: season.slug },
    props: { season },
  }));
}) satisfies GetStaticPaths;

type Props = Awaited<ReturnType<typeof getSeasons>>[number];

export const GET: APIRoute = ({ props, site }) => {
  const season = props.season as Props;
  const text = [
    `# Grist // ${seasonName(season.id)}`,
    "",
    `> ${season.blurb} Human-curated loot for your AI tools, battle tested by Dawid Młynarz.`,
    "",
    ...season.drops.map((drop) => dropMarkdown(drop, site, "##")),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
