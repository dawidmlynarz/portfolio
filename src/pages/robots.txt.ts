import type { APIRoute } from "astro";
import { isProduction } from "@/lib/site";

export const GET: APIRoute = ({ site }) => {
  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site)}\n`
    : "User-agent: *\nDisallow: /\n";

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
