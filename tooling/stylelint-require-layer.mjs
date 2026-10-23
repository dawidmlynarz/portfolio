// Every style rule must live inside one of the site's cascade layers.
// Unlayered CSS (e.g. a bare Astro scoped <style>) beats all layers and breaks the cascade order.
import stylelint from "stylelint";

const ruleName = "mlynarz/require-layer";
const LAYERS = new Set(["reset", "tokens", "base", "components", "utilities"]);
const messages = stylelint.utils.ruleMessages(ruleName, {
  unlayered: "Wrap this rule in @layer components { … } (or another site layer).",
  unknown: (name) => `Unknown layer "${name}". Use one of: ${[...LAYERS].join(", ")}.`,
});

/** @type {import("stylelint").Rule} */
const rule = (enabled) => (root, result) => {
  if (!enabled) return;

  root.walkAtRules("layer", (atRule) => {
    for (const name of atRule.params.split(",").map((n) => n.trim())) {
      if (name && !LAYERS.has(name)) {
        stylelint.utils.report({ result, ruleName, node: atRule, message: messages.unknown(name) });
      }
    }
  });

  root.walkRules((node) => {
    let parent = node.parent;
    while (parent && parent.type !== "root") {
      if (parent.type === "atrule" && /^(layer|keyframes)$/.test(parent.name)) return;
      parent = parent.parent;
    }
    stylelint.utils.report({ result, ruleName, node, message: messages.unlayered });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;

export default stylelint.createPlugin(ruleName, rule);
