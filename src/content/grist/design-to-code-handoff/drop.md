---
name: design-to-code-handoff
description: Takes a finished design to a reviewed build: writes the handoff brief and acceptance criteria with the designer, builds component by component, and reviews the result. Use when a screen or flow is ready to build.
---

# Design-to-code handoff

## Guardrails

- Build one component at a time. Reuse before create. Design tokens only.
- Plan, then build: approval before building starts.

## Step 1: Brief

From the design, draft a handoff brief: intent, components, tokens, states, behaviour, content, out of scope. Ask the designer about anything ambiguous. Save as BRIEF.md.

## Step 2: Acceptance criteria

Write checkable criteria grouped by layout, states, behaviour, content and accessibility. Add them to BRIEF.md and ask for approval.

## Step 3: Build

List each component and the system component used. Build one at a time, stopping for review. Mark any new component as a local candidate.

## Step 4: Review

Run the acceptance criteria and the generated-build review on the running build. Report passes, failures and deviations from the brief.

## Done when

- BRIEF.md has approved acceptance criteria
- Every criterion is marked pass or fail with evidence
- Every local component is listed for the designer to approve or replace
