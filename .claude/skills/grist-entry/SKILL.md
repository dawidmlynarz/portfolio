---
name: grist-entry
description: Turn Dawid's rough notes into a Grist drop (src/content/grist/<slug>/index.mdx + drop.md) in his voice. Use when he pastes notes for a drop, picks one from the backlog, or asks to update a Trying drop.
---

# Grist entry

Grist (/grist) is Dawid's human-curated loot for AI tools, battle tested by him. Your job is formatting, never authorship. Read `voice.md` in this folder before writing anything.

## Inputs

- Dawid's notes: what the drop is, why, what happened (Tested) or why he's trying it (Trying), and the loot itself, even half-done.
- Optional: a backlog item from `drafts.md` (another AI tool's drafts, not his words). Use only its title, type and the loot in its code block as a starting point. Never copy its Why, tl;dr or hint as written.

## Steps

1. **Ask what's missing, once.** Before writing, check you have: Tested or Trying; for Tested, what happened; for Trying, why and where he found it; the loot. Ask for gaps in one short message.
2. **Place it.** Read `SEASONS` in `src/lib/grist.ts`. Take the season he names, or the current one, and the next free slot (slots are 1 to 8, unique per season). The slot sets the drop day; never set a date.
3. **Name it and benchmark it.** Search for the industry name of the method and use it ("straw man proposal", not a coined term); keep a unique name only for a process that really is new. Compare the workflow with established practice and similar loot published online, and tell Dawid in two or three lines what's the same, what his version adds, and anything the others do that his misses.
4. **Set type and rarity.** Type is the format (`DROP_TYPES`). Rarity is depth (`RARITY_INFO`); check it against the tier notes and say why you picked it. What the tier needs is enforced by the schema in `src/content.config.ts`: steps from Uncommon, `example: true` and a `## Example` section from Epic, `limits` at Legendary.
5. **Write the files.**
   - `src/content/grist/<slug>/index.mdx`: frontmatter (`title`, `summary` one sentence, `hint` one sentence on when to use it and what you get, `season`, `slot`, `drop`, `rarity`, `status`, `learnedFrom` (title and url of what he read, up to three), `steps`, `example`, `limits`, `related`) and the Why as the body, in his sentences. Epic and up add `## Example`.
   - `src/content/grist/<slug>/drop.md`: the loot only, ready to paste into an AI tool.
   - Keep his wording. Cut and reorder; don't embellish. Follow `voice.md`.
6. **Flag.** Anything you wrote that isn't his (a hint, a step, a filler sentence, a guessed rarity) gets one MDX comment at the top: `{/* CLAUDE: what I added, for Dawid to confirm. */}`. Production builds fail while a published drop has one, so it can't slip out.
7. **Check.** Run `npx prettier --write src/content/grist/<slug>` and `npm run check`. Fix schema errors.
8. **Hand over.** Commit on a branch, push, and tell Dawid the preview URL (`/grist/<slug>`), the rarity you picked and why, and every `CLAUDE:` note. He reads, edits and merges before drop day.

## Sources

Only credit what Dawid has read. The sources named in `drafts.md` are unverified (some couldn't be found), so ask him before adding one, and check that the link opens.

## Reviewing imported drafts

Drops imported from `drafts.md` carry `draft: true` and a `CLAUDE:` note. To finish one: ask Dawid the questions for its Why, rewrite the tl;dr, hint and Why from his answers, confirm status and sources, then remove the note and `draft`. The loot can stay as drafted if he has checked it.

## Updating a Trying drop

When he reports back on a Trying drop: add what happened to the Why in his words, switch `status` to `tested` if he used it on real work, and keep the slot and date.
