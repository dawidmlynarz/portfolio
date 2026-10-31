# Grist voice

How a Grist drop should read. Drawn from Dawid's case studies (NerdWallet, BeatStars), his Human checkpoints drop and the Grist copy he approved. The source of truth is the doc "Grist — voice and tone"; keep this file in step with it.

## Who writes what

- The ideas, the Why and the judgement are Dawid's. Claude formats, tidies, shortens and fills in frontmatter.
- Claude never invents an experience, a result, a number or a source. Where one is needed and missing, write `[what happened]` and add a `CLAUDE:` comment.
- **Tested** drops: Dawid used it on real work. The Why says what happened.
- **Trying** drops: curated or new to him. The Why says why he picked it up and what he's watching for. `learnedFrom` credits what he read, as linked titles (up to three). Publishers of guides, reports and research are fine to name; product recommendations are not.

## Traits

- **First person, with ownership.** "I", and "we" only when a team did it. The Why speaks from his work, never for "teams" or "designers" in general.
- **Process in order.** What he did, then what happened.
- **Specifics.** A number, a project, a file, a moment. "~70% of the traffic was mobile", "two weeks (one sprint cycle)".
- **Plain and practical.** Points read as conclusions from the work, e.g. "Applying relevant filters is easier than showing relevant results."
- **Modest.** Report and move on.
- **A little uneven.** Vary sentence length. Fix typos, keep the rhythm.

Human checkpoints is the model for a Common: two short paragraphs, the rule said plainly, then the failure he has seen.

## Avoid

- Inside knowledge. Spell out an acronym the first time it appears in a drop (statement of work (SOW)), say in a few words what a tool is (Style Dictionary, an open-source token build tool), and never refer to a client, project or internal name a reader can't know. When unsure what a term means, ask Dawid instead of guessing.

- "Not X, it's Y" contrasts and "X instead of Y" punchlines. Say the positive version.
- Aphorisms as the last line of a Why ("Averages hide people.").
- Triplets everywhere. Keep the item that matters.
- Claims about "most teams" or "most failures" without his observation or a source.
- Em dashes, rhetorical questions, bold on every paragraph, closing lines that restate the page.
- "Seamless", "leverage", "delve", "robust", "game-changer", "the biggest lever", "the turning point".

## Before and after

Drafted: "'Done!' is the most expensive word an agent says when it's wrong. A receipt makes mistakes visible while they're still cheap."

Tested: "I started adding this after [a coding agent told me a change was done when it had only edited one of three files]. Now every agent I set up has to list what it changed and where before it says it's finished. It takes a few seconds to check the list, and I catch [the missed file] before it reaches a review."

Trying: "I'm trying this one on [project] for the next few weeks. The idea is simple: an agent lists what it changed and where before it says it's done, so I can check the list instead of the whole diff. I picked it up from [source]. I'll update this drop with what I find."
