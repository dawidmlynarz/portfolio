/**
 * PREVIEW: the hero backdrop options (tokens.css, [data-hero-bg]). Used by the preview picker and
 * the backgrounds playground; goes away once one is picked.
 */
export const BACKDROPS = [
  {
    value: "dots",
    label: "Dots (today)",
    note: "The current dot grid, for comparison.",
  },
  {
    value: "grain",
    label: "1 · Grain",
    note: "Even film grain over the whole hero. The closest thing to paper.",
  },
  {
    value: "fade",
    label: "2 · Grain fade",
    note: "The same grain, strongest at the top and gone by the time you reach the content.",
  },
  {
    value: "glow",
    label: "3 · Grainy glow",
    note: "A soft grey cloud of grain coming in from the top right. A grainy gradient in black and white.",
  },
  {
    value: "scan",
    label: "4 · Scanlines",
    note: "Hairline scanlines that fade out, a quiet nod to the glitch reveal.",
  },
  {
    value: "pixel",
    label: "5 · Pixel grain",
    note: "Sparse square pixels, like the glitch reveal's blocks at rest. Fades out downwards.",
  },
  {
    value: "bands",
    label: "6 · Bands",
    note: "A posterised gradient in a few near-identical greys, under fine grain.",
  },
] as const;

export type Backdrop = (typeof BACKDROPS)[number]["value"];
