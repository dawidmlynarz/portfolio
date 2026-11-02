Design system audit: mlynarz.com

Ownership
[x] A named design owner, and who approves changes. Dawid owns and approves.
[ ] A way to ask for a new component or token. Not written down.

Accessibility
[ ] A written target. Not stated. Suggest WCAG 2.2 AA.
[ ] Contrast checked for every text and background token pair. Only the danger colour has a logged ratio.
[x] Focus styles defined as tokens. --color-focus.

Tokens
[x] Colour, type, spacing and radius are all tokens. Stylelint blocks raw values.
[x] Primitives and semantic tokens are separate, components use semantic only.
[ ] Every semantic token has a one-line description. Comments cover groups, not each token.

Components
[x] Real components with variants. Astro components, BEM modifiers.
[ ] Every component has its states. Buttons have no loading state.
[x] Build or adopt decided. Built, no framework.

Docs
[x] Docs link to the source. /styleguide renders the real components.
[x] Open items listed where agents read them. CLAUDE.md and DECISIONS.md.

Score: 9 of 14. Fix first: token descriptions, contrast pairs, an accessibility target.
