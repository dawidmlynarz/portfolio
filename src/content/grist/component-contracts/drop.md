---
name: component-contract
description: Write or update the contract for a UI component (purpose, limits, don't use for) next to its source file. Use when a component is added or its props change.
---

# Component contract

1. Read the component's source and every place it's used.
2. Write CONTRACT.md next to it with three short sections:
   - **For:** what it's for, in one sentence.
   - **Limits:** what it can't do or shouldn't hold.
   - **Don't use for:** the near-miss cases, each with the component to use instead.
3. Keep it under 15 lines. Don't restate the props.
4. If usage elsewhere breaks the contract, list those places at the end instead of fixing them.
