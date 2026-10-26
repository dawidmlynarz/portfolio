/**
 * <liquid-reveal>: a portrait on top; a liquid, pointer-driven mask reveals a second image below.
 *
 * Ported from the original Webflow embed (liquid-reveal.js, Oct 2026) with the same motion model:
 * a sprung "head" that orbits the face at rest and is magnetised to the pointer on hover, a healing
 * trail, droplets on fast moves, drifting lobes and a wobbling iso-surface edge.
 *
 * Changes from the embed:
 * - Progressive enhancement: the top image is a real responsive <img> (LCP, no-JS, alt text).
 *   The canvas fades in over it once both images are decoded.
 * - Theme-aware: both cutouts are flattened onto the resolved --color-bg and re-flattened on theme
 *   change (the `themechange` event from ThemeToggle; its waitUntil holds the theme transition until
 *   the canvas has repainted). With
 *   data-clay-dark, a dark clay replaces the light one while the background is dark; it is loaded
 *   only when first needed.
 * - Images come from astro:assets (AVIF with alpha, picked to the rendered size).
 * - All listeners are removed when the element leaves the DOM.
 */

type Config = {
  top: "photo" | "clay";
  size: number; // 6–60
  soft: number; // 0–100
  pull: number; // 0–100
  wobble: number; // 0–100
  fade: number; // trail heal time, seconds
  orbit: number; // 0–100
  face: [number, number, number, number]; // x0, x1, y0, y1 (0–1) kept in frame
};
type Source = { url: string; w: number };
type Layout = { dx: number; dy: number; dw: number; dh: number };
type Stamp = { x: number; y: number; r: number; t: number };
type Drop = Stamp & { vx: number; vy: number; life: number };

const ISO = 0.5;
const BRUSH_K = 1 / 0.54; // a brush drawn at radius r*K crosses the threshold at r
const FIELD_PIXELS = 90_000; // mask resolution budget per frame
const smoothstep = (x: number) => x * x * (3 - 2 * x);

let brush: HTMLCanvasElement | null = null;
function getBrush() {
  if (brush) return brush;
  const size = 128;
  brush = document.createElement("canvas");
  brush.width = brush.height = size;
  const c = brush.getContext("2d")!;
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    g.addColorStop(t, `rgb(0 0 0 / ${Math.pow(1 - t * t, 2).toFixed(4)})`);
  }
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  return brush;
}

const pick = (sources: Source[], needed: number) =>
  sources.find((s) => s.w >= needed) ?? sources[sources.length - 1]!;

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

class LiquidReveal extends HTMLElement {
  #abort = new AbortController();
  #cfg!: Config;
  #reduceMotion = false;

  // canvases
  #cv!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;
  #topLayer = document.createElement("canvas");
  #bottomLayer = document.createElement("canvas");
  #field = document.createElement("canvas");
  #fctx = this.#field.getContext("2d", { willReadFrequently: true })!;
  #out = document.createElement("canvas");
  #octx = this.#out.getContext("2d")!;
  #outImg: ImageData | null = null;
  #noiseX = new Float32Array(0);
  #noiseY = new Float32Array(0);
  #photo: HTMLImageElement | null = null;
  #clay: HTMLImageElement | null = null;
  #clayLight: Promise<HTMLImageElement> | null = null;
  #clayDark: Promise<HTMLImageElement> | null = null;
  #drawnWidth = 0;
  #bg = "transparent";

  // geometry
  #W = 0;
  #H = 0;
  #dpr = 1;
  #MS = 0.33;
  #L: Layout | null = null;

  // motion
  #head = { x: 0, y: 0, vx: 0, vy: 0 };
  #hasHead = false;
  #cursor = { x: 0, y: 0 };
  #softCursor = { x: 0, y: 0 };
  #lastClient = { x: -1, y: -1 };
  #over = false;
  #touchUntil = 0;
  #orbitAngle = -Math.PI / 2;
  #orbitSpeed = 0;
  #pullMix = 0;
  #wobbleClock = 0;
  #wasResting = true;
  #reveal = 1;
  #trail: Stamp[] = [];
  #drops: Drop[] = [];
  #lastEmit: { x: number; y: number } | null = null;

  // loop
  #visible = false;
  #running = false;
  #last = 0;

  connectedCallback() {
    this.#cfg = JSON.parse(this.dataset.config ?? "{}") as Config;
    this.#reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.#reveal = this.#reduceMotion ? 0 : 1;

    // Page-load fade: mark the portrait as shown once the static image for the current theme has
    // decoded (LiquidReveal.astro fades it in from 0 to 100% opacity under the motion layer).
    const shown = [...this.querySelectorAll<HTMLImageElement>(".liquid__image")].find(
      (img) => getComputedStyle(img).display !== "none",
    );
    const markShown = () => (this.dataset.shown = "");
    if (!shown || shown.complete) markShown();
    else shown.decode().then(markShown, markShown);

    const canvas = this.querySelector("canvas");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    this.#cv = canvas;
    this.#ctx = ctx;

    const { signal } = this.#abort;
    let booted = false;
    const io = new IntersectionObserver(
      (entries) => {
        this.#visible = entries.some((e) => e.isIntersecting);
        if (this.#visible && !booted) {
          booted = true;
          void this.#boot();
        }
        if (this.#visible) this.#kick();
      },
      { rootMargin: "200px" },
    );
    io.observe(this);
    signal.addEventListener("abort", () => io.disconnect());
  }

  disconnectedCallback() {
    this.#abort.abort();
    this.#abort = new AbortController();
    this.#running = false;
  }

  async #boot() {
    const sources = (key: "photo") => JSON.parse(this.dataset[key] ?? "[]") as Source[];
    const rect = this.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    // Ask for the width the image is actually drawn at (cover can exceed the box).
    const ratio = Number(this.dataset.ratio) || 1;
    const drawnWidth = Math.max(rect.width, rect.height * ratio) * dpr;
    this.#drawnWidth = drawnWidth;
    this.#bg = getComputedStyle(this.#cv).color;

    try {
      [this.#photo, this.#clay] = await Promise.all([
        loadImage(pick(sources("photo"), drawnWidth).url),
        this.#clayFor(this.#bg),
      ]);
    } catch {
      return; // keep the static <img>
    }

    const { signal } = this.#abort;
    new ResizeObserver(() => this.#resize()).observe(this);
    signal.addEventListener("abort", () => this.#trail.splice(0));

    const onTheme = async () => {
      this.#bg = getComputedStyle(this.#cv).color;
      try {
        this.#clay = await this.#clayFor(this.#bg);
      } catch {
        // keep the clay already drawn
      }
      this.#paintLayers();
      this.#kick();
    };
    document.addEventListener(
      "themechange",
      (event) => {
        const detail = (event as CustomEvent<{ waitUntil?: (p: Promise<unknown>) => void }>).detail;
        detail?.waitUntil?.(onTheme());
      },
      { signal },
    );
    document.addEventListener("visibilitychange", () => this.#kick(), { signal });

    // Pointer is tracked on the window so text or buttons over the image don't block it.
    const opts = { passive: true, signal };
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        this.#lastClient.x = e.clientX;
        this.#lastClient.y = e.clientY;
        this.#over = this.#track(e.clientX, e.clientY);
        if (this.#over) this.#kick();
      },
      opts,
    );
    window.addEventListener(
      "scroll",
      () => {
        if (this.#lastClient.x >= 0)
          this.#over = this.#track(this.#lastClient.x, this.#lastClient.y);
      },
      opts,
    );
    document.documentElement.addEventListener("mouseleave", () => (this.#over = false), opts);
    window.addEventListener("blur", () => (this.#over = false), opts);
    // Touch: a tap pulls the liquid there for a moment; scrolling is never blocked.
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "touch") return;
        if (this.#track(e.clientX, e.clientY)) {
          this.#touchUntil = performance.now() + 1600;
          this.#kick();
        }
      },
      opts,
    );

    this.#bg = getComputedStyle(this.#cv).color;
    this.#resize();
    this.dataset.ready = "";
  }

  /**
   * The clay for a background colour: the dark variant (if any) on a dark page, else the light one.
   * Each is loaded the first time it is needed, so a page only fetches the clay its theme shows.
   */
  #clayFor(bg: string): Promise<HTMLImageElement> {
    const [r = 255, g = 255, b = 255] = (bg.match(/[\d.]+/g) ?? []).map(Number);
    const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
    const darkSources = JSON.parse(this.dataset.clayDark ?? "[]") as Source[];
    if (dark && darkSources.length) {
      this.#clayDark ??= loadImage(pick(darkSources, this.#drawnWidth).url);
      return this.#clayDark;
    }
    const lightSources = JSON.parse(this.dataset.clay ?? "[]") as Source[];
    this.#clayLight ??= loadImage(pick(lightSources, this.#drawnWidth).url);
    return this.#clayLight;
  }

  // ---------- layout ----------

  /**
   * Same crop as the static <img> (object-fit: cover; object-position at the face centre), so the
   * canvas lines up with it exactly when it fades in. Keep in sync with LiquidReveal.astro.
   */
  #computeLayout(iw: number, ih: number): Layout {
    const [x0, x1, y0, y1] = this.#cfg.face;
    const W = this.#W;
    const H = this.#H;
    const s = Math.max(W / iw, H / ih);
    const dw = iw * s;
    const dh = ih * s;
    return { dx: (W - dw) * ((x0 + x1) / 2), dy: (H - dh) * ((y0 + y1) / 2), dw, dh };
  }

  #resize() {
    if (!this.#photo || !this.#clay) return;
    const rect = this.getBoundingClientRect();
    this.#W = Math.max(1, rect.width);
    this.#H = Math.max(1, rect.height);
    this.#dpr = Math.min(devicePixelRatio || 1, 2);
    this.#cv.width = Math.round(this.#W * this.#dpr);
    this.#cv.height = Math.round(this.#H * this.#dpr);
    this.#MS = Math.min(0.5, Math.sqrt(FIELD_PIXELS / (this.#W * this.#H)));
    this.#field.width = this.#out.width = Math.max(1, Math.ceil(this.#W * this.#MS));
    this.#field.height = this.#out.height = Math.max(1, Math.ceil(this.#H * this.#MS));
    this.#outImg = this.#octx.createImageData(this.#out.width, this.#out.height);
    this.#noiseX = new Float32Array(this.#field.width * 2);
    this.#noiseY = new Float32Array(this.#field.height * 2);
    this.#trail.length = 0;
    this.#drops.length = 0;
    this.#L = this.#computeLayout(this.#photo.naturalWidth, this.#photo.naturalHeight);
    this.#paintLayers();
    if (!this.#hasHead) {
      const o = this.#orbitPoint(this.#orbitAngle);
      this.#head.x = o.x;
      this.#head.y = o.y;
      this.#hasHead = true;
    }
    this.#kick();
  }

  /** Flatten both transparent cutouts onto the current page background. */
  #paintLayers() {
    if (!this.#L || !this.#photo || !this.#clay) return;
    const photoOnTop = this.#cfg.top !== "clay";
    const pairs: [HTMLCanvasElement, HTMLImageElement][] = [
      [this.#topLayer, photoOnTop ? this.#photo : this.#clay],
      [this.#bottomLayer, photoOnTop ? this.#clay : this.#photo],
    ];
    for (const [layer, img] of pairs) {
      layer.width = this.#cv.width;
      layer.height = this.#cv.height;
      const c = layer.getContext("2d")!;
      c.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);
      c.fillStyle = this.#bg;
      c.fillRect(0, 0, this.#W, this.#H);
      c.imageSmoothingQuality = "high";
      c.drawImage(img, this.#L.dx, this.#L.dy, this.#L.dw, this.#L.dh);
    }
  }

  #baseRadius() {
    return (this.#cfg.size / 100) * Math.sqrt(this.#W * this.#H) * 0.45 + 8;
  }

  #orbitPoint(a: number, now = 0) {
    const L = this.#L;
    if (!L) return { x: this.#W / 2, y: this.#H / 2 };
    const [x0, x1, y0, y1] = this.#cfg.face;
    const cx = L.dx + ((x0 + x1) / 2) * L.dw;
    const cy = L.dy + 0.44 * L.dh;
    const rx = Math.min((x1 - x0) * L.dw * 0.36, this.#W * 0.4);
    const ry = Math.min((y1 - y0) * L.dh * 0.3, this.#H * 0.34);
    const wob = 1 + 0.1 * Math.sin(a * 3 + 0.6) + 0.07 * Math.sin(now * 0.00037);
    return {
      x: cx + Math.cos(a) * rx * wob,
      y: cy + Math.sin(a) * ry * wob + Math.sin(a * 2 + 0.9) * ry * 0.16,
    };
  }

  #track(clientX: number, clientY: number) {
    const r = this.getBoundingClientRect();
    const inside =
      clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    if (inside) {
      this.#cursor.x = clientX - r.left;
      this.#cursor.y = clientY - r.top;
    }
    return inside;
  }

  // ---------- field ----------

  #splat(x: number, y: number, r: number, a: number) {
    if (a <= 0.004 || r <= 0.5) return;
    const R = r * BRUSH_K * this.#MS;
    this.#fctx.globalAlpha = Math.min(1, a);
    this.#fctx.drawImage(getBrush(), x * this.#MS - R, y * this.#MS - R, R * 2, R * 2);
  }

  #emitTrail(now: number, r: number) {
    const head = this.#head;
    const speed = Math.hypot(head.vx, head.vy);
    const rr = r * (0.9 + Math.min(speed / 2600, 0.25));
    if (!this.#lastEmit) {
      this.#lastEmit = { x: head.x, y: head.y };
      return;
    }
    const dx = head.x - this.#lastEmit.x;
    const dy = head.y - this.#lastEmit.y;
    const d = Math.hypot(dx, dy);
    const spacing = Math.max(3, r * 0.12);
    if (d >= spacing) {
      const n = Math.min(60, Math.floor(d / spacing));
      for (let i = 1; i <= n; i++) {
        this.#trail.push({
          x: this.#lastEmit.x + (dx * i) / n,
          y: this.#lastEmit.y + (dy * i) / n,
          r: rr,
          t: now,
        });
      }
      this.#lastEmit = { x: head.x, y: head.y };
    }
    if (
      !this.#reduceMotion &&
      speed > 450 &&
      this.#drops.length < 36 &&
      Math.random() < Math.min(0.5, (speed / 900) * 0.12)
    ) {
      const nx = -head.vy / speed;
      const ny = head.vx / speed;
      const side = Math.random() < 0.5 ? -1 : 1;
      const off = r * (0.55 + Math.random() * 0.45) * side;
      this.#drops.push({
        x: head.x + nx * off,
        y: head.y + ny * off,
        vx: nx * side * (40 + Math.random() * 70) + head.vx * 0.08,
        vy: ny * side * (40 + Math.random() * 70) + head.vy * 0.08,
        r: r * (0.2 + Math.random() * 0.18),
        t: now,
        life: 500 + Math.random() * 700,
      });
    }
  }

  /** Threshold the field into a liquid edge, wobbled by separable animated sine noise. */
  #liquidPass(t: number, r: number, hover: number) {
    const fw = this.#field.width;
    const fh = this.#field.height;
    const src = this.#fctx.getImageData(0, 0, fw, fh).data;
    const dst = this.#outImg!.data;
    const nx = this.#noiseX;
    const ny = this.#noiseY;
    const amp = (this.#cfg.wobble / 100) * 0.3 * (1 + 0.9 * hover);
    const s = 0.015 + (this.#cfg.soft / 100) * 0.42 + 0.06 * hover;
    const lo = ISO - s;
    const inv = 1 / (2 * s);
    const wl = Math.max(10, r * this.#MS * 2.1);
    const f1 = (Math.PI * 2) / wl;
    const f2 = f1 * 1.61;
    for (let x = 0; x < fw; x++) {
      nx[x * 2] = Math.sin(x * f1 + t * 1.15);
      nx[x * 2 + 1] = Math.cos(x * f2 - t * 1.6 + 1.2);
    }
    for (let y = 0; y < fh; y++) {
      ny[y * 2] = Math.cos(y * f1 * 0.93 - t * 0.9 + 0.4);
      ny[y * 2 + 1] = Math.sin(y * f2 * 1.07 + t * 1.35);
    }
    for (let y = 0, i = 3; y < fh; y++) {
      const ay = ny[y * 2]!;
      const by = ny[y * 2 + 1]!;
      for (let x = 0; x < fw; x++, i += 4) {
        const a = src[i]!;
        if (a === 0) {
          dst[i] = 0;
          continue;
        }
        const v =
          a / 255 +
          amp * (0.62 * nx[x * 2]! * ay + 0.38 * nx[x * 2 + 1]! * by) * Math.min(1, a / 60);
        let o = (v - lo) * inv;
        o = o <= 0 ? 0 : o >= 1 ? 1 : o * o * (3 - 2 * o);
        dst[i] = (o * 255 * this.#reveal) | 0;
      }
    }
    this.#octx.putImageData(this.#outImg!, 0, 0);
  }

  // ---------- loop (pauses off screen and in hidden tabs) ----------

  #kick() {
    if (this.#running || !this.#visible || document.hidden || !this.#L) return;
    this.#running = true;
    this.#last = performance.now();
    requestAnimationFrame((t) => this.#frame(t));
  }

  #frame(now: number) {
    if (!this.#running || !this.#visible || document.hidden) {
      this.#running = false;
      return;
    }
    const cfg = this.#cfg;
    const rm = this.#reduceMotion;
    const head = this.#head;
    const soft = this.#softCursor;
    const dt = Math.min(0.033, (now - this.#last) / 1000);
    this.#last = now;
    const resting = !this.#over && now > this.#touchUntil;

    if (this.#wasResting && !resting) {
      soft.x = this.#cursor.x;
      soft.y = this.#cursor.y;
    }
    this.#wasResting = resting;
    const kc = 1 - Math.exp(-dt * 12);
    soft.x += (this.#cursor.x - soft.x) * kc;
    soft.y += (this.#cursor.y - soft.y) * kc;

    this.#pullMix +=
      ((resting ? 0 : 1) - this.#pullMix) * (1 - Math.exp(-dt * (resting ? 1.2 : 2.4)));
    const m = smoothstep(Math.min(1, Math.max(0, this.#pullMix)));

    const ts = now / 1000;
    const calm =
      0.5 * Math.sin(ts * 0.31) + 0.3 * Math.sin(ts * 0.53 + 1.1) + 0.2 * Math.sin(ts * 0.89 + 2.3);
    const lively =
      0.5 * Math.sin(ts * 1.7 + 0.4) + 0.3 * Math.sin(ts * 2.9 + 1.7) + 0.2 * Math.sin(ts * 4.3);
    const sizeMod = rm ? 1 : (1 + 0.24 * calm) * (1 - m) + (1.25 + 0.12 * lively + 0.08 * calm) * m;
    const r = this.#baseRadius() * sizeMod;
    this.#wobbleClock += dt * (0.6 + 1.0 * m);

    const goalSpeed = rm ? 0 : (0.12 + (cfg.orbit / 100) * 1.1) * (1 - m * 0.8);
    this.#orbitSpeed += (goalSpeed - this.#orbitSpeed) * (1 - Math.exp(-dt * 1.3));
    this.#orbitAngle += dt * this.#orbitSpeed;
    const o = this.#orbitPoint(this.#orbitAngle, rm ? 0 : now);
    const tx = o.x + (soft.x - o.x) * m;
    const ty = o.y + (soft.y - o.y) * m;

    const k = 9 + (cfg.pull / 100) * 75 + 30 * m;
    const c = 2 * Math.sqrt(k) * 0.64;
    head.vx += ((tx - head.x) * k - head.vx * c) * dt;
    head.vy += ((ty - head.y) * k - head.vy * c) * dt;
    const sp = Math.hypot(head.vx, head.vy);
    const vmax = 2200;
    if (sp > vmax) {
      head.vx *= vmax / sp;
      head.vy *= vmax / sp;
    }
    if (rm && !resting) {
      head.x = tx;
      head.y = ty;
      head.vx = head.vy = 0;
    }
    head.x += head.vx * dt;
    head.y += head.vy * dt;

    const want = rm ? (resting ? 0 : 1) : 1;
    this.#reveal += (want - this.#reveal) * Math.min(1, dt * 4);

    const f = this.#fctx;
    f.setTransform(1, 0, 0, 1, 0, 0);
    f.globalAlpha = 1;
    f.clearRect(0, 0, this.#field.width, this.#field.height);

    if (this.#reveal > 0.01) this.#emitTrail(now, r);
    else this.#lastEmit = null;
    const life = cfg.fade * 1000;
    while (this.#trail.length && now - this.#trail[0]!.t > life) this.#trail.shift();
    if (this.#trail.length > 800) this.#trail.splice(0, this.#trail.length - 800);
    for (const s of this.#trail) {
      const p = (now - s.t) / life;
      this.#splat(s.x, s.y, s.r * (1 - 0.55 * p * p), Math.pow(1 - p, 1.5) * 0.72);
    }
    for (let i = this.#drops.length - 1; i >= 0; i--) {
      const d = this.#drops[i]!;
      const p = (now - d.t) / d.life;
      if (p >= 1) {
        this.#drops.splice(i, 1);
        continue;
      }
      const damp = Math.exp(-dt * 3);
      d.vx *= damp;
      d.vy *= damp;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      this.#splat(d.x, d.y, d.r * (1 - 0.4 * p), (1 - smoothstep(p)) * 0.95);
    }

    // Head, drifting lobes, squash/stretch along velocity, then the tendril and cursor pool.
    const speed = Math.hypot(head.vx, head.vy);
    this.#splat(head.x, head.y, r, 1);
    if (!rm) {
      for (let i = 0; i < 4; i++) {
        const ph = i * 1.9 + 0.7;
        const ang = ts * (0.35 + 0.55 * m) * (i % 2 ? -1 : 1) + ph + Math.sin(ts * 0.7 + ph) * 0.8;
        const sz =
          0.5 +
          0.18 * Math.sin(ts * (0.6 + 0.9 * m) * (1 + i * 0.23) + ph * 2) +
          0.12 * Math.sin(ts * 1.3 + ph);
        const dist =
          r * (0.38 + 0.18 * Math.sin(ts * (0.5 + 0.8 * m) + ph * 1.3)) * (0.7 + 0.5 * m);
        this.#splat(head.x + Math.cos(ang) * dist, head.y + Math.sin(ang) * dist, r * sz, 0.9);
      }
      if (speed > 20) {
        const ux = head.vx / speed;
        const uy = head.vy / speed;
        const st = Math.min(speed / 1600, 0.6);
        this.#splat(
          head.x - ux * r * 0.7 * st,
          head.y - uy * r * 0.7 * st,
          r * (1 - 0.25 * st),
          0.9,
        );
        this.#splat(
          head.x + ux * r * 0.35 * st,
          head.y + uy * r * 0.35 * st,
          r * (0.9 - 0.2 * st),
          0.8,
        );
      }
    }
    if (m > 0.02 && this.#reveal > 0.01) {
      const dx = soft.x - head.x;
      const dy = soft.y - head.y;
      const d = Math.hypot(dx, dy);
      const strength = (0.3 + (cfg.pull / 100) * 0.6) * m;
      if (d > r * 0.25) {
        const steps = Math.min(30, Math.ceil(d / (r * 0.1)));
        for (let i = 1; i <= steps; i++) {
          const u = i / steps;
          const neck =
            r * (0.62 - 0.2 * smoothstep(u)) * strength * Math.min(1, (r * 3.2) / d + 0.3);
          this.#splat(head.x + dx * u, head.y + dy * u, neck, 0.85);
        }
      }
      this.#splat(soft.x, soft.y, r * (0.62 + 0.1 * lively) * m, 0.95);
    }

    this.#liquidPass(rm ? 0 : this.#wobbleClock, r, m);

    // Top layer with the liquid cut out, bottom layer showing through.
    const ctx = this.#ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(this.#topLayer, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.#out, 0, 0, this.#cv.width, this.#cv.height);
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(this.#bottomLayer, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    // With reduced motion there is nothing to animate once the liquid has faded out.
    if (rm && resting && this.#reveal < 0.01 && !this.#trail.length) {
      this.#running = false;
      return;
    }
    requestAnimationFrame((t) => this.#frame(t));
  }
}

if (!customElements.get("liquid-reveal")) customElements.define("liquid-reveal", LiquidReveal);
