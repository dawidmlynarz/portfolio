// The home portrait: the photo on top, and the sculptures the glitch reveals under it. All share
// one 2400 × 1792 framing. Marble has a variant per theme. Both come up about equally often, and
// the two resting bands always show one of each.
import portraitPhoto from "@/assets/portrait/portrait-photo.avif";
import marbleLight from "@/assets/portrait/portrait-marble-light.avif";
import marbleDark from "@/assets/portrait/portrait-marble-dark.avif";
import iridescent from "@/assets/portrait/portrait-iridescent.avif";

export { portraitPhoto };

// The first loads with the canvas; the others follow once it is idle, in this order.
export const PORTRAIT_LAYERS = [
  { light: marbleLight, dark: marbleDark, weight: 1 },
  { light: iridescent, weight: 1 },
];
