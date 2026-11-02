/**
 * /llms.txt (llmstxt.org): what's here for AI tools. Lists Grist's drops with their markdown
 * twins; /grist/llms-full.txt holds all of them in one file.
 */
import type { APIRoute } from "astro";
import { SITE } from "@/lib/site";
import { getSeasons, twinHref } from "@/lib/drops";
import { DROP_TYPES, seasonName } from "@/lib/grist";

export const GET: APIRoute = async ({ site }) => {
  const abs = (path: string) => new URL(path, site).href;
  const seasons = (await getSeasons()).filter((season) => season.drops.length > 0);
  const text = [
    `# ${SITE.name}`,
    "",
    "> Product designer. Grist is my human-curated loot for AI tools, battle tested by me: rules, prompts, checklists, specs and skills on agentic UX and AI-ready design systems.",
    "",
    `All of Grist in one file: ${abs("/grist/llms-full.txt")}`,
    "",
    ...seasons.flatMap((season) => [
      `## Grist // ${seasonName(season.id)}`,
      "",
      ...season.drops.map(
        (drop) =>
          `- [${drop.data.title}](${abs(twinHref(drop))}): ${DROP_TYPES[drop.data.drop].label}. ${drop.data.summary}`,
      ),
      "",
    ]),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
