## Design system audit

### Ownership

- [ ] A named design owner, and who approves changes
- [ ] A way to ask for a new component or token

### Accessibility

- [ ] A written target (for example WCAG 2.2 AA, the common web accessibility standard)
- [ ] Contrast checked for every text and background token pair
- [ ] Focus styles defined as tokens

### Tokens

- [ ] Colour, type, spacing and radius are all tokens; anything still hard-coded is listed
- [ ] Raw values (primitives) and named roles (semantic tokens) are separate, and components use only the named roles
- [ ] Every semantic token has a one-line description

### Components

- [ ] Components are real components with variants, not static frames
- [ ] Every component has its states (hover, focus, disabled, error, loading), or the missing ones are listed
- [ ] Build or adopt is decided for each component family, with the reason

### Docs

- [ ] Docs link to the source tokens and components instead of copying values
- [ ] Open items are listed where agents read them (DESIGN.md or README)
