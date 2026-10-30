/** /grist/llms-full.txt: every listed drop, season by season, as one markdown file. */
import type { APIRoute } from "astro";
import { dropMarkdown, getSeasons } from "@/lib/drops";

export const GET: APIRoute = async ({ site }) => {
  const seasons = (await getSeasons()).filter((season) => season.drops.length > 0);
  const text = [
    "# Grist: human-written loot for your AI tools",
    "",
    "> By Dawid Młynarz. The ideas and words are his; each drop is a rule, prompt, checklist, spec or skill.",
    "",
    ...seasons.flatMap((season) => [
      `## Season ${season.number}: ${season.title}`,
      "",
      ...season.drops.map((drop) => dropMarkdown(drop, site, "###")),
    ]),
  ].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
