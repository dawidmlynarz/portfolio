// DTCG Token Exporter, by Dawid Młynarz (https://mlynarz.com)
// Reads the local Variable collections and Text Styles in a Figma file and writes one tokens.json.
// Single-mode collections go once into a shared "primitives" layer. Multi-mode collections are
// written once per mode (light, dark, ...). Aliases stay as {path.to.token} references, so the
// links between tokens survive the export.

figma.showUI(__html__, { width: 380, height: 560 });

// Text styles aren't a Variable collection, but we want them selectable in
// the same checkbox tree and filterable with the same exclusion logic — so
// they get a fixed pseudo-collection id to hook into that machinery.
var TEXT_STYLES_PSEUDO_ID = "__figma_text_styles__";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 0–1 float channel -> 2-digit hex. */
function channelToHex(c) {
  var v = Math.round(c * 255);
  var hex = v.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

/** Figma RGBA -> #rrggbb or #rrggbbaa. */
function rgbaToHex(color) {
  var hex = "#" + channelToHex(color.r) + channelToHex(color.g) + channelToHex(color.b);
  if (typeof color.a === "number" && color.a < 1) {
    hex += channelToHex(color.a);
  }
  return hex;
}

/** "color/bg/primary" -> ["color", "bg", "primary"] (trimmed, safe). */
function namePath(name) {
  return name
    .split("/")
    .map(function (part) {
      return part.trim();
    })
    .filter(function (part) {
      return part.length > 0;
    });
}

/** Kebab-safe key from a collection/mode name (used for theme keys like "light"/"dark"). */
function slug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build a folder tree for one collection's variables, mirroring how Figma's
 * own Variables panel groups by "/" in the name. Only the segments *before*
 * the final one count as folders — the final segment is the variable itself.
 */
function buildFolderTree(variableNames) {
  var root = { ownCount: 0, children: {} };

  variableNames.forEach(function (name) {
    var segments = namePath(name);
    var node = root;
    for (var i = 0; i < segments.length - 1; i++) {
      var seg = segments[i];
      if (!node.children[seg]) {
        node.children[seg] = { ownCount: 0, children: {} };
      }
      node = node.children[seg];
    }
    node.ownCount += 1;
  });

  function addTotals(node) {
    var total = node.ownCount;
    var keys = Object.keys(node.children);
    for (var i = 0; i < keys.length; i++) {
      total += addTotals(node.children[keys[i]]);
    }
    node.totalCount = total;
    return total;
  }
  addTotals(root);

  return root;
}

/**
 * True if `excludedPaths` (array of string[] folder paths for this
 * collection) contains a path that is a prefix of (or equal to) `folderPath`.
 * An empty excluded path ([]) matches everything — i.e. the whole collection.
 */
function isExcluded(folderPath, excludedPaths) {
  for (var i = 0; i < excludedPaths.length; i++) {
    var ex = excludedPaths[i];
    var match = true;
    for (var j = 0; j < ex.length; j++) {
      if (folderPath[j] !== ex[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

/** Set a raw literal at a nested path, warning on any overwrite (leaf<->group or duplicate). */
function setNested(root, path, value, sourceLabel, warnings) {
  var node = root;
  for (var i = 0; i < path.length - 1; i++) {
    var key = path[i];
    if (typeof node[key] !== "object" || node[key] === null) {
      if (node[key] !== undefined) {
        warnings.push(
          path.slice(0, i + 1).join(".") +
            " was a single value but " +
            sourceLabel +
            " needs it to be a group; original value was replaced.",
        );
      }
      node[key] = {};
    }
    node = node[key];
  }

  var finalKey = path[path.length - 1];
  if (node[finalKey] !== undefined) {
    if (typeof node[finalKey] === "object") {
      warnings.push(
        path.join(".") +
          " was a group of values but " +
          sourceLabel +
          " overwrote it with a single value.",
      );
    } else {
      warnings.push(
        path.join(".") +
          " is defined more than once (last write: " +
          sourceLabel +
          "); earlier value was overwritten.",
      );
    }
  }
  node[finalKey] = value;
}

/** Convert a variable's raw (non-alias) value into its final literal form. */
function literalFromRaw(variable, raw) {
  if (variable.resolvedType === "COLOR") return rgbaToHex(raw);
  return raw; // strings, numbers, booleans pass through unchanged
}

/**
 * Resolve a variable's value for a given theme (mode slug). A collection
 * with a single mode always uses that mode, regardless of theme — this is
 * how mode-invariant variables (fontSize, spacing, unchanging primitives,
 * ...) end up in the shared `primitives` layer rather than duplicated.
 *
 * If the value is an alias, this does NOT resolve it down to a literal.
 * Instead it returns a Style Dictionary-style reference string pointing at
 * wherever the target variable lives in the *output* tree — e.g.
 * "{primitives.color.blurple.500}" for a semantic token aliasing a
 * primitive, or "{light.color.background.brand}" for one semantic token
 * aliasing another within the same theme. This keeps primitives as the
 * single source of truth instead of baking their value into every place
 * that references them.
 */
async function resolveValue(variable, themeSlug, warnings, excludedByCollection, globalLayerName) {
  var collection = await figma.variables.getVariableCollectionByIdAsync(
    variable.variableCollectionId,
  );
  if (!collection) {
    warnings.push('Could not find the collection for "' + variable.name + '"; skipped.');
    return undefined;
  }

  var modeId = null;
  if (collection.modes.length === 1) {
    modeId = collection.modes[0].modeId;
  } else {
    for (var i = 0; i < collection.modes.length; i++) {
      if (slug(collection.modes[i].name) === themeSlug) {
        modeId = collection.modes[i].modeId;
        break;
      }
    }
  }

  if (modeId === null) {
    warnings.push(
      '"' +
        variable.name +
        '" (in "' +
        collection.name +
        '") has no mode matching theme "' +
        themeSlug +
        '"; skipped for this theme.',
    );
    return undefined;
  }

  var raw = variable.valuesByMode[modeId];
  if (raw === undefined) {
    warnings.push('"' + variable.name + '" has no value for the resolved mode; skipped.');
    return undefined;
  }

  if (raw !== null && typeof raw === "object" && raw.type === "VARIABLE_ALIAS") {
    var target = await figma.variables.getVariableByIdAsync(raw.id);
    if (!target) {
      warnings.push('"' + variable.name + '" points to a variable that no longer exists; skipped.');
      return undefined;
    }

    var targetCollection = await figma.variables.getVariableCollectionByIdAsync(
      target.variableCollectionId,
    );
    if (!targetCollection) {
      warnings.push(
        '"' + variable.name + '" points to a variable whose collection is missing; skipped.',
      );
      return undefined;
    }

    var layerPrefix;
    if (targetCollection.modes.length === 1) {
      layerPrefix = globalLayerName;
    } else {
      var targetHasMatchingMode = targetCollection.modes.some(function (m) {
        return slug(m.name) === themeSlug;
      });
      if (!targetHasMatchingMode) {
        warnings.push(
          '"' +
            variable.name +
            '" aliases "' +
            target.name +
            '", which has no mode matching theme "' +
            themeSlug +
            '"; skipped.',
        );
        return undefined;
      }
      layerPrefix = themeSlug;
    }

    var targetFolderPath = namePath(target.name).slice(0, -1);
    var targetExclusions = excludedByCollection[target.variableCollectionId] || [];
    if (isExcluded(targetFolderPath, targetExclusions)) {
      warnings.push(
        '"' +
          variable.name +
          '" aliases "' +
          target.name +
          '", which is excluded from this export — the reference will be broken.',
      );
    }

    var refPath = [layerPrefix].concat(namePath(target.name)).join(".");
    return "{" + refPath + "}";
  }

  return literalFromRaw(variable, raw);
}

/**
 * A text style property is *usually* a plain value, but occasionally it's
 * bound to a Variable instead (e.g. font size pulled from a shared spacing
 * scale). If so, this returns the same kind of "{primitives...}" reference
 * used for variable aliases, instead of baking in a snapshot value.
 *
 * Note: text styles don't have themes/modes of their own, so a bound
 * variable is expected to live in a single-mode collection. If it's bound to
 * a variable that varies by mode, there's no theme context to resolve it
 * against here — this falls back to that variable's first mode's value
 * (with a warning), rather than guessing which theme was intended.
 */
async function resolveTextStyleProperty(
  style,
  propName,
  plainValue,
  warnings,
  excludedByCollection,
  globalLayerName,
) {
  var bound = style.boundVariables && style.boundVariables[propName];
  if (!bound || !bound.id) return plainValue;

  var variable = await figma.variables.getVariableByIdAsync(bound.id);
  if (!variable) {
    warnings.push(
      'Text style "' +
        style.name +
        '" property "' +
        propName +
        '" is bound to a variable that no longer exists; used its last known value instead.',
    );
    return plainValue;
  }

  var collection = await figma.variables.getVariableCollectionByIdAsync(
    variable.variableCollectionId,
  );
  if (!collection) {
    warnings.push(
      'Text style "' +
        style.name +
        '" property "' +
        propName +
        '" is bound to a variable whose collection is missing; used its last known value instead.',
    );
    return plainValue;
  }

  if (collection.modes.length > 1) {
    warnings.push(
      'Text style "' +
        style.name +
        '" property "' +
        propName +
        '" is bound to "' +
        variable.name +
        "\", which varies by mode — text styles don't support themes, so its first mode's value was used instead of a reference.",
    );
    var firstModeId = collection.modes[0].modeId;
    var rawFallback = variable.valuesByMode[firstModeId];
    if (rawFallback === undefined) return plainValue;
    if (
      rawFallback !== null &&
      typeof rawFallback === "object" &&
      rawFallback.type === "VARIABLE_ALIAS"
    ) {
      var innerTarget = await figma.variables.getVariableByIdAsync(rawFallback.id);
      if (!innerTarget) return plainValue;
      var innerModeId = Object.keys(innerTarget.valuesByMode)[0];
      return literalFromRaw(innerTarget, innerTarget.valuesByMode[innerModeId]);
    }
    return literalFromRaw(variable, rawFallback);
  }

  var targetFolderPath = namePath(variable.name).slice(0, -1);
  var targetExclusions = excludedByCollection[variable.variableCollectionId] || [];
  if (isExcluded(targetFolderPath, targetExclusions)) {
    warnings.push(
      'Text style "' +
        style.name +
        '" property "' +
        propName +
        '" references "' +
        variable.name +
        '", which is excluded from this export — the reference will be broken.',
    );
  }

  return "{" + [globalLayerName].concat(namePath(variable.name)).join(".") + "}";
}

/**
 * Build one composite typography token from a Figma TextStyle — font
 * family/style, size, line height, letter spacing, paragraph spacing/indent,
 * text case, and text decoration, all bundled under the style's own name.
 *
 * Figma expresses lineHeight/letterSpacing as either a plain pixel value or
 * a percentage; percentages are normalized to a unitless ratio (e.g. 150%
 * line-height -> 1.5), which is what most CSS/JS consumption expects.
 */
async function buildTypographyToken(style, warnings, excludedByCollection, globalLayerName) {
  var lineHeightValue;
  if (style.lineHeight.unit === "AUTO") {
    lineHeightValue = "AUTO";
  } else if (style.lineHeight.unit === "PERCENT") {
    lineHeightValue = style.lineHeight.value / 100;
  } else {
    lineHeightValue = style.lineHeight.value;
  }

  var letterSpacingValue =
    style.letterSpacing.unit === "PERCENT"
      ? style.letterSpacing.value / 100
      : style.letterSpacing.value;

  var token = {};
  token.fontFamily = await resolveTextStyleProperty(
    style,
    "fontFamily",
    style.fontName.family,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  // Figma calls this the font's "style" (e.g. "Bold", "Semi Bold Italic") —
  // it's a name, not a numeric CSS font-weight. Map it downstream if needed.
  token.fontStyle = await resolveTextStyleProperty(
    style,
    "fontStyle",
    style.fontName.style,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  token.fontSize = await resolveTextStyleProperty(
    style,
    "fontSize",
    style.fontSize,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  token.lineHeight = await resolveTextStyleProperty(
    style,
    "lineHeight",
    lineHeightValue,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  token.letterSpacing = await resolveTextStyleProperty(
    style,
    "letterSpacing",
    letterSpacingValue,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  token.paragraphSpacing = await resolveTextStyleProperty(
    style,
    "paragraphSpacing",
    style.paragraphSpacing,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  token.paragraphIndent = await resolveTextStyleProperty(
    style,
    "paragraphIndent",
    style.paragraphIndent,
    warnings,
    excludedByCollection,
    globalLayerName,
  );
  // Figma doesn't support binding these two to variables, so no lookup needed.
  token.textCase = style.textCase;
  token.textDecoration = style.textDecoration;

  return token;
}

// ---------------------------------------------------------------------------
// Scan (populates the selection tree in the UI)
// ---------------------------------------------------------------------------

async function scanVariables() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var textStyles = await figma.getLocalTextStylesAsync();

  if (collections.length === 0 && textStyles.length === 0) {
    figma.ui.postMessage({
      type: "ERROR",
      message: "No local variable collections or text styles found in this file.",
    });
    return;
  }

  var result = [];
  for (var c = 0; c < collections.length; c++) {
    var collection = collections[c];
    var names = [];
    for (var v = 0; v < collection.variableIds.length; v++) {
      var variable = await figma.variables.getVariableByIdAsync(collection.variableIds[v]);
      if (variable) names.push(variable.name);
    }
    result.push({
      id: collection.id,
      name: collection.name,
      modeCount: collection.modes.length,
      tree: buildFolderTree(names),
    });
  }

  if (textStyles.length > 0) {
    var styleNames = textStyles.map(function (s) {
      return s.name;
    });
    result.push({
      id: TEXT_STYLES_PSEUDO_ID,
      name: "Text Styles",
      modeCount: 0, // not a real Variable collection — no mode badge in the UI
      tree: buildFolderTree(styleNames),
    });
  }

  figma.ui.postMessage({ type: "SCAN_RESULT", collections: result });
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

async function exportTokens(excluded) {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var textStyles = await figma.getLocalTextStylesAsync();

  if (collections.length === 0 && textStyles.length === 0) {
    figma.ui.postMessage({
      type: "ERROR",
      message: "No local variable collections or text styles found in this file.",
    });
    return;
  }

  var excludedByCollection = {};
  (excluded || []).forEach(function (entry) {
    if (!excludedByCollection[entry.collectionId]) {
      excludedByCollection[entry.collectionId] = [];
    }
    excludedByCollection[entry.collectionId].push(entry.path);
  });

  var warnings = [];

  // Rename this if you'd rather call the global layer "global", "base", etc.
  var GLOBAL_LAYER_NAME = "primitives";
  // Where Text Styles land inside the global layer — a composite object per
  // style (fontFamily, fontSize, lineHeight, ...), not individual scalars.
  var TYPOGRAPHY_GROUP_NAME = "typography";

  var multiModeCollections = collections.filter(function (c) {
    return c.modes.length > 1;
  });
  var singleModeCollections = collections.filter(function (c) {
    return c.modes.length === 1;
  });

  // The set of themes to export is the union of every mode name across every
  // multi-mode ("semantic") collection — e.g. "light"/"dark".
  var themeSlugs = [];
  multiModeCollections.forEach(function (c) {
    c.modes.forEach(function (m) {
      var s = slug(m.name);
      if (themeSlugs.indexOf(s) === -1) themeSlugs.push(s);
    });
  });

  var out = {};

  // --- Global layer: every single-mode ("primitive") collection, plus Text
  // Styles, written once. Nothing here changes by theme, so it isn't
  // duplicated. ---
  if (singleModeCollections.length > 0 || textStyles.length > 0) {
    var globalBucket = {};

    for (var g = 0; g < singleModeCollections.length; g++) {
      var gCollection = singleModeCollections[g];
      var gExclusions = excludedByCollection[gCollection.id] || [];

      for (var gv = 0; gv < gCollection.variableIds.length; gv++) {
        var gVariable = await figma.variables.getVariableByIdAsync(gCollection.variableIds[gv]);
        if (!gVariable) continue;
        if (gVariable.hiddenFromPublishing) {
          // Still exported — change this comment to `continue;` to skip them.
        }
        var gFolderPath = namePath(gVariable.name).slice(0, -1);
        if (isExcluded(gFolderPath, gExclusions)) continue;

        var gValue = await resolveValue(
          gVariable,
          null,
          warnings,
          excludedByCollection,
          GLOBAL_LAYER_NAME,
        );
        if (gValue === undefined) continue;

        setNested(globalBucket, namePath(gVariable.name), gValue, gCollection.name, warnings);
      }
    }

    if (textStyles.length > 0) {
      var typographyBucket = {};
      var textStyleExclusions = excludedByCollection[TEXT_STYLES_PSEUDO_ID] || [];

      for (var ts = 0; ts < textStyles.length; ts++) {
        var style = textStyles[ts];
        if (style.hiddenFromPublishing) {
          // Still exported — change this comment to `continue;` to skip them.
        }
        var styleFolderPath = namePath(style.name).slice(0, -1);
        if (isExcluded(styleFolderPath, textStyleExclusions)) continue;

        var typographyToken = await buildTypographyToken(
          style,
          warnings,
          excludedByCollection,
          GLOBAL_LAYER_NAME,
        );
        setNested(typographyBucket, namePath(style.name), typographyToken, "Text Styles", warnings);
      }

      globalBucket[TYPOGRAPHY_GROUP_NAME] = typographyBucket;
    }

    out[GLOBAL_LAYER_NAME] = globalBucket;
  }

  // --- Semantic layer: every multi-mode collection, once per theme. If a
  // semantic variable is a direct value, it's exported as a literal. If it's
  // an alias (typically pointing into the global layer above), it's exported
  // as a "{primitives.color.blurple.500}"-style reference instead of being
  // baked into a duplicate literal. ---
  for (var t = 0; t < themeSlugs.length; t++) {
    var themeSlug = themeSlugs[t];
    var themeObj = {};

    for (var c1 = 0; c1 < multiModeCollections.length; c1++) {
      var collection1 = multiModeCollections[c1];
      var exclusions1 = excludedByCollection[collection1.id] || [];

      var hasMatchingMode = collection1.modes.some(function (m) {
        return slug(m.name) === themeSlug;
      });
      if (!hasMatchingMode) {
        // A different, unrelated mode dimension (e.g. Compact/Comfortable
        // rather than Light/Dark) — skip it for this theme.
        warnings.push(
          'Collection "' +
            collection1.name +
            '" has no mode matching theme "' +
            themeSlug +
            '"; skipped entirely for this theme.',
        );
        continue;
      }

      for (var v1 = 0; v1 < collection1.variableIds.length; v1++) {
        var variable1 = await figma.variables.getVariableByIdAsync(collection1.variableIds[v1]);
        if (!variable1) continue;
        if (variable1.hiddenFromPublishing) {
          // Still exported — change this comment to `continue;` to skip them.
        }
        var folderPath1 = namePath(variable1.name).slice(0, -1);
        if (isExcluded(folderPath1, exclusions1)) continue;

        var value1 = await resolveValue(
          variable1,
          themeSlug,
          warnings,
          excludedByCollection,
          GLOBAL_LAYER_NAME,
        );
        if (value1 === undefined) continue;

        setNested(
          themeObj,
          namePath(variable1.name),
          value1,
          collection1.name + " (" + themeSlug + ")",
          warnings,
        );
      }
    }

    out[themeSlug] = themeObj;
  }

  figma.ui.postMessage({
    type: "EXPORT_RESULT",
    fileName: "tokens.json",
    body: JSON.stringify(out, null, 2),
    warnings: warnings,
  });
}

// ---------------------------------------------------------------------------
// Messages from the UI
// ---------------------------------------------------------------------------

figma.ui.onmessage = function (msg) {
  if (msg.type === "SCAN") {
    scanVariables().catch(function (err) {
      figma.ui.postMessage({ type: "ERROR", message: String(err) });
    });
  }
  if (msg.type === "EXPORT") {
    exportTokens(msg.excluded).catch(function (err) {
      figma.ui.postMessage({ type: "ERROR", message: String(err) });
    });
  }
  if (msg.type === "OPEN_URL" && /^https:\/\/mlynarz\.com(\/|$)/.test(msg.url)) {
    figma.openExternal(msg.url);
  }
  if (msg.type === "CLOSE") {
    figma.closePlugin();
  }
};
