---
name: ds-readiness-pass
description: Scores a design system for AI readiness and writes the files that close the biggest gaps: token descriptions, component contracts, AGENTS.md for consumers, DESIGN.md and llms.txt. Use in a design system's repo.
---

# Design system readiness pass

## Guardrails

- Tokens only and name by job: apply to every suggestion.
- Never change token values or component code. Only add documentation files.
- Mark every guess about intent as [ASK] or [CHECK].

## Step 1: Score

Run the five-point readiness check by reading the repo. Show the score with evidence for each area. Ask which gaps to address.

## Step 2: Token descriptions

For each token group, write descriptions by role with a "don't use for" line. Output as a patch to the token source, not generated files.

## Step 3: Component contracts

For the 10 most-used components (ask if unsure), write contracts: purpose, use when, don't use for, props that matter, states, limits.

## Step 4: Guidance files

Write AGENTS.md for consuming teams and DESIGN.md, linking to tokens and contracts instead of copying values.

## Step 5: Index

Write llms.txt listing DESIGN.md, AGENTS.md, the token file and every contract with a one-line description.

## Step 6: Summary

Old score, estimated new score, files created, every [ASK] and [CHECK], and gaps that need engineering.

## Done when

- Every generated file links to real paths in the repo
- No token value or component code was changed
- The summary lists every guess for review
