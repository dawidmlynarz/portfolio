/** /grist/marketplace.json: Grist as a Claude Code plugin marketplace (src/lib/marketplace.ts). */
import type { APIRoute } from "astro";
import { marketplaceOf } from "@/lib/marketplace";
import { siteBase } from "@/lib/site";

export const GET: APIRoute = async ({ site }) =>
  new Response(JSON.stringify(await marketplaceOf(siteBase(site)), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
