/**
 * The about-me statements (StoryIntro): the short summary after the home hero and the longer
 * story under the ribbon on About. Dawid's own words; the pictures and GIFs zoom on hover.
 * Dawid's portrait stays out: both pages already show him in the hero.
 */
import type { StoryPart } from "@/components/blocks/StoryIntro.astro";
import newsweek from "@/content/work/newsweek-design-system/cover.avif";
import designSystem from "@/content/work/xwp/cover.avif";
import csspeeper from "@/content/work/csspeeper/cover.avif";
import anvil from "@/content/work/zazmic-anvil-ui/cover.avif";
import poznan from "@/assets/about/poznan.jpg";
import tadzik from "@/assets/about/tadzik.jpg";
import gaming from "@/assets/about/gaming.jpg";
import horseMask from "@/assets/about/about-04.jpg";
import yesNod from "@/assets/about/gifs/yes-nod.webp?url";
import yesNodStill from "@/assets/about/gifs/yes-nod-still.webp?url";
import aiPanic from "@/assets/about/gifs/music-sick-ai.webp?url";
import aiPanicStill from "@/assets/about/gifs/music-sick-ai-still.webp?url";
import gandalf from "@/assets/about/gifs/gandalf.webp?url";
import gandalfStill from "@/assets/about/gifs/gandalf-still.webp?url";
import emmet from "@/assets/about/gifs/emmet.webp?url";
import emmetStill from "@/assets/about/gifs/emmet-still.webp?url";

/** Each picture sits right before the words it illustrates. */
const pictures = {
  yesNod: {
    image: yesNod,
    still: yesNodStill,
    alt: "GIF: a bearded mountain man nodding in approval.",
    shape: "square",
  },
  aiPanic: {
    image: aiPanic,
    still: aiPanicStill,
    alt: "GIF: a retro robot panicking, its red eyes flashing.",
  },
  newsweek: { image: newsweek, alt: "The redesigned Newsweek homepage on a desktop and a phone." },
  designSystem: {
    image: designSystem,
    alt: "Design system documentation: spacing, typography and design tokens.",
  },
} satisfies Record<string, StoryPart>;

/** Home, after the hero: a short summary. */
export const HOME_STORY: StoryPart[][] = [
  [
    "I'm Dawid Młynarz, a ",
    pictures.yesNod,
    " Lead Product Designer with 15 years of turning complex problems into clear, useful products. I've ",
    pictures.newsweek,
    " worked on high-stakes products used by millions, and built the ",
    pictures.designSystem,
    " design systems behind them. Today I help teams bring ",
    pictures.aiPanic,
    " AI into their products in ways people understand, trust and actually use.",
  ],
];

/** About, under the ribbon: three short paragraphs. */
export const ABOUT_STORY: StoryPart[][] = [
  [
    "I’m a ",
    pictures.yesNod,
    " Lead Product Designer from ",
    {
      image: poznan,
      alt: "Poznań's Old Town: the town hall tower above the colourful merchant houses.",
      shape: "portrait",
    },
    " Poznań. I studied linguistics, not design. The rest I taught myself. Fifteen years in, I know my way around product strategy, research and ",
    pictures.designSystem,
    " design systems, and I’ve led design teams. I’ve worked with ",
    pictures.newsweek,
    " Newsweek and Google, and with companies of every size in between.",
  ],
  [
    "In 2016 I co-founded ",
    { image: csspeeper, alt: "CSS Peeper panels inspecting colours, fonts and assets." },
    " ",
    { text: "CSS Peeper", href: "/work/csspeeper" },
    ". Over half a million designers and developers use it. Today I’m at ",
    {
      image: anvil,
      alt: "Anvil UI components for AI agents: tool calls, sources and progress.",
    },
    " Zazmic, helping teams bring ",
    pictures.aiPanic,
    " AI into their products in ways people understand, trust and actually use.",
  ],
  [
    "At home I’m a husband and a dad. ",
    {
      image: tadzik,
      alt: "Tadzik, a black long-haired dog with a white chest, lying on a sofa.",
      shape: "portrait",
      focus: "50% 30%",
    },
    " Tadzik, our dog, runs security. I collect ",
    {
      image: emmet,
      still: emmetStill,
      alt: "GIF: Emmet from The LEGO Movie, mouth wide open.",
    },
    " LEGO. A lot of LEGO. I rewatch the extended ",
    {
      image: gandalf,
      still: gandalfStill,
      alt: "GIF: Gandalf grinning and bobbing his head.",
      shape: "square",
    },
    " Lord of the Rings more than I should. Late at night you’ll find me in ",
    {
      image: gaming,
      alt: "My Arc Raiders character in a blue helmet, flashing a peace sign on a snowy mountain.",
    },
    " Arc Raiders. I take the work seriously, ",
    { image: horseMask, alt: "Dawid in the office wearing a horse-head mask, holding a mug." },
    " myself a lot less.",
  ],
];
