# Token pipeline

## Source

- Tool: Figma variables
- Primitives collection: raw values only (blue-600, space-16), no modes
- Semantic collection: tokens named by role (color-text-link, space-section) that point at primitives; modes for light and dark
- Rule: components and code use semantic tokens only

## Naming

- Pattern: category-role-variant (color-text-muted, space-4, radius-md)
- Every semantic token has a $description: where it goes, in one line

## Export

- Format: one JSON file in the W3C design tokens format (also called DTCG, after the W3C Design Tokens Community Group), which Style Dictionary reads
- Links between tokens stay links ({color.blue.600}), never copied values
- Text styles export as typography tokens

## Build

- Tool: Style Dictionary (open source)
- Outputs: [the platforms you ship to: CSS variables, iOS, Android, React Native]
- One build command; generated files are never edited by hand

## Check

- One page (Storybook or similar) shows every semantic token in both modes
- The automated build fails if the generated files don't match the latest export

## Owner

- The design system designer exports after every change to the variables
- A developer reviews the generated files in a pull request before they merge
