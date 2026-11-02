Verdict
Build discovery as an assistant. Let the agent act only to hold a table. Paying the deposit stays with the person.

Top five issues

1. High. The deposit is step 3 of a 4-step plan that's approved as a whole ("Approve plan").
   Fix: a separate checkpoint right before payment, with the amount and the cancellation rule.
2. High. It can pay with the saved card without saying which one.
   Fix: name the card and the amount in the checkpoint.
3. Medium. A held table that expires is silent. The person finds out at payment.
   Fix: show the expiry on the plan and warn 10 minutes before.
4. Medium. It asks to confirm the map view and the date filter.
   Fix: remove both checkpoints. They can be undone in one click.
5. Low. "Done!" after holding a table reads like a booking.
   Fix: "Table held until 18:40. Not booked yet."

Action map
| Action | Can be undone | Treatment | Notes |
| Search restaurants | Yes | No interface | |
| Filter by date | Yes | Log and undo | Was a checkpoint |
| Hold a table | Yes, until expiry | Log and undo | Show expiry |
| Pay the deposit | No | Checkpoint | Name card, amount, cancellation rule |

Open questions
Can holds be extended? The brief doesn't say.
