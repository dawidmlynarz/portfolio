/**
 * `npm run stats [-- --days 7]`: Grist downloads, installs and copies per drop, read from the
 * Workers Analytics Engine dataset that functions/grist/_middleware.ts writes to.
 *
 * Needs CF_ACCOUNT_ID and CF_API_TOKEN (a token with Account Analytics Read), in the environment
 * or in a git-ignored .env file. Setup: README, "Grist stats".
 *
 * Numbers are requests, not people. One person downloading twice counts twice. A plugin row is an
 * install or an update (updates come when a drop's files change).
 */
const DATASET = "grist_stats";

const days = Number(process.argv[process.argv.indexOf("--days") + 1]) || 7;
const { CF_ACCOUNT_ID, CF_API_TOKEN } = process.env;
if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error("Set CF_ACCOUNT_ID and CF_API_TOKEN first. See README, Grist stats.");
  process.exit(1);
}

async function sql(query) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/analytics_engine/sql`,
    { method: "POST", headers: { Authorization: `Bearer ${CF_API_TOKEN}` }, body: query },
  );
  const text = await response.text();
  if (!response.ok) throw new Error(`Analytics Engine answered ${response.status}: ${text}`);
  return JSON.parse(text).data;
}

const since = `timestamp > NOW() - INTERVAL '${Math.floor(days)}' DAY`;
// _sample_interval undoes Analytics Engine's sampling, which only starts at far more traffic.
const rows = await sql(`
  SELECT blob1 AS event, blob2 AS drop, blob3 AS client, SUM(_sample_interval) AS n
  FROM ${DATASET}
  WHERE ${since}
  GROUP BY event, drop, client
  FORMAT JSON
`);

const COLUMNS = [
  ["zip", "zip"],
  ["md", "md"],
  ["copy-ai", "copy AI"],
  ["copy-drop", "copy drop"],
  ["copy-file", "copy file"],
  ["copy-install", "copy cmd"],
  ["copy-link", "copy link"],
  ["plugin", "plugin"],
  ["drop-md", "raw md"],
];

/** Takes: everything that hands the drop over. Links and raw .md fetches (mostly AI tools) aren't. */
const TAKES = new Set(["zip", "md", "copy-ai", "copy-drop", "copy-file", "copy-install", "plugin"]);

const byDrop = new Map();
const clients = new Map();
const other = new Map();
for (const { event, drop, client, n } of rows) {
  const count = Number(n);
  if (!COLUMNS.some(([key]) => key === event)) {
    const key = drop ? `${event} ${drop}` : event;
    other.set(key, (other.get(key) ?? 0) + count);
    continue;
  }
  const line = byDrop.get(drop) ?? { takes: 0 };
  line[event] = (line[event] ?? 0) + count;
  if (TAKES.has(event)) line.takes += count;
  byDrop.set(drop, line);
  if (event === "plugin") clients.set(client, (clients.get(client) ?? 0) + count);
}

console.log(`Grist, last ${days} days\n`);
if (byDrop.size === 0) console.log("No downloads or copies yet.");
else {
  const table = [...byDrop]
    .sort(([, a], [, b]) => b.takes - a.takes)
    .map(([drop, line]) => ({
      drop,
      takes: line.takes,
      ...Object.fromEntries(COLUMNS.map(([key, label]) => [label, line[key] ?? 0])),
    }));
  console.table(table);
}

if (other.size) {
  console.log("\nOther files");
  console.table(Object.fromEntries([...other].map(([key, n]) => [key, { requests: n }])));
}

if (clients.size) {
  console.log("\nPlugin zips by client (claude-code should be most of them)");
  console.table(Object.fromEntries([...clients].map(([key, n]) => [key, { requests: n }])));
}

console.log(
  "\nCopies are counted only for visitors who chose Accept. Page views are in Cloudflare Web Analytics.",
);
