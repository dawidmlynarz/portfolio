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

Pick a format before you export. Both keep the same layers and references.

- **W3C DTCG** (the default). Every token is `{ "$value", "$type", "$description" }`, in the W3C design tokens format. Style Dictionary reads it as it is, with `usesDtcg: true`.
- **Plain values.** The same tree with bare values and no wrappers, for importing straight into JavaScript.

```json
{
  "primitives": {
    "color": { "blue": { "600": { "$value": "#1d4ed8", "$type": "color" } } },
    "space": {
      "4": { "$value": "16px", "$type": "dimension", "$description": "Gap between items" }
    },
    "typography": {
      "Heading": {
        "H1": {
          "$type": "typography",
          "$value": {
            "fontFamily": "Inter",
            "fontWeight": 600,
            "fontSize": "32px",
            "lineHeight": 1.25,
            "letterSpacing": "-0.02em"
          }
        }
      }
    }
  },
  "light": {
    "color": {
      "text": {
        "link": {
          "$value": "{primitives.color.blue.600}",
          "$type": "color",
          "$description": "Links in body text"
        }
      }
    }
  },
  "dark": {
    "color": {
      "text": {
        "link": {
          "$value": "{primitives.color.blue.400}",
          "$type": "color",
          "$description": "Links in body text"
        }
      }
    }
  }
}
```

- Collections with one mode (your raw palette, type scale, spacing) go into `primitives`, once.
- Collections with modes are written once per mode. Light and Dark modes give you `light` and `dark`.
- An alias stays a reference, like `{primitives.color.blue.600}`, so changing a primitive changes every token that points at it.
- A variable's description in Figma becomes its `$description`. That's the line agents read to pick the right token.
- `$type` comes from the variable's type and scopes. Colours are `color`, sizes scoped to gap, radius, width or font size are `dimension` in px, font weights are `fontWeight`, other numbers are `number`. Strings and booleans have no type in the spec, so they go without one.
- Colours export as hex, with alpha when there's transparency.
- Text Styles land under `primitives.typography` as `typography` tokens. The font style name (Semi Bold) becomes a weight (600), and line height becomes a ratio of the font size. Text case, decoration and paragraph spacing go under `$extensions`.
- If two variables end up on the same path, or a token points at something you left out, the plugin shows a warning instead of overwriting.

## Changing it

- To leave out variables hidden from publishing, find the `hiddenFromPublishing` check in `code.js` and make it `continue`.
- To get final values instead of references, change `return "{" + refPath + "}";` in `resolveValue` to call `resolveValue` again on the target.
- To rename the `primitives` layer, change `GLOBAL_LAYER_NAME` in `exportTokens`.
- If you have two kinds of modes, like Light and Dark plus Compact and Comfortable, each mode becomes its own theme. Mixing them (Light and Compact) isn't supported yet.

## License

MIT, see `LICENSE`.
