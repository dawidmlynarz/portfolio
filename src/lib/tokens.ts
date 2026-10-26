/** Spacing scale keys from tokens.css (--space-*). Props take a key, CSS gets var(--space-<key>). */
export const SPACE = ["1", "2", "3", "4", "6", "8", "10", "12", "16", "24"] as const;
export type Space = (typeof SPACE)[number];

export const space = (key: Space) => `var(--space-${key})`;

/** Semantic color roles from tokens.css (--color-*). The only colors components may use. */
export const COLOR_ROLES = [
  "bg",
  "bg-subtle",
  "text",
  "text-muted",
  "brand",
  "brand-strong",
  "border",
  "border-muted",
  "border-subtle",
  "focus",
  "overlay",
  "scrim",
  "tint-pink",
  "tint-blue",
  "tint-green",
  "tint-orange",
  "tint-violet",
  "tint-cyan",
  "tint-yellow",
  "ink",
  "sticker",
] as const;
