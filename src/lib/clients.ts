/** Clients with a logo in src/assets/clients/<key>.svg. */
export const CLIENTS = {
  newsweek: "Newsweek",
  google: "Google",
  pantheon: "Pantheon",
  xwp: "XWP",
  beatstars: "BeatStars",
  "x-team": "X-Team",
  holidaycheck: "HolidayCheck",
  pearson: "Pearson",
  passion: "Passion",
} as const;

export type Client = keyof typeof CLIENTS;
