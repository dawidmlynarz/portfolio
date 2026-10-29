/**
 * Mindblown goo: gooey strands between the lifted lid and the hole's front rim (Figma:
 * brain-face-default, the pink tentacles). Each strand is a row of beads that an SVG goo filter
 * (blur + alpha threshold) melts into one tube. The beads thin out in the middle as the lid rises,
 * so the strands only just hold on a hover peek; past their snapping point they tear, the top
 * half goes with the lid and the bottom half drips back into the rim.
 *
 * Everything is in the head's own 963 x 896 units, so it scales with the head. `start()` runs a
 * ticker that reads the lid's GSAP transform every frame, and `stop()` ends it; with reduced
 * motion the strands still stretch with the lid but don't wave.
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
const BEADS = 17;
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

export function createGoo(svg: SVGSVGElement, lid: HTMLElement, reduced: boolean) {
  const bodyG = svg.querySelector(".mindblown__goo-body")!,
    shineG = svg.querySelector(".mindblown__goo-shine")!;
  const el = <K extends "circle" | "ellipse">(tag: K, parent: Element) =>
    parent.appendChild(document.createElementNS(NS, tag)) as SVGElementTagNameMap[K];

  const strands: Strand[] = STRANDS.map((s, i) => ({
    ...s,
    phase: i * 1.7,
    speed: 2.2 + (i % 3) * 0.45,
    torn: 0,
    body: Array.from({ length: BEADS }, () => el("circle", bodyG)),
    shine: Array.from({ length: BEADS }, () => el("circle", shineG)),
    puddle: el("ellipse", bodyG),
    cap: el("ellipse", bodyG),
  }));

  /* the strands show only above the cut's centre line or inside the hole, so their lower ends
     go down behind the face's front edge; the head's outline (CSS mask) trims the rest */
  const [above, hole] = svg.querySelectorAll(".mindblown__goo-cut > *");
  for (const [k, v] of Object.entries({ x: 0, y: -H, width: W, height: H + CY }))
    above!.setAttribute(k, String(v));
  for (const [k, v] of Object.entries({ cx: CX, cy: CY, rx: RX, ry: RY }))
    hole!.setAttribute(k, v.toFixed(1));

  let running = false,
    time = 0;

  /* a point on the lid's lower edge, moved the way GSAP moves the lid */
  function onLid(x: number, y: number, px: number) {
    const g = gsap.getProperty,
      a = ((g(lid, "rotation") as number) * Math.PI) / 180,
      dx = x - OX,
      dy = y - OY;
    return {
      x:
        OX +
        dx * Math.cos(a) -
        dy * Math.sin(a) +
        (g(lid, "x") as number) * px +
        ((g(lid, "xPercent") as number) / 100) * W,
      y: OY + dx * Math.sin(a) + dy * Math.cos(a) + ((g(lid, "yPercent") as number) / 100) * H,
    };
  }

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
      if (!s.torn && gap > s.snap) s.torn = 0.0001;
      if (s.torn && s.torn < 1) s.torn = Math.min(1, s.torn + dt * 2.6);
      // grows in as the lid leaves the rim, so nothing shows while the lid is down
      const grow = gsap.utils.clamp(0, 1, gap / 10) * (s.torn ? 1 - s.torn ** 2 : 1);
      if (grow > 0) live = true;
      const pull = 1 - (1 - s.torn) ** 3,
        // the stretch thins the middle: thick at rest, a thread just before it tears
        thin = gsap.utils.clamp(0.4, 0.7, 0.7 - gap / 260),
        wave = reduced ? 0 : Math.min(gap * 0.14, 7);
      const nx = -(top.y - bot.y) / (gap || 1),
        ny = (top.x - bot.x) / (gap || 1);
      for (let i = 0; i < BEADS; i++) {
        let t = i / (BEADS - 1);
        // torn: the upper half stays on the lid, the lower half slides back to the rim
        if (s.torn) t = t < 0.5 ? t * (1 - pull) : 1 - (1 - t) * (1 - pull);
        const arc = Math.sin(Math.PI * t),
          sway =
            wave *
            (arc * Math.sin(time * s.speed + s.phase + t * 2.4) +
              0.45 * Math.sin(2 * Math.PI * t) * Math.cos(time * s.speed * 1.3 + s.phase));
        const x = top.x + (bot.x - top.x) * t + nx * sway,
          y = top.y + (bot.y - top.y) * t + ny * sway,
          r = s.r * (1 - (1 - thin) * arc ** 0.7) * grow * (s.torn && t < 0.5 ? 1 - pull : 1);
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
    /** the lid is about to move: fresh strands, drawn every frame */
    start() {
      for (const s of strands) s.torn = 0;
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
