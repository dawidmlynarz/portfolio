/**
 * Every line icon on the site, in one style: a 24px grid, drawn as strokes (Icon.astro sets 1.75,
 * round caps and joins, currentColor). Shapes follow Lucide (ISC) unless noted. Add new icons here
 * and render them with <Icon>, so the site has one set to keep consistent.
 */
export const ICONS = {
  // Arrows: calls to action, carousel back, Back to top, downloads
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  "arrow-left": ["M19 12H5", "M11 6l-6 6 6 6"],
  "arrow-up": ["M12 19V5", "M5 12l7-7 7 7"],
  "arrow-down": ["M12 5v14", "M5 12l7 7 7-7"],
  // Before/after slider handle: points both ways
  swap: ["M9 7l-5 5 5 5", "M15 7l5 5-5 5"],
  close: ["M18 6 6 18", "M6 6l12 12"],
  info: ["M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Z", "M12 16v-4", "M12 8h.01"],
  // Form errors (the case-study lock)
  alert: ["M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Z", "M12 7.5v5.5", "M12 16.5v.01"],
  "circle-check": ["M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20Z", "m9 12 2 2 4-4"],
  // Case-study cards, the lock panel, locked Grist drops
  lock: [
    "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z",
    "M7 11V7a5 5 0 0 1 10 0v4",
  ],
  copy: [
    "M10 8h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z",
    "M5 16a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1",
  ],
  link: [
    "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1",
    "M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
  ],
  sparkles: [
    "M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0Z",
    "M20 3v4M22 5h-4M4 17v2M5 18H3",
  ],
  // Video controls
  play: ["M7 4.5v15L19 12z"],
  pause: ["M8 5v14", "M16 5v14"],
  // Theme toggle
  sun: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8Z",
    "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  ],
  moon: ["M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"],
  // Grist
  lightbulb: [
    "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    "M9 18h6",
    "M10 22h4",
  ],
  calendar: [
    "M8 2v4",
    "M16 2v4",
    "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    "M3 10h18",
  ],
  figma: [
    "M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5Z",
    "M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Z",
    "M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0Z",
    "M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0Z",
    "M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5Z",
  ],
  hourglass: [
    "M5 22h14",
    "M5 2h14",
    "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22",
    "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2",
  ],
  crown: [
    "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
    "M5 21h14",
  ],
  flask: [
    "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2",
    "M6.453 15h11.094",
    "M8.5 2h7",
  ],
} as const;

export type IconName = keyof typeof ICONS;
