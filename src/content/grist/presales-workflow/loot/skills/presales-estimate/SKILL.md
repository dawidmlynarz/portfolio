---
name: presales-estimate
description: Breaks the corrected scope into screens, flows and system work, and estimates hours as ranges with assumptions, exclusions and UX risks. Third step of the presales workflow.
---

# Presales: estimate

## Ask for

- corrections.md and straw-man.md
- My baselines, hours per unit: simple screen [x], complex screen [x], flow [x], new component [x], research activity [x]

## Do

1. Break the work into units: screens (simple or complex, and why), flows (start, end, steps, states), system work (components and tokens that don't exist yet), research and discovery, handoff and QA support.
2. Give each unit low and high hours from my baselines, with one line of reasoning.
3. Group the hours by phase: discovery, design, handoff, QA support.
4. List assumptions (what we believe is true, and what happens to the hours if it's wrong), exclusions, and UX risks (risk, effect on hours, how we'd reduce it).

Ask me about anything the corrections don't settle before you guess. Write it all to estimate.md.

## Then

Send estimate.md to the estimate-reviewer agent. Fix everything it flags, then stop and ask for approval (checkpoint 2). After approval, hand estimate.md to presales-sow-review.
