/**
 * Cloudflare Pages Function for /grist/*: counts Grist downloads and plugin installs.
 *
 * Static files can't count themselves and Web Analytics only sees pages that run its beacon, so
 * this middleware writes one row to Workers Analytics Engine for each Grist file that is served,
 * then hands the file over unchanged (`next()`, so _headers still apply). Pages pass straight
 * through without a row.
 *
 * A row holds the event, the drop, the kind of client (from the user agent) and the country. No
 * IP, no cookie, nothing stored on the visitor's device: it is a server log with fewer fields, so
 * it runs for everyone. Without the GRIST_STATS binding (local dev, previews) nothing is written.
 *
 * Columns (read them with `npm run stats`):
 * blob1 event · blob2 drop (or season) · blob3 client · blob4 country · blob5 user agent product
 * (first token only, to tell Claude Code apart) · double1 count (always 1) · index1 drop.
 */

export interface AnalyticsEngineDataset {
  writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void;
}

interface Env {
  GRIST_STATS?: AnalyticsEngineDataset;
}

interface Context {
  request: Request & { cf?: { country?: string } };
  env: Env;
  next: () => Promise<Response>;
}

/** Path patterns of the files worth counting, each with its event name. */
const FILES: [RegExp, string][] = [
  [/^\/grist\/plugins\/([a-z0-9-]+)\.zip$/, "plugin"],
  [/^\/grist\/marketplace\.json$/, "marketplace"],
  [/^\/grist\/season\/([a-z0-9-]+)\.md$/, "season"],
  [/^\/grist\/llms-full\.txt$/, "llms-full"],
  [/^\/grist\/([a-z0-9-]+)\/drop\.md$/, "drop-md"],
  [/^\/grist\/([a-z0-9-]+)\.zip$/, "zip"],
  [/^\/grist\/([a-z0-9-]+)\.md$/, "md"],
];

/** Sent by the Copy for AI button, whose copy is a fetch of the .md twin. */
export const COPY_HEADER = "X-Grist-Copy";

/** The kind of client, from the user agent. Rough on purpose. */
export function clientOf(userAgent: string) {
  if (/claude|anthropic/i.test(userAgent)) return "claude-code";
  if (/bot|crawl|spider|slurp|preview|scan/i.test(userAgent)) return "bot";
  if (/^mozilla\//i.test(userAgent)) return "browser";
  if (/curl|wget|python|node|undici|axios|go-http|git/i.test(userAgent)) return "tool";
  return "other";
}

/** Writes one row. Never throws: counting must not break a download. */
export function count(env: Env, request: Context["request"], event: string, drop: string) {
  try {
    const userAgent = request.headers.get("User-Agent") ?? "";
    env.GRIST_STATS?.writeDataPoint({
      blobs: [
        event,
        drop,
        clientOf(userAgent),
        request.cf?.country ?? "",
        userAgent.split(" ")[0]!.slice(0, 40),
      ],
      doubles: [1],
      indexes: [(drop || event).slice(0, 96)],
    });
  } catch {
    // Analytics Engine unavailable: serve the file anyway.
  }
}

export async function onRequest({ request, env, next }: Context) {
  const response = await next();
  if (request.method !== "GET" || response.status !== 200 || !env.GRIST_STATS) return response;

  const path = new URL(request.url).pathname.toLowerCase();
  for (const [pattern, event] of FILES) {
    const match = pattern.exec(path);
    if (!match) continue;
    const copied = event === "md" && request.headers.get(COPY_HEADER) === "1";
    count(env, request, copied ? "copy-ai" : event, match[1] ?? "");
    break;
  }
  return response;
}
