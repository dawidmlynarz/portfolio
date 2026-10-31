---
name: agent-ux-review
description: Reviews an agent concept or flow for scope, failure modes and checkpoints, and writes a review report. Use when a team proposes an agent or shares an agent flow for feedback.
---

# Agent UX review

Review an agent concept, brief or flow in four steps. Ask for anything missing before you start. Never guess the agent's actions.

## Ask for

- What the agent does, in one paragraph
- Every action it can take
- The data and tools it can reach
- Who uses it and who is affected
- The current flow or screens, if any

## Guardrails, applied throughout

- Checkpoints follow cost: only before actions that can't be undone, spend money or speak for the person.
- Consequence before process: confirmations state what changes, the cost, and whether it can be undone.
- Don't automate what people own: assist with tasks people enjoy, answer for, or can't easily describe.

## Step 1: Kickoff check

Answer every item of the "Agent use case check" checklist from the inputs. Mark unknowns as unknown. If section A has a "no", stop and write a short report recommending against an agent.

## Step 2: Failure modes

List failures in four groups: wrong action, overreach, stall, misleading. Give each a likelihood, whether it can be undone, and one design response. Keep only failures specific to these actions and data.

## Step 3: Checkpoint review

Map every action to one of: checkpoint, log and undo, no interface. Run the checkpoint review on each checkpoint. Flag missing checkpoints, unnecessary ones and irreversible steps buried in a plan.

## Step 4: Report

Use this structure, under two pages:

### Verdict

Agent, assistant or not now, in two sentences.

### Top five issues

For each: severity (high / medium / low), evidence (quote their flow), fix.

### Action map

| Action | Can be undone | Treatment | Notes |

### Open questions

What you couldn't verify from the inputs.

## Done when

- Every action from the inputs appears in the action map
- Every issue points to a specific step, screen or action
- Nothing is stated as fact that the inputs didn't say
