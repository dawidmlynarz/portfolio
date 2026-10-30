/**
 * Markdown twin of each quest (/grist/<slug>.md), for people who want to hand a quest to their AI
 * tools: frontmatter with the derived rank, then the MDX body as plain markdown.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { QUEST_TYPES, RARITY_LABELS, STATUSES, VOLUMES } from "@/lib/grist";
import { derive, getQuests, isoDate, questHref, type Quest } from "@/lib/quests";

export const getStaticPaths = (async () => {
  const quests = await getQuests();
  return quests.map((quest) => ({ params: { slug: quest.id }, props: { quest } }));
}) satisfies GetStaticPaths;

/** MDX comments are notes for the author, not the reader. */
const toMarkdown = (body = "") => body.replace(/\{\/\*[\s\S]*?\*\/\}\s*/g, "").trim();

export const GET: APIRoute = ({ props, site }) => {
  const quest = props.quest as Quest;
  const { data } = quest;
  const { rarity, version, updated } = derive(quest);
  const yaml = JSON.stringify;
  const lines = [
    "---",
    `title: ${yaml(data.title)}`,
    `definition: ${yaml(data.definition)}`,
    `volume: ${yaml(VOLUMES[data.volume].title)}`,
    `status: ${STATUSES[data.status].label}`,
    `type: ${QUEST_TYPES[data.type].label}`,
    `rarity: ${RARITY_LABELS[rarity]}`,
    `version: "${version}"`,
    `started: ${isoDate(data.started)}`,
    ...(data.levelUps.length ? [`last_level_up: ${isoDate(updated)}`] : []),
    `url: ${new URL(questHref(quest), site).href}`,
    "---",
    "",
    `# ${data.title}`,
    "",
    `> ${data.definition}`,
    "",
    toMarkdown(quest.body),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
