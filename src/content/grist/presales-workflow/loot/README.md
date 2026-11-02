# Presales workflow

From notes on early calls to a statement of work (SOW) ready to sign, for an AI engagement. Four skills run in order, a reviewer agent checks the estimate, and you approve at two checkpoints.

## Files

- skills/presales-straw-man/SKILL.md: notes to a straw man proposal
- skills/presales-workshop/SKILL.md: straw man to a workshop plan, then a correction log
- skills/presales-estimate/SKILL.md: corrections to a work breakdown and an estimate
- skills/presales-sow-review/SKILL.md: estimate to SOW text, then a designer's review of it
- agents/estimate-reviewer.md: a subagent that checks every estimate
- sample-run.md: one made-up engagement, start to finish

## Install

- Claude Code: copy skills/ into .claude/skills and agents/ into .claude/agents, in your project or your home folder.
- Other tools: add each SKILL.md as its own project instruction, and run the reviewer as a separate chat with agents/estimate-reviewer.md as its instructions.

## Order

1. presales-straw-man, with your call notes. Output: straw-man.md
2. Checkpoint 1: you approve the straw man.
3. presales-workshop, before and after the session. Output: workshop-plan.md, then corrections.md
4. presales-estimate, with corrections.md. Output: estimate.md
5. estimate-reviewer reads estimate.md. Output: review notes; the estimate is fixed until it passes.
6. Checkpoint 2: you approve the estimate.
7. presales-sow-review, with estimate.md and the SOW draft if one exists. Output: sow-design.md and the edits.

Every file is plain markdown in one folder, so you can stop, edit and pick up at any step.

## Rules for every step

- Never invent a number. Hours come from my baselines; anything else is a blank: [x].
- Mark every claim: (from notes), (from workshop), (assumption) or (guess).
- No vendor names and no buzzwords.
- Don't move past a checkpoint without my approval in the chat.
