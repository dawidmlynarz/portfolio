/**
 * "Ink spread": a same-document View Transition where the new state grows as a circle from an
 * element (direction "in"), or the old state shrinks back into it ("out"). Used by the theme
 * switch. Styles: [data-spread] in base.css.
 * Reduced motion or no View Transitions: the update runs instantly.
 */
export function spread(
  origin: Element,
  update: () => unknown,
  direction: "in" | "out" = "in",
): void {
  const root = document.documentElement;
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    void update();
    return;
  }
  // The circle is centred on the element and reaches the farthest corner of the viewport.
  const { left, top, width, height } = origin.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty("--spread-x", `${x}px`);
  root.style.setProperty("--spread-y", `${y}px`);
  root.style.setProperty("--spread-r", `${r}px`);
  root.dataset.spread = direction;
  const transition = document.startViewTransition(async () => {
    await update();
  });
  transition.finished.finally(() => delete root.dataset.spread);
}
