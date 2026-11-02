# DESIGN.md

## What this system is

The design system behind mlynarz.com, Dawid Młynarz's portfolio, and Grist.
One site, built in Astro with plain CSS. Light and dark themes from day one.

## Principles

- Tokens only. This means no hex, no raw px for spacing or radius, outside tokens.css.
- Reuse before creating. This means a new variant before a near-duplicate component.
- Complete without JavaScript. This means motion is extra, never needed to read the page.

## Where things live

- Tokens: src/styles/tokens.css, mirrored by name in the Figma file "mlynarz.com — Foundations"
- Components: src/components/ (layout, ui, blocks), all shown on /styleguide
- Patterns: CLAUDE.md (hard rules) and DECISIONS.md (why things are the way they are)

## Foundations

Colour is black and white. Emphasis comes from the inverse surface, and the only colour is --color-danger, for errors. Every --color-* token uses light-dark(), so components never check the theme.
Type is fluid, from the 375 to the 1440 mode in Figma, through --text-* tokens.
Spacing and radius use --space-* and --radius-*. Layout uses Container, Grid, Stack and Section.
Motion lives in one module (src/scripts/motion.ts) and respects reduced motion.

## Components

- Container, Stack, Grid, Section: page layout. Use these before writing layout CSS.
- Button: actions. Variants for primary, secondary and ghost.
- Link: text links, with the hairline underline.
- Figure, Video, BeforeAfter: case study media. Alt text required.
- Tag: short labels on cards.
- Nav, Footer, ThemeToggle: site chrome. One of each per page.

## Rules

- Do use semantic tokens (--color-text). Don't use primitives (--gray-900) in components.
- Do put component CSS in a scoped style inside @layer components. Don't write unlayered CSS.
- Do name classes in BEM (block__element--modifier). Don't copy Webflow classes.
- Do add every new component to /styleguide. Don't ship one that isn't there.

## Accessibility

The system gives visible focus (--color-focus), semantic HTML and reduced motion support.
Product pages still owe alt text and a heading order that makes sense.

## Changing the system

Change a token in tokens.css and in Figma, under the same name. Log anything non-obvious in DECISIONS.md. Dawid approves.
