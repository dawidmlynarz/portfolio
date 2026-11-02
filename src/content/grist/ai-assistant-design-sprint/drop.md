# AI assistant design sprint

Five stages. You run the sprint and make the calls. Each stage has a prompt for the part an AI tool can draft. Paste the output of one stage into the next.

## 1. Competitive audit

You: pick 3 to 5 assistants the client's users already know, and try each one.

Prompt:

> Here are my notes from trying [assistants]. Build an audit table with one row per assistant and the columns: Where it lives · What it can do (answer, recommend, act) · How it hands off to a person · How it handles errors · Tone. Add [my criteria]. Mark anything my notes don't cover as "not seen". Then list three patterns worth copying and three to avoid.

## 2. Journey map

You: confirm the journey's start and end with the client.

Prompt:

> Using the audit above and this brief [brief], map the journey for [audience] from the first question to after [the main task]. For each stage give: What the person wants · What the assistant does · What could go wrong. Flag the stage where a mistake costs the most.

## 3. Interaction spec

You: decide what the assistant may never do, before you prompt.

Prompt:

> For each stage of the journey map, write the interaction spec: what the assistant says (one example line), what it shows (cards, options, summaries), what it does, and what it never does. Never: [my list]. Any action that spends money or can't be undone needs a confirmation step. Keep each stage under 80 words.

## 4. Scripted prototype

You: build the clickable prototype. Real-looking content, fixed responses, no model yet.

Prompt:

> Turn the interaction spec into a script for the main flow. Write every assistant reply word for word, with the person's input before it, and one error path. Number the screens so I can match them to the prototype.

## 5. Review

You: walk the client through the prototype and take notes.

Prompt:

> Here are my notes from the prototype review [notes]. Write two lists. Decisions: what was agreed, who agreed, and what changes. Open questions: what's undecided, and who answers it. Don't add anything that isn't in my notes.

## Output

Audit table · Journey map · Interaction spec · Prototype and script · Decisions and open questions
