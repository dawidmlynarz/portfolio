/**
 * Link lab behaviour (/playground/links). Three small jobs:
 * - Tap to replay: specimen links go nowhere; a tap or click re-runs that link's hover, so touch
 *   screens can see each option.
 * - "Signal settle": letters arrive as noise and lock in from left to right. The real text stays in
 *   the DOM (only faded out while the noise runs), so the accessible name never changes.
 * - Reduced motion preview: a switch that previews what reduced-motion visitors get.
 */
const NOISE = "ABCDEFGHJKLMNPRSTUVWXYZ#%&*+=/<>_";
const SETTLE = 420; // ms
const FRAME = 40; // ms, a coarse rate reads as a signal, not a tween

const lab = document.querySelector<HTMLElement>("[data-link-lab]");
const systemReduced = matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => systemReduced.matches || lab?.hasAttribute("data-reduced");

function settle(link: HTMLElement) {
  const label = link.querySelector<HTMLElement>(".lab-link__label");
  const noise = label?.querySelector<HTMLElement>(".lab-link__noise");
  const text = label?.querySelector<HTMLElement>(".lab-link__text")?.textContent ?? "";
  if (!label || !noise || reduced() || label.hasAttribute("data-settling")) return;

  label.setAttribute("data-settling", "");
  const start = performance.now();
  const tick = () => {
    const t = Math.min(1, (performance.now() - start) / SETTLE);
    const locked = Math.floor(t * text.length);
    noise.textContent = [...text]
      .map((char, i) =>
        i < locked || char === " " ? char : NOISE[Math.floor(Math.random() * NOISE.length)],
      )
      .join("");
    if (t < 1) setTimeout(tick, FRAME);
    else label.removeAttribute("data-settling");
  };
  tick();
}

if (lab) {
  for (const link of lab.querySelectorAll<HTMLElement>("[data-settle]")) {
    const trigger = link.closest(".link-lab__trigger") ?? link;
    trigger.addEventListener("pointerenter", () => settle(link));
    link.addEventListener("focus", () => settle(link));
  }

  lab.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLElement>(".lab-link");
    if (!link) return;
    event.preventDefault();
    // Restart the CSS animation: drop the state, force a style flush, set it again.
    link.removeAttribute("data-hot");
    void link.offsetWidth;
    link.setAttribute("data-hot", "");
    if (link.hasAttribute("data-settle")) settle(link);
    clearTimeout(Number(link.dataset.hotTimer));
    link.dataset.hotTimer = String(setTimeout(() => link.removeAttribute("data-hot"), 1600));
  });

  lab.querySelector<HTMLInputElement>("[data-reduced-switch]")?.addEventListener("change", (e) => {
    lab.toggleAttribute("data-reduced", (e.target as HTMLInputElement).checked);
  });
}
