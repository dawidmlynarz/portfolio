/** /grist/plugins/<slug>.zip: a skill or workflow drop as a Claude Code plugin (src/lib/marketplace.ts). */
import type { APIRoute, GetStaticPaths } from "astro";
import type { Drop } from "@/lib/drops";
import { getPluginDrops, pluginZipOf } from "@/lib/marketplace";
import { siteBase } from "@/lib/site";

export const getStaticPaths = (async () =>
  (await getPluginDrops()).map((drop) => ({
    params: { slug: drop.id },
    props: { drop },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) =>
  new Response(pluginZipOf(props.drop as Drop, siteBase(site)), {
    headers: { "Content-Type": "application/zip" },
  });
