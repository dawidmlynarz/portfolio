/**
 * Mindblown goo: gooey strands between the lifted lid and the hole's front rim (Figma:
 * brain-face-default, the pink tentacles). Each strand is a row of beads that an SVG goo filter
 * (blur + alpha threshold) melts into one tube. The beads thin out in the middle as the lid rises,
 * so the strands only just hold on a hover peek; past their snapping point they tear, the top
 * half goes with the lid and the bottom half drips back into the rim.
 *
 * While the lid is dragged (`free(true)`) they never tear: they stretch like taffy, as far as
 * the lid goes, and may leave the head's outline.
 *
 * Everything is in the head's own 963 x 896 units, so it scales with the head. `start()` runs a
 * ticker that reads the lid's transform every frame (GSAP's, plus the drag's own `translate` and
 * `rotate`), and `stop()` ends it; with reduced motion the strands still stretch but don't wave.
 */
import { gsap } from "gsap";

const W = 963,
  H = 896;
/* the cut ellipse (--mb-cut in mindblown.css): centre 45.5% / 33.3%, radii 20.2% / 3.17% */
const CX = W * 0.455,
  CY = H * 0.333,
  RX = W * 0.202,
  RY = H * 0.0317;
/* the lid's transform-origin (mindblown.css .mindblown__layer--lid) */
const OX = W * 0.26,
  OY = H * 0.345;
/* beads per strand: at least BEADS, one every few units as it stretches, up to MAX_BEADS */
const BEADS = 17,
  MAX_BEADS = 64;
const NS = "http://www.w3.org/2000/svg";

/* where each strand sits across the cut (-1 left end .. 1 right end), how thick it is, and how
   far it stretches before it tears (head units; a hover peek lifts the lid about 50) */
const STRANDS = [
  { u: -0.86, r: 10, snap: 120 },
  { u: -0.68, r: 8, snap: 100 },
  { u: -0.36, r: 5.5, snap: 85 },
  { u: 0.4, r: 6, snap: 90 },
  { u: 0.7, r: 8.5, snap: 110 },
  { u: 0.88, r: 9.5, snap: 130 },
];

type Strand = (typeof STRANDS)[number] & {
  phase: number;
  speed: number;
  torn: number; // 0 holding, then 0..1 while it pulls apart
  body: SVGCircleElement[];
  shine: SVGCircleElement[];
  puddle: SVGEllipseElement;
  cap: SVGEllipseElement;
};

/** the drag's offset of the lid, in px and degrees (mindblown.ts writes it to the lid's CSS
    `translate` and `rotate`, which apply on top of GSAP's transform) */
export type Drag = { x: number; y: number; r: number };

export function createGoo(svg: SVGSVGElement, lid: HTMLElement, drag: Drag, reduced: boolean) {
  const bodyG = svg.querySelector(".mindblown__goo-body")!,
    shineG = svg.querySelector(".mindblown__goo-shine")!;
  const el = <K extends "circle" | "ellipse">(tag: K, parent: Element) =>
    parent.appendChild(document.createElementNS(NS, tag)) as SVGElementTagNameMap[K];

  const strands: Strand[] = STRANDS.map((s, i) => ({
    ...s,
    phase: i * 1.7,
    speed: 2.2 + (i % 3) * 0.45,
    torn: 0,
    body: Array.from({ length: MAX_BEADS }, () => el("circle", bodyG)),
    shine: Array.from({ length: MAX_BEADS }, () => el("circle", shineG)),
    puddle: el("ellipse", bodyG),
    cap: el("ellipse", bodyG),
  }));

  /* the face below the cut hides the strands (the mask's silhouette, from the cut's centre line
     down), except inside the hole, so their lower ends go down behind the face's front edge;
     the head's outline (CSS mask, off while dragging) trims the rest */
  const set = (e: Element | null, a: Record<string, number>) => {
    for (const [k, v] of Object.entries(a)) e!.setAttribute(k, v.toFixed(1));
  };
  set(svg.querySelector(".mindblown__goo-below rect"), {
    x: -W,
    y: CY,
    width: 3 * W,
    height: 2 * H,
  });
  set(svg.querySelector(".mindblown__goo-hole"), { cx: CX, cy: CY, rx: RX, ry: RY });

  let running = false,
    held = false,
    time = 0;

  const turn = (x: number, y: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) };
  };
  /* a point on the lid's lower edge, moved the way the lid moves: GSAP's transform, then the
     drag's translate and rotate (both about the lid's transform-origin) */
  function onLid(x: number, y: number, px: number) {
    const g = (k: string) => gsap.getProperty(lid, k) as number;
    const a = turn(x - OX, y - OY, g("rotation"));
    a.x += g("x") * px + (g("xPercent") / 100) * W;
    a.y += (g("yPercent") / 100) * H;
    const b = turn(a.x, a.y, drag.r);
    return { x: OX + b.x + drag.x * px, y: OY + b.y + drag.y * px };
  }

  /* the cut's front curve at x (its centre line past the ends) */
  const front = (x: number) => CY + RY * Math.sqrt(Math.max(0, 1 - ((x - CX) / RX) ** 2));

  function draw(dt: number) {
    const px = W / (lid.offsetWidth || W);
    let live = false;
    for (const s of strands) {
      const x0 = CX + s.u * RX,
        y0 = CY + RY * Math.sqrt(1 - s.u * s.u);
      // both ends start tucked in: under the lid's edge, and inside the hole behind its front edge
      const edge = onLid(x0, y0, px),
        top = onLid(x0, y0 - 9, px),
        bot = { x: x0, y: y0 - 4 };
      const gap = Math.hypot(top.x - bot.x, top.y - bot.y);
      if (!s.torn && !held && gap > s.snap) s.torn = 0.0001;
      if (s.torn && s.torn < 1) s.torn = Math.min(1, s.torn + dt * 2.6);
      // grows in as the lid leaves the rim, so nothing shows while the lid is down
      const grow = gsap.utils.clamp(0, 1, gap / 10) * (s.torn ? 1 - s.torn ** 2 : 1);
      if (grow > 0) live = true;
      const pull = 1 - (1 - s.torn) ** 3,
        // the stretch thins the middle: thick at rest, a thread just before it tears (dragged,
        // it keeps thinning but never lets go)
        thin = gsap.utils.clamp(held ? 0.5 : 0.4, 0.7, 0.7 - gap / 260),
        // a long, held strand sags under its own weight
        sag = held ? Math.min(gap * 0.12, 40) : 0,
        wave = reduced ? 0 : Math.min(gap * 0.14, 7) * gsap.utils.clamp(0.25, 1, 140 / gap),
        n = gsap.utils.clamp(BEADS, MAX_BEADS, Math.ceil(gap / 5) + 1);
      const nx = -(top.y - bot.y) / (gap || 1),
        ny = (top.x - bot.x) / (gap || 1);
      for (let i = n; i < MAX_BEADS; i++) {
        s.body[i]!.setAttribute("r", "0");
        s.shine[i]!.setAttribute("r", "0");
      }
      for (let i = 0; i < n; i++) {
        let t = i / (n - 1);
        // torn: the upper half stays on the lid, the lower half slides back to the rim
        if (s.torn) t = t < 0.5 ? t * (1 - pull) : 1 - (1 - t) * (1 - pull);
        const arc = Math.sin(Math.PI * t),
          sway =
            wave *
            (arc * Math.sin(time * s.speed + s.phase + t * 2.4) +
              0.45 * Math.sin(2 * Math.PI * t) * Math.cos(time * s.speed * 1.3 + s.phase));
        const x = top.x + (bot.x - top.x) * t + nx * sway,
          y = top.y + (bot.y - top.y) * t + ny * sway + sag * arc,
          r =
            Math.max(s.r * (1 - (1 - thin) * arc ** 0.7), held ? 4 : 0) *
            grow *
            (s.torn && t < 0.5 ? 1 - pull : 1);
        s.body[i]!.setAttribute("cx", x.toFixed(1));
        s.body[i]!.setAttribute("cy", y.toFixed(1));
        s.body[i]!.setAttribute("r", Math.max(0, r).toFixed(2));
        s.shine[i]!.setAttribute("cx", (x - r * 0.3).toFixed(1));
        s.shine[i]!.setAttribute("cy", y.toFixed(1));
        s.shine[i]!.setAttribute("r", Math.max(0, r * 0.42).toFixed(2));
      }
      // the blobs where it clings to the front wall of the hole and to the underside of the lid
      // (the lid stays on top, so only the part hanging below its edge shows); a torn strand's
      // stub shrinks back into the lid with it
      s.puddle.setAttribute("cx", bot.x.toFixed(1));
      s.puddle.setAttribute("cy", (y0 - 1).toFixed(1));
      s.puddle.setAttribute("rx", (s.r * 1.6 * grow).toFixed(2));
      s.puddle.setAttribute("ry", (s.r * 0.75 * grow).toFixed(2));
      const cap = grow * (s.torn ? 1 - pull : 1);
      s.cap.setAttribute("cx", edge.x.toFixed(1));
      s.cap.setAttribute("cy", (edge.y - 1).toFixed(1));
      s.cap.setAttribute("rx", (s.r * 1.4 * cap).toFixed(2));
      s.cap.setAttribute("ry", (s.r * 0.6 * cap).toFixed(2));
    }
    return live;
  }

  function tick(_t: number, ms: number) {
    time += ms / 1000;
    // every strand has torn and dripped away (the head is open): nothing left to draw
    if (!draw(ms / 1000) && strands.every((s) => s.torn === 1)) goo.stop();
  }

  const goo = {
    /** is this point (head units, from the head's top left) on the lifted lid, above its edge? */
    onLid(x: number, y: number) {
      return y < onLid(x, front(x), W / (lid.offsetWidth || W)).y;
    },
    /** while the lid is dragged: the strands hold on whatever the stretch, and may leave the
        head's outline */
    free(on: boolean) {
      held = on;
      svg.classList.toggle("mindblown__goo--free", on);
    },
    /** the lid is about to move: fresh strands, drawn every frame */
    start() {
      if (!held) for (const s of strands) s.torn = 0;
      if (running) return;
      running = true;
      svg.classList.add("mindblown__goo--on");
      gsap.ticker.add(tick);
    },
    /** the lid is back down (or gone): hide them and stop drawing */
    stop() {
      if (!running) return;
      running = false;
      svg.classList.remove("mindblown__goo--on");
      gsap.ticker.remove(tick);
    },
  };
  return goo;
}
