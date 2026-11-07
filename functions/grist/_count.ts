/**
 * POST /grist/_count: a click on a Grist copy button that never reaches the server otherwise
 * (Copy just the drop, a workflow file, the install commands, the drop link).
 *
 * CopyButton sends it with sendBeacon, and only after the visitor chose Accept on the cookie
 * notice. The body is `{"event":"copy-drop","drop":"<slug>"}`. Anything else is ignored, so the
 * counter can't be filled with made-up events. Always answers 204.
 */
import { count, type AnalyticsEngineDataset } from "./_middleware";

interface Context {
  request: Request & { cf?: { country?: string } };
  env: { GRIST_STATS?: AnalyticsEngineDataset };
}

const EVENTS = new Set(["copy-drop", "copy-file", "copy-install", "copy-link"]);
const DROP = /^[a-z0-9-]{1,96}$/;

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function onRequestPost({ request, env }: Context) {
  // Only the site's own pages count.
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return done();
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return done();

  const body = await request
    .text()
    .then((text) => (text.length > 512 ? undefined : JSON.parse(text)))
    .catch(() => undefined);
  const event = typeof body?.event === "string" ? body.event : "";
  const drop = typeof body?.drop === "string" ? body.drop : "";
  if (EVENTS.has(event) && DROP.test(drop)) count(env, request, event, drop);
  return done();
}
