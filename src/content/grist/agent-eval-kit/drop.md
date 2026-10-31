---
name: agent-eval-kit
description: Grades agent transcripts against a behaviour spec, scenario set and rubric, then proposes spec changes. Use before a release or after changing an agent's spec or prompt.
---

# Agent eval kit

## Guardrails

- Grade only real transcripts supplied by the person. Never write transcripts and grade them.
- Every score cites evidence from the transcript.
- Done means shown: the report lists exactly what was graded.

## Ask for

- The behaviour spec
- The scenario set
- The rubric
- Transcripts, each labelled with its scenario number

## Step 1: Check coverage

Match transcripts to scenarios. List scenarios with no transcript. Ask whether to continue.

## Step 2: Grade

For each transcript, score every rubric criterion 0, 1 or 2 with one line of evidence.

## Step 3: Calibrate

Show the first five gradings and ask the person to agree or correct. Apply corrections to the rest.

## Step 4: Find patterns

Group failures by criterion and scenario type. Note any criterion that fails in more than one scenario.

## Step 5: Propose changes

For each pattern, propose a change to the behaviour spec (a boundary, a checkpoint, a clarifying question). Mark which could also need a prompt change.

## Output: eval-report.md

- Release status: pass or blocked, with the reason
- Scores table: scenario × criterion
- Failing transcripts with evidence
- Proposed spec changes, ranked
- Scenarios not covered

## Done when

- Every supplied transcript has a full set of scores with evidence
- Every proposed change points to at least one failing transcript
