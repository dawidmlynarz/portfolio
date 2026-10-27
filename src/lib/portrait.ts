// The home portrait: the photo on top, and the sculptures the liquid reveals under it. All share
// one 2400 × 1792 framing. Clay and marble have a variant per theme; the iridescent one is rare.
import portraitPhoto from "@/assets/portrait/portrait-photo.avif";
import clayLight from "@/assets/portrait/portrait-clay-light.avif";
import clayDark from "@/assets/portrait/portrait-clay-dark.avif";
import marbleLight from "@/assets/portrait/portrait-marble-light.avif";
import marbleDark from "@/assets/portrait/portrait-marble-dark.avif";
import iridescent from "@/assets/portrait/portrait-iridescent.avif";

export { portraitPhoto };

// The first loads with the canvas; the others follow once it is idle, in this order.
export const PORTRAIT_LAYERS = [
  { light: clayLight, dark: clayDark },
  { light: marbleLight, dark: marbleDark },
  { light: iridescent, weight: 0.3 },
];
