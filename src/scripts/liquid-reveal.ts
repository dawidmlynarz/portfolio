/**
 * <liquid-reveal>: a portrait on top; a glitch reveals up to four layers below it.
 *
 * The glitch itself (a weak video signal: rolling tracking bands at rest, interference under the
 * pointer) lives in reveal-glitch.ts. This element owns everything around it: the canvas and the
 * layer textures, loading, theme, the pointer, layer picks and the frame loop.
 *
 * Layers: picks are weighted, so a layer can be rare (a pick of the current layer changes nothing).
 *
 * Also:
 * - Progressive enhancement: the top image is a real responsive <img> (LCP, no-JS, alt text). The
 *   canvas fades in over it once the top and the first layer are decoded. Without WebGL the static
 *   image stays.
 * - Memory: each image is drawn once at the canvas size into a scratch canvas, uploaded, and the
 *   scratch is released, so only the GPU textures stay. Their total is capped (TEXTURE_BUDGET); on
 *   very large retina screens they are drawn slightly below device resolution.
 * - Lazy: the other layers load one at a time at low priority once the canvas is running, each
 *   uploaded in its own idle slot, and join the picks when ready. Skipped on Save-Data or 2G/3G.
 * - Transparent: the cutouts stay cutouts, so the hero grain (HeroBackdrop) shows around them.
 * - Theme-aware: the resolved --color-bg picks each layer's light or dark variant, and the canvas
 *   repaints on theme change (the `themechange` event from ThemeToggle; its waitUntil holds the
 *   theme transition until the canvas has repainted). A variant is loaded only when first needed.
 * - Images come from astro:assets (AVIF with alpha, picked to the rendered size). The top reuses
 *   the static <img>'s file when it is big enough, so it is not downloaded twice.
 * - Starts once the page has loaded and gone idle, so it never competes with first paint.
 * - All listeners are removed when the element leaves the DOM.
 */

import { LAYER_SAMPLERS, texture } from "./reveal-gl";
import { GlitchSignal } from "./reveal-glitch";

type Config = {
  face: [number, number, number, number]; // x0, x1, y0, y1 (0–1) kept in frame
};
type Source = { url: string; w: number };
type LayerData = { light: Source[]; dark?: Source[]; weight: number };
type Slot = {
  data: LayerData;
  variants: { light?: Promise<HTMLImageElement>; dark?: Promise<HTMLImageElement> };
  img: HTMLImageElement | null; // the variant on the GPU; null until loaded
};
type Layout = { dx: number; dy: number; dw: number; dh: number };

const MAX_LAYERS = 4;
const TEXTURE_BUDGET = 64e6; // bytes for the top and layer textures together

/** Resolves when the main thread is idle (or after a short timeout). */
const idle = (timeout = 1500) =>
  new Promise<void>((resolve) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(() => resolve(), { timeout })
      : setTimeout(resolve, 200),
  );

/** Resolves once the page has loaded and the main thread is idle. */
const afterLoad = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") void idle().then(resolve);
    else addEventListener("load", () => void idle().then(resolve), { once: true });
  });

/** Save-Data or a slow connection: no extra layers. */
const lean = () => {
  const c = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  return Boolean(c?.saveData) || /(^|-)(2g|3g)$/.test(c?.effectiveType ?? "");
};

/** The canvas's WebGL context with the top and layer textures on units 0–4. */
class GlLayers {
  gl: WebGLRenderingContext;
  #images: WebGLTexture[] = []; // unit 0 top, 1–4 layers
  ready = false;

  static create(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return null;
    const layers = new GlLayers(gl);
    layers.init();
    return layers;
  }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  /** (Re)creates the quad and the textures; also called after a lost context is restored. */
  init() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Empty until uploaded.
    const empty = new Uint8Array(4);
    this.#images = LAYER_SAMPLERS.map((_, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      const tex = texture(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty);
      return tex;
    });
    this.ready = true;
  }

  /** Uploads a painted image (0 top, 1–4 layers), premultiplied like the canvas output. */
  setImage(unit: number, source: HTMLCanvasElement) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.#images[unit]!);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }
}

const pick = (sources: Source[], needed: number) =>
  sources.find((s) => s.w >= needed) ?? sources[sources.length - 1]!;

const loadImage = (url: string, priority: "high" | "low" | "auto" = "auto") =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.fetchPriority = priority;
    img.onerror = reject;
    img.src = url;
    // Decode off the main thread, so the first drawImage of a large AVIF doesn't block a frame.
    img.decode().then(() => resolve(img), reject);
  });

/** Relative luminance below half: a dark page. */
const isDark = (color: string) => {
  const [r = 255, g = 255, b = 255] = (color.match(/[\d.]+/g) ?? []).map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
};

class LiquidReveal extends HTMLElement {
  #abort = new AbortController();
  #cfg!: Config;
  #reduceMotion = false;

  #cv!: HTMLCanvasElement;
  #gl: GlLayers | null = null;
  #glitch: GlitchSignal | null = null;
  #scratch = document.createElement("canvas");
  #top: HTMLImageElement | null = null;
  #slots: Slot[] = [];
  #drawnWidth = 0;
  #dark = false;

  // geometry
  #W = 0;
  #H = 0;
  #dpr = 1;
  #L: Layout | null = null;

  // pointer
  #cursor = { x: 0, y: 0 };
  #lastClient = { x: -1, y: -1 };
  #over = false;
  #wasResting = true;
  #touchUntil = 0;
  #tapped = false;

  // loop
  #visible = false;
  #running = false;
  #last = 0;

  connectedCallback() {
    this.#cfg = JSON.parse(this.dataset.config ?? "{}") as Config;
    this.#reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layers = JSON.parse(this.dataset.layers ?? "[]") as LayerData[];
    this.#slots = layers.slice(0, MAX_LAYERS).map((data) => ({ data, variants: {}, img: null }));

    // Page-load fade: mark the portrait as shown once the static image has decoded
    // (LiquidReveal.astro fades it in from 0 to 100% opacity under the motion layer). The image's
    // own onload usually gets there first; this covers a load that beat the attribute.
    const shown = this.querySelector<HTMLImageElement>(".liquid__image");
    const markShown = () => (this.dataset.shown = "");
    if (!shown || shown.complete) markShown();
    else shown.decode().then(markShown, markShown);

    const canvas = this.querySelector("canvas");
    if (!canvas || !this.#slots.length) return;
    this.#cv = canvas;
    this.#gl = GlLayers.create(canvas);
    if (!this.#gl) return; // keep the static <img>
    this.#glitch = new GlitchSignal(this.#gl.gl);
    if (!this.#glitch.init()) {
      this.#gl = null;
      return; // keep the static <img>
    }

    const { signal } = this.#abort;
    canvas.addEventListener(
      "webglcontextlost",
      (e) => {
        e.preventDefault();
        if (this.#gl) this.#gl.ready = false;
        delete this.dataset.ready; // show the static <img> while the canvas is blank
      },
      { signal },
    );
    canvas.addEventListener(
      "webglcontextrestored",
      () => {
        this.#gl?.init();
        if (this.#gl && this.#top) {
          if (!this.#glitch?.init()) {
            this.#gl.ready = false;
            return;
          }
          this.#glitch.resize(this.#W, this.#H);
          this.#uploadAll();
          this.dataset.ready = "";
        }
        this.#kick();
      },
      { signal },
    );
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
    await afterLoad();
    const topSources = JSON.parse(this.dataset.top ?? "[]") as Source[];
    const rect = this.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    // Ask for the width the image is actually drawn at (cover can exceed the box).
    const ratio = Number(this.dataset.ratio) || 1;
    this.#drawnWidth = Math.max(rect.width, rect.height * ratio) * dpr;
    this.#dark = isDark(getComputedStyle(this.#cv).color);

    const first = this.#slots[0]!;
    try {
      [this.#top, first.img] = await Promise.all([
        loadImage(this.#topUrl(topSources)),
        this.#variant(first, this.#dark),
      ]);
    } catch {
      return; // keep the static <img>
    }

    const { signal } = this.#abort;
    new ResizeObserver(() => this.#resize()).observe(this);

    const onTheme = async () => {
      this.#dark = isDark(getComputedStyle(this.#cv).color);
      await Promise.all(
        this.#slots
          .filter((slot) => slot.img)
          .map(async (slot) => {
            try {
              slot.img = await this.#variant(slot, this.#dark);
            } catch {
              // keep the variant already drawn
            }
          }),
      );
      this.#uploadAll();
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
        if (e.pointerType === "touch") {
          // A finger still down after a tap drags the glitch until the page starts scrolling.
          if (performance.now() < this.#touchUntil && this.#track(e.clientX, e.clientY))
            this.#touchUntil = performance.now() + 1600;
          return;
        }
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
    // Touch: a tap pulls the glitch there for a moment and switches the layer; scrolling is
    // never blocked.
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "touch") return;
        if (this.#track(e.clientX, e.clientY)) {
          this.#touchUntil = performance.now() + 1600;
          this.#tapped = true;
          this.#kick();
        }
      },
      opts,
    );

    this.#resize();
    this.dataset.ready = "";
    if (!lean()) void this.#loadRest();
  }

  /** The other layers, one at a time, each uploaded in its own idle slot. */
  async #loadRest() {
    for (const slot of this.#slots.slice(1)) {
      await idle();
      let img: HTMLImageElement;
      let dark: boolean;
      try {
        do {
          dark = this.#dark;
          img = await this.#variant(slot, dark, "low");
        } while (dark !== this.#dark); // the theme changed while it loaded
      } catch {
        continue; // left out of the picks
      }
      await idle();
      if (this.#abort.signal.aborted) return;
      slot.img = img;
      this.#upload(this.#slots.indexOf(slot) + 1, img);
      this.#releaseScratch();
    }
  }

  /** A layer's image for the theme: its dark variant (if any) on a dark page, else the light one. */
  #variant(slot: Slot, dark: boolean, priority: "auto" | "low" = "auto") {
    const key = dark && slot.data.dark ? "dark" : "light";
    slot.variants[key] ??= loadImage(pick(slot.data[key]!, this.#drawnWidth).url, priority);
    return slot.variants[key];
  }

  /** The static <img>'s file when it is big enough, else a pick. */
  #topUrl(sources: Source[]) {
    const current = this.querySelector<HTMLImageElement>(".liquid__image")?.currentSrc;
    const path = current && new URL(current, location.href).pathname;
    const shown = sources.find((s) => s.url === path);
    return shown && shown.w >= this.#drawnWidth * 0.8
      ? shown.url
      : pick(sources, this.#drawnWidth).url;
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
    if (!this.#top || !this.#gl) return;
    const rect = this.getBoundingClientRect();
    this.#W = Math.max(1, rect.width);
    this.#H = Math.max(1, rect.height);
    this.#dpr = Math.min(devicePixelRatio || 1, 2);
    this.#cv.width = Math.round(this.#W * this.#dpr);
    this.#cv.height = Math.round(this.#H * this.#dpr);
    this.#glitch?.resize(this.#W, this.#H);
    this.#L = this.#computeLayout(this.#top.naturalWidth, this.#top.naturalHeight);
    this.#uploadAll();
    this.#kick();
  }

  /**
   * Paints one cutout at the canvas size (kept transparent around the figure) into the scratch
   * canvas and uploads it. Under the texture budget, that is the device resolution.
   */
  #upload(unit: number, img: HTMLImageElement) {
    if (!this.#L || !this.#gl?.ready) return;
    const { width: cw, height: ch } = this.#cv;
    const scale = Math.min(1, Math.sqrt(TEXTURE_BUDGET / ((1 + this.#slots.length) * cw * ch * 4)));
    const s = this.#scratch;
    s.width = Math.max(1, Math.round(cw * scale));
    s.height = Math.max(1, Math.round(ch * scale));
    const c = s.getContext("2d")!;
    c.setTransform(s.width / this.#W, 0, 0, s.height / this.#H, 0, 0);
    c.imageSmoothingQuality = "high";
    c.drawImage(img, this.#L.dx, this.#L.dy, this.#L.dw, this.#L.dh);
    this.#gl.setImage(unit, s);
  }

  #uploadAll() {
    if (!this.#top) return;
    this.#upload(0, this.#top);
    this.#slots.forEach((slot, i) => slot.img && this.#upload(i + 1, slot.img));
    this.#releaseScratch();
  }

  /** Only the GPU copies stay. */
  #releaseScratch() {
    this.#scratch.width = this.#scratch.height = 0;
  }

  /**
   * A random loaded layer, by weight. It can be the current one (then nothing switches): excluding
   * it would make a rare layer come up every other time when there are only two.
   */
  #pickLayer(current: number) {
    const ready = this.#slots
      .map((slot, i) => ({ i, w: slot.img ? slot.data.weight : 0 }))
      .filter((c) => c.w > 0);
    let roll = Math.random() * ready.reduce((sum, c) => sum + c.w, 0);
    for (const c of ready) if ((roll -= c.w) <= 0) return c.i;
    return ready[ready.length - 1]?.i ?? current;
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

  // ---------- loop (pauses off screen and in hidden tabs) ----------

  #kick() {
    if (this.#running || !this.#visible || document.hidden || !this.#L) return;
    if (!this.#gl?.ready) return; // context lost; restored re-kicks
    this.#running = true;
    this.#last = performance.now();
    requestAnimationFrame((t) => this.#frame(t));
  }

  #frame(now: number) {
    if (!this.#running || !this.#visible || document.hidden || !this.#gl?.ready || !this.#glitch) {
      this.#running = false;
      return;
    }
    // Real elapsed time, capped for stalls and background tabs.
    const dt = Math.min(0.1, (now - this.#last) / 1000);
    this.#last = now;
    const resting = !this.#over && now > this.#touchUntil;
    const arrived = this.#wasResting && !resting;
    this.#wasResting = resting;

    this.#glitch.frame({
      now,
      dt,
      W: this.#W,
      H: this.#H,
      cursor: this.#cursor,
      pointing: !resting,
      arrived,
      tapped: this.#tapped,
      reduceMotion: this.#reduceMotion,
      pick: (current) => this.#pickLayer(current),
    });
    this.#tapped = false;
    requestAnimationFrame((t) => this.#frame(t));
  }
}

if (!customElements.get("liquid-reveal")) customElements.define("liquid-reveal", LiquidReveal);
