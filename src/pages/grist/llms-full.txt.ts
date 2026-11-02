/** /grist/llms-full.txt: every listed drop, season by season, as one markdown file. */
import type { APIRoute } from "astro";
import { dropMarkdown, getSeasons } from "@/lib/drops";
import { seasonName } from "@/lib/grist";

export const GET: APIRoute = async ({ site }) => {
  const seasons = (await getSeasons()).filter((season) => season.drops.length > 0);
  const text = [
    "# Grist // Human-curated loot for your AI tools",
    "",
    "> Battle tested by Dawid Młynarz. Each drop is a rule, prompt, checklist, spec or skill.",
    "",
    ...seasons.flatMap((season) => [
      `## ${seasonName(season.id)}`,
      "",
      ...season.drops.map((drop) => dropMarkdown(drop, site, "###")),
    ]),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
