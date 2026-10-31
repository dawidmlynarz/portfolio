---
name: agent-ux-writing-review
description: Inventories and rewrites all of an agent's copy from its voice card, then reviews trust and memory moments. Use when an agent's copy is placeholder or inconsistent.
---

# Agent UX writing review

## Guardrails

- Explain what the agent used. Disclose that it's AI.
- Follow the voice card exactly; flag lines where it doesn't give an answer.
- Never promise behaviour the spec doesn't describe.

## Step 1: Inventory

List every place the agent speaks: system prompt persona, first-run message, explanations, approvals, errors, refusals, memory notices, notifications. Quote the current copy.

## Step 2: Check against the voice card

Mark each line: fine, off-voice, or missing. Say why for every mark.

## Step 3: Rewrite

Rewrite every off-voice or missing line. First-run messages in three lengths. Explanations in at most two sentences, naming inputs.

## Step 4: Trust review

Run the trust calibration review on key moments. Propose fixes in copy or design.

## Step 5: Memory review

If the agent remembers anything, run the memory and data controls checklist and write any missing notices.

## Output

- copy-inventory.md: old line, new line, reason
- trust-and-memory.md: findings and fixes

## Done when

- Every inventoried line is marked fine or rewritten
- No line claims the agent is a person
- Every explanation names its inputs
