Check these design tokens the way a coding agent will read them.

For each semantic token, flag:

- No description, or one that only repeats the name
- A description of how it looks ("dark grey") instead of what it's for
- Two tokens whose descriptions overlap, so an agent can't tell which to pick
- A name built on a raw value (blue-500) on a token components use

Skip primitives. Components shouldn't use them, so they don't need descriptions.

Output a table: Token | Problem | Suggested description
Then list any token you couldn't judge, marked [ASK].

Tokens:
[paste your token file]
