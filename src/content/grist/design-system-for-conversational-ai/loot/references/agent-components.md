## Agent components and their states

Use this as a checklist, not a shopping list. Most products need half of these at first.

| Component          | What it's for                                                                      | States                                                 |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Message            | One turn from the person or the agent                                              | sending, streaming, done, error, edited                |
| Composer           | Where the person writes or attaches                                                | empty, typing, sending, disabled while the agent works |
| Thinking indicator | Shows the agent is working before any text                                         | thinking, taking long, cancelled                       |
| Plan               | The steps the agent will take, before it acts                                      | draft, waiting for approval, running, done, changed    |
| Tool call          | One action the agent takes, like a search or a booking                             | queued, running, done, failed, skipped                 |
| Approval           | Stops before an action that can't be undone, spends money or speaks for the person | waiting, approved, changed, declined, expired          |
| Citation           | Where a claim came from                                                            | inline, expanded, source unavailable                   |
| Result card        | A structured answer, like an offer or a summary                                    | loading, ready, outdated                               |
| Error and retry    | Something failed and what to do next                                               | recoverable, needs the person, permanent               |
| Undo               | Reverses what the agent just did                                                   | available, counting down, expired                      |
| Handoff            | Passes the conversation to a person                                                | offered, waiting, connected, unavailable               |
| Activity log       | What the agent did, in order, readable later                                       | live, complete, filtered                               |
| Feedback           | Thumbs, flags or corrections on an answer                                          | idle, given, sent                                      |
