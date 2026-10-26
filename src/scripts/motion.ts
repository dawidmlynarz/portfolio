/**
 * The motion layer (v2). Runs only when BaseLayout set `html.motion` (no reduced-motion
 * preference). Everything it animates is fully visible without it.
 *
 * - Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync.
 * - [data-reveal="lines"]: headings rise line by line from behind a mask (SplitText).
 * - [data-reveal="fade"]: blocks fade and rise in once they enter the viewport.
 * - [data-hero] + [data-story]: the hero holds while the inverse story panel grows over it,
 *   then the statement lights up word by word.
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
    // Let popovers (the mobile menu sheet) scroll natively.
    prevent: (node) => Boolean(node.closest("[popover]")),
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

function story() {
  const section = document.querySelector<HTMLElement>("[data-story]");
  const panel = section?.querySelector<HTMLElement>("[data-story-panel]");
  if (!section || !panel) return;
  const words = section.querySelectorAll<HTMLElement>("[data-story-word]");
  const radius = getComputedStyle(root).getPropertyValue("--radius-xl").trim() || "0px";

  // The hero holds in place while the panel slides over it, easing back as it goes.
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: "bottom bottom",
      end: () => `+=${window.innerHeight}`,
      pin: true,
      pinSpacing: false,
    });
    gsap.to(hero, {
      scale: 0.92,
      autoAlpha: 0.3,
      transformOrigin: "50% 100%",
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true },
    });
  }

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
  });
  // Enter (one screen of scroll): the panel grows from an inset card to full bleed.
  timeline.fromTo(
    panel,
    { clipPath: `inset(10% 6% 0% 6% round ${radius})` },
    { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1 },
  );
  // Pinned (the rest): words light up in reading order, with a short hold at the end.
  const span = 1.3;
  timeline.fromTo(
    words,
    { opacity: 0.16 },
    {
      opacity: 1,
      duration: 0.12,
      stagger: words.length > 1 ? (span - 0.12) / (words.length - 1) : 0,
    },
    1.05,
  );
  // Then the client logo strip slides left to right (one copy's width), with a short hold.
  const track = section.querySelector<HTMLElement>("[data-logo-track]");
  if (track) {
    timeline.fromTo(track, { xPercent: -100 / 3 }, { xPercent: 0, duration: 1.2 }, 2.45);
    timeline.fromTo(track, { autoAlpha: 0.35 }, { autoAlpha: 1, duration: 0.3 }, 2.35);
  }
  timeline.to({}, { duration: 0.15 });
}

if (root.classList.contains("motion")) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  smoothScroll();
  revealFades();
  revealLines();
  story();
}
