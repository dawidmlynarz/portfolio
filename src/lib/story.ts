/**
 * The about-me statements (StoryIntro): the short summary after the home hero and the longer
 * story under the ribbon on About. Dawid's own words; the pictures and GIFs zoom on hover.
 * Dawid's portrait stays out: both pages already show him in the hero.
 */
import type { StoryPart } from "@/components/blocks/StoryIntro.astro";
import csspeeper from "@/content/work/csspeeper/cover.avif";
import tadzik from "@/assets/about/tadzik.jpg";
import gaming from "@/assets/about/gaming.jpg";
import bigBrain from "@/assets/about/gifs/big-brain.webp?url";
import bigBrainStill from "@/assets/about/gifs/big-brain-still.webp?url";
import leo from "@/assets/about/gifs/leo.webp?url";
import leoStill from "@/assets/about/gifs/leo-still.webp?url";
import yesNod from "@/assets/about/gifs/yes-nod.webp?url";
import yesNodStill from "@/assets/about/gifs/yes-nod-still.webp?url";
import aiPanic from "@/assets/about/gifs/music-sick-ai.webp?url";
import aiPanicStill from "@/assets/about/gifs/music-sick-ai-still.webp?url";
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
} satisfies Record<string, StoryPart>;

/** Home, after the hero: a short summary. */
export const HOME_STORY: StoryPart[][] = [
  [
    "I'm Dawid Młynarz, a ",
    pictures.yesNod,
    " Lead Product Designer with 15+ years of experience. I've helped turn ",
    {
      image: bigBrain,
      still: bigBrainStill,
      alt: "GIF: a man smugly tapping his temple, the “big brain” meme.",
    },
    " complex problems into products used by millions and built the design systems behind them. Today, I help teams bring ",
    pictures.aiPanic,
    " AI into their workflows in ways people trust, understand, and actually use.",
  ],
];

/** About, under the ribbon: three short paragraphs, in Dawid's words. */
export const ABOUT_STORY: StoryPart[][] = [
  [
    "I’m Dawid, a ",
    pictures.yesNod,
    " Lead Product Designer from Poland. For over 15 years I’ve worked on everything from product strategy and research to design systems. I’ve also ",
    {
      image: leo,
      still: leoStill,
      alt: "GIF: Leonardo DiCaprio in a tuxedo, smiling with fireworks behind him.",
      shape: "square",
    },
    " led design teams, caring about people and cleaning up the processes that slow them down.",
  ],
  [
    "In 2016 I co-founded ",
    { image: csspeeper, alt: "CSS Peeper panels inspecting colours, fonts and assets." },
    " ",
    { text: "CSS Peeper", href: "/work/csspeeper" },
    ". Over half a million designers and developers use it. Today I’m at Zazmic, helping teams bring ",
    pictures.aiPanic,
    " AI into their products in ways people understand, trust and actually use.",
  ],
  [
    "After hours I’m a family guy with ",
    {
      image: tadzik,
      alt: "Tadzik, a black long-haired dog with a white chest, looking into the camera.",
      shape: "square",
    },
    " Tadzik, our dog who runs security. Late at night you’ll find me in ",
    {
      image: gaming,
      alt: "My Arc Raiders character in a blue helmet, flashing a peace sign on a snowy mountain.",
    },
    " Arc Raiders. Oh, and I collect ",
    {
      image: emmet,
      still: emmetStill,
      alt: "GIF: Emmet from The LEGO Movie, mouth wide open.",
      shape: "square",
    },
    " LEGO. A lot of LEGO. I take the work seriously, myself a lot less.",
  ],
];
