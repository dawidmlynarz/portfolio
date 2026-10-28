// PREVIEW ONLY: the ways the home hero hands over to the About statement, compared with the
// AboutPicker. html[data-about] holds the choice (set before first paint on the home page); the
// story section and the motion layer read it. Once one is picked, the others go.
export const ABOUT_VARIANTS = [
  { value: "flow", label: "Flow" },
  { value: "split", label: "Split" },
] as const;

export type AboutVariant = (typeof ABOUT_VARIANTS)[number]["value"];

export const DEFAULT_ABOUT_VARIANT: AboutVariant = "flow";
