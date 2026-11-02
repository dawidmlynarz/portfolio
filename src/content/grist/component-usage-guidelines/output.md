Button

Purpose: Starts an action on the current page, like saving, sending or opening a dialog.

Use when:

- The person is about to do something, not go somewhere
- It's the main or second action in a form, card or dialog

Don't use for:

- Going to another page. Use Link.
- Switching a setting on and off. Use Switch.
- A row of filters. Use ToggleGroup.

Props that matter:

- variant: primary (one per view), secondary, ghost
- loading: shows a spinner and blocks repeat clicks
- icon: leading icon, never on its own without a label

States: default, hover, focus, pressed, loading, disabled

Easily confused with: Link. If the URL changes, it's a Link, even when it looks like a button.

Limits: label up to 3 words [CHECK]. Keyboard reachable, visible focus, 44px touch target.
