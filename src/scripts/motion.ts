/**
 * The motion layer (v2). Runs only when BaseLayout set `html.motion` (no reduced-motion
 * preference). Everything it animates is fully visible without it.
 *
 * - Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync.
 * - [data-reveal="lines"]: headings rise line by line from behind a mask (SplitText).
 * - [data-reveal="fade"]: blocks fade and rise in once they enter the viewport.
 * - [data-hero] + [data-story]: the hero holds while the inverse story panel grows over it,
 *   then the statement lights up word by word.
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

/** The hero holds in place while the next section slides over it, easing back as it goes. */
function holdHero(hero: HTMLElement, section: HTMLElement, scale: number, alpha: number) {
  ScrollTrigger.create({
    trigger: hero,
    start: "bottom bottom",
    end: () => `+=${window.innerHeight}`,
    pin: true,
    pinSpacing: false,
  });
  gsap.to(hero, {
    scale,
    autoAlpha: alpha,
    transformOrigin: "50% 100%",
    ease: "none",
    scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true },
  });
}

/** Words light up in reading order while the statement scrolls through the screen (no pin). */
function lightWordsInPlace(section: HTMLElement, words: NodeListOf<HTMLElement>) {
  const text = section.querySelector<HTMLElement>(".story__text") ?? section;
  gsap.fromTo(
    words,
    { opacity: 0.16 },
    {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: text, start: "top 85%", end: "bottom 55%", scrub: 0.6 },
    },
  );
}

/** Words light up while the panel is pinned; the tall track comes from StoryIntro's CSS. */
function lightWordsPinned(
  words: NodeListOf<HTMLElement>,
  timeline: gsap.core.Timeline,
  at: number,
) {
  const span = 1.3;
  timeline.fromTo(
    words,
    { opacity: 0.16 },
    {
      opacity: 1,
      duration: 0.12,
      stagger: words.length > 1 ? (span - 0.12) / (words.length - 1) : 0,
    },
    at,
  );
  timeline.to({}, { duration: 0.25 });
}

/**
 * Avatar variant: the hero portrait shrinks into the round avatar beside the About label. The
 * portrait is scaled from its top-left corner and clipped to a circle around the face, so the
 * circle lands exactly on the avatar's box.
 */
function avatarMorph(hero: HTMLElement, section: HTMLElement) {
  const media = hero.querySelector<HTMLElement>(".home-hero__media");
  const target = section.querySelector<HTMLElement>("[data-story-avatar]");
  if (!media || !target) return;
  const IMAGE_RATIO = 2400 / 1792; // the portrait files (src/lib/portrait.ts)
  const geo = { x: 0, y: 0, k: 1, cx: 0, cy: 0, r: 0, R: 0 };
  const measure = () => {
    gsap.set(media, { clearProps: "transform,clipPath" });
    const m = media.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    // Where the face sits under object-fit: cover with LiquidReveal's face-centred position.
    const dw = Math.max(m.width, m.height * IMAGE_RATIO);
    const dh = dw / IMAGE_RATIO;
    const ox = (m.width - dw) * 0.49;
    const oy = (m.height - dh) * 0.45;
    geo.cx = ox + 0.46 * dw;
    geo.cy = oy + 0.4 * dh;
    geo.r = 0.3 * dh;
    geo.R = Math.hypot(Math.max(geo.cx, m.width - geo.cx), Math.max(geo.cy, m.height - geo.cy));
    geo.k = t.width / 2 / geo.r;
    geo.x = t.left + t.width / 2 - m.left - geo.cx * geo.k;
    geo.y = t.top + t.height / 2 - m.top - geo.cy * geo.k;
  };
  ScrollTrigger.addEventListener("refreshInit", measure);
  measure();
  gsap.fromTo(
    media,
    {
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "0 0",
      clipPath: () => `circle(${geo.R}px at ${geo.cx}px ${geo.cy}px)`,
    },
    {
      x: () => geo.x,
      y: () => geo.y,
      scale: () => geo.k,
      clipPath: () => `circle(${geo.r}px at ${geo.cx}px ${geo.cy}px)`,
      ease: "power1.inOut",
      immediateRender: false,
      scrollTrigger: {
        trigger: media,
        start: "center center",
        endTrigger: target,
        end: "center 40%",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    },
  );
}

/**
 * The hand-off from the hero to the About statement ([data-story]). html[data-about] picks the
 * PREVIEW variant (see StoryIntro); no attribute is the inverse panel growing over the held hero.
 */
function story() {
  const section = document.querySelector<HTMLElement>("[data-story]");
  const panel = section?.querySelector<HTMLElement>("[data-story-panel]");
  if (!section || !panel) return;
  const words = section.querySelectorAll<HTMLElement>("[data-story-word]");
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const variant = root.dataset.about ?? "current";

  if (variant === "current") {
    const radius = getComputedStyle(root).getPropertyValue("--radius-xl").trim() || "0px";
    if (hero) holdHero(hero, section, 0.92, 0.3);
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
    lightWordsPinned(words, timeline, 1.05);
    return;
  }

  if (variant === "ink") {
    // The gradient seam scrolls in with the page; the words light up once the ink holds.
    const sticky = section.querySelector<HTMLElement>(".story__sticky") ?? panel;
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sticky,
        start: "top 30%",
        endTrigger: section,
        end: "bottom bottom",
        scrub: 0.6,
      },
    });
    lightWordsPinned(words, timeline, 0);
    return;
  }

  lightWordsInPlace(section, words);

  if (variant === "flow") {
    const rule = section.querySelector<HTMLElement>("[data-story-rule]");
    if (rule)
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: rule, start: "top 95%", end: "top 50%", scrub: 0.6 },
        },
      );
  }

  if (variant === "split" && hero) {
    // Wider screens: the portrait column stays on screen until the statement has passed.
    const media = hero.querySelector<HTMLElement>(".home-hero__media");
    gsap.matchMedia().add("(width >= 48em)", () => {
      if (!media) return;
      ScrollTrigger.create({
        trigger: hero,
        start: "bottom bottom",
        endTrigger: section,
        end: "bottom bottom",
        pin: media,
        pinSpacing: false,
      });
    });
  }

  if (variant === "sheet" && hero) holdHero(hero, section, 0.94, 0.5);

  if (variant === "bridge") {
    const track = section.querySelector<HTMLElement>("[data-story-band-track]");
    if (track)
      gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -25, // one of the four repeats
          ease: "none",
          scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
  }

  if (variant === "avatar" && hero) avatarMorph(hero, section);
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
