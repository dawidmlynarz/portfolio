---
name: workspace-setup
description: Sets up a designer's AI workspace by interviewing them: a project context file, a personal rules file and three skills from their repeated prompts. Use when starting with AI tools or cleaning up a messy setup.
---

# Workspace setup

## Guardrails

- Read any existing context or rules file before writing anything.
- Ask before assuming; never invent facts about the person, their product or their team.
- Plan, then build: show the plan and wait for approval.

## Step 1: Plan

List what you'll create and ask the person to confirm.

## Step 2: Context file

Interview one question at a time (no more than 12) about the current project. Write CONTEXT.md, one page, unknowns marked [TBC].

## Step 3: Rules file

Interview about how they work, their principles, voice, design system, accessibility baseline and red lines. Write RULES.md under two pages. Every line must be checkable in output.

## Step 4: Skills

Ask for up to five prompts they repeat. Run the "Is this worth automating?" checklist on each. For the three that pass, write a SKILL.md each: frontmatter, ask for, steps, output, done when.

## Step 5: Summary

List the files created, items marked [TBC], and prompts skipped with the reason.

## Done when

- CONTEXT.md and RULES.md exist and the person has read both
- Each skill has been run once on a real task
- Nothing in any file was invented
