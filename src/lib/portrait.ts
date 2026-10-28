// The home portrait: the photo on top, and the sculptures the glitch reveals under it. All share
// one 2400 × 1792 framing. Marble has a variant per theme; the iridescent one is rare.
import portraitPhoto from "@/assets/portrait/portrait-photo.avif";
import marbleLight from "@/assets/portrait/portrait-marble-light.avif";
import marbleDark from "@/assets/portrait/portrait-marble-dark.avif";
import iridescent from "@/assets/portrait/portrait-iridescent.avif";

export { portraitPhoto };

// The first loads with the canvas; the others follow once it is idle, in this order.
export const PORTRAIT_LAYERS = [
  { light: marbleLight, dark: marbleDark },
  { light: iridescent, weight: 0.3 },
];
