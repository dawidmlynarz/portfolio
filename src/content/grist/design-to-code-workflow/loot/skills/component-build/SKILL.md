---
name: component-build
description: Builds an approved handoff brief one component at a time with the design system, then fixes what design QA finds. Second step of the design-to-code workflow.
---

# Component build

## Ask for

- The approved BRIEF.md

## Plan

List every component the brief needs, in build order, smallest shared ones first. For each, name the system component you'll use, the variant it needs, or "none exists". Wait for approval of the list.

## Build

For each component:

1. Search the design system for one that does the job, including variants and props. If something close exists, use it and say what's different.
2. If nothing fits, build it as a local candidate, outside the design system's code, and add it to the candidates list.
3. Use design tokens only.
4. Stop for review before the next one.

Assemble the screen only after its components are approved.

## Fix loop

When the build is done, ask the design-qa agent to review it. Fix every failure in QA.md, then ask for a review again. Stop when it passes, or when only questions for the designer are left.

## Then

Report: components built (from the system, and local candidates), criteria passing and failing, and any deviation from the brief (checkpoint 2).
