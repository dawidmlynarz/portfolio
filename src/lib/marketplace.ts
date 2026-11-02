/**
 * Grist as a Claude Code plugin marketplace, served by the site itself (no separate repo).
 * People add it with `/plugin marketplace add https://www.mlynarz.com/grist/marketplace.json` and
 * install a drop with `/plugin install <slug>@grist`.
 *
 * Only skills and workflows become plugins: they are the drops a coding agent installs as they are.
 * The catalog lists the same drops as the front door (getDrops), so drafts and drops whose day
 * hasn't come stay out, and production rebuilds on drop days add new ones.
 *
 * Each entry is an `archive` source: a zip of the plugin at /grist/plugins/<slug>.zip, pinned by
 * its SHA-256. No `version` is set anywhere, so Claude Code takes the version from that digest and
 * people get an update whenever a drop's files change. The zip writer is deterministic (fixed
 * dates), so an unchanged drop keeps its digest across builds. See DECISIONS.md.
 */
import { createHash } from "node:crypto";
import { DROP_TYPES, SEASONS } from "@/lib/grist";
import {
  DROP_LICENSE,
  dropHref,
  folderOf,
  getDrops,
  licenseFileOf,
  lootFilesOf,
  type Drop,
} from "@/lib/drops";
import { SITE } from "@/lib/site";
import { zip } from "@/lib/zip";

/** The name people type after @. Kept short; changing it breaks every install. */
export const MARKETPLACE_NAME = "grist";

export const marketplaceHref = "/grist/marketplace.json";
export const pluginZipHref = (drop: Drop) => `/grist/plugins/${drop.id}.zip`;

/** Drops that ship as a Claude Code plugin. */
export const isPlugin = (drop: Drop) => drop.data.drop === "skill" || drop.data.drop === "workflow";

export async function getPluginDrops() {
  return (await getDrops()).filter(isPlugin);
}

const author = (base: URL) => ({ name: SITE.name, url: base.origin });

/** Display fields, shared by plugin.json and the marketplace entry (people see the entry's before install). */
function manifestOf(drop: Drop, base: URL) {
  return {
    name: drop.id,
    displayName: drop.data.title,
    description: drop.data.summary,
    author: author(base),
    homepage: new URL(dropHref(drop), base).href,
    license: DROP_LICENSE.spdx,
    keywords: [DROP_TYPES[drop.data.drop].label.toLowerCase(), SEASONS[drop.data.season].slug],
  };
}

/**
 * The plugin's files. A skill goes under skills/<name>/, named after its SKILL.md. A workflow's
 * loot is already laid out as skills/ and agents/, so it goes in as it is, README and sample run
 * included. Hooks are left unwired: the workflow README calls them optional.
 */
export function pluginFilesOf(drop: Drop, base: URL) {
  const loot = lootFilesOf(drop).filter((file) => !file.bundled);
  const prefix = drop.data.drop === "skill" ? `skills/${folderOf(drop)}/` : "";
  return [
    {
      path: ".claude-plugin/plugin.json",
      text: JSON.stringify(manifestOf(drop, base), null, 2),
    },
    ...loot.map(({ path, text }) => ({ path: `${prefix}${path}`, text })),
    licenseFileOf(drop, base),
  ];
}

export const pluginZipOf = (drop: Drop, base: URL) => zip(pluginFilesOf(drop, base));

/** marketplace.json, with every plugin zip pinned by its digest. */
export async function marketplaceOf(base: URL) {
  const drops = await getPluginDrops();
  return {
    $schema: "https://json.schemastore.org/claude-code-marketplace.json",
    name: MARKETPLACE_NAME,
    description: "Human-curated loot for your AI tools, battle tested by Dawid Młynarz.",
    owner: { ...author(base), email: SITE.email },
    plugins: drops.map((drop) => ({
      ...manifestOf(drop, base),
      category: DROP_TYPES[drop.data.drop].label.toLowerCase(),
      source: {
        source: "archive",
        url: new URL(pluginZipHref(drop), base).href,
        sha256: createHash("sha256").update(pluginZipOf(drop, base)).digest("hex"),
      },
    })),
  };
}
