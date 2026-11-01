/**
 * Hover effects on Legendary and Mythic drop cards, from Dawid's settings in the effects builder
 * (/grist/review/fx, 1 Nov). They use the react-cards-opening effects (playEffects, no React
 * component is rendered), loaded only the first time someone points at one of these cards, so no
 * other page or card pays for them. Nothing plays under reduced motion or without a pointer that
 * hovers; the cards are complete without it.
 *
 * The effects sit behind the cards (they stay on top and readable), on a layer laid over the card
 * with room around it, fixed to the viewport so it can never widen the page. The layer goes once
 * the show is over.
 */
import "@react-cards-opening/effects/styles.css";
import { clearEffects, EFFECTS, playEffects, type EffectName } from "@react-cards-opening/effects";

interface Row {
  effect: EffectName;
  delay: number;
  /** Percent of the card's width. */
  size: number;
  /** 0 to 1, the layer's opacity. */
  strength: number;
}

const LOOKS: Record<"legendary" | "mythic", Row[]> = {
  legendary: [
    { effect: "flash", delay: 0, size: 100, strength: 1 },
    { effect: "shake", delay: 0, size: 100, strength: 1 },
    { effect: "beams", delay: 0.25, size: 60, strength: 1 },
    { effect: "embers", delay: 0.4, size: 60, strength: 1 },
  ],
  mythic: [
    { effect: "negative", delay: 0, size: 100, strength: 1 },
    { effect: "nova", delay: 0, size: 100, strength: 1 },
    { effect: "quake", delay: 0, size: 100, strength: 1 },
    { effect: "chroma", delay: 0, size: 100, strength: 1 },
    { effect: "comets", delay: 0.05, size: 100, strength: 1 },
    { effect: "flames", delay: 0.15, size: 70, strength: 0.85 },
  ],
};

/** A token's colour as a plain hex (the library takes hex only). */
function tokenHex(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const [r = 0, g = 0, b = 0] = (getComputedStyle(probe).color.match(/[\d.]+/g) ?? []).map(Number);
  probe.remove();
  return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;
}

const playing = new WeakMap<HTMLElement, HTMLElement[]>();

export function playDropFx(card: HTMLElement, tier: "legendary" | "mythic") {
  // A show already running on this card is cleared first, so two never stack.
  for (const old of playing.get(card) ?? []) {
    clearEffects(old);
    old.remove();
  }

  const box = card.getBoundingClientRect();
  const room = box.width * 0.35;
  const tone = tokenHex(`--rarity-${tier}-icon`);
  // Lights add up into a glow on dark, and are painted on light, as in the builder ("auto").
  const blend = document.documentElement.dataset.theme === "dark" ? "add" : "normal";
  const layers: HTMLElement[] = [];
  let left = LOOKS[tier].length;

  for (const row of LOOKS[tier]) {
    const effect = EFFECTS[row.effect];
    if (!effect) continue;
    const layer = document.createElement("div");
    layer.className = "rco-fx-layer drop-fx";
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, {
      position: "fixed",
      inset: "auto",
      left: `${box.left - room}px`,
      top: `${box.top - room}px`,
      width: `${box.width + room * 2}px`,
      height: `${box.height + room * 2}px`,
      opacity: String(row.strength),
      zIndex: "-1",
    });
    // Under every card, not only this one (z-index -1, above the page background), so nothing
    // spills over the neighbours; it shows in the gaps between them.
    card.before(layer);
    layers.push(layer);
    const timeline = playEffects(layer, effect, {
      at: card,
      size: (box.width * row.size) / 100,
      ratio: box.height / box.width,
      tone,
      delay: row.delay,
      blend,
      subject: card,
    });
    timeline.eventCallback("onComplete", () => {
      left -= 1;
      if (left > 0) return;
      for (const done of layers) {
        clearEffects(done);
        done.remove();
      }
      playing.delete(card);
    });
  }
  playing.set(card, layers);
}
