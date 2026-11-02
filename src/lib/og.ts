/**
 * Share images (Open Graph, 1200×630) for Grist, from Dawid's Figma templates
 * (Foundations, "opengraph images", 170:6284): one for the front door, one per drop in its
 * rarity's colours. Built at build time with Satori (layout to SVG) and resvg (SVG to PNG), so
 * nothing runs when someone shares a link.
 *
 * Colours come from tokens.css (the light theme, which the templates use), the logo and the stamp
 * are the templates' own artwork (src/assets/og), the rarity icons are TileIcon's paths, and the
 * type is Geist at the template's sizes.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { create, type Font } from "fontkitten";
import { Resvg } from "@resvg/resvg-js";
import { RARITY_ICON_PATHS } from "@/components/grist/tile-icons";
import { DROP_TYPES, SEASONS, type Rarity } from "@/lib/grist";
import type { Drop } from "@/lib/drops";

// Paths from the project root: the build runs there, and bundling moves this file.
const root = (path: string) => join(process.cwd(), path);
const read = (path: string) => readFileSync(root(path));
const text = (path: string) => readFileSync(root(path), "utf8");

// ---- Tokens: the light value of a custom property in tokens.css, var() followed through. ----
const TOKENS = text("src/styles/tokens.css");
function token(name: string, seen = 0): string {
  const match = TOKENS.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match || seen > 8) throw new Error(`og: no token ${name}`);
  let value = match[1]!.trim();
  const pair = value.match(/^light-dark\(\s*([^,]+(?:\([^)]*\))?[^,]*),/);
  if (pair) value = pair[1]!.trim();
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  return ref ? token(ref[1]!, seen + 1) : value;
}

const C = {
  bg: token("--color-bg"),
  text: token("--color-text"),
  muted: token("--color-text-muted"),
  tier: (rarity: Rarity) => token(`--rarity-${rarity}-icon`),
};

/** `amount` of hex colour `a` over hex colour `b` (Satori has no color-mix). */
function mix(a: string, b: string, amount: number) {
  const rgb = (hex: string) => {
    const full = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join("") : hex.slice(1);
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };
  const [x, y] = [rgb(a), rgb(b)];
  return `#${x
    .map((v, i) =>
      Math.round(v * amount + y[i]! * (1 - amount))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

// ---- Artwork ----
const svgData = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const LOGO = svgData(text("src/assets/og/logo.svg"));
const STAMP_RING = svgData(text("src/assets/og/stamp-ring.svg"));
const STAMP_MARK = svgData(text("src/assets/og/stamp-mark.svg"));
const icon = (rarity: Rarity) =>
  svgData(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${C.tier(rarity)}">${RARITY_ICON_PATHS[
      rarity
    ]
      .map((d) => `<path d="${d}"/>`)
      .join("")}</svg>`,
  );

// Geist's static TTFs (v1.9.0, OFL) with the GPOS table removed. Satori draws glyphs kerned but
// measures them unkerned, which left wide gaps after words like "Your" and "System". Unkerned,
// the two agree. Satori can't read woff2 or variable fonts, and these carry ł.
const FONT_FILES = {
  400: read("src/assets/og/fonts/Geist-Regular.ttf"),
  600: read("src/assets/og/fonts/Geist-SemiBold.ttf"),
} as const;
const FONTS = ([400, 600] as const).map((weight) => ({
  name: "Geist",
  data: FONT_FILES[weight],
  weight,
  style: "normal" as const,
}));

// The same fonts, for measuring words before layout (unkerned, like Satori draws them).
const openFont = (data: Buffer) => create(data) as Font; // a single font, not a collection
const METRICS = { 400: openFont(FONT_FILES[400]), 600: openFont(FONT_FILES[600]) };
type Weight = keyof typeof METRICS;
const advance = (text: string, size: number, weight: Weight, tracking = 0) => {
  const font = METRICS[weight];
  return [...text].reduce(
    (sum, char) =>
      sum +
      (font.glyphForCodePoint(char.codePointAt(0)!).advanceWidth * size) / font.unitsPerEm +
      tracking,
    0,
  );
};

// The page's grain (--texture-grain-light), drawn at the template's size so resvg renders it once.
const GRAIN = svgData(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .3 0 0 0 -.11"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`,
);

// ---- A tiny element helper for Satori (it takes React-shaped objects; no React needed). ----
type Style = Record<string, string | number>;
type Child = El | string;
interface El {
  type: string;
  props: { style?: Style; src?: string; width?: number; height?: number; children?: Child[] };
}
const h = (type: string, style: Style, ...children: Child[]): El => ({
  type,
  props: { style: { display: "flex", ...style }, children },
});
const img = (src: string, width: number, height: number, style: Style = {}): El => ({
  type: "img",
  props: { src, width, height, style },
});

const W = 1200;
const H = 630;
const PAD = 64;
const COLUMN = W - 2 * PAD - 80 - 180; // the text column, beside the stamp

/** The frame every template shares: a tint and grain fading out, the rule, the header row and the stamp. */
function frame(header: El, body: El, wash: string) {
  return h(
    "div",
    { width: W, height: H, backgroundColor: C.bg, fontFamily: "Geist", color: C.text },
    // The tint and the grain, then the background fading in over them by three quarters down.
    h("div", { position: "absolute", top: 0, left: 0, width: W, height: H, backgroundColor: wash }),
    img(GRAIN, W, H, { position: "absolute", top: 0, left: 0 }),
    h("div", {
      position: "absolute",
      top: 0,
      left: 0,
      width: W,
      height: H,
      backgroundImage: `linear-gradient(to bottom, ${mix(C.bg, C.bg, 1)}00, ${C.bg} 75%)`,
    }),
    h(
      "div",
      {
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        flexDirection: "column",
        gap: 64,
        padding: PAD,
      },
      h(
        "div",
        { flexDirection: "column", gap: 24, width: "100%" },
        h("div", { width: "100%", height: 2, backgroundColor: C.text }),
        h(
          "div",
          { justifyContent: "space-between", alignItems: "center", width: "100%" },
          header,
          img(LOGO, 86, 36),
        ),
      ),
      h(
        "div",
        { flexGrow: 1, alignItems: "flex-end", gap: 80, width: "100%" },
        // A fixed column: Satori sizes wrapping text by its unwrapped width, which pushes the stamp out.
        h("div", { width: COLUMN, flexShrink: 0 }, body),
        h(
          "div",
          { position: "relative", width: 180, height: 180, flexShrink: 0 },
          img(STAMP_RING, 158.729, 158.592, { position: "absolute", left: 10.6, top: 10.7 }),
          img(STAMP_MARK, 72, 72, { position: "absolute", left: 54, top: 54 }),
        ),
      ),
    ),
  );
}

/** Text as one span per word, wrapped by flexbox a space apart, so one line can mix colours. */
type Words = [string, string][]; // [text, colour] runs
type TextStyle = { fontSize: number; fontWeight?: Weight; letterSpacing?: number } & Style;
const gapOf = ({ fontSize, fontWeight = 400, letterSpacing = 0 }: TextStyle) =>
  advance(" ", fontSize, fontWeight, letterSpacing);
function run(runs: Words, style: TextStyle) {
  const gap = gapOf(style);
  return h(
    "div",
    { flexWrap: "wrap", columnGap: gap, ...style },
    ...runs.flatMap(([line, color]) => line.split(" ").map((word) => h("span", { color }, word))),
  );
}

const LEAD = { fontSize: 22, lineHeight: "33px", flexWrap: "nowrap" };

/** The words of `text` broken into lines `width` wide, the way flex-wrap will break them. */
function lines(text: string, width: number, style: TextStyle) {
  const { fontSize, fontWeight = 400, letterSpacing = 0 } = style;
  const gap = gapOf(style);
  const out: string[] = [];
  let line = "";
  let used = 0;
  for (const word of text.split(" ")) {
    const w = advance(word, fontSize, fontWeight, letterSpacing);
    if (line && used + gap + w > width) {
      out.push(line);
      [line, used] = [word, w];
    } else [line, used] = [line ? `${line} ${word}` : word, line ? used + gap + w : w];
  }
  return line ? [...out, line] : out;
}

/** `text` cut to `max` lines at a word, with an ellipsis when it runs over. */
function clip(text: string, width: number, style: TextStyle, max: number) {
  if (lines(text, width, style).length <= max) return text;
  const words = text.split(" ");
  while (words.length && lines(`${words.join(" ")}…`, width, style).length > max) words.pop();
  return `${words.join(" ").replace(/[,.;:]$/, "")}…`;
}

async function png(tree: El) {
  const svg = await satori(tree as never, { width: W, height: H, fonts: FONTS });
  return new Uint8Array(new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng());
}

/** The front door: all six icons over the hero line. */
export function frontImage() {
  const icons = (["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const).map((r) =>
    img(icon(r), 36, 36),
  );
  return png(
    frame(
      run(
        [
          ["Loot for AI grinders.", C.text],
          ["Human-curated by Dawid Młynarz.", C.muted],
        ],
        LEAD,
      ),
      h(
        "div",
        { flexGrow: 1, flexDirection: "column", gap: 24 },
        h("div", { gap: 10, alignItems: "center" }, ...icons),
        run(
          [
            ["Your AI is only as good as what you feed it.", C.text],
            ["Here’s human-curated loot, a new drop every Friday.", C.muted],
          ],
          { fontSize: 64, fontWeight: 600, lineHeight: "67.2px", letterSpacing: -1.6 },
        ),
      ),
      token("--color-bg-subtle"),
    ),
  );
}

/** A drop: its type in the tier colour, its name, and its summary. Long names step down a size. */
export function dropImage(drop: Drop) {
  const { title, summary, rarity, season } = drop.data;
  const s = SEASONS[season];
  // The template's 88px title, stepped down until it fits on two lines.
  const titleStyle = (size: number): TextStyle => ({
    fontSize: size,
    fontWeight: 600,
    lineHeight: `${size * 1.02}px`,
    letterSpacing: -size * 0.03,
  });
  const size = [88, 76, 64].find((px) => lines(title, COLUMN, titleStyle(px)).length <= 2) ?? 56;
  const summaryStyle: TextStyle = { fontSize: 30, lineHeight: "48.4px", letterSpacing: -0.3 };
  return png(
    frame(
      run(
        [
          [`Season ${s.number} //`, C.muted],
          [s.title, C.text],
        ],
        LEAD,
      ),
      h(
        "div",
        { flexGrow: 1, flexDirection: "column", gap: 24 },
        h(
          "div",
          { gap: 10, alignItems: "center" },
          img(icon(rarity), 36, 36),
          run([[DROP_TYPES[drop.data.drop].label, C.tier(rarity)]], {
            fontSize: 30,
            fontWeight: 600,
            lineHeight: "36px",
            letterSpacing: -0.3,
          }),
        ),
        run([[title, C.text]], titleStyle(size)),
        run([[clip(summary, COLUMN, summaryStyle, 2), C.muted]], summaryStyle),
      ),
      // The wash: the tier colour at 8% over the background, like the cards' hover.
      mix(C.tier(rarity), C.bg, 0.08),
    ),
  );
}
