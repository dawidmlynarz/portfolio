/** Clients with a logo in src/assets/clients/<key>.svg, in display order. */
export const CLIENTS = {
  newsweek: "Newsweek",
  google: "Google",
  nerdwallet: "NerdWallet",
  twitch: "Twitch",
  pearson: "Pearson",
  holidaycheck: "HolidayCheck",
  pantheon: "Pantheon",
  beatstars: "BeatStars",
  xwp: "XWP",
  "x-team": "X-Team",
  zazmic: "Zazmic",
  csspeeper: "CSS Peeper",
  grist: "Grist",
} as const;

export type Client = keyof typeof CLIENTS;

/** Companies I worked with, for the logo lists (CSS Peeper and Grist are my own products, so they stay out). */
const OWN_PRODUCTS: Client[] = ["csspeeper", "grist"];
export const WORKED_WITH = (Object.keys(CLIENTS) as Client[]).filter(
  (key) => !OWN_PRODUCTS.includes(key),
);

/** Unique suffix for ids inside inlined logo SVGs (masks, clip paths), shared by every render. */
let logoIdCounter = 0;
export const nextLogoId = () => ++logoIdCounter;
