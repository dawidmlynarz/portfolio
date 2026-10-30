---
name: agentic-flow-audit
description: Audit a product flow where an AI agent acts for people. Checks plan, checkpoints, reasons, undo and handoff, and reports what to fix first. Use when reviewing or shipping an agent feature.
---

# Agentic flow audit

Read the flow you're given (screens, spec or link). Then check five things, in this order:

1. **Checkpoints.** Does the agent stop before anything that can't be undone, spends money, or speaks for the person? Nowhere else?
2. **Undo.** Can people reverse what the agent did without asking, from where the result shows up?
3. **Plan.** Before a long task, does it say what it will do and let people change it?
4. **Reasons.** Is the why next to the action, in two sentences or fewer?
5. **Handoff.** When it hands over to a person, is there a brief so nobody starts over?

For each, write one line: the rating (high, medium, ok), what you found, and the change.
Order the list by risk, highest first. Don't suggest anything outside these five.
