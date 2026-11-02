Inventory
| Component | Global or agent | States | Exists today? |
| Message | Agent | sending, streaming, done, error | Yes, no error state |
| Composer | Agent | empty, typing, disabled while working | Yes |
| Plan | Agent | waiting for approval, running, done | No |
| Approval | Agent | waiting, approved, declined, expired | No |
| Tool call | Agent | running, done, failed | No |
| Offer card | Global (card variant) | loading, ready, outdated | Yes, as Hotel card |
| Date picker | Global | default, range, disabled dates | Yes |
| Button, Input, Card | Global | full set | Yes |

Page structure
Foundations · Buttons · Inputs · Cards · Pickers · Agent (Message, Composer, Plan, Approval, Tool call)

Variable groups and naming
color, type, space, radius, motion. Named like the React library (color-text-muted, space-4), so Figma and code match.

Candidates and gaps

- Candidate: Hotel card from the booking prototype. Keep it as an Offer card variant, not a new component.
- Gap: no Approval. Booking a room spends money, so it needs one before launch.
- Gap: Message has no error state. A failed reply has nowhere to go.
- Left out for now: Citation, Handoff, Activity log. The first release doesn't need them.
