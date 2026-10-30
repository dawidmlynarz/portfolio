/** Season pack (/grist/season-<n>.md): every listed drop of a season in one markdown file. */
import type { APIRoute, GetStaticPaths } from "astro";
import { dropMarkdown, getSeasons } from "@/lib/drops";

export const getStaticPaths = (async () => {
  const seasons = (await getSeasons()).filter((season) => season.drops.length > 0);
  return seasons.map((season) => ({
    params: { number: String(season.number) },
    props: { season },
  }));
}) satisfies GetStaticPaths;

type Props = Awaited<ReturnType<typeof getSeasons>>[number];

export const GET: APIRoute = ({ props, site }) => {
  const season = props.season as Props;
  const text = [
    `# Grist, season ${season.number}: ${season.title}`,
    "",
    `> ${season.blurb} Human-written loot for your AI tools, by Dawid Młynarz.`,
    "",
    ...season.drops.map((drop) => dropMarkdown(drop, site, "##")),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
};
