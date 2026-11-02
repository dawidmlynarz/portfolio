## Checkpoint review

Run this on every action marked "checkpoint" in the action map.

### Does it need a checkpoint?

- [ ] It can't be undone, it spends money, or it speaks for the person. If none of these, take the checkpoint out and give it a log and an undo instead.
- [ ] It isn't one of many approvals in a row. When every step asks, people stop reading and click through.

### Is the checkpoint clear?

- [ ] It says what will change, before how the agent got there
- [ ] It says what it costs, in money, time or who sees it
- [ ] It says whether it can be undone, and for how long
- [ ] Approve, change and cancel are all there, and cancel leaves nothing half done

### Is it in the right place?

- [ ] It comes right before the action, not at the start of a long plan
- [ ] An irreversible step inside a plan gets its own checkpoint, not a single "approve plan"

### Result

Keep / Change / Remove, with one line on why.
