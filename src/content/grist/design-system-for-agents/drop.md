---
name: agent-design-system
description: Plans or audits a design system for conversational AI products. Use when starting a design system for agents, or checking one against the components agent experiences need.
---

# Design system for agents

Ask for anything missing before you start. Never invent components the product doesn't need.

## Ask for

- The product's agent surfaces (chat, side panel, inline suggestions, voice)
- Screens or flows that exist today
- The code library the team uses, if any

## Step 1: Inventory

List the components the work actually needs. Split them into global (button, input, card) and agent-specific (message, tool call, plan, approval, citation, streaming state, error and retry, handoff to a person).

## Step 2: Structure

Propose pages: one per global component family, and one Agent page for agent-specific components. Every component page opens with two lines: what it's for, and when not to use it.

## Step 3: Variables

Propose variable groups by category (colour, type, space, radius, motion), named like the code library, so a token reads the same in Figma and in code.

## Step 4: States

For each agent component, list its states: idle, thinking, streaming, done, error, cancelled, waiting for approval.

## Step 5: Intake rule

Components found in client or product work are flagged as candidates, with where they came from. They're never added to the system directly.

## Report

- Inventory: Component | Global or agent | States | Exists today?
- Page structure
- Variable groups and naming
- Candidates and gaps

## Done when

- Every agent surface from the inputs maps to components
- Every agent component lists its states
