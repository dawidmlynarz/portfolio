/**
 * Enforces CLAUDE.md rule 1 ("tokens only") mechanically.
 * Only src/styles/tokens.css may contain raw colors, primitives or raw sizes.
 */
const SPACING_PROPS =
  "/^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(-|$)|^(margin|padding|inset)-(block|inline)/";

/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-html/astro"],
  plugins: ["./tooling/stylelint-require-layer.mjs"],
  rules: {
    // Vite resolves bare package imports; url() would not.
    "import-notation": "string",

    // Astro's :global() reaches slotted/MDX content from a component's scoped styles.
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global"] }],

    // Order-based specificity warnings fight BEM modifiers; cascade layers already set precedence.
    "no-descending-specificity": null,

    // BEM-style class names: block, block__element, block--modifier (kebab-case parts).
    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",
      { message: "Use kebab-case BEM: block, block__element, block--modifier." },
    ],

    // No raw colors: use semantic --color-* tokens.
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
    ],

    // No raw lengths for spacing, radius or type size: use --space-*, --radius-*, --text-*.
    "declaration-property-unit-disallowed-list": [
      {
        [SPACING_PROPS]: ["px", "rem", "em"],
        "/radius$/": ["px", "rem", "em", "%"],
        "font-size": ["px", "rem", "em", "vw"],
      },
      { message: "Use a token (--space-*, --radius-*, --text-*) instead of a raw length." },
    ],

    // Components use semantic tokens, never primitives (--neutral-*, --blue-*).
    "declaration-property-value-disallowed-list": [
      { "/.*/": ["/var\\(\\s*--(neutral|blue)-/"] },
      { message: "Use a semantic token (e.g. --color-text), not a primitive." },
    ],

    // Astro scoped <style> is unlayered and would beat every layer: wrap it in @layer components.
    "mlynarz/require-layer": true,
  },
  overrides: [
    {
      // Experiments (CLAUDE.md rule 6) map theme colours and type to site tokens, but keep their
      // own illustration colours and layout values. Layers, BEM and the primitive ban still apply.
      files: ["src/experiments/**"],
      rules: {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-unit-disallowed-list": null,
      },
    },
    {
      files: ["src/styles/tokens.css"],
      rules: {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-unit-disallowed-list": null,
        "declaration-property-value-disallowed-list": null,
        "custom-property-empty-line-before": null,
        "comment-empty-line-before": null,
      },
    },
  ],
};
