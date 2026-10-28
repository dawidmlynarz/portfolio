// PREVIEW ONLY: the ways the home hero hands over to the About statement, compared with the
// AboutPicker. html[data-about] holds the choice (set before first paint on the home page); the
// story section and the motion layer read it. Once one is picked, the others go.
export const ABOUT_VARIANTS = [
  { value: "current", label: "0 · Current panel" },
  { value: "flow", label: "1 · Flow" },
  { value: "ink", label: "2 · Ink" },
  { value: "split", label: "3 · Split" },
  { value: "sheet", label: "4 · Sheet" },
  { value: "bridge", label: "5 · Bridge" },
  { value: "avatar", label: "6 · Avatar" },
] as const;

export type AboutVariant = (typeof ABOUT_VARIANTS)[number]["value"];

export const DEFAULT_ABOUT_VARIANT: AboutVariant = "flow";
