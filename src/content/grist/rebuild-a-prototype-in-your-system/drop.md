You're auditing a working prototype before we rebuild it with our design system.

Prototype: [repo or screens]
Design system: [package name, docs, component list]

1. List every screen and the components on it.
2. Map each component to a design system component. Mark it: exact match, needs a variant, or missing.
3. For anything missing, propose building it locally in the sandbox and flag it as a system candidate. Never add it to the system package.
4. List raw values (colours, spacing, fonts) that should become tokens.
5. Write a rebuild order, smallest shared components first.

Output a table: Screen | Component | System match | Action. Then the rebuild order.
Don't change any code yet.
