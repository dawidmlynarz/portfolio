# DTCG Token Exporter

A Figma plugin by [Dawid Młynarz](https://mlynarz.com). It exports the Variable collections and Text Styles in a Figma file into one `tokens.json`, and keeps the links between tokens.

## Install

You need the Figma desktop app. Local plugins don't load in the browser.

1. Keep `manifest.json`, `code.js` and `ui.html` together in one folder.
2. In Figma, go to Plugins, Development, Import plugin from manifest, and pick `manifest.json`.
3. Open the file with your variables and run the plugin from Plugins, Development, DTCG Token Exporter.
4. Untick anything you don't want. The tree follows the folders in Figma's own panels.
5. Click Export selected, then Download.

## What you get

```json
{
  "primitives": {
    "color": { "blue": { "400": "#60a5fa", "600": "#1d4ed8" }, "gray": { "900": "#111111" } },
    "typography": {
      "Heading": {
        "H1": { "fontFamily": "Inter", "fontStyle": "Bold", "fontSize": 32, "lineHeight": 1.2 }
      }
    }
  },
  "light": { "color": { "text": { "link": "{primitives.color.blue.600}" } } },
  "dark": { "color": { "text": { "link": "{primitives.color.blue.400}" } } }
}
```

- Collections with one mode (your raw palette, type scale, spacing) go into `primitives`, once.
- Collections with modes are written once per mode. Light and Dark modes give you `light` and `dark`.
- An alias stays a reference, like `{primitives.color.blue.600}`, so changing a primitive changes every token that points at it.
- Colours export as `#rrggbb`, or `#rrggbbaa` with transparency. Sizes export as plain numbers, without `px`.
- Text Styles land under `primitives.typography`. Line height and letter spacing in percent become ratios (150% is `1.5`).
- If two variables end up on the same path, or a token points at something you left out, the plugin shows a warning instead of overwriting.

## Before you build with it

The references need resolving before the values are usable in code. Style Dictionary can do it with a custom parser, since this shape has no `$value` and `$type` wrappers. A short script that swaps each `{a.b.c}` for the value at that path works too.

## Changing it

- To leave out variables hidden from publishing, find the `hiddenFromPublishing` check in `code.js` and make it `continue`.
- To get final values instead of references, change `return "{" + refPath + "}";` in `resolveValue` to call `resolveValue` again on the target.
- To rename the `primitives` layer, change `GLOBAL_LAYER_NAME` in `exportTokens`.
- If you have two kinds of modes, like Light and Dark plus Compact and Comfortable, each mode becomes its own theme. Mixing them (Light and Compact) isn't supported yet.
