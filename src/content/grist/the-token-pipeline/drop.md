# Token pipeline

## Source

- Tool: Figma variables
- Collections: Primitives (raw values, no modes), Semantic (aliases only; modes: light, dark)
- Rule: components and code use semantic tokens only

## Naming

- Pattern: category-role-variant (color-text-muted, space-4, radius-md)
- Every semantic token has a $description: where it goes, in one line

## Export

- Format: DTCG JSON
- Aliases stay as references ({color.blue.600}), never resolved values
- Text styles export as typography tokens

## Transform

- Tool: Style Dictionary
- Outputs: [CSS custom properties, React Native, ...]
- One build command; generated files are never edited by hand

## Check

- A Storybook page lists every semantic token in both modes
- CI fails if generated files don't match the latest export

## Owner

- [Who exports, how often, who reviews]
