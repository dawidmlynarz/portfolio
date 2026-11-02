/**
 * Hover embers on Legendary and Mythic drop cards, from Dawid's settings in the effects builder
 * (/grist/review/fx, 2 Nov): embers only, 80% of the card's width, strength 0.75, density 0.35,
 * in the tier colour, in front of the cards. They use the react-cards-opening effects (playEffects,
 * no React component is rendered), loaded only the first time someone points at one of these
 * cards, so no other page or card pays for them. Nothing plays under reduced motion or without a
 * pointer that hovers; the cards are complete without it.
 *
 * The embers play on a layer fixed over the whole viewport, above every card, so they can rise
 * past the card's edge and over its neighbours without being clipped or widening the page. The
 * layer ignores the pointer and goes once the embers are done.
 */
import "@react-cards-opening/effects/styles.css";
import { clearEffects, EFFECTS, playEffects, type Effect } from "@react-cards-opening/effects";

export type FxTier = "legendary" | "mythic";

const LOOK = { size: 80, strength: 0.75, density: 0.35 };

/** Keeps only `density` of the particles an effect lets go (as the builder does). */
function thinned(effect: Effect, density: number): Effect {
  return {
    ...effect,
    play: (stage, timeline) => {
      const field = Object.create(stage.field) as typeof stage.field;
      field.emit = (particles) => stage.field.emit(particles.filter(() => Math.random() < density));
      effect.play({ ...stage, field }, timeline);
    },
  };
}

/** A token's colour as a plain hex (the library takes hex only). */
function tokenHex(token: string) {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const [r = 0, g = 0, b = 0] = (getComputedStyle(probe).color.match(/[\d.]+/g) ?? []).map(Number);
  probe.remove();
  return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;
}

const playing = new WeakMap<HTMLElement, HTMLElement>();

export function playDropFx(card: HTMLElement, tier: FxTier) {
  const embers = EFFECTS.embers;
  if (!embers) return;
  // A show already running on this card is cleared first, so two never stack.
  const old = playing.get(card);
  if (old) {
    clearEffects(old);
    old.remove();
  }

  const box = card.getBoundingClientRect();
  // Lights add up into a glow on dark, and are painted on light, as in the builder ("auto").
  const theme = document.documentElement.dataset.theme;
  const dark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const layer = document.createElement("div");
  layer.className = "rco-fx-layer drop-fx";
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    opacity: String(LOOK.strength),
    zIndex: "calc(var(--z-nav) - 1)",
  });
  document.body.append(layer);
  playing.set(card, layer);

  const timeline = playEffects(layer, thinned(embers, LOOK.density), {
    at: card,
    size: (box.width * LOOK.size) / 100,
    ratio: box.height / box.width,
    tone: tokenHex(`--rarity-${tier}-icon`),
    delay: 0,
    blend: dark ? "add" : "normal",
    subject: card,
  });
  timeline.eventCallback("onComplete", () => {
    clearEffects(layer);
    layer.remove();
    if (playing.get(card) === layer) playing.delete(card);
  });
}
