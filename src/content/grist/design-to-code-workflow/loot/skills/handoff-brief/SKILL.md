---
name: handoff-brief
description: Writes a handoff brief and acceptance criteria for a design before a coding agent builds it. First step of the design-to-code workflow.
---

# Handoff brief

## Ask for

- A link to the design, with its version or date
- The design system: package name, docs, component list
- The smallest and largest screen sizes to support

## Do

Write BRIEF.md. Link to the design for the visuals; the brief is for everything the design can't show.

- Intent: what the person is trying to do here, and what matters most
- Components: each system component used, and any new one needed, with why
- Tokens: anything unusual, such as a token used outside its normal role
- States: every state, what triggers it and what it shows
- Behaviour: interactions, transitions, validation, keyboard
- Content: real copy, limits, and how long content wraps or truncates
- Out of scope: what this handoff deliberately leaves out

Ask the designer about anything ambiguous instead of choosing a default.

## Acceptance criteria

Add them to BRIEF.md, grouped by layout, states, behaviour, content and accessibility. Each one must be checkable on the running build in under a minute. Prefer the things that are easy to get wrong.

## Then

Stop. Show BRIEF.md and ask for approval (checkpoint 1). After approval, hand it to component-build.
