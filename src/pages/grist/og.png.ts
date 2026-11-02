/**
 * The front door's share image (/grist/og.png), from the general template (src/lib/og.ts).
 */
import type { APIRoute } from "astro";
import { frontImage } from "@/lib/og";

export const GET: APIRoute = async () =>
  new Response(await frontImage(), { headers: { "Content-Type": "image/png" } });
