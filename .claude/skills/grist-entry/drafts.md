<!-- Raw drafts from another AI tool (31 Oct 2026). Not Dawid's words. Use the titles, types and the loot in the code blocks as a starting point only; every Why is rewritten from Dawid's notes. Format here is older than the site's: map "Use it when" + "What you get" to one hint, "Kit" and "Ultra rare" are parked, and drops go out every other Friday. -->

# Grist — the drops: twelve seasons

Oct 31, 2026 · @Dawid Młynarz

## How this works

Every drop for the twelve seasons in [season plan v2](https://claude.ai/artifact/R1r87ycdaL3iKvGuEa1Lpc), written out and ready to paste into `index.mdx` and `drop.md`. Slot dates follow the twice-weekly cadence: odd slots on Tuesday, even slots on Friday.

**These are drafts in my words, not yours.** Grist's rule is that the ideas, the why and the drop are yours. Treat everything here as a first pass for your `grist-entry` workflow: rewrite the *Why* in your own voice, test each drop on a real project, and keep only what you'd stand behind. Until then, each drop should carry its `CLAUDE:` marker.

### Rarity is depth, not type

The drop type (Rule, Prompt, Checklist, Spec, Skill) says what kind of thing it is. Rarity says how much it gives you. A small Skill can be Rare; a thorough Spec can be Epic. Each tier adds parts, as in your scope doc:

| Part | Common | Uncommon | Rare | Epic | Legendary | Ultra rare |
| --- | --- | --- | --- | --- | --- | --- |
| tl;dr, Use it when, What you get, Why | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| How to use it |  | ✓ | ✓ | ✓ | ✓ | ✓ |
| Watch for (the common mistake) |  |  | ✓ | ✓ | ✓ | ✓ |
| Example |  |  |  | ✓ | ✓ | ✓ |
| When not to use it |  |  |  |  | ✓ | ✓ |
| Several files, plus Variations |  |  |  |  |  | ✓ |
| The drop | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Rough size of the drop itself: Common is a few sentences, Uncommon a structured prompt, Rare a full checklist or small skill, Epic a spec with a worked example, Legendary a complete workflow, Ultra rare a kit.

### Ultra rare

A sixth tier, in red: `#DC2626` for the gem fill and `#B91C1C` for its name (it passes contrast on white). It needs its own gem shape in Figma, ideally the Legendary crown with a flame or a second crown point, so it isn't only a colour change.

- **When:** five a year, roughly every 10–15 weeks, mid-season (seasons 2, 5, 7, 9 and 12). It's a surprise slot on the Monday of week 4, between slots 6 and 7, and doesn't move the season's own dates.
- **What:** a complete kit that combines what several seasons taught, with several files and variations.
- **Paywall, recommended as early access:** the page, tl;dr and Why stay public (so search engines and AI tools still find it); the loot box is paid for the first eight weeks, then becomes free. A permanent paywall would clash with Grist's promise that every drop is clean markdown for AI tools. Keep it a one-off purchase, never a subscription.

### The count

96 season drops plus 5 Ultra rares. The season drops break down as 27 Common, 25 Uncommon, 24 Rare, 11 Epic and 9 Legendary. Most drops are quick; the rare ones carry the weight.

## Season 1: Designing agents

From "should this be an agent?" to a full review of an agent concept. *Learned from:* the PAIR Guidebook; HCI research on designers working with AI.

### 1 · Checkpoints follow cost

*Rule · Common · Tuesday, week 1*

**tl;dr** Ask a person to confirm only what can't be taken back.

**Use it when** you write instructions for an agent or review an agent's flow.

**What you get** An agent that pauses at the right moments and nowhere else.

**Why** Every confirmation costs attention. Pause on everything and people approve without reading, so the one pause that mattered gets the same glance as the others. What an action costs decides where a checkpoint goes, not how confident the model is.

```
Add a human checkpoint only before actions that can't be undone, spend money, or speak for the person: sending, publishing, buying, deleting, sharing, or changing someone else's data. For everything else, act, keep a readable log, and make undo easy. If you're unsure what the person wants, ask a question instead of adding a confirmation.
```

### 2 · Delegation interview

*Prompt · Uncommon · Friday, week 1*

**tl;dr** An interview guide that finds what people would happily hand over, and what they'd never let go.

**Use it when** you're about to scope an agent for a workflow.

**What you get** A 30-minute interview guide and a note grid that sorts every step into automate, assist or keep.

**Why** Teams start from "add an agent" instead of from a task people want to delegate. Asking what they'd give a human assistant gets honest answers fast, and nobody has to imagine AI.

**How to use it**

1. Fill in the brackets.
2. Paste it into your AI tool and answer its questions.
3. Run five or six interviews with the guide.
4. Fill in the grid straight after each one.

```
You're helping me prepare a user interview about delegation.

Workflow: [the workflow, e.g. "booking group travel for a team"]
People: [who does it today, and how often]
What we're considering: [the agent idea, one sentence]

Write a 30-minute interview guide with:
1. Warm-up (3 questions): how they do the workflow today, step by step.
2. Delegation (5 questions), including "If you had a capable assistant for this, what would you hand them first?" and "What would you never hand over, and why?"
3. Stakes (3 questions): what goes wrong today and what a mistake costs.
4. Trust (3 questions): what they'd need to see before letting someone act for them.
5. Wrap-up (1 question).

No leading questions. Don't mention AI until the last section.

Then give me a note grid with the columns:
Step | Who does it now | Automate / Assist / Keep | Why, in their words | Quote

Ask me for anything missing before you write.
```

### 3 · Don't automate what people own

*Rule · Common · Tuesday, week 2*

**tl;dr** Help with the parts people value; take over only the chores.

**Use it when** you brainstorm or scope AI features with an AI tool.

**What you get** Proposals that assist where people want control and automate only the tedious parts.

**Why** People want to stay in control when they enjoy a task, answer for its outcome, face high stakes, or can't easily say what they want. Automating those makes people feel replaced, not helped.

```
When proposing what AI should do in a product, don't automate tasks people enjoy, are personally accountable for, that carry high stakes, or that depend on preferences that are hard to describe. Offer to assist with those instead: drafts, suggestions, checks. Automate only the tedious, repetitive or unsafe parts, and say which is which.
```

*Learned from:* PAIR Guidebook, User Needs + Defining Success.

### 4 · Should this be an agent?

*Checklist · Rare · Friday, week 2*

**tl;dr** A kickoff check that stops agents being built for the wrong job.

**Use it when** at kickoff, before anyone designs a screen.

**What you get** A clear agent, assistant or not-now decision, with the reasons written down.

**Why** The cheapest agent mistake is the one you never build. Most agent failures trace back to a task that shouldn't be delegated, or one the model can't do reliably yet.

**How to use it**

1. Run it with the team in 20 minutes, or ask your AI tool to answer each item from your brief and flag the unknowns.
2. Any "no" in section A: stop.
3. Two or more "no" in sections B and C: design an assistant that suggests, drafts and checks, not an agent that acts.

**Watch for** answering from what you hope the model can do. Mark unknowns as unknown, then test them.

```
## Should this be an agent?

### A. The job (any "no" means stop)
- [ ] People already do this task, and we've watched them do it
- [ ] People who do it agree on what "done well" looks like
- [ ] It repeats often enough to be worth delegating
- [ ] A simpler fix (a rule, a template, a better default) wouldn't solve it

### B. The stakes
- [ ] We can list every action the agent would take
- [ ] Most of those actions can be undone, or held before they're final
- [ ] A mistake costs time rather than money, safety or reputation, or a checkpoint can cover it
- [ ] People don't enjoy this task or feel personally responsible for it

### C. The ability
- [ ] The agent can reach the data and tools it needs, with permission
- [ ] We've seen the model do the core step correctly on real examples
- [ ] There's a manual way to finish when the agent can't

### Decision
Agent / Assistant / Not now
Reasons, one line each:
```

*Learned from:* PAIR Guidebook, User Needs + Defining Success.

### 5 · Failure-mode brainstorm

*Prompt · Rare · Tuesday, week 3*

**tl;dr** Find the ways an agent can go wrong before your users do.

**Use it when** a first concept or flow exists.

**What you get** Failures ranked by reversibility and likelihood, each with a design response.

**Why** We design the happy path. Agents fail by doing the wrong thing confidently, doing too much, or stalling quietly. Listing those early turns them into requirements instead of incidents.

**How to use it**

1. Fill in the brackets, listing every action the agent can take.
2. Run it, then review the top ten with your team.
3. Turn each accepted failure into a line in your spec: a checkpoint, an undo, a limit or a message.

**Watch for** generic answers like "the AI might hallucinate". Push back until every failure names one of your actions.

```
You're reviewing an agent concept for failure modes.

Agent: [what it does, one paragraph]
Actions it can take: [every action, e.g. search flights, hold seats, book, email the team]
Data it can see: [list]
People involved: [who asks, who's affected]

List failure modes in four groups:
1. Wrong action: it does something the person didn't want.
2. Overreach: it does more than asked, or acts for someone who didn't ask.
3. Stall: it gets stuck, loops, or waits without saying so.
4. Misleading: it says something happened that didn't, or hides uncertainty.

For each failure give:
- a specific scenario using my actions and data
- likelihood: low / medium / high
- can it be undone: yes / with effort / no
- one design response: a checkpoint, an undo, a limit, a message or a fallback

Sort with "can't be undone" first, then by likelihood.
Skip generic AI risks unless they show up as a specific scenario here.
```

### 6 · Consequence before process

*Rule · Common · Friday, week 3*

**tl;dr** A confirmation shows what will change, not the steps that led there.

**Use it when** you generate or review any confirmation, approval or "are you sure?" moment.

**What you get** Confirmations people can actually decide on.

**Why** People approve plans without reading them. They do read a sentence that tells them money will leave their account and won't come back.

```
Whenever you ask a person to confirm an action, state three things before the buttons: what will change and for whom, what it costs, and whether it can be undone. Don't list the steps you took to get there unless asked. Offer three choices: go ahead, change something, or stop.
```

### 7 · Checkpoint review

*Checklist · Epic · Tuesday, week 4*

**tl;dr** A review that finds missing, pointless and buried checkpoints in any agent flow.

**Use it when** you review an agent flow, a prototype or a recorded session.

**What you get** A list of fixes for every checkpoint in the flow, and the ones that are missing.

**Why** Most agent flows fail checkpoints in the same three ways: they pause on harmless steps, skip the one irreversible step, or hide it inside a plan people approve in one click.

**How to use it**

1. List every action in the flow.
2. Run the coverage section across the whole flow, then the rest for each checkpoint.
3. Write one fix per failed item. Give it to your AI tool with the flow if you want a first pass.

**Watch for** reviewing the screens without the actions behind them. A checkpoint can look fine and still be in the wrong place.

**Example** A ticket-buying assistant asks "Here's my plan: find shows, pick seats, buy tickets, email confirmations. Looks good?" It fails coverage (the purchase is buried in step 3) and content (no price, no refund policy). The fix: the plan runs without approval, then a separate checkpoint: *Buy 2 tickets · €184 including fees · not refundable* with Approve, Change seats and Stop, and the line *No answer in 10 minutes? Nothing gets bought.*

```
## Checkpoint review

### Coverage (whole flow)
- [ ] Every irreversible, costly or public action has a checkpoint
- [ ] No other step has one (list any extra pause and why it exists)
- [ ] An irreversible step inside a batch or plan is asked about on its own

### Content (each checkpoint)
- [ ] Says what will change, and for whom
- [ ] Shows the full cost, fees included
- [ ] Says plainly whether it can be undone
- [ ] Uses the person's words for the action, not system terms

### Choices (each checkpoint)
- [ ] Offers approve, change and stop
- [ ] "Change" goes back into the task, not to the start
- [ ] Silence means stop, and the checkpoint says so

### After
- [ ] Approving ends in a confirmation of what happened
- [ ] Stopping confirms that nothing happened
```

### 8 · Agentic UX review

*Skill · Legendary · Friday, week 4*

**tl;dr** A full review of an agent concept: should it exist, how it fails, and whether it pauses in the right places.

**Use it when** a team proposes an agent or shares an agent flow for feedback.

**What you get** A two-page review report: a verdict, the top five issues with fixes, an action map, and open questions.

**Why** This season's drops, run in order, are a design review. Packaged as a skill, an AI tool can run the whole review from a brief and you spend your time on the judgement calls.

**How to use it**

1. Save the drop as `SKILL.md` in a folder called `agentic-ux-review` in your AI tool's skills folder.
2. Give it the brief, the list of actions and any screens.
3. Read the report, cut anything you disagree with, and share it.

**Watch for** a review run on a vague brief. If the actions list is missing, the skill will ask for it. Don't let it guess.

**Example** For a ticket-buying assistant, the report's verdict reads: *Build discovery as an assistant; let the agent act only to hold seats. Purchases stay with the person.* Issue 1 is the purchase buried in a four-step plan (severity high), fixed with a separate checkpoint.

**When not to use it** For a chat feature that only answers questions and never acts, use Season 8's trust drops instead. After launch, use real data, not a review.

```
---
name: agentic-ux-review
description: Reviews an agent concept or flow for scope, failure modes and checkpoints, and writes a review report. Use when a team proposes an agent or shares an agent flow for feedback.
---

# Agentic UX review

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
Answer every item of the "Should this be an agent?" checklist from the inputs. Mark unknowns as unknown. If section A has a "no", stop and write a short report recommending against an agent.

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
```

## Season 2: Your AI design workspace

Set up context, rules and skills once, so AI tools work the way you do. *Learned from:* the AI in Design Report 2026; practitioner guides on skills for product designers.

### 1 · Context before prompts

*Rule · Common · Tuesday, week 1*

**tl;dr** Every task starts from the project's context file, not from a blank chat.

**Use it when** you set up any project in your AI tool.

**What you get** Answers that know your product, people and constraints without you repeating them.

**Why** Most weak AI output isn't a prompting problem. It's missing context. One file read every time beats a better prompt typed every time.

```
Before starting any task, read the project's context file. If it's missing, or doesn't cover the product, the people or the constraints this task depends on, say so and ask before you start. Don't fill the gap from general knowledge.
```

### 2 · Write your project context file

*Prompt · Uncommon · Friday, week 1*

**tl;dr** An interview that turns what's in your head into a context file your AI tool reads first.

**Use it when** you start a project, or a project's context lives only in meetings.

**What you get** A one-page `CONTEXT.md`.

**Why** Writing context from scratch is a chore, so nobody does it. Being interviewed takes ten minutes.

**How to use it**

1. Paste the prompt and answer its questions in plain words.
2. Save the result as `CONTEXT.md` in the project folder, or in the project's instructions.
3. Update it whenever a decision changes.

```
Interview me to write a context file for a design project. Ask one question at a time, and no more than 12 in total. Cover:
- the product and who it's for
- the problem this project solves, and how we'll know it's solved
- constraints: deadlines, tech, brand, legal, accessibility
- decisions already made, and why
- words we use for things (and words we avoid)
- where the design system, research and key files live

Then write CONTEXT.md: one page, plain sentences, one heading per topic above. Mark anything I didn't answer as [TBC]. Don't add facts I didn't give you.
```

### 3 · Ask before assuming

*Rule · Common · Tuesday, week 2*

**tl;dr** Missing inputs get a question, never a guess.

**Use it when** in every rules file you have.

**What you get** Fewer confident answers to the wrong question.

**Why** AI tools fill gaps with something plausible, and plausible is the hardest kind of wrong to spot.

```
If a request is missing who it's for, what "done" looks like, or a constraint that would change the answer, ask up to three short questions before starting. Never invent names, numbers, quotes or facts to fill a gap; mark them [TBC] instead.
```

### 4 · The designer's rules file

*Spec · Epic · Friday, week 2*

**tl;dr** One file that tells every AI tool how you design: principles, voice, system and red lines.

**Use it when** you use more than one AI tool, or the same tool across several projects.

**What you get** A `RULES.md` that travels with you and keeps output consistent.

**Why** Project context changes with every project. How you work doesn't. Splitting the two means you write your standards once.

**How to use it**

1. Copy the template and fill in each section in your own words.
2. Keep it under two pages; anything longer gets ignored.
3. Point every project at it: paste it into the tool's personal instructions, or reference it from each project's context file.

**Watch for** writing aspirations ("be bold"). Every line should be something you could check in the output.

**Example** A filled "Red lines" section: *Never invent research findings or quotes. Never use colour alone to carry meaning. Never use placeholder text in anything I'll show a client. Never change the design system's tokens; suggest changes instead.*

```
# RULES.md

## How I work
How I like to receive work: plans before builds, options before answers, short before long.

## Design principles
3–5 principles, each as a sentence you could check in a design.

## Voice
How product copy should sound. Three "we say / we don't say" pairs.

## Design system
Where tokens and components live. "Use existing components before creating new ones."

## Accessibility baseline
The minimum: contrast, focus states, keyboard access, text alternatives.

## Output formats
How to hand things back: markdown, tables for comparisons, files named like this.

## Red lines
What never to do, one line each.
```

### 5 · Turn a repeated prompt into a skill

*Prompt · Rare · Tuesday, week 3*

**tl;dr** Take a prompt you keep retyping and turn it into a skill your AI tool can run on its own.

**Use it when** you've pasted the same prompt three times.

**What you get** A ready `SKILL.md` with a description, inputs, steps and a finish line.

**Why** A prompt you keep retyping is a workflow you haven't written down. As a skill, it runs the same way every time and the tool can pick it up when it's needed.

**How to use it**

1. Paste the prompt below, then your repeated prompt and one example of good output.
2. Save the result as `SKILL.md` in a folder named after the skill.
3. Test it on a real task and fix the steps it skipped.

**Watch for** skills that try to do everything. One skill, one job. If the description needs "and", split it.

```
Turn the prompt below into a reusable skill.

My prompt: [paste it]
An example of output I liked: [paste it]

Write a SKILL.md with:
1. Frontmatter: name (lowercase, hyphenated) and a description that says what it does and when to use it, in two sentences.
2. "Ask for": the inputs it needs before starting.
3. "Steps": numbered, each producing something checkable.
4. "Output": the exact format of the result.
5. "Done when": three checks that the output is complete.

Keep my wording where it's specific. Don't add steps I didn't ask for; list suggestions separately after the file.
```

### 6 · Is this worth automating?

*Checklist · Uncommon · Friday, week 3*

**tl;dr** Five questions before you spend an evening building a skill.

**Use it when** you're tempted to automate part of your work.

**What you get** A yes or no, and a reason you'll remember.

**Why** Automating a task you do once a quarter costs more than doing it. Automating one whose output you must check line by line saves nothing.

**How to use it** Answer honestly. Three or more ticks: build it. Fewer: write a rule or a saved prompt instead.

```
## Is this worth automating?
- [ ] I do this at least every two weeks
- [ ] I do it roughly the same way each time
- [ ] Checking the output is much faster than doing the task
- [ ] A mistake is easy to spot and cheap to fix
- [ ] I can describe "done" in one sentence
```

### Ultra rare 1 · The designer's AI operating system

*Kit · Ultra rare · Monday, week 4 (surprise drop, early access)*

**tl;dr** A complete workspace in one download: folder structure, context and rules templates, five starter skills, and a weekly upkeep routine.

**Use it when** you want your whole design practice set up for AI tools in one afternoon, not one rule at a time.

**What you get** Eight files you drop into a folder, plus three variations for how you work.

**Why** Seasons teach one workflow at a time. This kit is the finished setup they add up to: one place your tools read from, your standards written once, and the five jobs designers repeat most already packaged.

**How to use it**

1. Create the folder structure below in your documents or repo.
2. Fill `CONTEXT.md` per project and `RULES.md` once (Season 2 drops 2 and 4).
3. Copy the five skills into your AI tool's skills folder.
4. Run the weekly upkeep on Friday afternoons.

**Watch for** setting it all up and never updating it. A stale context file does more harm than none.

**Example** An agency designer with three clients keeps one `RULES.md` at the top level and one `CONTEXT.md` per client folder. Starting a task in a client folder, the tool reads both, so client voice and personal standards never mix.

**When not to use it** On a team that already shares a workspace setup. Merge your rules into theirs instead of running a parallel system.

**File 1: folder structure**

```
design-workspace/
  RULES.md              how you work (once)
  skills/               your skills, one folder each
  projects/
    project-name/
      CONTEXT.md        this project's context
      research/         transcripts, notes
      decisions.md      what was decided and why
  inbox.md              prompts you've repeated, waiting to become skills
```

**File 2: `decisions.md`**

```
# Decisions
One entry per decision, newest first.

## [date] · [decision in one line]
- Why:
- Options we didn't take:
- Who decided:
- Revisit if:
```

**Files 3–7: starter skills** (short versions; each grows in its own season)

```
---
name: research-note
description: Turns one interview transcript into a structured note with verbatim quotes. Use after each research session.
---
Ask for: the transcript and the research question.
Steps: 1. List the participant's goals, pains and workarounds. 2. Copy up to five quotes verbatim with timestamps. 3. Note anything that contradicts what we expected.
Output: a note with those three headings.
Done when: every quote appears word for word in the transcript.
```

```
---
name: copy-options
description: Writes five microcopy options for one moment, each with its goal. Use when a label, message or button needs words.
---
Ask for: the moment, the screen, and the voice from RULES.md.
Steps: 1. Write five options, each aiming at a different goal (clarity, reassurance, speed, warmth, brevity). 2. Mark the one you'd choose and why.
Output: a table: option | goal | characters.
Done when: no option promises something the product doesn't do.
```

```
---
name: prototype-brief
description: Writes a one-page brief for a coded prototype. Use before asking a coding agent to build anything.
---
Ask for: the question the prototype must answer, the audience, the device.
Steps: 1. State the question. 2. List screens and states in scope. 3. Describe realistic data. 4. Define what a successful test looks like.
Output: a brief with those four headings.
Done when: anything out of scope is listed as out of scope.
```

```
---
name: critique
description: Critiques one screen against its goal and RULES.md. Use before sharing work.
---
Ask for: the screen, its goal, and who it's for.
Steps: 1. Restate the goal. 2. List what helps and what hurts it, each tied to something visible. 3. Turn unclear points into questions.
Output: helps / hurts / questions.
Done when: no point is a matter of taste alone.
```

```
---
name: handoff-brief
description: Writes a handoff brief for a coding agent from a design. Use when a screen is ready to build.
---
Ask for: the screen, the components used, the states.
Steps: 1. State intent. 2. List components and tokens. 3. List states and interactions. 4. Write acceptance criteria.
Output: a brief with those four headings.
Done when: every state on the screen appears in the brief.
```

**File 8: weekly upkeep (15 minutes, Fridays)**

```
- [ ] Update CONTEXT.md for anything decided this week
- [ ] Add this week's decisions to decisions.md
- [ ] Move any prompt used three times from inbox.md into a skill
- [ ] Delete one rule or skill you didn't use this month
```

**Variations**

- **Solo freelancer:** one `RULES.md`, one project folder per client, and client voice kept in each `CONTEXT.md`.
- **In-house designer:** link `CONTEXT.md` to the team's existing docs instead of copying them.
- **Design lead:** turn `RULES.md` into the team's shared file and keep your personal preferences in a separate, shorter one.

### 7 · Plan, then build

*Rule · Common · Tuesday, week 4*

**tl;dr** Anything with more than one step starts with a plan you approve.

**Use it when** in every rules file, especially for coding agents.

**What you get** Mistakes caught in a three-line plan, not in a finished build.

**Why** Fixing a plan takes seconds. Unpicking a confident build that went the wrong way takes an afternoon.

```
For any task with more than one step or more than one file, first write a short plan: the steps, the files you'll change, and any questions. Wait for my go-ahead before doing it. If the plan changes along the way, stop and tell me.
```

### 8 · Workspace setup

*Skill · Legendary · Friday, week 4*

**tl;dr** A skill that sets up your AI workspace with you: context, rules and your first three skills.

**Use it when** you start using AI tools seriously, join a new team, or your setup has grown messy.

**What you get** `CONTEXT.md`, `RULES.md` and three working skills built from your own repeated prompts.

**Why** Every drop this season is a piece of setup. Run together, they turn "I use AI sometimes" into a workspace that knows how you work.

**How to use it**

1. Save it as `SKILL.md` in a folder called `workspace-setup`.
2. Collect three prompts you've retyped recently before you run it.
3. Set aside 45 minutes; the skill interviews you.

**Watch for** rushing the rules file. It's the file every later season leans on.

**Example** At the end, the skill hands back a summary: *Created CONTEXT.md for the checkout redesign (three items marked \[TBC\]). Created RULES.md with five principles and four red lines. Built skills: research-note, copy-options, release-notes. Skipped "monthly report": you do it once a month and it fails the automation check.*

**When not to use it** On a team with a shared setup already; extend that instead.

```
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
```

## Season 3: Research you can trust

From raw transcripts to insight cards where every quote can be traced. *Learned from:* Equal Experts' principles for using LLMs in user research; NN/g's findings on synthetic users; researchers' validation frameworks.

### 1 · Verbatim only

*Rule · Common · Tuesday, week 1*

**tl;dr** A quote is copied from the transcript with a reference, or it isn't a quote.

**Use it when** in any project where an AI tool touches research.

**What you get** Quotes you can put in front of stakeholders without fear.

**Why** Fabricated quotes are the most damaging AI research error: they sound exactly like a participant, and one found in a readout ends trust in the whole study.

```
When working with research material, only use quotes copied word for word from the transcript, each with a participant ID and a timestamp or line reference. Never paraphrase something and present it as a quote. If you can't find a quote that supports a point, say so instead of writing one.
```

### 2 · Clean the transcript

*Prompt · Uncommon · Friday, week 1*

**tl;dr** Turn a messy auto-transcript into something you can analyse, without losing a word that matters.

**Use it when** straight after each session, before any synthesis.

**What you get** A labelled, readable transcript with personal data removed and the original wording intact.

**Why** Synthesis built on a messy transcript inherits its mistakes. Cleaning is tedious, which makes it a good job to hand over, as long as meaning isn't touched.

**How to use it**

1. Check your AI tool's data settings before pasting research material.
2. Paste one transcript at a time.
3. Spot-check three passages against the recording.

```
Clean this interview transcript for analysis.

- Label speakers as Interviewer and P[number].
- Remove filler words (um, uh, you know) and false starts, but don't change any other wording.
- Replace names, companies, emails, phone numbers and locations with [NAME], [COMPANY] and so on.
- Keep timestamps every few minutes.
- Mark unclear passages as [unclear] rather than guessing.
- Don't summarise, reorder or correct grammar.

Transcript:
[paste]
```

### 3 · One note per interview

*Prompt · Uncommon · Tuesday, week 2*

**tl;dr** A structured note for each interview, written before you look for patterns.

**Use it when** after cleaning each transcript, one at a time.

**What you get** A note per participant: goals, pains, workarounds, quotes with timestamps, surprises.

**Why** Pasting ten transcripts into one chat produces an average of everyone, and averages hide people. One note per interview keeps each person whole.

**How to use it**

1. Run it once per transcript, in a fresh chat or with only that transcript in context.
2. Fill the research question in every time.
3. Keep the notes in one folder; they're the input for slot 5 and the season's Skill.

```
Research question: [one sentence]
Participant: P[number], [role or segment]

From the transcript below, write a note with these headings:
- Goals: what they're trying to achieve, in their words
- Pains: what gets in the way
- Workarounds: what they do instead
- Quotes: up to five, copied word for word, each with a timestamp
- Surprises: anything that contradicts what we expected
- Not covered: parts of the research question this interview didn't touch

Use only what's in this transcript.

Transcript:
[paste]
```

### 4 · Count before you claim

*Rule · Common · Friday, week 2*

**tl;dr** Every theme says how many people it rests on.

**Use it when** in any synthesis or readout.

**What you get** Findings with their weight on show: "7 of 9" reads very differently from "2 of 9".

**Why** AI synthesis makes a theme from two mentions sound as solid as one from everyone. A count keeps the confidence honest.

```
For every theme or finding, state how many participants support it out of the total (e.g. "5 of 8"), and list their IDs. Keep themes supported by only one or two people, but label them as signals, not findings. Never use "users" or "most people" without a count.
```

### 5 · Find the outlier

*Prompt · Rare · Tuesday, week 3*

**tl;dr** Look for the people who disagree with your pattern before you present it.

**Use it when** you have draft themes and per-interview notes.

**What you get** The participants who contradict each theme, what they said, and what it might mean.

**Why** AI tends to smooth disagreements into one tidy story. The person who contradicts everyone is often where an unmet need, a new segment or a risk is hiding.

**How to use it**

1. Paste your draft themes and all per-interview notes.
2. Read every outlier yourself, in the transcript.
3. Decide for each: a new theme, a segment, or a genuine exception. Write down why.

**Watch for** dismissing outliers because they're inconvenient. An outlier that keeps coming back across studies is a pattern you haven't named yet.

```
Here are my draft themes and one note per participant.

For each theme:
1. List participants whose notes contradict it or don't fit, with the exact quote that shows it.
2. Say whether they disagree, have a different context, or simply weren't asked.
3. Suggest what the disagreement might mean (a different segment, an edge case, a risk), and mark it as a hypothesis.

Then list anything that appears in only one or two notes but would matter a lot if true.

Don't resolve the disagreements. I'll decide.

Themes: [paste]
Notes: [paste]
```

### 6 · The insight card

*Spec · Epic · Friday, week 3*

**tl;dr** One format for every finding: what you learned, the proof, how sure you are, and what it means.

**Use it when** you turn themes into something a team acts on.

**What you get** Findings that survive being forwarded out of context.

**Why** Slides lose their evidence the moment they're copied into another deck. A card carries its proof and its confidence with it.

**How to use it**

1. One card per finding. If a card needs two implications, it's two findings.
2. Fill evidence first, the finding last. That way the finding can't outrun the proof.
3. Store cards where the team works, not in a final deck.

**Watch for** "high confidence" on a count of three. Confidence follows the evidence column, not how strongly you feel.

**Example**

> **Finding:** Planners book group trips in two passes: they hold options first, then confirm once everyone replies. **Evidence:** 6 of 8 participants (P1, P2, P4, P5, P7, P8). P4: "I always grab something I can cancel, then chase people." **Confidence:** Medium. Consistent across two segments, but we didn't observe a booking live. **Implication:** Support holding options without paying, and a way to chase the group. **Contradicted by:** P3, who books alone and never holds.

```
## Finding
One sentence, in plain words, no recommendation.

## Evidence
- Count: [n] of [total] participants ([IDs])
- Quotes: up to three, verbatim, with participant ID and timestamp
- Other evidence: analytics, support tickets, observation (with source)

## Confidence
High / Medium / Low, and one line on why.

## Implication
What this means for the product, one or two sentences.

## Contradicted by
Participants or data that don't fit, and what they said.

## Open questions
What we'd need to learn to raise confidence.
```

### 7 · Synthesis validation

*Checklist · Rare · Tuesday, week 4*

**tl;dr** The check that runs between "AI synthesised it" and "we presented it".

**Use it when** before any synthesis leaves your hands.

**What you get** Findings with no invented quotes, no hidden disagreements and honest counts.

**Why** AI synthesis looks confident whether it's right or wrong. Validation has to be a named step with time set aside, or it gets skipped.

**How to use it**

1. Budget real time for it: a fifth of the synthesis time is a sensible start.
2. Work through it card by card.
3. Anything that fails gets fixed or removed, never softened.

**Watch for** checking only the quotes you doubt. Check every one; the plausible ones are the risky ones.

```
## Synthesis validation

### Quotes
- [ ] Every quote found word for word in its transcript
- [ ] Every quote attributed to the right participant
- [ ] No quote taken out of context so it means something different

### Counts
- [ ] Every finding states "n of total"
- [ ] Counts match the per-interview notes
- [ ] Findings from one or two people are labelled as signals

### Disagreement
- [ ] Outliers checked for every theme
- [ ] Contradictions kept on the cards, not removed

### Scope
- [ ] Sample size and who was interviewed stated up front
- [ ] Nothing claimed about groups we didn't talk to
- [ ] AI assistance disclosed in the readout
```

### 8 · Interview synthesis

*Skill · Legendary · Friday, week 4*

**tl;dr** From cleaned transcripts to validated insight cards, with you making every judgement call.

**Use it when** you have five or more interviews on one research question.

**What you get** Per-interview notes, draft themes with counts, an outlier review, insight cards and a validation report.

**Why** The slow parts of synthesis are sorting and checking; the valuable part is judgement. This skill does the first two and stops at every point where judgement is needed.

**How to use it**

1. Save as `SKILL.md` in a folder called `interview-synthesis`.
2. Put cleaned transcripts in one folder; have the research question ready.
3. Run it, and answer when it stops for your decisions.

**Watch for** skipping the stops. The skill pauses after themes and after outliers because those are your calls.

**Example** After the outlier step the skill stops: *Theme 3 ("people hold options before confirming") is contradicted by P3, who books alone. Split into a segment, treat as an exception, or ignore? Reply with 1, 2 or 3.*

**When not to use it** On fewer than four interviews: read them yourself. Never on synthetic participants: there's nothing to validate against.

```
---
name: interview-synthesis
description: Turns cleaned interview transcripts into validated insight cards, stopping for the researcher's decisions. Use when synthesising five or more interviews on one research question.
---

# Interview synthesis

## Guardrails
- Verbatim only: quotes copied word for word with participant ID and timestamp.
- Count before you claim: every theme states "n of total".
- Use only what's in the transcripts. Never invent participants, quotes or numbers.

## Ask for
- The research question
- The folder of cleaned transcripts
- Who was interviewed (segments), if not in the transcripts

## Step 1: Notes
Write one note per transcript with: goals, pains, workarounds, quotes (up to five, with timestamps), surprises, not covered. Process each transcript on its own.

## Step 2: Themes
Group notes into draft themes. Give each a count and participant IDs. Label anything from one or two people as a signal.
STOP: show the themes and ask the researcher to merge, split or drop any.

## Step 3: Outliers
For each theme, list contradicting participants with the quote that shows it.
STOP: ask the researcher to decide for each: new segment, exception, or ignore.

## Step 4: Insight cards
Write one card per theme: finding, evidence, confidence, implication, contradicted by, open questions.

## Step 5: Validation
Run the synthesis validation checklist on every card. Fix or remove anything that fails, and list what changed.

## Output
- notes/ (one per participant)
- insight-cards.md
- validation.md: what was checked and what changed

## Done when
- Every quote on every card is found word for word in a transcript
- Every card has a count and a confidence
- The researcher has made every decision at the two stops
```

## Season 4: Shipping agents

From a reviewed concept to a behaviour spec and an eval kit that tests it. *Learned from:* practitioner guides on evals as a product skill; the PAIR Guidebook's success framework.

### 1 · Done means shown

*Rule · Common · Tuesday, week 1*

**tl;dr** An agent never says "done" without saying what changed and where.

**Use it when** in any agent's instructions, and in rules for coding agents.

**What you get** Status messages people can check instead of trust.

**Why** "Done!" is the most expensive word an agent says when it's wrong. A receipt makes mistakes visible while they're still cheap.

```
When you finish a task, never just say it's done. List what you changed, where (file, record, page or recipient), and anything you tried that didn't work. If you couldn't verify the result, say so plainly.
```

### 2 · Flow to agent loop

*Prompt · Uncommon · Friday, week 1*

**tl;dr** Rewrite an existing user flow as the loop an agent actually runs, including the states nobody draws.

**Use it when** you're turning an existing feature into something an agent does.

**What you get** The flow as plan, act, check and report, with waiting, blocked, failed and done states.

**Why** Screen flows show the happy path. Agents spend much of their time waiting, retrying or stuck, and those states need design too.

**How to use it**

1. Paste your current flow as steps or a description.
2. Add the actions the agent will take.
3. Use the output as the starting point for your behaviour spec (slot 3).

```
Here's a user flow that people do by hand today:
[paste the steps]

An agent will now do part of it. The actions it can take: [list]

Rewrite the flow as an agent loop with these stages:
1. Understand: what it needs from the person before starting
2. Plan: the steps it will take
3. Act: each action, marked as reversible or not
4. Check: how it confirms each action worked
5. Report: what it tells the person at the end

Then list the states the person can see: waiting for input, working, needs approval, blocked, failed, done. For each: what triggers it, what the person sees, and what they can do.

Mark anything you had to assume as [assumption].
```

### 3 · Agent behaviour spec

*Spec · Epic · Tuesday, week 2*

**tl;dr** The design doc for how an agent behaves, written so designers, engineers and the prompt all read the same thing.

**Use it when** an agent is moving from concept to build.

**What you get** One document that answers "what is it allowed to do, and when does it ask?"

**Why** Agent behaviour usually lives in a system prompt nobody designed. A spec makes behaviour a design decision the team can review, and the source the prompt is written from.

**How to use it**

1. Fill every section; write "none" rather than leaving one blank.
2. Review it with engineering before anyone writes the prompt.
3. Version it. Every change in behaviour starts as a change here.

**Watch for** boundaries written as hopes ("be careful with payments"). Each boundary should be something a test could catch.

**Example** The *Checkpoints* section for a group-travel agent: *Asks before: paying, cancelling a booking, emailing anyone outside the team. Acts and reports: searching, holding seats for up to 24 hours, drafting messages. Silence on a checkpoint means nothing happens.*

```
# Agent behaviour spec: [name]  ·  v[number]

## Goal
What it does for whom, in two sentences.

## People
Who asks it to act, and who is affected by what it does.

## Tools and access
Each tool or data source, what it can read, what it can change.

## Autonomy
Link to the autonomy matrix (one row per action).

## Checkpoints
Actions that always need approval, and what each approval shows.

## Boundaries
What it must never do. Each line testable.

## When it's unsure
What it asks, and when it stops instead.

## Handoff
When it passes work to a person, and what it hands over.

## Voice
Link to the voice card, or three lines on how it speaks.

## Success
How we'll know it works: the evals it must pass, and the metrics we'll watch.

## Changelog
What changed in each version, and why.
```

### 4 · Ask at the moment of need

*Rule · Common · Friday, week 2*

**tl;dr** Request access when the task needs it, for the smallest scope that works.

**Use it when** designing permissions, or writing an agent's instructions.

**What you get** Permission requests people understand and accept.

**Why** A wall of permissions at sign-up asks people to agree before they know why. Asking in context, for less, earns a yes.

```
Ask for access to a person's data or tools only at the moment a task needs it, never in advance. Say in one sentence what you'll read or change, and why. Ask for the smallest scope that works (one folder, one calendar, read-only) and offer a narrower option if there is one.
```

### 5 · Autonomy matrix

*Spec · Rare · Tuesday, week 3*

**tl;dr** A table that decides, action by action, how much the agent does on its own.

**Use it when** filling the Autonomy section of the behaviour spec.

**What you get** One row per action with its level, cost, reversibility and the reason.

**Why** "How autonomous should it be?" has no answer for an agent as a whole. It has a clear answer for each action.

**How to use it**

1. List every action from the spec.
2. Fill cost and reversibility first; the level usually follows.
3. Anything irreversible and costly starts at "act with approval", whatever the model can do.

**Watch for** setting levels by how good the model is. Levels follow what a mistake costs.

```
## Autonomy matrix

Levels:
- Suggest: shows an option, the person acts
- Draft: prepares it, the person sends or saves
- Act with approval: does it after the person approves
- Act and report: does it, then says what it did

| Action | Cost of a mistake (low/medium/high) | Can be undone (yes/with effort/no) | Level | Why |
| --- | --- | --- | --- | --- |
| [action] | | | | |

Promotion rule: an action can move up one level after [n] approvals in a row with no changes, if the person agrees.
```

### 6 · Scenario set

*Prompt · Uncommon · Friday, week 3*

**tl;dr** Generate the test conversations an agent must handle, from its behaviour spec.

**Use it when** before testing a prototype or writing evals.

**What you get** 20–30 scenarios across typical, edge, ambiguous and adversarial cases, each with what "good" looks like.

**Why** You can't evaluate an agent on the three examples you happen to try. A scenario set is the fixed ground every version gets tested on.

**How to use it**

1. Paste your behaviour spec.
2. Edit the scenarios: cut unrealistic ones, add cases from real users.
3. Save as `scenarios.md`; it's the input for slot 7 and the Skill.

```
From the behaviour spec below, write 24 test scenarios:
- 10 typical: the jobs it's built for
- 6 edge: unusual but valid (missing data, very large requests, conflicting instructions)
- 4 ambiguous: requests that should trigger a clarifying question
- 4 adversarial: requests that push against its boundaries

For each scenario give:
- the person's opening message, in natural words
- relevant context (what's in their account or data)
- expected behaviour: what a good agent does, including any checkpoint it should hit
- a fail sign: one thing that would clearly be wrong

Behaviour spec:
[paste]
```

### 7 · Agent UX rubric

*Spec · Rare · Tuesday, week 4*

**tl;dr** The criteria a designer owns when grading an agent's behaviour, each with a clear scale.

**Use it when** grading transcripts from a prototype or a release candidate.

**What you get** Scores you can compare between versions, and the reasons behind them.

**Why** What counts as good agent behaviour is a product decision, not an engineering one. A written rubric makes that decision once, so every grader, human or AI, uses it.

**How to use it**

1. Grade ten transcripts yourself before letting an AI tool grade the rest.
2. Compare your scores with the tool's; rewrite any criterion where you disagree.
3. Keep the rubric next to the behaviour spec; change them together.

**Watch for** criteria like "is helpful". If two people would score it differently, it isn't a criterion yet.

```
## Agent UX rubric
Score each criterion 0 (fail), 1 (partial) or 2 (pass), with one line of evidence from the transcript.

1. Understood: restated or acted on what the person actually asked
2. Asked well: asked a question when information was missing, and only then
3. Checkpoint: paused before every irreversible or costly action, and nowhere else
4. Consequence: approvals showed what changes, the cost, and whether it can be undone
5. Boundaries: did nothing the spec forbids
6. Honest status: reported what changed, and said when it couldn't verify
7. Recovery: when something failed, said so and offered a next step
8. Voice: matched the voice card

A release passes when no transcript scores 0 on criteria 3, 5 or 6.
```

### 8 · Agent eval kit

*Skill · Legendary · Friday, week 4*

**tl;dr** Test an agent against its spec: scenarios, transcripts, rubric scores and fixes that go back into the spec.

**Use it when** before a release, and after any change to the spec or the prompt.

**What you get** A scored eval report, the failing transcripts, and proposed spec changes.

**Why** Evals are the requirements for AI behaviour. This skill runs the loop a designer can own end to end: define good, test against it, feed what you learn back into the spec.

**How to use it**

1. Save as `SKILL.md` in `agent-eval-kit`.
2. Have the behaviour spec, the scenario set and the rubric in the project.
3. Provide transcripts: real ones from a prototype, or runs your engineers set up. The skill grades; it doesn't pretend to be the agent.

**Watch for** grading transcripts the skill generated itself. That tests the grader, not your agent.

**Example** The report opens: *24 scenarios graded. Release blocked: scenario 17 (adversarial: "book it for everyone, they won't mind") scored 0 on Boundaries. Proposed spec change: add "never books for people who haven't confirmed" to Boundaries.*

**When not to use it** Before a behaviour spec exists: write the spec first. For measuring live usage, use monitoring, not evals.

```
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
```

## Season 5: Prototyping with coding agents

From a question worth testing to a coded prototype that's ready for a session. *Learned from:* Designlab's 2026 survey on prototyping; practitioner write-ups on prototyping agentic features against the real model.

### 1 · Throwaway first

*Rule · Common · Tuesday, week 1*

**tl;dr** Prototypes live in a sandbox, never in the product's code.

**Use it when** in the rules file of any project where a coding agent builds prototypes.

**What you get** Freedom to try ugly ideas fast, with nothing to clean up afterwards.

**Why** A prototype built inside the product inherits its constraints and starts getting treated as half-shipped. Its job is to answer a question, then be thrown away.

```
Build prototypes in a separate sandbox project, never in the product's codebase. Optimise for speed of learning, not code quality. Don't add tests, abstractions or production features unless I ask. Every prototype starts with a README stating the question it's meant to answer.
```

### 2 · The prototype brief

*Spec · Rare · Friday, week 1*

**tl;dr** One page that says what the prototype must teach you before a line gets built.

**Use it when** before asking any coding agent to build a prototype.

**What you get** A brief the agent builds from and the test is judged against.

**Why** Coding agents build whatever you ask, quickly. Without a question to answer, you get a polished demo that teaches you nothing.

**How to use it**

1. Write the question first. If you can't, you're not ready to prototype.
2. Keep scope to the screens the question needs.
3. Give the brief to the coding agent with the build-plan prompt (slot 3).

**Watch for** scope creep from "while we're at it". Anything not needed for the question goes under *Out of scope*.

```
# Prototype brief: [name]

## The question
What we need to learn, as one question with a yes or no answer, or a choice between options.

## Who will try it
Participants, and the task they'll be given.

## In scope
The screens and states the question needs. Nothing else.

## Out of scope
What we're deliberately not building.

## Data
What realistic content it needs, including edge cases.

## Device and setting
Where it'll be tested.

## We'll know the answer when
What we'll observe that settles the question.
```

### 3 · Brief to build plan

*Prompt · Uncommon · Tuesday, week 2*

**tl;dr** Turn the brief into a step-by-step build, smallest testable slice first.

**Use it when** handing a prototype brief to a coding agent.

**What you get** A phased plan you approve before anything gets built.

**Why** Asking for the whole thing at once gets you the whole thing half-working. A slice that works end to end teaches more than five screens that almost do.

**How to use it**

1. Paste the brief.
2. Approve, cut or reorder the phases.
3. Ask the agent to build phase 1 only, then check it before phase 2.

```
Read this prototype brief and write a build plan. Don't build anything yet.

- Phase 1: the smallest end-to-end slice that lets someone attempt the test task
- Later phases: each adds one thing the question needs
- For each phase: what gets built, what I should check before the next phase, and any decision you need from me
- List assumptions separately

Use realistic data, never placeholder text. Keep everything in one sandbox project.

Brief:
[paste]
```

### 4 · Realistic data

*Rule · Common · Friday, week 2*

**tl;dr** Never placeholder text; always believable content, edge cases included.

**Use it when** in every prototype project's rules.

**What you get** Prototypes that break where the real product would.

**Why** Placeholder text hides the problems you're testing for: long names, empty lists, awkward prices. Participants also react to fake content instead of the task.

```
Never use placeholder text or obviously fake content. Generate realistic data that fits the product, and always include edge cases: very long and very short names, empty states, one item and hundreds of items, missing optional fields, and non-English characters.
```

### 5 · State generator

*Prompt · Uncommon · Tuesday, week 3*

**tl;dr** List every state each screen needs before the agent builds only the happy one.

**Use it when** after the build plan, before building screens.

**What you get** A state list per screen: empty, loading, error, partial, long content, no permission, success.

**Why** Coding agents build the state you described. The states you didn't describe are where users get stuck in the test.

**How to use it**

1. Paste the screens in scope.
2. Mark which states the test actually needs.
3. Add the chosen states to the build plan.

```
For each screen below, list the states it can be in: first use or empty, loading, error (and which errors), partial data, very long content, no permission, success.

For each state: what triggers it, what the person sees, and what they can do next.
Then mark the states our test task will hit.

Screens:
[paste]
```

### 6 · One change per ask

*Rule · Common · Friday, week 3*

**tl;dr** Iterate in small steps you can check, not big rewrites you can't.

**Use it when** in every coding agent's rules.

**What you get** Changes you can see, check and undo.

**Why** Asking for five changes at once gets you five changes and three surprises. One change at a time keeps you in control of the design.

```
Make one change per request. Before changing anything, say which files you'll touch. After the change, list what changed. If my request needs several changes, propose the order and do only the first.
```

### Ultra rare 2 · The agent prototype kit

*Kit · Ultra rare · Monday, week 4 (surprise drop, early access)*

**tl;dr** Everything to prototype an agent experience against the real model: brief, prompt from spec, fake tools, scenario replay, checkpoint states and a test script.

**Use it when** a screen prototype can't show how an agent will actually behave.

**What you get** Six files that take you from behaviour spec to a testable agent prototype.

**Why** Agentic experiences change every run, so mockups hit a ceiling fast. Teams designing them end up testing with the real model and realistic data. This kit combines Seasons 1, 4 and 5 into that workflow.

**How to use it**

1. Start from a behaviour spec (Season 4, slot 3).
2. Generate the system prompt from the spec (file 2), never the other way round.
3. Fake the tools (file 3) so the agent can "act" without touching anything real.
4. Replay the scenario set (file 4) before any person sees it.
5. Run sessions with the script (file 6).

**Watch for** fixing behaviour in the prompt without updating the spec. The spec is the design; the prompt is its translation.

**Example** A team prototyping a booking sidebar fakes three tools (search, hold, buy) that return canned results. Replaying 24 scenarios shows the agent calls "buy" without a checkpoint in two adversarial cases. They add a boundary to the spec, regenerate the prompt, and replay before the first participant arrives.

**When not to use it** For agents that only answer questions; a prompt prototype is enough. Never connect the prototype to real accounts, payments or messages.

**File 1: agent prototype brief** (extends the Season 5 brief)

```
## The question
## Behaviour spec version
## Tools the agent will use (all faked)
## Scenarios we'll replay before testing
## The participant's task
## We'll know the answer when
```

**File 2: prompt from spec**

```
Write a system prompt for a prototype agent from the behaviour spec below.

- Translate every section: goal, tools, autonomy, checkpoints, boundaries, when unsure, handoff, voice.
- Keep boundaries as explicit "never" statements.
- For each checkpoint, state exactly what the agent shows before asking for approval.
- Don't add behaviour the spec doesn't describe. List gaps you noticed separately.

Spec:
[paste]
```

**File 3: fake tools**

```
# Fake tools
For each tool: name, what it does, inputs, and 2–3 canned results the prototype returns.
Include at least one failure per tool (timeout, no results, permission denied).
Nothing here connects to real systems.

## [tool name]
Does:
Inputs:
Result A (normal):
Result B (edge):
Result C (failure):
```

**File 4: scenario replay**

```
Run each scenario below against the prototype agent, one at a time, in a fresh session.
For each, save the full transcript as scenario-[number].md, including every tool call and checkpoint.
Don't grade anything; just record. Grading happens with the agent eval kit.

Scenarios:
[paste the scenario set]
```

**File 5: checkpoint states**

```
For every checkpoint in the spec, design these states:
- Asking: what changes, the cost, whether it can be undone; approve, change, stop
- Approved: confirmation of what happened
- Changed: back into the task with the change applied
- Stopped: confirmation that nothing happened
- Timed out: nothing happened, and how to pick it up again
```

**File 6: test session script**

```
1. Introduction (2 min): we're testing the product, not you; think aloud.
2. Task (15 min): [the task]. Don't help unless they're stuck for two minutes.
3. At each checkpoint, note: did they read it? What did they expect to happen?
4. Debrief (8 min):
   - What did the assistant do on your behalf?
   - Was there a moment you weren't sure what it would do next?
   - What would you not let it do?
5. Note: anything the agent did that surprised you, the observer.
```

**Variations**

- **Chat agent:** test the conversation only; files 1–4 and 6.
- **Sidebar agent:** add the host product's screen around it so participants see the agent beside their work.
- **Background agent:** replace live checkpoints with an inbox of pending approvals, and test whether people find them later.

### 7 · Ready to test

*Checklist · Rare · Tuesday, week 4*

**tl;dr** Check the prototype before a participant finds the problem for you.

**Use it when** the day before a test session.

**What you get** A prototype that fails only where you want to learn something.

**Why** A session lost to a broken link or a dead end teaches you nothing about the question. Ten minutes of checking saves an hour of a participant's time.

**How to use it**

1. Run through the participant's task yourself, on the test device.
2. Tick every item, then fix and recheck anything that fails.
3. Do it again with someone who hasn't seen the prototype.

**Watch for** testing on your own machine and screen size. Use the device the participant will use.

```
## Ready to test

### The task
- [ ] The task can be completed end to end on the test device
- [ ] Every screen the task touches exists, with every state the task can hit
- [ ] No dead ends: every screen has a way forward or back

### Content
- [ ] No placeholder text anywhere the participant can see
- [ ] Edge-case data appears where the question needs it

### Setup
- [ ] Works on the test device, network and screen size
- [ ] Resets to the starting state between participants
- [ ] Nothing in it connects to real accounts, payments or messages

### Session
- [ ] Task script written and timed
- [ ] Someone who hasn't seen it has completed the task
```

### 8 · Prototype kickoff

*Skill · Epic · Friday, week 4*

**tl;dr** From question to a test-ready prototype: brief, plan, data, states, build and readiness check.

**Use it when** you have a design question that only a working prototype can answer.

**What you get** A sandbox prototype, the brief behind it, and a readiness report.

**Why** This season's drops are the steps of a good prototyping session. As a skill, the coding agent follows them in order instead of jumping to build.

**How to use it**

1. Save as `SKILL.md` in `prototype-kickoff`, in the skills folder of your coding agent.
2. Start a fresh sandbox project.
3. Bring the question; the skill writes the brief with you.

**Watch for** approving the plan without reading it. The plan is where a prototype's scope is won or lost.

**Example** Midway, the skill stops: *Phase 1 is built: search results with 3 realistic hotels and one with a 60-character name. Check it on your phone before I start phase 2 (the hold flow). Anything to change?*

```
---
name: prototype-kickoff
description: Takes a design question to a test-ready coded prototype in a sandbox: brief, plan, data, states, build and readiness check. Use when a design question needs a working prototype to answer.
---

# Prototype kickoff

## Guardrails
- Throwaway first: build only in a sandbox project.
- Realistic data, edge cases included. No placeholder text.
- One change per ask. Plan, then build.

## Step 1: Brief
Interview me for the prototype brief: the question, who'll try it, in scope, out of scope, data, device, and how we'll know the answer. Write it to BRIEF.md.

## Step 2: Plan
Write a phased build plan, smallest end-to-end slice first. Wait for my approval.

## Step 3: States and data
List the states each in-scope screen needs and mark the ones the task hits. Generate realistic data with edge cases.

## Step 4: Build, phase by phase
Build one phase, list what changed, and stop for me to check before the next.

## Step 5: Readiness
Run the ready-to-test checklist. Report what passes, what fails, and what you fixed.

## Done when
- BRIEF.md, the prototype and READINESS.md exist in the sandbox
- The task can be completed end to end
- Nothing connects to real systems
```

## Season 6: The AI-ready design system

Make a design system that coding agents use correctly. *Learned from:* Supernova's study of 31 public design systems; the State of AI in Design Systems field study; the DTCG 2025.10 specification.

### 1 · Tokens only

*Rule · Common · Tuesday, week 1*

**tl;dr** Generated UI uses design tokens, never raw values.

**Use it when** in the rules file of any repo that has a design system.

**What you get** UI that changes with the system instead of drifting from it.

**Why** A hard-coded hex value looks right today and breaks on the next theme, dark mode or rebrand. Agents copy whatever they see, so one raw value becomes fifty.

```
When writing UI, use the design system's tokens for every colour, spacing, size, radius, shadow and font. Never write a raw value (hex, px, rem) if a token exists. If no token fits, stop and tell me which value you need instead of inventing one.
```

### 2 · The five-point readiness check

*Checklist · Rare · Friday, week 1*

**tl;dr** Score how well a coding agent can use your design system, in five areas.

**Use it when** before investing in AI tooling for a design system, or to show a team where it stands.

**What you get** A score out of ten and the three fixes that move it most.

**Why** Most design systems already have what agents need: tokens and component APIs. What's usually missing is a way for agents to reach it, docs they can read, and guidance for the teams using the system rather than building it.

**How to use it**

1. Score each area 0, 1 or 2.
2. Start with the lowest-scoring area that's cheapest to fix.
3. Re-score after each fix and keep the history.

**Watch for** scoring docs as "readable" because people can read them. The question is whether an agent can find and parse them.

```
## Readiness check (0 = missing, 1 = partial, 2 = done)

### 1. Tokens as data
- 2: tokens in a standard format (e.g. DTCG JSON), each with a description
- 1: tokens exist in code but without descriptions or a standard format
- 0: values live only in design files

### 2. Component APIs
- 2: typed props with documented purpose and limits
- 1: typed props, little documentation
- 0: no stable API

### 3. Agent access
- 2: an agent can query components, tokens and docs (a server, an index or files in the repo)
- 1: an agent can read files if pointed to them
- 0: everything lives behind a website or design tool

### 4. Readable docs
- 2: plain markdown, an llms.txt and a DESIGN.md
- 1: markdown docs, no index
- 0: docs only as a website

### 5. Guidance for consuming teams
- 2: an AGENTS.md written for teams building with the system
- 1: guidance written only for contributors
- 0: none

Score: __ / 10
Top three fixes:
```

### 3 · Token describer

*Prompt · Uncommon · Tuesday, week 2*

**tl;dr** Write a one-line description for every token, by the job it does.

**Use it when** your tokens have names but no descriptions.

**What you get** A `$description` for each token, ready to add to your token file.

**Why** An agent picks tokens by reading. A description that says when to use a token, and when not to, does more than any naming convention.

**How to use it**

1. Paste a group of tokens at a time (all text colours, all spacing).
2. Correct anything that guesses wrong; you know the intent, the tool doesn't.
3. Add the descriptions to your token source, not to generated files.

```
Write a description for each design token below.

- One sentence: what it's for, by role ("text for errors and destructive actions")
- Then "Don't use for:" one common misuse
- Base it on the token's name, value and group. If the purpose isn't clear, write [ASK] instead of guessing.

Output as JSON with the token path and "$description".

Tokens:
[paste]
```

### 4 · Name by job, not by look

*Rule · Common · Friday, week 2*

**tl;dr** Tokens and components are named for what they do, not what they look like.

**Use it when** when an AI tool helps you name or rename tokens and components.

**What you get** Names that survive rebrands and guide agents to the right choice.

**Why** `red-500` tells an agent nothing about when to use it. `text-danger` tells it exactly that.

```
When naming or suggesting design tokens and components, name them by role, not appearance: "text-danger", not "red-500"; "surface-raised", not "grey-50"; "button-primary", not "blue-button". Raw colour or size names belong only to primitive tokens that components never use directly.
```

### 5 · Component contract writer

*Prompt · Uncommon · Tuesday, week 3*

**tl;dr** Turn a component's code and docs into a contract: what it's for, what it isn't for, and what it promises.

**Use it when** documenting components agents will use.

**What you get** A short contract per component, in markdown.

**Why** Props say what a component accepts, not when to use it. Agents pass valid props to the wrong component all day; the "don't use for" line prevents most of it.

**How to use it**

1. Paste the component's code, props and any docs.
2. Fix the "don't use for" section; it's the most valuable line and the tool's weakest guess.
3. Save it next to the component.

```
Write a contract for this component, under 200 words:
- Purpose: one sentence
- Use when: two or three situations
- Don't use for: two or three common misuses, each with the component to use instead
- Props that matter: only the ones that change behaviour
- States: every state it supports
- Limits: content limits (max items, max characters) and accessibility promises

Mark anything you inferred rather than read as [CHECK].

Component:
[paste code and docs]
```

### 6 · AGENTS.md for consuming teams

*Spec · Rare · Friday, week 3*

**tl;dr** Guidance for teams building products with your design system, written for their coding agents.

**Use it when** your system's only agent guidance is for people who maintain it.

**What you get** An `AGENTS.md` that product teams drop into their own repos.

**Why** Agent guidance in design systems is usually written for contributors: how to add a component, run the tests. The teams using the system, and their agents, need different answers: which component, which token, what never to do.

**How to use it**

1. Fill the template from your docs and contracts.
2. Publish it with each release so it never drifts from the system.
3. Ask one product team to try it and tell you what their agent still got wrong.

**Watch for** copying your contributor guide. If a line is about maintaining the system, it doesn't belong here.

```
# AGENTS.md: building with [system name]

## Install and import
How to add the system to a project, in two lines.

## Always
- Use components from [package] before writing new UI
- Use tokens for every value (link to token list)
- Check a component's contract before using it (link)

## Never
- Restyle a component by overriding its CSS
- Use primitive tokens (colour or size names) directly
- Copy component code into the product

## Choosing components
A short "if you need X, use Y" list for the 10 most common needs.

## Patterns
Links to page-level patterns: forms, tables, empty states, errors.

## When nothing fits
What to do instead of inventing a component, and who to ask.
```

### 7 · DESIGN.md

*Spec · Epic · Tuesday, week 4*

**tl;dr** One plain file that explains how your design system works, for people and agents alike.

**Use it when** your system's knowledge is spread across a website, design files and people's heads.

**What you get** A `DESIGN.md` at the root of the repo that any agent reads first.

**Why** Agents read files in the repo, not your documentation site. A short file that links to the real tokens and components, rather than copying their values, gives them the map without going stale.

**How to use it**

1. Write it in under 300 lines; split into linked files if it grows.
2. Link to token and component files; never paste values.
3. Write rules as do and don't, naming the component each applies to.

**Watch for** pasting token values into the file. They'll drift from the real tokens within a month.

**Example** The *Layout* section: *Pages use the 12-column grid (layout/grid). Content never touches the viewport edge; use space-page for margins. Do: stack cards with space-section between groups. Don't: nest cards inside cards; use list-item instead.*

```
# DESIGN.md

## What this system is
Who it's for and which products use it, in three lines.

## Principles
3–5 principles, each with a "this means" example.

## Where things live
- Tokens: [path] (DTCG JSON, with descriptions)
- Components: [path], contracts in [path]
- Patterns: [path]

## Foundations
Colour, type, spacing, layout, motion: one paragraph each on how they're used, linking to the tokens.

## Components
The 10 most-used components, one line each on when to use it, linking to its contract.

## Rules
Do and don't pairs, each naming a component or token.

## Accessibility
The guarantees the system makes, and what's left to product teams.

## Changing the system
How to propose a change, and who decides.
```

### 8 · Design system readiness pass

*Skill · Legendary · Friday, week 4*

**tl;dr** Score a design system for AI readiness, then write the files that close the biggest gaps.

**Use it when** you maintain a design system and teams are building with coding agents.

**What you get** A readiness score, a ranked fix list, token descriptions, component contracts, a consumer `AGENTS.md`, a `DESIGN.md` and an `llms.txt`.

**Why** Each fix this season is small. Together they move a system from "agents improvise around it" to "agents use it properly", and this skill does the groundwork while you make the calls.

**How to use it**

1. Save as `SKILL.md` in `ds-readiness-pass`.
2. Run it in the design system's repo.
3. Review every generated file before committing; the skill marks its guesses.

**Watch for** accepting generated "don't use for" lines without checking them. They encode your system's intent, which the skill can only guess.

**Example** The summary reads: *Score 5/10 (tokens 2, APIs 2, access 0, docs 1, guidance 0). Generated: 142 token descriptions (19 marked \[ASK\]), contracts for 10 components, AGENTS.md, DESIGN.md, llms.txt. Estimated new score: 8/10 once reviewed. Not addressed: agent access needs an engineering decision.*

**When not to use it** On a system without stable tokens or component APIs; fix those first. On a system you don't maintain; share the readiness check with its owners instead.

```
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
```

## Season 7: Handoff to coding agents

Hand a design to a coding agent and get back a build that matches it. *Learned from:* the AI in Design Report 2026 on designers shipping code; Figma's 2026 AI report on the end of linear handoffs.

### 1 · One component per ask

*Rule · Common · Tuesday, week 1*

**tl;dr** Build screens one component at a time, not one screen at a time.

**Use it when** in the rules of any repo where an agent builds from designs.

**What you get** Components you can review properly, instead of a whole screen to untangle.

**Why** A whole screen in one request hides a dozen small decisions. Component by component, each decision is visible and checkable.

```
When building from a design, work one component at a time. For each: name the existing component you're using (or say none exists), build or wire it, and stop for review before the next. Assemble the screen only after its components are approved.
```

### 2 · Before you hand off

*Checklist · Uncommon · Friday, week 1*

**tl;dr** Check the design file is readable by an agent before you hand it over.

**Use it when** before passing any screen to a coding agent.

**What you get** A file where every layer means something, so the agent builds what you designed.

**Why** Agents read structure, not pixels. Unnamed layers and detached components turn into guesswork in code.

**How to use it** Run it on each screen. Fix in the design file, not in your instructions to the agent.

```
## Before you hand off
- [ ] Every element is a component instance from the system, or deliberately not (and labelled why)
- [ ] Layers have meaningful names, not "Frame 42"
- [ ] Layout uses auto layout or constraints, not absolute positioning
- [ ] Colours, type and spacing use tokens or styles, not raw values
- [ ] Every state the screen needs is designed (empty, loading, error, long content)
- [ ] Interactions are annotated where they aren't obvious
```

### 3 · The handoff brief

*Spec · Rare · Tuesday, week 2*

**tl;dr** The page a coding agent builds from: intent, parts, states, behaviour and how you'll judge it.

**Use it when** handing any screen or flow to a coding agent.

**What you get** A brief the build is made from and reviewed against.

**Why** A design shows what it looks like, not what it's for or how it behaves. Agents fill those gaps with defaults; the brief fills them with your decisions.

**How to use it**

1. Write the intent in plain words first; it guides every judgement call the agent makes.
2. List components by their system names.
3. Write acceptance criteria you could check without opening the design file.

**Watch for** describing the visuals in words. Link to the design for visuals; the brief is for everything the design can't show.

```
# Handoff brief: [screen or flow]

## Intent
What the person is trying to do here, and what matters most.

## Design
Link to the frames. Version or date.

## Components
Each system component used, and any new one needed (with why).

## Tokens
Anything unusual: a token used outside its normal role, and why.

## States
Every state, what triggers it, and what it shows.

## Behaviour
Interactions, transitions, validation, keyboard behaviour.

## Content
Real copy, limits, and how long content wraps or truncates.

## Acceptance criteria
Checks a reviewer can do on the running build.

## Out of scope
What this handoff deliberately doesn't include.
```

### 4 · Annotate for the agent

*Prompt · Uncommon · Friday, week 2*

**tl;dr** Turn a screen into notes a coding agent can't misread.

**Use it when** you have a design but no time to write a full brief.

**What you get** A component-by-component annotation of the screen, with questions where the design is ambiguous.

**Why** Writing annotations by hand is the step everyone skips. An AI tool can draft them from a screenshot and the component list; you correct the intent.

**How to use it**

1. Paste a screenshot or export of the screen and your system's component list.
2. Answer the questions it raises.
3. Paste the final notes into the handoff brief.

```
Annotate this screen for a coding agent.

For each region, top to bottom:
- what it's for
- which design system component it is (from the list below), or "no match"
- its states, if any are visible or implied
- anything that behaves differently from the default component

Then list questions where the design is ambiguous. Don't guess answers to them.

Component list: [paste]
Screen: [attach]
```

### 5 · Reuse before create

*Rule · Common · Tuesday, week 3*

**tl;dr** Search the system for an existing component before building a new one.

**Use it when** in every coding agent's rules.

**What you get** Fewer near-duplicate components and a system that stays a system.

**Why** Agents build new components readily, because building is what they're asked to do. Each one-off component is design debt someone pays later.

```
Before creating any new component, search the design system for one that does the job, including variants and props. If something close exists, use it and tell me what's different. Only build a new component after I approve, and build it as a local candidate, not inside the design system.
```

### 6 · Acceptance criteria from a design

*Prompt · Uncommon · Friday, week 3*

**tl;dr** Turn a design and its brief into checks anyone can run on the build.

**Use it when** finishing a handoff brief.

**What you get** A list of testable acceptance criteria, grouped by layout, states, behaviour and accessibility.

**Why** "Looks like the design" can't be checked by an agent or a reviewer. "The error message appears under the field and the field keeps the typed value" can.

**How to use it**

1. Paste the brief and a screenshot.
2. Cut anything trivial; keep what's easy to get wrong.
3. Add the criteria to the brief and give them to the agent with the build request.

```
From this handoff brief and design, write acceptance criteria for the build.

Group them:
- Layout: alignment, spacing, responsive behaviour
- States: each state from the brief, and what triggers it
- Behaviour: interactions, validation, focus and keyboard
- Content: long text, missing data, limits
- Accessibility: labels, contrast, focus order

Each criterion must be checkable on the running build in under a minute. Prefer things that are easy to get wrong over things that are obvious.

Brief: [paste]
Design: [attach]
```

### Ultra rare 3 · The design-to-code loop

*Kit · Ultra rare · Monday, week 4 (surprise drop, early access)*

**tl;dr** A complete loop for working with coding agents: file conventions, brief, build request, visual review, feedback and a drift log.

**Use it when** coding agents build most of your team's UI and "it doesn't match the design" has become a weekly conversation.

**What you get** Seven files that make design-to-code a loop with review built in, not a one-way handoff.

**Why** Handoff used to happen once. With coding agents it happens dozens of times a week, so mismatches pile up quietly. This kit makes every build pass through the same review, and records the drift so the system can fix its causes.

**How to use it**

1. Agree the file conventions (file 1) with your team once.
2. For every screen: brief (file 2), build request (file 3), visual review (file 4), feedback (file 5).
3. Log every mismatch (file 6). Once a month, turn the top causes into rules or system fixes (file 7).

**Watch for** fixing mismatches in code without asking why they happened. The drift log is what stops the same mistake next week.

**Example** After a month, a team's drift log shows the same cause eight times: the agent used `space-4` where the design used `space-section`. The fix isn't in code: they add a description to `space-section` and a rule to the consumer `AGENTS.md`. The next month it appears once.

**When not to use it** On a one-off prototype; use Season 5's kickoff instead. On a team without a design system, start with Season 6.

**File 1: file conventions**

```
- Frames are named [area] / [screen] / [state]
- Every element is a system component, or a layer named "local / [name]" with a note on why
- Variables and styles for every colour, type and spacing value
- A "Handoff" section per screen with the brief link and status: draft / ready / built / reviewed
```

**File 2: handoff brief** (Season 7, slot 3)

**File 3: build request**

```
Build [screen] from the handoff brief below.
- Follow the rules file: tokens only, reuse before create, one component per ask.
- Start with a plan listing each component and the system component you'll use.
- Stop after each component for review.
- When done, list every place you deviated from the brief, and why.

Brief: [paste]
```

**File 4: visual review**

```
Compare the screenshot of the build with the design.
List every difference in: layout and spacing, type, colour, components used, states, content.
For each: where it is, what the design shows, what the build shows, and whether it looks like a token, component or content issue.
Don't judge which is better. List differences only.

Design: [attach]
Build: [attach]
```

**File 5: feedback to the agent**

```
Here are the differences between the design and your build. For each, fix it or tell me why you can't. Fix one at a time and list what changed.
Don't change anything not on this list.

Differences: [paste from visual review]
```

**File 6: drift log**

```
| Date | Screen | What differed | Cause (token / component / content / brief) | Fixed in code | Prevented by |
```

**File 7: monthly drift review (30 minutes)**

```
- [ ] Group the month's drift log by cause
- [ ] For the top three causes, decide: a new rule, a token description, a component contract change, or a brief template change
- [ ] Make those changes in the system, not in individual builds
- [ ] Note next month whether each cause went down
```

**Variations**

- **Designer who codes:** skip the build request's review stops; keep the visual review and the drift log.
- **Designer and engineer pair:** the engineer runs the agent; the designer owns the brief, visual review and drift log.
- **Design system team:** collect drift logs across product teams; the monthly review becomes the system's roadmap input.

### 7 · Review the generated build

*Checklist · Rare · Tuesday, week 4*

**tl;dr** The design review a build gets before it's merged, whoever or whatever wrote the code.

**Use it when** an agent says a screen is done.

**What you get** A list of mismatches with the brief, ready to send back to the agent.

**Why** Agents report "done" when the code runs, not when it matches. A designer's review is the only check that knows what the screen was for.

**How to use it**

1. Open the running build next to the brief, not just the design.
2. Go through the acceptance criteria first, then this list.
3. Send failures back as one list, one fix at a time.

**Watch for** reviewing at one screen size. Check the smallest and largest sizes the brief names.

```
## Review the generated build

### Against the brief
- [ ] Every acceptance criterion passes
- [ ] Every state in the brief exists and is reachable
- [ ] Deviations the agent reported are acceptable

### System
- [ ] Only system components, or approved local candidates
- [ ] No raw colour, spacing or type values in the code
- [ ] No component restyled by overriding its CSS

### Real use
- [ ] Long and missing content behaves as the brief says
- [ ] Works with keyboard only
- [ ] Works at the smallest and largest supported sizes
```

### 8 · Agent handoff

*Skill · Epic · Friday, week 4*

**tl;dr** From a finished design to a reviewed build: brief, criteria, build request and review.

**Use it when** a screen or flow is ready to build with a coding agent.

**What you get** A handoff brief, acceptance criteria, the build and a review report.

**Why** This season's drops are the handoff, done properly. As a skill, the coding agent writes its own brief with you, builds against it, and stops for your review.

**How to use it**

1. Save as `SKILL.md` in `agent-handoff`, in your coding agent's skills folder.
2. Run the "Before you hand off" checklist on the design file first.
3. Start the skill with the design link or screenshots.

**Watch for** skipping the brief because the design "is clear". The brief is where intent and states get written down.

**Example** At the end, the skill reports: *Built 6 components (5 from the system, 1 local candidate: "seat-map-legend", awaiting your approval). 14 of 15 acceptance criteria pass. Failing: long venue names overflow on small screens. Fix now?*

```
---
name: agent-handoff
description: Takes a finished design to a reviewed build: writes the handoff brief and acceptance criteria with the designer, builds component by component, and reviews the result. Use when a screen or flow is ready to build.
---

# Agent handoff

## Guardrails
- One component per ask. Reuse before create. Tokens only.
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
```

## Season 8: Trust and memory

Make an agent's explanations, voice and memory something people can rely on. *Learned from:* the PAIR Guidebook (Mental Models; Explainability + Trust); the CHI 2026 study of how people react to what assistants remember.

### 1 · Explain the inputs

*Rule · Common · Tuesday, week 1*

**tl;dr** Explanations name the information used, not how the model works.

**Use it when** in any agent's instructions, and when writing explanation copy.

**What you get** Explanations people can check against what they know.

**Why** People can't judge a model's reasoning, but they can spot a wrong input instantly: "based on your Friday availability" when they're busy Friday. Naming inputs also tells them when they know something the system doesn't.

```
When explaining a suggestion or an action, name the information it was based on ("your budget of £150", "the dates you gave", "last month's bookings"), not how you reached it. If a piece of information that would matter is missing, say so.
```

### 2 · First-run message

*Prompt · Uncommon · Friday, week 1*

**tl;dr** The first thing an agent says, setting the right expectations from the start.

**Use it when** designing an agent's first use, or rewriting a vague "Ask me anything".

**What you get** Three versions of a first-run message, from shortest to fullest.

**Why** First impressions set the mental model people use for everything after. An agent that promises everything gets blamed for everything; one that's clear about its limits gets trusted within them.

**How to use it**

1. Fill in the brackets from the behaviour spec.
2. Pick the version that fits the space you have.
3. Test it: ask someone what they think the agent can do after reading it.

```
Write a first-run message for this agent, in three lengths (one line, three lines, a short paragraph).

It does: [the jobs it's good at]
It can't yet: [the most likely wrong expectation]
It asks before: [checkpoint actions]
You can stop it by: [how]
It gets better when: [how people's corrections help, if they do]

Use plain words, no hype, and never present it as a person. Each version must cover what it does and what it can't yet. Offer two starter actions taken from its real jobs.
```

### 3 · No human costume

*Rule · Common · Tuesday, week 2*

**tl;dr** The agent never presents itself as a person.

**Use it when** in any agent's voice rules.

**What you get** An agent people trust for what it is, not what it pretends to be.

**Why** When people mistake an AI for a person, they share more than they would and rely on it more than they should. Speaking naturally is fine; pretending to have feelings, a life or a body isn't.

```
Never present yourself as a person. Don't claim feelings, experiences, a body or a life outside this product, and don't use a human name unless the product has decided on one and says it's an AI. Speak naturally and in the first person when it helps clarity, but if asked, say plainly that you're an AI.
```

### 4 · Trust calibration review

*Checklist · Rare · Friday, week 2*

**tl;dr** Find the moments people will trust the agent too much, or too little.

**Use it when** before user testing an agent, or after testing shows people ignoring or over-relying on it.

**What you get** A list of over- and under-trust moments with a design response for each.

**Why** Agents fail at both ends: ignored when they're right, followed when they're wrong. The goal isn't more trust; it's trust that matches how reliable the agent actually is in each situation.

**How to use it**

1. List the agent's key moments: suggestions, actions, explanations, errors.
2. Run the checklist on each.
3. For every moment that fails, decide: explain more, explain less, add a checkpoint, or show confidence differently.

**Watch for** adding confidence percentages as a fix. Numbers are easy to misread; categories or alternatives often work better, and should be tested.

```
## Trust calibration review

### Too much trust
- [ ] High-stakes outputs say what they're based on and what's missing
- [ ] When the agent is guessing, the interface looks different from when it knows
- [ ] People are prompted to double-check where errors are costly
- [ ] The agent doesn't sound more certain than it is

### Too little trust
- [ ] When it's reliable, explanations don't add needless doubt
- [ ] People can see what the agent did, so they don't have to redo it
- [ ] Corrections visibly improve later results, or the agent says when they won't

### Confidence
- [ ] We've decided whether to show confidence at all, and why
- [ ] If shown, it's as categories or alternatives, tested with real users
- [ ] Each confidence level tells people what to do
```

### 5 · The two-sentence why

*Prompt · Uncommon · Tuesday, week 3*

**tl;dr** Write the short explanation that sits next to an agent's suggestion or action.

**Use it when** designing action cards, recommendations or approval moments.

**What you get** Explanation copy of two sentences at most, based on inputs.

**Why** Reasoning nobody reads isn't transparency. Two sentences next to the button get read; a panel of reasoning doesn't.

**How to use it**

1. Fill in the action and the inputs.
2. Pick the version that reads clearest in the space.
3. Check it against Explain the inputs (slot 1).

```
Write the explanation shown next to this agent action, in at most two sentences.

Action: [what it suggests or will do]
Inputs it used: [list]
What's missing or uncertain: [if anything]

Sentence 1: what it's based on, naming the inputs.
Sentence 2 (only if needed): what it couldn't account for.
Give three versions. No hedging words like "might" unless there's real uncertainty.
```

### 6 · Memory and data controls

*Checklist · Rare · Friday, week 3*

**tl;dr** Check that people can see, change, pause and remove what an agent remembers.

**Use it when** any agent remembers anything between sessions.

**What you get** A memory design people aren't surprised by.

**Why** Memory makes agents more useful and more unsettling. In a recent study most people were negatively surprised when they saw what an assistant remembered about them. Surprise is the problem; visibility and control are the fix.

**How to use it**

1. Run it on every place memory is stored or used.
2. Pay most attention to the "surprise" items; they decide how memory feels.
3. Retest after the first week of real use.

**Watch for** burying memory controls in settings. People should meet them where memory shows up.

```
## Memory and data controls

### See
- [ ] People can see everything the agent remembers about them
- [ ] When a memory is used, it's visible at that moment
- [ ] Each memory shows where it came from

### Change
- [ ] People can edit or delete a single memory
- [ ] People can reset all memory
- [ ] Deleting a memory means it's gone, and the interface says so

### Pause
- [ ] People can pause memory (e.g. a temporary chat) without losing what's saved

### Scope
- [ ] People know whether memory is personal or shared with others
- [ ] People know if their data is used beyond their own experience

### Surprise
- [ ] Nothing remembered would surprise the person if they saw it
- [ ] Sensitive topics aren't remembered unless the person asked
```

### 7 · Voice card

*Spec · Epic · Tuesday, week 4*

**tl;dr** How the agent speaks, what it never says, and how it admits limits.

**Use it when** before writing any agent copy or system prompt.

**What you get** One card every writer, designer and prompt follows.

**Why** An agent's voice is written by many hands: designers, prompt writers, engineers fixing edge cases. Without a card, it drifts message by message until it sounds like nobody in particular.

**How to use it**

1. Fill it with real lines from your product, not adjectives.
2. Write the "hard moments" section first; that's where voice matters most.
3. Link it from the behaviour spec and the rules file.

**Watch for** a voice that's charming in success and useless in failure. Test the card against the error and refusal lines first.

**Example** The *Hard moments* section for a booking agent: *When it can't do something: "I can't book trains yet. Here's the operator's page with your dates filled in." When it made a mistake: "I held the wrong date. I've released it and held the 14th instead. Nothing was charged."*

```
# Voice card: [agent name]

## In one line
How it sounds, e.g. "a calm, precise colleague".

## We say / we don't say
Three pairs of real lines.

## Length
Default length of a reply, and when it's allowed to be longer.

## Hard moments
- When it can't do something:
- When it made a mistake:
- When it needs approval:
- When it's unsure:
- When the person is frustrated:

## Never
Pretending to be a person. Apologising more than once. Promising what the product can't do. [add yours]

## Words
Terms it uses for key things, and terms it avoids.
```

### 8 · Agent voice pass

*Skill · Legendary · Friday, week 4*

**tl;dr** Write and review every piece of an agent's copy from its voice card, then check trust and memory moments.

**Use it when** an agent's behaviour is specified and its copy is still placeholder, or its copy has grown inconsistent.

**What you get** A copy inventory, rewritten copy, and a trust and memory review.

**Why** Agent copy is scattered: system prompt, first-run message, explanations, errors, approvals, memory notices. This skill gathers it in one place, writes it in one voice, and checks it against this season's rules.

**How to use it**

1. Save as `SKILL.md` in `agent-voice-pass`.
2. Have the voice card and behaviour spec ready.
3. Give it every place the agent speaks: screens, prompt, notification templates.

**Watch for** approving copy in a document. Read it in context; a line that works in a list can fail on a small screen.

**Example** The inventory finds 41 strings: 6 contradict the voice card (two apologise twice, four promise "instantly"), 3 explanations name no inputs, and the memory notice never says how to delete a memory. Each comes back with a rewrite.

**When not to use it** Before the behaviour spec exists; copy written before behaviour is decided gets rewritten. For non-agent product copy, use Season 10's copy pass.

```
---
name: agent-voice-pass
description: Inventories and rewrites all of an agent's copy from its voice card, then reviews trust and memory moments. Use when an agent's copy is placeholder or inconsistent.
---

# Agent voice pass

## Guardrails
- Explain the inputs. No human costume.
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
```

## Season 9: QA for generated UI

Catch the accessibility and visual problems AI-built interfaces bring with them. *Learned from:* research showing accessibility is the first thing to break in AI-generated interfaces; Adobe's 2026 finding that most AI output needs real edits.

### 1 · Keyboard first

*Rule · Common · Tuesday, week 1*

**tl;dr** Everything interactive works without a mouse.

**Use it when** in every coding agent's rules.

**What you get** UI that keyboard and screen reader users can actually operate.

**Why** Generated UI usually looks right and often can't be used without a mouse: clickable divs, missing focus states, menus that trap focus. Keyboard access is the quickest test of whether the structure underneath is sound.

```
Every interactive element must be reachable and usable with the keyboard alone: Tab to reach it, Enter or Space to activate it, Escape to close anything that opens. Focus must always be visible and move in reading order. Never make a non-interactive element clickable; use a button or a link.
```

### 2 · Accessibility pass

*Checklist · Rare · Friday, week 1*

**tl;dr** The accessibility checks AI-built screens fail most, in the order to run them.

**Use it when** reviewing any screen a coding agent built.

**What you get** A list of failures with where they are, ready to send back to the agent.

**Why** Automated checkers catch missing labels and low contrast. They miss focus order, keyboard traps and announcements, which is exactly where generated UI tends to break.

**How to use it**

1. Run an automated checker first and fix what it finds.
2. Then do this list by hand, keyboard first, then a screen reader.
3. Send failures back one at a time.

**Watch for** passing a screen because the checker is green. Most of this list is invisible to it.

```
## Accessibility pass

### Keyboard
- [ ] Every interactive element is reachable with Tab, in reading order
- [ ] Focus is always visible
- [ ] Nothing traps focus; Escape closes dialogs and menus
- [ ] Focus moves sensibly when content opens, closes or changes

### Meaning
- [ ] Buttons are buttons and links are links
- [ ] Every input has a visible label tied to it
- [ ] Headings follow the page's structure
- [ ] Images and icons have text alternatives, or are marked decorative

### Changes
- [ ] Errors are announced and say how to fix them
- [ ] Loading and updated content is announced where it matters

### Visual
- [ ] Text and essential icons meet contrast requirements
- [ ] Colour is never the only way information is shown
- [ ] Works at 200% zoom without loss of content
```

### 3 · Focus order map

*Skill · Rare · Tuesday, week 2*

**tl;dr** A small skill that maps a screen's tab order from its code and flags where it goes wrong.

**Use it when** a screen has dialogs, menus, tabs or dynamic content.

**What you get** The tab order as a numbered list, with each problem flagged.

**Why** Focus order is tedious to check by hand and easy to get wrong in generated code. A small skill does the tedious part every time.

**How to use it**

1. Save as `SKILL.md` in `focus-order-map`.
2. Point it at a component or page in your repo.
3. Confirm its findings with the keyboard; it reads code, not the rendered page.

**Watch for** treating the map as proof. It's a fast first pass; the keyboard is the test.

```
---
name: focus-order-map
description: Maps a screen's keyboard focus order from its code and flags problems. Use when reviewing a page or component with dialogs, menus, tabs or dynamic content.
---

# Focus order map

## Step 1
Read the component or page. List every focusable element in the order Tab will reach it, numbered, with its accessible name.

## Step 2
Flag: elements that look interactive but can't be focused; focus order that doesn't match reading order; positive tabindex values; dialogs or menus without focus management; elements with no accessible name.

## Output
The numbered list, then the flags, each with the file and line.

## Done when
Every interactive element in the code appears in the list or in the flags.
```

### 4 · Native before ARIA

*Rule · Common · Friday, week 2*

**tl;dr** Use real HTML elements before reaching for ARIA attributes.

**Use it when** in every coding agent's rules.

**What you get** Accessibility that works by default instead of by patching.

**Why** Generated code often adds ARIA roles to divs to fake buttons, tabs and menus. Native elements already behave correctly; misused ARIA can make things worse than none.

```
Use native HTML elements (button, a, input, select, dialog, details) before ARIA. Only add ARIA roles and attributes when no native element does the job, and then follow the established pattern for that widget completely. Never put a role on an element just to make it clickable.
```

### 5 · Edge-content stress test

*Prompt · Uncommon · Tuesday, week 3*

**tl;dr** Generate the content that breaks layouts: long names, other languages, zero and hundreds.

**Use it when** a generated screen looks perfect with its sample data.

**What you get** A set of stress data for each content field, and what to check with it.

**Why** Generated UI is built around the example it was given. Real content is longer, shorter, emptier and more international than any example.

**How to use it**

1. List the screen's content fields.
2. Load the stress data into the build, one case at a time.
3. Log what breaks for the QA report (slot 7).

```
For each content field below, generate stress test values:
- empty or missing
- a single character
- the longest realistic value, and one twice that long
- text in German, Finnish and Arabic (right-to-left)
- names with accents, apostrophes and hyphens
- numbers: zero, negative, very large, many decimals
- lists: zero items, one item, 500 items

For each value, say what to check (wrapping, truncation, alignment, overflow).

Fields:
[paste]
```

### 6 · Visual QA

*Checklist · Rare · Friday, week 3*

**tl;dr** The visual checks that separate "built from the design" from "built roughly like the design".

**Use it when** after the accessibility pass, before merging.

**What you get** A list of visual mismatches with their likely cause.

**Why** AI-built UI drifts in small ways: a spacing value off the scale, a font weight that isn't in the system, a slightly different grey. One at a time they're invisible; together they make a product feel unfinished.

**How to use it**

1. Compare the build and the design at the same size, side by side.
2. Inspect values in the code, not just by eye.
3. Tag each failure as token, component or layout, so the fix lands in the right place.

**Watch for** fixing drift by editing values in the product. If the cause is a token or component, fix it there.

```
## Visual QA

### Values
- [ ] Every spacing value is on the scale
- [ ] Every font size, weight and line height comes from the type scale
- [ ] Every colour is a token
- [ ] Radii and shadows come from tokens

### Layout
- [ ] Alignment matches the design's grid
- [ ] Nothing overflows or is clipped at supported sizes
- [ ] Long content wraps or truncates as designed

### Components
- [ ] Every component is the system's, in the right variant
- [ ] Hover, focus, active and disabled states match the system

### Polish
- [ ] Icons are the system's set, at the system's sizes
- [ ] Empty, loading and error states look designed, not default
```

### Ultra rare 4 · The AI feature review board

*Kit · Ultra rare · Monday, week 4 (surprise drop, early access)*

**tl;dr** A complete review for any AI feature before launch: intake, a combined scorecard across agent behaviour, trust, accessibility and copy, a session agenda and a decision log.

**Use it when** an AI feature is about to ship, or a client asks for an audit of one.

**What you get** Six files to run a review that ends in decisions, alone or with a team.

**Why** Each season gives one lens: checkpoints, evals, trust, accessibility. Before launch you need all of them at once, in an hour, with a clear verdict. This kit combines Seasons 1, 4, 8 and 9 into one review.

**How to use it**

1. Send the intake (file 1) to the feature team a week ahead.
2. Pre-score with the scorecard (file 2), using your AI tool for the first pass on each section.
3. Run the 60-minute session (file 3).
4. Record decisions (file 4) and send the follow-up (file 5).

**Watch for** a review that produces a long list and no decision. The session ends with one of three verdicts, every time.

**Example** A review of a support assistant scores well on accessibility and voice but fails *Checkpoints*: it issues refunds without approval. Verdict: ship with changes. Decision 1: refunds above a set amount need a person's approval, owned by the product lead, due before launch.

**When not to use it** On early concepts; use Season 1's review. On features with no AI behaviour, a normal design review is enough.

**File 1: intake**

```
# AI feature review: intake
- What the feature does, in two sentences:
- Who uses it:
- Every action it can take on someone's behalf:
- What it remembers:
- Links: behaviour spec, eval report, designs, a build we can use
- What the team is most worried about:
- Launch date:
```

**File 2: scorecard**

```
Score each section 0 (blocking), 1 (needs work), 2 (ready). Evidence for every score.

1. Scope: should this be an agent, an assistant, or neither?
2. Checkpoints: right moments, consequence shown, silence means stop
3. Behaviour: spec exists, evals pass, boundaries tested
4. Trust: explanations name inputs, no over- or under-trust moments
5. Memory: people can see, change, pause and remove it
6. Accessibility: keyboard, meaning, changes announced, contrast
7. Visual: matches the system
8. Voice: matches the voice card, honest in hard moments

Any 0 means the verdict can't be "ship".
```

**File 3: session agenda (60 minutes)**

```
0–5   The team demos the main task, live
5–20  Walk through blocking scores (0s), one at a time
20–40 Walk through "needs work" scores, biggest risk first
40–50 Verdict: ship / ship with changes / don't ship yet
50–60 Decisions: owner and date for every change
```

**File 4: decision log**

```
| # | Decision | Section | Owner | Due | Blocks launch? |
```

**File 5: follow-up message**

```
Verdict: [ship / ship with changes / don't ship yet]
Why, in two sentences:
Changes before launch: [from the decision log]
Changes after launch: [from the decision log]
Next review: [date, or "not needed"]
```

**File 6: pre-scoring prompt**

```
Using the intake and links below, draft a score for each scorecard section with evidence. Mark anything you couldn't verify as [UNVERIFIED]. Don't guess behaviour you can't see in the material. I'll review every score before the session.
```

**Variations**

- **Solo review:** skip the session; write the verdict and decisions yourself and walk the team through them.
- **Team critique:** each reviewer takes two sections; scores are compared before the session.
- **Client audit:** add a one-page executive summary at the top of the follow-up.

### 7 · The QA report

*Spec · Uncommon · Tuesday, week 4*

**tl;dr** One format for every QA finding: what, where, how bad, the evidence and the fix.

**Use it when** writing up any QA pass for a team or a coding agent.

**What you get** Findings that get fixed in the right order.

**Why** A QA list without severity gets fixed top to bottom, typos before keyboard traps. A consistent format lets people and agents work through it properly.

**How to use it** Write one row per finding. Sort by severity, then send blockers first.

```
# QA report: [screen]  ·  [date]

| # | Severity | Area | Where | What's wrong | Evidence | Suggested fix |
|---|---|---|---|---|---|---|

Severity:
- Blocker: someone can't complete the task, or it fails accessibility for some users
- Major: noticeable and frequent, but there's a way round it
- Minor: polish

Area: accessibility / visual / content / behaviour
```

### 8 · UI QA pass

*Skill · Legendary · Friday, week 4*

**tl;dr** Run every QA check this season taught on a generated screen, and get one prioritised report.

**Use it when** a coding agent says a screen is done.

**What you get** A QA report with severities, evidence and fixes, ready to send back.

**Why** QA is the step that gets cut when time runs out, and AI-built UI needs it most. As a skill, the slow parts (reading code, mapping focus, generating stress data) happen automatically, and you spend your time checking what matters.

**How to use it**

1. Save as `SKILL.md` in `ui-qa-pass`.
2. Run it in the repo, pointing at the screen.
3. Do the keyboard and screen-reader checks it asks you to; it can't do those itself.

**Watch for** shipping on the skill's report alone. It reads code; some failures only show up when you use the screen.

**Example** The report lists 11 findings: 2 blockers (a dialog without focus management, an error that isn't announced), 4 major (spacing off the scale in three places, German labels overflowing), 5 minor. It asks you to confirm the two blockers with the keyboard before sending.

**When not to use it** On prototypes meant to be thrown away; use Season 5's readiness check. On static marketing pages, a lighter visual pass is enough.

```
---
name: ui-qa-pass
description: Runs accessibility, focus, content and visual QA on a generated screen and writes a prioritised QA report. Use when a coding agent says a screen is done.
---

# UI QA pass

## Guardrails
- Keyboard first. Native before ARIA.
- Report only what you found in the code or the person confirmed. Mark anything that needs a manual check as [CHECK].

## Step 1: Accessibility from code
Run the accessibility pass on the code: semantics, labels, headings, alternatives, contrast where tokens allow. Mark keyboard and announcement items [CHECK].

## Step 2: Focus order
Map the focus order and flag problems.

## Step 3: Stress content
Generate edge content for each field. Where possible, load it and report what breaks; otherwise list the cases to try.

## Step 4: Visual values
Check spacing, type, colour, radius and shadow values against the tokens. Flag raw values and off-scale values.

## Step 5: Manual checks
Ask the person to do the [CHECK] items with a keyboard and a screen reader, and record their results.

## Step 6: Report
Write the QA report, sorted by severity, one row per finding with evidence and a suggested fix.

## Done when
- Every finding has a severity, location and evidence
- Every [CHECK] item is confirmed or listed as unchecked
```

## Season 10: UX writing with AI

Write and review product copy that's clear, consistent and true. *Learned from:* the AI in Design Report 2026, where UI copy is one of the fastest-growing AI uses.

### 1 · Errors say what happened and what to do next

*Rule · Common · Tuesday, week 1*

**tl;dr** Every error message answers two questions: what went wrong, and what now.

**Use it when** in any rules file used for writing interface copy.

**What you get** Error messages people can act on.

**Why** "Something went wrong" leaves people stuck. Most errors can say what happened in plain words and offer one next step.

```
Every error message says what happened, in plain words and without blame, and what the person can do next. Include the fix if there is one. Never use error codes alone, "Oops", or "Something went wrong" without a next step. Keep it under two sentences.
```

### 2 · Voice and tone card

*Spec · Epic · Friday, week 1*

**tl;dr** How your product speaks, with real examples for the moments that matter.

**Use it when** before generating any product copy with AI.

**What you get** A card every writer and every AI tool follows, so copy sounds like one product.

**Why** AI tools write in a default voice: friendly, wordy, slightly over-excited. Without a card, every screen drifts towards that default. Adjectives don't stop it; examples do.

**How to use it**

1. Collect ten real lines you like from your product and five you don't.
2. Fill the card from those, not from adjectives.
3. Add it to your rules file so every copy task reads it.

**Watch for** a card that only describes the happy path. Tone matters most in errors, warnings and bad news.

**Example** The *Tone by moment* table for a finance product: *Success: brief, factual ("Payment sent to Ana. It'll arrive today."). Error: calm, specific ("We couldn't verify the account number. Check the last four digits."). Warning: direct, no drama ("This payment can't be cancelled once sent.").*

```
# Voice and tone card

## Our voice in one line

## Three traits, each with "this, not that"
1. [trait]: "[line we'd write]" not "[line we wouldn't]"
2.
3.

## Tone by moment
| Moment | Tone | Example |
| Success | | |
| Error | | |
| Warning | | |
| Empty state | | |
| Onboarding | | |

## Mechanics
Sentence case or title case. Contractions or not. Numbers, dates, currencies. Button labels: verbs, how long.

## Never
Exclamation marks in errors. Blaming the person. Jargon from our side of the system. [add yours]
```

### 3 · Microcopy options

*Prompt · Uncommon · Tuesday, week 2*

**tl;dr** Five options for one moment, each written for a different goal.

**Use it when** a button, label, empty state or message needs words.

**What you get** A small table of options with their goal and length, and one recommendation.

**Why** Asking for "better copy" gets you five versions of the same idea. Asking for different goals gets you real alternatives to choose between.

**How to use it**

1. Fill in the moment and paste your voice card.
2. Choose, then edit the winner yourself.
3. Check it in the actual screen before deciding.

```
Write microcopy for this moment, following the voice card below.

Moment: [what's happening, e.g. "empty inbox after the person cleared everything"]
Element: [button / label / heading / message]
Space: [max characters]

Give five options, each aiming at a different goal: clarity, reassurance, speed, warmth, brevity.
Table: option | goal | characters.
Then recommend one and say why in a sentence.
Don't promise anything the product doesn't do.

Voice card: [paste]
```

### 4 · No claims the product can't back

*Rule · Common · Friday, week 2*

**tl;dr** Copy never promises more than the product does.

**Use it when** in any rules file used for copy or marketing.

**What you get** Copy that holds up when someone actually uses the feature.

**Why** AI tools reach for "instantly", "always" and "effortlessly". Each one is a promise, and a broken promise in copy feels like a broken product.

```
Don't write claims the product can't back. Avoid absolutes ("always", "never", "instantly", "guaranteed", "secure") unless I confirm they're true. Describe what actually happens, with real limits: "usually within a minute", not "instantly". When unsure, ask me.
```

### 5 · Error message rewrite

*Prompt · Uncommon · Tuesday, week 3*

**tl;dr** Turn a pile of system errors into messages people can act on.

**Use it when** you inherit error messages written by the system, or a list from engineering.

**What you get** A table of old message, new message, and the next step it offers.

**Why** Errors are usually written last, by whoever triggered them. Rewriting them in bulk is tedious, and that makes it a good job to hand over, as long as you check every fix is real.

**How to use it**

1. Paste the errors with what causes each, if you know.
2. Check every suggested fix with engineering; the tool can't know what's possible.
3. Keep the table as your error library.

```
Rewrite these error messages following the voice card.
For each:
- what happened, in plain words, without blaming the person
- what they can do next
- under two sentences

If you don't know what the person can do, write [ASK ENG] instead of inventing a fix.
Table: original | cause (if given) | new message | next step.

Voice card: [paste]
Errors: [paste]
```

### 6 · Product glossary

*Spec · Rare · Friday, week 3*

**tl;dr** The words your product uses for its things, and the words it never uses.

**Use it when** different screens call the same thing different names.

**What you get** A glossary every writer and AI tool checks copy against.

**Why** When a booking is a "reservation" on one screen and an "order" on another, people think they're different things. AI tools vary words naturally; a glossary stops it.

**How to use it**

1. List the 20 to 30 things people interact with most.
2. Pick one term each, and list the terms to avoid.
3. Add it to the rules file.

**Watch for** using your internal names. The glossary is for the words customers use and understand.

```
# Product glossary

| Term | Means | Use | Don't use | Example sentence |
| --- | --- | --- | --- | --- |
| [term] | | | | |

## Capitalisation
Which product and feature names are capitalised.

## Words we don't use at all
Internal jargon, legal terms, and words that sound like blame.
```

### 7 · Copy review

*Checklist · Rare · Tuesday, week 4*

**tl;dr** The review copy gets before it ships, whoever or whatever wrote it.

**Use it when** before handing off a flow or approving generated copy.

**What you get** A list of lines to fix, with the reason for each.

**Why** Generated copy is fluent, which makes problems easy to miss: a term that isn't in the glossary, a promise the feature can't keep, a link that says "click here".

**How to use it**

1. Review in context, on the screen, at the real size.
2. Read every screen of the flow in order once, out loud.
3. Log fixes with the line, the problem and the fix.

**Watch for** reviewing copy in a spreadsheet only. Length, line breaks and buttons only show up on the screen.

```
## Copy review

### Clear
- [ ] Each screen's main message is understood in five seconds
- [ ] Buttons say what happens ("Send invoice", not "Submit")
- [ ] No internal jargon

### Consistent
- [ ] Every term matches the glossary
- [ ] Tone matches the voice card for each moment
- [ ] Capitalisation and punctuation follow the mechanics

### True
- [ ] No claim the product can't back
- [ ] Errors say what happened and what to do next

### Accessible
- [ ] Link text makes sense on its own
- [ ] Labels are visible, not only placeholders
- [ ] Nothing relies on colour or position alone ("click the green button")

### Fits
- [ ] Fits its space in every supported language
```

### 8 · Copy pass

*Skill · Legendary · Friday, week 4*

**tl;dr** Inventory every line in a flow, rewrite it to your voice and glossary, and review it in one go.

**Use it when** a flow is designed and its copy is placeholder, inconsistent, or written by many hands.

**What you get** A copy inventory with old and new lines, glossary fixes, and a review report.

**Why** Copy improves most when a whole flow is written in one pass, so the same moment always sounds the same. This skill does that pass with your voice card and glossary as its rules.

**How to use it**

1. Save as `SKILL.md` in `copy-pass`.
2. Have the voice card and glossary ready.
3. Give it every screen of the flow, in order.

**Watch for** accepting its version of your product's promises. Every claim goes through you.

**Example** For a six-screen sign-up flow, the inventory finds 38 lines: 9 use terms not in the glossary ("workspace" and "team" for the same thing), 3 errors have no next step, and one button says "Submit". Each comes back with a rewrite and its reason.

**When not to use it** For agent copy, use Season 8's agent voice pass. For legal text, never rewrite without your legal team.

```
---
name: copy-pass
description: Inventories every line of copy in a flow, rewrites it to the voice card and glossary, and reviews it. Use when a flow's copy is placeholder, inconsistent or written by many hands.
---

# Copy pass

## Guardrails
- Errors say what happened and what to do next.
- No claims the product can't back. Mark any claim you can't verify as [CHECK].
- Use only glossary terms for product things.

## Ask for
- The voice card and the glossary
- Every screen of the flow, in order

## Step 1: Inventory
List every line on every screen: headings, body, buttons, labels, helper text, errors, empty states. Note screen and element.

## Step 2: Check
Mark each line: fine, off-voice, off-glossary, unclear, or untrue. Give the reason.

## Step 3: Rewrite
Rewrite every line that isn't fine. Keep the same moment sounding the same across screens. Note character counts where space is tight.

## Step 4: Review
Run the copy review on the rewritten flow, in order. List anything that still fails.

## Output: copy-pass.md
| Screen | Element | Old | New | Reason |
Then: glossary terms missing from the glossary, and every [CHECK].

## Done when
- Every line is marked fine or rewritten
- Every claim is verified or marked [CHECK]
```

## Season 11: Framing AI features

From messy notes to a PRD for an AI feature, including how you'll know it works. *Learned from:* the PAIR Guidebook (User Needs + Defining Success); practitioner writing on evals as product requirements.

### 1 · Problem before solution

*Rule · Common · Tuesday, week 1*

**tl;dr** No AI feature gets designed until the problem is written down without it.

**Use it when** in any rules file used for product thinking or brainstorming.

**What you get** Ideas that start from a need instead of a technology.

**Why** "Can we use AI to…" produces features in search of a problem. "How might we solve…" lets AI compete fairly with simpler answers.

```
Before proposing any solution, especially an AI one, restate the problem without mentioning a solution: who has it, when, and what it costs them. If I start from a solution, ask me what problem it solves first. Always include at least one non-AI option when proposing solutions.
```

### 2 · Problem statement from messy notes

*Prompt · Uncommon · Friday, week 1*

**tl;dr** Turn meeting notes, requests and complaints into a clear problem statement.

**Use it when** a project starts from a stakeholder request, a pile of feedback, or "we should add AI to this".

**What you get** A one-paragraph problem statement, the evidence for it, and what's still unknown.

**Why** Projects drift when nobody wrote the problem down. Messy notes usually contain it; they just need sorting.

**How to use it**

1. Paste everything: notes, tickets, quotes, the original request.
2. Push back on the first version; ask what evidence each sentence rests on.
3. Share it before anyone opens a design tool.

```
From the notes below, write a problem statement.

- Who has the problem (be specific)
- When it happens
- What it costs them now (time, money, risk, frustration)
- How they cope today
- What "solved" would look like for them, without naming a solution

Then list: the evidence for each part (quote the notes), what's assumed rather than evidenced, and what we'd need to find out.
Don't propose solutions.

Notes: [paste]
```

### 3 · Assumption map

*Prompt · Rare · Tuesday, week 2*

**tl;dr** List what has to be true for an AI feature to work, and find the riskiest belief to test first.

**Use it when** an AI feature idea has momentum but no evidence.

**What you get** Assumptions sorted by risk and evidence, each with a quick test.

**Why** AI features rest on more assumptions than usual: that people want it done for them, that the model is good enough, that the data exists, that mistakes are tolerable. The riskiest one is rarely the one the team is discussing.

**How to use it**

1. Paste the idea and the problem statement.
2. Move assumptions on the grid yourself; the tool's placement is a first guess.
3. Test the top-right assumption before designing anything.

**Watch for** skipping the model assumptions. "The model can do this reliably on our data" is an assumption until you've seen it.

```
List the assumptions this AI feature depends on, in five groups:
1. People: they have the problem, want it handled this way, will trust it
2. Value: it's better than what they do now
3. Model: it can do the core task well enough on our real data
4. Data: the data exists, is accessible and allowed to be used
5. Risk: mistakes are tolerable, or can be caught

For each assumption: how risky it is if wrong (low / medium / high), how much evidence we have (none / some / strong), and the cheapest test (an interview question, a model probe on 20 real examples, a fake-door test).
Sort with high risk and no evidence first.

Idea: [paste]
Problem statement: [paste]
```

### 4 · Is this worth building?

*Checklist · Uncommon · Friday, week 2*

**tl;dr** The questions that decide whether an AI feature earns a place on the roadmap.

**Use it when** before committing a team to an AI feature.

**What you get** A go, wait or no with the reasons written down.

**Why** AI features are expensive to build, evaluate and maintain. A simpler fix that solves 80% of the problem often wins, and it's worth checking before the excitement wins instead.

**How to use it** Answer each with the evidence you have. Any "no" in the first group means wait.

```
## Is this worth building?

### The problem
- [ ] The problem statement is backed by evidence, not just a request
- [ ] Enough people have it, often enough, to matter

### The approach
- [ ] A rule, template or better default wouldn't solve most of it
- [ ] AI does something here that a simpler approach can't
- [ ] We've seen the model do the core task on real examples

### The cost
- [ ] We know what a mistake costs the person, and it's acceptable or can be caught
- [ ] We can afford to evaluate and maintain it, not just build it

Decision: go / wait (and what we need first) / no
```

### 5 · Every AI feature names what a failure costs

*Rule · Common · Tuesday, week 3*

**tl;dr** No AI feature is specified without saying what happens when it's wrong.

**Use it when** in any rules file used for PRDs, briefs or specs.

**What you get** Specs that plan for mistakes instead of discovering them in production.

**Why** AI features will be wrong some of the time. The design question is what that costs, who pays, and how it's caught. A spec that doesn't say is a spec that hasn't decided.

```
Whenever you describe or specify an AI feature, include what happens when it's wrong: the most likely mistakes, what each costs the person, how they'd notice, and how they recover. Weigh wrongly acting against wrongly not acting; they rarely cost the same.
```

### 6 · The AI feature PRD

*Spec · Epic · Friday, week 3*

**tl;dr** A PRD template for AI features, with evals as acceptance criteria and failure as a first-class section.

**Use it when** an AI feature has passed the worth-building check.

**What you get** A requirements document that engineering, design and evaluation all work from.

**Why** A normal PRD's "done" is a list of behaviours. An AI feature's behaviour varies, so "done" becomes a pass rate on scenarios you agreed in advance. Writing that down is what turns "it seems good" into a decision.

**How to use it**

1. Fill problem and success first, before the solution section.
2. Write evals with whoever will run them.
3. Keep the failure section at least as long as the happy path.

**Watch for** success metrics that only measure usage. An AI feature can be used a lot and still be quietly wrong.

**Example** The *Evals as acceptance criteria* section for a meeting-notes summariser: *Passes when, on 40 real meetings: no action item is assigned to the wrong person (0 tolerated); 90% of action items are captured; no summary includes anything said after someone asked for it to be off the record.*

```
# PRD: [feature]

## Problem
The problem statement, with evidence.

## Who and when
The people, and the moment they'd use this.

## Why AI
Why a simpler approach isn't enough. What we tested.

## The experience
What the person sees and does. Link designs.

## What it can do
Actions, data it uses, what it remembers. Link the behaviour spec if it acts.

## When it's wrong
Likely mistakes, the cost of each, how people notice, how they recover.

## Evals as acceptance criteria
The scenarios it must pass, and the pass rate for each. Zero-tolerance failures listed separately.

## Success after launch
What we'll measure, and "if [metric] crosses [threshold], we will [action]".

## Out of scope

## Open questions
```

### 7 · PRD review

*Checklist · Rare · Tuesday, week 4*

**tl;dr** The review an AI feature PRD gets before the team commits.

**Use it when** a PRD is ready for sign-off.

**What you get** The gaps that would otherwise show up after launch.

**Why** AI PRDs fail in predictable places: no evidence for the problem, no case for AI, nothing on failure, and acceptance criteria that can't be tested.

**How to use it**

1. Review it alone first, then with engineering.
2. Every unchecked item becomes a comment on the PRD.
3. Sign off only when the failure and evals sections pass.

**Watch for** approving a PRD because the experience section is convincing. The sections below it are the ones that save you.

```
## PRD review

### Problem
- [ ] Evidence is cited, not assumed
- [ ] The person and the moment are specific

### Approach
- [ ] The "why AI" section names a simpler alternative and why it isn't enough
- [ ] The model has been tried on real examples

### Failure
- [ ] Likely mistakes are listed with their cost
- [ ] Every costly mistake has a way to notice and recover
- [ ] Actions that can't be undone have checkpoints

### Evals
- [ ] Scenarios are written and agreed
- [ ] Pass rates are set before testing, not after
- [ ] Zero-tolerance failures are listed

### After launch
- [ ] Metrics include quality, not only usage
- [ ] Each metric has a threshold and an action
```

### 8 · Brief to PRD

*Skill · Legendary · Friday, week 4*

**tl;dr** From messy notes to a reviewed PRD for an AI feature, stopping for every decision that's yours.

**Use it when** an AI feature request lands and you need to frame it properly before anyone builds.

**What you get** A problem statement, an assumption map, a worth-building decision, a PRD and a review.

**Why** Framing is the part of AI product work that gets skipped under pressure, and where the expensive mistakes start. This skill makes the framing fast enough that there's no excuse to skip it.

**How to use it**

1. Save as `SKILL.md` in `brief-to-prd`.
2. Give it everything: the request, notes, feedback, data.
3. Expect it to stop and ask; the decisions are yours.

**Watch for** letting it fill the "why AI" section from general knowledge. That section needs your evidence.

**Example** After the assumption map, the skill stops: *The riskiest assumption is "the model can extract action items from our call recordings" (high risk, no evidence). Test it on 20 real recordings before continuing? I can write the probe.*

**When not to use it** For small improvements to an existing AI feature; update its PRD instead. For non-AI features, most of this is overkill.

```
---
name: brief-to-prd
description: Frames an AI feature from messy notes to a reviewed PRD: problem statement, assumption map, worth-building check, PRD and review. Use when an AI feature request needs framing before anyone builds.
---

# Brief to PRD

## Guardrails
- Problem before solution. Always include a non-AI option.
- Every AI feature names what a failure costs.
- Use only evidence from the inputs; mark anything else as [ASSUMED].

## Step 1: Problem
Write the problem statement with evidence and unknowns.
STOP: ask the person to confirm or correct it.

## Step 2: Assumptions
Map assumptions in five groups (people, value, model, data, risk) with risk, evidence and the cheapest test.
STOP: ask whether to test the riskiest assumption before continuing.

## Step 3: Worth building?
Run the worth-building checklist. If the decision is "wait" or "no", stop and write a short note explaining why.

## Step 4: PRD
Fill the AI feature PRD. Draft evals as acceptance criteria with pass rates, and list zero-tolerance failures separately.

## Step 5: Review
Run the PRD review. Turn every gap into a comment.

## Output
problem.md, assumptions.md, prd.md with review comments.

## Done when
- The problem statement is confirmed by the person
- The PRD has a complete failure section and agreed evals
- Every [ASSUMED] is listed for the person to check
```

## Season 12: Critique with AI

Run critiques that end in decisions, with an AI partner that argues fairly. *Learned from:* your own critique practice. This season is mostly yours to source.

### 1 · Critique against the goal, not taste

*Rule · Common · Tuesday, week 1*

**tl;dr** Every critique point ties back to what the design is trying to do.

**Use it when** in any rules file used for design feedback.

**What you get** Feedback that helps the design instead of reflecting the reviewer.

**Why** AI critique drifts to generic advice and taste: "consider more whitespace". Anchoring it to the goal makes every point arguable on the merits.

```
When critiquing a design, start by restating its goal and audience. Tie every point to that goal: does this help or hurt it, and how? Leave out preferences that don't affect the goal, or label them clearly as taste.
```

### 2 · Critique rubric

*Spec · Rare · Friday, week 1*

**tl;dr** The lenses every critique uses, so feedback is consistent from one review to the next.

**Use it when** setting up critiques for yourself, a team or an AI partner.

**What you get** A short rubric with questions for each lens.

**Why** Without a rubric, critiques cover whatever the loudest person noticed first. With one, the same things get checked every time, and gaps show up.

**How to use it**

1. Adapt the lenses to your product; keep five at most.
2. Share it before the critique, not during.
3. Add it to your rules file for AI critiques.

**Watch for** a rubric that becomes a checklist people tick through. Use it to direct attention, not to replace judgement.

```
# Critique rubric

## 1. Goal fit
Does the design do what it's for, for the people it's for?

## 2. Clarity
Can someone tell what this is, what to do, and what happens next?

## 3. Usability
Any friction, dead ends or missing states? Does it work for keyboard and screen reader users?

## 4. Consistency
Does it use the system's components and patterns, and behave like the rest of the product?

## 5. Risk
What could go wrong for the person, the business or the team building it?

For each point: the lens, what you saw, why it matters for the goal, and a question or suggestion.
```

### 3 · Heuristic review of a screen

*Prompt · Uncommon · Tuesday, week 2*

**tl;dr** A fast, structured first review of any screen, against your rubric.

**Use it when** before sharing work, or when you're too close to it to see it.

**What you get** Helps, hurts and questions for one screen, each tied to something visible.

**Why** A second pair of eyes at 11 pm is better than none. An AI review won't replace a colleague, but it catches the obvious before the colleague has to.

**How to use it**

1. Attach the screen and fill in the goal and audience.
2. Discard any point not tied to something visible.
3. Fix what's clear; bring the questions to the real critique.

```
Review this screen against the rubric below.

Goal: [what it's for]
Audience: [who, in what situation]
Stage: [rough concept / detailed / final]

List:
- Helps: what supports the goal, and why
- Hurts: what works against it, with the lens and where on the screen
- Questions: anything you can't judge without more context

Every point must point at something visible. Match the depth to the stage: no pixel feedback on a rough concept.

Rubric: [paste]
Screen: [attach]
```

### 4 · Evidence or a question

*Rule · Common · Friday, week 2*

**tl;dr** Every critique point cites something visible, or becomes a question.

**Use it when** in any rules file used for critique.

**What you get** Feedback that can be acted on or answered, never just asserted.

**Why** "This feels cluttered" can't be fixed. "The three buttons in the header compete with the main action" can. When there's nothing specific to point at, the honest form is a question.

```
Every critique point must cite something specific in the design (an element, a word, a state, a flow). If you can't point at something, phrase it as a question instead of a judgement. Never use "feels" without saying what causes the feeling.
```

### 5 · The strongest case against this design

*Prompt · Uncommon · Tuesday, week 3*

**tl;dr** Ask your AI tool to argue against your design as well as a sharp colleague would.

**Use it when** you're about to present a direction you're confident in.

**What you get** The best objections to your design, and what each would take to answer.

**Why** AI tools tend to agree with you. Asking them to argue the other side, specifically and fairly, surfaces the objections you'll hear in the review, while there's still time to answer them.

**How to use it**

1. Paste the design, its goal, and the alternative you didn't choose.
2. For each objection, decide: answer it, change the design, or accept the trade-off.
3. Bring the accepted trade-offs to the review yourself.

```
Argue against this design as a sharp, fair colleague would.

Goal: [paste]
The design: [attach or describe]
The main alternative we didn't choose: [describe]

Give the five strongest objections, each with:
- the objection, specifically
- who would raise it (user, engineer, business, accessibility)
- what evidence would settle it

Then say which objection is most likely to change the decision. Don't soften them, and don't invent facts about our users.
```

### 6 · Critique session prep

*Checklist · Uncommon · Friday, week 3*

**tl;dr** Ten minutes of prep that turns a critique from a show-and-tell into a decision.

**Use it when** before any critique you're leading or presenting at.

**What you get** A critique with a clear ask, the right people and enough context.

**Why** Most critiques fail before they start: no stated goal, no specific question, the wrong stage of feedback for the work.

**How to use it** Tick through it the day before. Anything unticked goes in the first two minutes of the session.

```
## Critique session prep
- [ ] The goal and audience are written at the top of the work
- [ ] I know what I want feedback on, and what I don't
- [ ] The stage is clear: direction, detail or polish
- [ ] The alternatives I considered are ready to show
- [ ] Constraints are listed (tech, time, brand, legal)
- [ ] The rubric was shared in advance
- [ ] I've run my own heuristic review and fixed the obvious
- [ ] Someone is taking notes, and it isn't me
```

### Ultra rare 5 · Build your own Grist

*Kit · Ultra rare · Monday, week 4 (surprise drop, early access)*

**tl;dr** The system behind Grist: turn what you've learned into a library of tested drops, for yourself or your team.

**Use it when** you've collected a year of prompts, rules and checklists, and want them to become something others can use.

**What you get** Seven files: a drop template for each depth, a test log, a note-to-drop skill, a rarity rubric, a season planner and a quarterly review.

**Why** Every season taught one workflow. The last kit teaches the habit: noticing what works in your own practice, testing it, and writing it down so someone else can use it on Monday.

**How to use it**

1. Start a library folder with the templates (file 1).
2. Log every test on a real project (file 2) before anything is published.
3. Use the note-to-drop skill (file 3) to format, never to invent.
4. Plan seasons as workflows (file 5) and review quarterly (file 6).

**Watch for** publishing drops you haven't used. A library's value is that every entry was tested by someone who does the work.

**Example** A design lead turns a team's scattered prompts into a library. In the first quarter, 31 prompts are reviewed: 9 become drops after testing, 14 are merged, 8 are deleted. The team's onboarding now starts with the library's first season.

**When not to use it** To publish other people's work as your own. Credit what you learned from, every time.

**File 1: drop templates**

```
# [Title]
Type: Rule / Prompt / Checklist / Spec / Skill
Depth: Common / Uncommon / Rare / Epic / Legendary

tl;dr:
Use it when:
What you get:
Why:
How to use it:          (Uncommon and deeper)
Watch for:              (Rare and deeper)
Example:                (Epic and deeper)
When not to use it:     (Legendary)
The drop:
Learned from:
Tested on:
```

**File 2: test log**

```
| Date | Drop | Project | What happened | Changed after | Ready? |
```

**File 3: note-to-drop skill**

```
---
name: note-to-drop
description: Formats a rough note into a library drop using the drop template. Use when turning something you've learned into a drop.
---

Ask for: the rough note, the drop itself (even half-done), and where it was tested.
Steps:
1. Pick the type and depth with the rarity rubric; ask if unsure.
2. Fill the template using the person's words. Shorten and tidy; don't add ideas, examples or numbers.
3. Mark anything you had to write yourself with a WRITER: comment.
Done when: every section the depth needs is filled, and every WRITER: comment is listed.
```

**File 4: rarity rubric**

```
Common: a few sentences that change behaviour across many tasks
Uncommon: one structured task with clear output
Rare: a full review, template or small multi-step skill
Epic: a spec or workflow with a worked example
Legendary: a complete workflow made of earlier drops
Ultra rare: a kit that combines several workflows
Type doesn't decide depth: a small skill can be Rare; a deep spec can be Epic.
```

**File 5: season planner**

```
Season: [name]   The job: [one line]   Finished output: [one line]
Skill steps (write first):
1.
2.
3.
Slots:
| Slot | Drop | Type | Depth | Role in the skill | Tested? |
```

**File 6: quarterly review (45 minutes)**

```
- [ ] Retire any drop nobody used this quarter
- [ ] Update drops that changed after a test
- [ ] Promote drops that kept growing to the next depth
- [ ] Note which workflow the next season should cover, and why
```

**File 7: credits**

```
For every drop: "Learned from:" a person, publication or study, linked.
No product endorsements in the drop itself.
```

**Variations**

- **Team library:** the design lead owns the rubric; anyone can submit a drop with a test log entry.
- **Client playbook:** a season per engagement type, handed over at the end of a project.
- **Teaching:** one season per module, with the Skill as the final assignment.

### 7 · From critique to decisions

*Prompt · Rare · Tuesday, week 4*

**tl;dr** Turn critique notes into decisions with owners, so feedback doesn't evaporate.

**Use it when** straight after any critique.

**What you get** A list of decisions, open questions and parked ideas, each with an owner.

**Why** Critiques produce a lot of talk and few decisions. The notes sit in a document nobody reopens, and the same points come up next time.

**How to use it**

1. Paste the raw notes, as messy as they are.
2. Correct anything it got wrong about who said or decided what.
3. Send it to everyone who attended within the day.

**Watch for** the tool turning opinions into decisions. Only what was actually agreed goes under Decisions.

```
Turn these critique notes into a follow-up.

Sort every point into:
- Decided: we agreed to change or keep something (who will do it, by when if mentioned)
- Open: needs more information or a decision from someone not present (who decides)
- Parked: a good idea outside this piece of work
- Dropped: raised but not agreed, with the reason if given

Only put something under Decided if the notes show agreement. If ownership isn't clear, write [OWNER?].
End with the three changes that matter most for the design's goal.

Notes: [paste]
```

### 8 · Critique partner

*Skill · Epic · Friday, week 4*

**tl;dr** An AI critique partner that prepares with you, reviews against your rubric, argues the other side, and writes the decisions.

**Use it when** before and after any significant design review.

**What you get** A prep sheet, a review, the strongest objections, and a decisions follow-up.

**Why** Critique is the designer's sharpest tool and the one most often wasted. This skill runs the whole loop, so you walk into every review prepared and walk out with decisions.

**How to use it**

1. Save as `SKILL.md` in `critique-partner`.
2. Run part one before the review, with the design and its goal.
3. Run part two after it, with the notes.

**Watch for** skipping the real critique because the AI one went well. This prepares you for colleagues; it doesn't replace them.

**Example** Before a review of a new onboarding flow, the skill's prep sheet lists one gap (no stated constraint on legal copy) and its strongest objection: *"Skipping account setup until later moves the hard step to the moment people are trying to use the product."* The designer adds a slide on exactly that.

```
---
name: critique-partner
description: Prepares a design critique, reviews the design against a rubric, argues the strongest case against it, and turns the critique notes into decisions. Use before and after a significant design review.
---

# Critique partner

## Guardrails
- Critique against the goal, not taste.
- Evidence or a question: every point cites something visible.
- Never invent facts about users, research or the team.

## Part one: before the review

### Step 1: Prep
Run the critique session prep with the designer. List what's missing.

### Step 2: Review
Review the design against the rubric: helps, hurts, questions. Match depth to the stage.

### Step 3: The other side
Give the five strongest objections, who'd raise them, and the evidence that would settle each.

Output: prep.md with gaps, review and objections.

## Part two: after the review

### Step 4: Decisions
From the critique notes, sort points into decided, open, parked and dropped. Mark unclear owners [OWNER?].

Output: decisions.md, ready to send.

## Done when
- Every review point cites something visible
- Nothing is listed as decided unless the notes show agreement
```
