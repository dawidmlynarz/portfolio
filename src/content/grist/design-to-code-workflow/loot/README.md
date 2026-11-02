# Design-to-code workflow

A finished design to a reviewed build, with a coding agent. Two skills run in order, a design QA agent reviews the build, and you approve at two checkpoints. An optional hook blocks raw colour values.

## Files

- skills/handoff-brief/SKILL.md: design to a handoff brief with acceptance criteria
- skills/component-build/SKILL.md: brief to a build, one component at a time, with a fix loop
- agents/design-qa.md: a subagent that checks the build against the brief
- hooks/block-raw-values.sh: optional, stops raw colour values from being saved
- sample-run.md: one rebuild, start to finish

## Install

- Claude Code: copy skills/ into .claude/skills and agents/ into .claude/agents.
- Other tools: add each SKILL.md as its own project instruction, and run the QA agent as a separate chat with agents/design-qa.md as its instructions.
- The hook (Claude Code only): copy it to .claude/hooks/, make it executable, and add this to .claude/settings.json:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/block-raw-values.sh" }]
      }
    ]
  }
}
```

## Order

1. handoff-brief, with the design. Output: BRIEF.md with acceptance criteria
2. Checkpoint 1: you approve the brief.
3. component-build, one component at a time, each stopping for review.
4. design-qa reads BRIEF.md and checks the running build. Output: QA.md
5. component-build fixes what QA.md lists, and design-qa checks again, until it passes or only questions for you are left.
6. Checkpoint 2: you review the build and every local component.

## Rules for every step

- Build one component at a time. Reuse before create: search the system first.
- Design tokens only. No raw colour, spacing or type values.
- New components are local candidates, never added to the design system's own code.
- Don't move past a checkpoint without my approval in the chat.
