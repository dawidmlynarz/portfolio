/** Clients with a logo in src/assets/clients/<key>.svg, in display order. */
export const CLIENTS = {
  newsweek: "Newsweek",
  google: "Google",
  twitch: "Twitch",
  pearson: "Pearson",
  holidaycheck: "HolidayCheck",
  pantheon: "Pantheon",
  beatstars: "BeatStars",
  xwp: "XWP",
  "x-team": "X-Team",
  zazmic: "Zazmic",
} as const;

export type Client = keyof typeof CLIENTS;

/** Unique suffix for ids inside inlined logo SVGs (masks, clip paths), shared by every render. */
let logoIdCounter = 0;
export const nextLogoId = () => ++logoIdCounter;
