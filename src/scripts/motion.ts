/**
 * The motion layer (v2). Runs only when BaseLayout set `html.motion` (no reduced-motion
 * preference). Everything it animates is fully visible without it.
 *
 * - Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync.
 * - [data-reveal="lines"]: headings rise line by line from behind a mask (SplitText).
 * - [data-reveal="fade"]: blocks fade and rise in once they enter the viewport.
 * - [data-story]: the About statement after the home hero lights up word by word as it scrolls.
 * - Links: the "row tear" hover (styles in base.css). Links marked [data-no-tear] keep their own
 *   hover: buttons, pills and quiet links (menu, case-study cards, Next project).
 *
 * Elements marked [data-reveal] stay hidden by base.css until this script has set their
 * starting state (data-reveal-ready), with a 3s CSS failsafe if it never runs.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

const root = document.documentElement;
const EASE = "expo.out";

const ready = (el: HTMLElement) => {
  el.dataset.revealReady = "";
};

function smoothScroll() {
  const lenis = new Lenis({
    autoRaf: false,
    anchors: true,
    // Let popovers and the open nav menu scroll natively.
    prevent: (node) => Boolean(node.closest("[popover], [data-nav-panel]")),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function revealLines() {
  const headings = document.querySelectorAll<HTMLElement>('[data-reveal="lines"]');
  const run = () => {
    for (const el of headings) {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.2,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }),
      });
      ready(el);
    }
  };
  // Split after the web font is in, so line breaks match the final layout.
  document.fonts.ready.then(run, run);
}

function revealFades() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal="fade"]')) {
    gsap.from(el, {
      autoAlpha: 0,
      y: 48,
      duration: 1.2,
      ease: EASE,
      scrollTrigger: { trigger: el, start: "top 98%", once: true },
    });
    ready(el);
  }
}

/**
 * The About statement after the home hero ([data-story]): words light up in reading order while
 * it scrolls through the screen. Nothing is pinned.
 */
function story() {
  const text = document.querySelector<HTMLElement>("[data-story-text]");
  if (!text) return;
  gsap.fromTo(
    text.querySelectorAll<HTMLElement>("[data-story-word]"),
    { opacity: 0.16 },
    {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: text, start: "top 85%", end: "bottom 55%", scrub: 0.6 },
    },
  );
}

const TEAR_MS = 300; // a little longer than --duration-tear

/** Wraps a link's label (everything before its icon) in .link-tear, once. */
function tearLabel(link: HTMLAnchorElement) {
  const existing = link.querySelector<HTMLElement>(":scope > .link-tear");
  if (existing) return existing;
  // A link can name its label (the nav logo tears only the name, the mark tears in Nav).
  const named = link.querySelector<HTMLElement>(":scope > [data-tear-label]");
  if (named) {
    named.classList.add("link-tear");
    return named;
  }
  const label = document.createElement("span");
  label.className = "link-tear";
  const icon = [...link.childNodes].find((node) => node instanceof SVGElement);
  for (const node of [...link.childNodes]) {
    if (node === icon) break;
    label.append(node);
  }
  link.prepend(label);
  return label;
}

/** The label's text split into the lines it renders on, with where each line sits. */
function tearLines(label: HTMLElement) {
  const lines: { text: string; rect: DOMRect }[] = [];
  const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    for (let i = 0; i < text.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      const line = lines.at(-1);
      // Collapsed white space has no box: it belongs to the line it is on.
      if (!rect.width) {
        if (line) line.text += text[i];
      } else if (line && Math.abs(rect.top - line.rect.top) < rect.height / 2) {
        line.text += text[i];
        line.rect = new DOMRect(
          line.rect.x,
          line.rect.y,
          rect.right - line.rect.x,
          line.rect.height,
        );
      } else {
        lines.push({ text: text[i]!, rect });
      }
    }
  }
  return lines.filter((line) => line.text.trim());
}

/** Lays the two torn rows (top and bottom, middle) over each line of the label, then runs. */
function tear(link: HTMLAnchorElement) {
  const label = tearLabel(link);
  const lines = tearLines(label);
  if (!lines.length) return;
  // Where absolutely positioned copies start from, inside the (possibly wrapped) label.
  const probe = document.createElement("span");
  probe.className = "link-tear__row";
  label.append(probe);
  const origin = probe.getBoundingClientRect();
  probe.remove();
  for (const { text, rect } of lines) {
    for (const part of ["outer", "middle"]) {
      const row = document.createElement("span");
      row.className = `link-tear__row link-tear__row--${part}`;
      row.setAttribute("aria-hidden", "true");
      row.textContent = text.trim();
      row.style.cssText = `inset:auto;left:${rect.left - origin.left}px;top:${rect.top - origin.top}px;width:${rect.width}px;height:${rect.height}px`;
      label.append(row);
    }
  }
  link.setAttribute("data-tearing", "");
  setTimeout(() => {
    link.removeAttribute("data-tearing");
    for (const row of label.querySelectorAll(".link-tear__row")) row.remove();
  }, TEAR_MS);
}

function linkTear() {
  const start = (target: EventTarget | null) => {
    const link = (target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
    if (!link || link.hasAttribute("data-no-tear") || link.hasAttribute("data-tearing")) return;
    tear(link);
  };
  document.addEventListener("pointerover", (event) => {
    const from = (event.relatedTarget as Element | null)?.closest?.("a[href]");
    if (from !== (event.target as Element).closest?.("a[href]")) start(event.target);
  });
  document.addEventListener("focusin", (event) => {
    if ((event.target as Element).matches?.(":focus-visible")) start(event.target);
  });
}

if (root.classList.contains("motion")) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  smoothScroll();
  revealFades();
  revealLines();
  story();
  linkTear();
}
