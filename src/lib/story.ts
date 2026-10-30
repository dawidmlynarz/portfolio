/**
 * The about-me statements (StoryIntro): the short summary after the home hero and the longer
 * story under the ribbon on About. Dawid's own words; the pictures and GIFs zoom on hover.
 * Dawid's portrait stays out: both pages already show him in the hero.
 */
import type { StoryPart } from "@/components/blocks/StoryIntro.astro";
import newsweek from "@/content/work/newsweek-design-system/cover.avif";
import beatstars from "@/content/work/beatstars-product-design/cover.avif";
import designSystem from "@/content/work/xwp/cover.avif";
import csspeeper from "@/content/work/csspeeper/cover.avif";
import anvil from "@/content/work/zazmic-anvil-ui/cover.avif";
import poznan from "@/assets/about/poznan.jpg";
import tadzik from "@/assets/about/tadzik.jpg";
import horseMask from "@/assets/about/about-04.jpg";
import mordor from "@/assets/about/gifs/mordor.webp?url";
import mordorStill from "@/assets/about/gifs/mordor-still.webp?url";
import precious from "@/assets/about/gifs/precious.webp?url";
import preciousStill from "@/assets/about/gifs/precious-still.webp?url";
import legoCastle from "@/assets/about/gifs/lego-castle.webp?url";
import legoCastleStill from "@/assets/about/gifs/lego-castle-still.webp?url";
import gamer from "@/assets/about/gifs/friday-gamer.webp?url";
import gamerStill from "@/assets/about/gifs/friday-gamer-still.webp?url";

const pictures = {
  newsweek: { image: newsweek, alt: "The redesigned Newsweek homepage on a desktop and a phone." },
  beatstars: { image: beatstars, alt: "BeatStars app screens for music producers." },
  designSystem: {
    image: designSystem,
    alt: "Design system documentation: spacing, typography and design tokens.",
  },
  anvil: {
    image: anvil,
    alt: "Anvil UI components for AI agents: tool calls, sources and progress.",
  },
} satisfies Record<string, StoryPart>;

/** Home, after the hero: the original summary, word for word. */
export const HOME_STORY: StoryPart[][] = [
  [
    "I'm Dawid Młynarz, a Lead Product Designer with 15 years of turning complex problems into clear, useful products. I've shaped newsrooms ",
    pictures.newsweek,
    ", fintech and creator platforms ",
    pictures.beatstars,
    ", and built the design systems ",
    pictures.designSystem,
    " behind them. Today I help teams bring AI into their products ",
    pictures.anvil,
    " in ways people understand, trust and actually use.",
  ],
];

/** About, under the ribbon: three paragraphs at most. */
export const ABOUT_STORY: StoryPart[][] = [
  [
    "I’m a Lead Product Designer from Poznań ",
    {
      image: poznan,
      alt: "Poznań's Old Town: the town hall tower above the colourful merchant houses.",
      shape: "portrait",
    },
    ". I studied linguistics, not design, and learned the craft on the job ",
    {
      image: mordor,
      still: mordorStill,
      alt: "GIF: Boromir explaining that one does not simply walk into Mordor.",
    },
    ". For 15 years I’ve shaped newsrooms ",
    pictures.newsweek,
    ", fintech and creator platforms ",
    pictures.beatstars,
    ", and built the design systems behind them.",
  ],
  [
    "In 2016 I co-founded ",
    { text: "CSS Peeper", href: "/work/csspeeper" },
    " ",
    { image: csspeeper, alt: "CSS Peeper panels inspecting colours, fonts and assets." },
    ", a Chrome extension used by over half a million designers and developers. Today I help teams bring AI into their products ",
    pictures.anvil,
    " in ways people understand, trust and actually use.",
  ],
  [
    "At home I’m a husband, a dad, and the owner of Tadzik ",
    {
      image: tadzik,
      alt: "Tadzik, a black long-haired dog with a white chest, lying on a sofa.",
      shape: "portrait",
      focus: "50% 30%",
    },
    ", our self-appointed head of security. I collect classic LEGO Castle and Pirates sets ",
    {
      image: legoCastle,
      still: legoCastleStill,
      alt: "GIF: a LEGO knight with a crossbow on a castle wall.",
    },
    ", rewatch the extended Lord of the Rings more than I should ",
    {
      image: precious,
      still: preciousStill,
      alt: "GIF: Gollum's hand reaching for the ring, “my… precious”.",
    },
    ", and game late into the night ",
    {
      image: gamer,
      still: gamerStill,
      alt: "GIF: someone hunched over a gaming setup, captioned “Friday gamer status”.",
      shape: "square",
    },
    ". I take the work seriously, myself a lot less ",
    { image: horseMask, alt: "Dawid in the office wearing a horse-head mask, holding a mug." },
    ".",
  ],
];
