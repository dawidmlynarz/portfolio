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
 * - Transparent: the cutouts stay cutouts, so the hero backdrop (--bg-hero) shows around them.
 *   The liquid masks both layers (top minus liquid, bottom inside it), so a soft edge never lets
 *   the image below bleed through.
 * - Theme-aware: the resolved --color-bg picks the clay, and the canvas repaints on theme change
 *   (the `themechange` event from ThemeToggle; its waitUntil holds the theme transition until the
 *   canvas has repainted). With data-clay-dark, a dark clay replaces the light one while the
 *   background is dark; it is loaded only when first needed.
 * - Images come from astro:assets (AVIF with alpha, picked to the rendered size). The clay reuses
 *   the static <img>'s file when it is big enough, so it is not downloaded twice.
 * - Starts once the page has loaded and gone idle, so it never competes with first paint.
 * - Drawn with WebGL: one shader thresholds the liquid field, wobbles its edge and mixes the two
 *   layers per pixel, so a frame costs well under a millisecond on the main thread. Without WebGL
 *   the same model runs on a 2D canvas (threshold on the CPU, composite with blend modes).
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

/** Resolves once the page has loaded and the main thread is idle (or after a short timeout). */
const afterLoad = () =>
  new Promise<void>((resolve) => {
    const idle = () =>
      "requestIdleCallback" in window
        ? requestIdleCallback(() => resolve(), { timeout: 1500 })
        : setTimeout(resolve, 200);
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
  });

/** Edge shape for one frame, shared by the WebGL and 2D renderers. */
type Edge = { amp: number; lo: number; hi: number; f1: number; f2: number };

const VERTEX = `attribute vec2 p;varying vec2 uv;
void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;

// Same maths as LiquidReveal.#liquidPass, per output pixel instead of per field pixel.
const FRAGMENT = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D topTex,bottomTex,fieldTex;
uniform vec2 fieldSize,freq;
uniform vec4 phase,edge;
varying vec2 uv;
void main(){
  float a=texture2D(fieldTex,uv).a;
  float m=0.;
  if(a>0.){
    vec2 q=uv*fieldSize;
    float n=.62*sin(q.x*freq.x+phase.x)*cos(q.y*freq.x*.93+phase.z)
      +.38*cos(q.x*freq.y+phase.y)*sin(q.y*freq.y*1.07+phase.w);
    m=smoothstep(edge.y,edge.z,a+edge.x*n*min(1.,a*4.25))*edge.w;
  }
  vec4 top=texture2D(topTex,uv)*(1.-m);
  gl_FragColor=top+texture2D(bottomTex,uv)*m*(1.-top.a);
}`;

/** Draws a frame in one pass: top layer minus the liquid, over the bottom layer inside it. */
class GlRenderer {
  #gl: WebGLRenderingContext;
  #u: Record<string, WebGLUniformLocation | null> = {};
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
    const renderer = new GlRenderer(gl);
    return renderer.init() ? renderer : null;
  }

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
  }

  /** (Re)creates the program and textures; also called after a lost context is restored. */
  init() {
    const gl = this.#gl;
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return (this.ready = false);
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    for (const name of ["fieldSize", "freq", "phase", "edge"])
      this.#u[name] = gl.getUniformLocation(program, name);
    // One texture per unit, bound once: 0 top layer, 1 bottom layer, 2 liquid field.
    ["topTex", "bottomTex", "fieldTex"].forEach((name, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(program, name), i);
    });
    return (this.ready = true);
  }

  /** Uploads a painted layer (0 top, 1 bottom), premultiplied like the canvas output. */
  setLayer(i: 0 | 1, source: HTMLCanvasElement) {
    const gl = this.#gl;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  draw(field: HTMLCanvasElement, e: Edge, t: number, reveal: number) {
    const gl = this.#gl;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.activeTexture(gl.TEXTURE2);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, field);
    // Phases wrapped on the CPU in double precision, so the clock never outgrows mediump floats.
    const wrap = (x: number) => x % (Math.PI * 2);
    gl.uniform2f(this.#u.fieldSize!, field.width, field.height);
    gl.uniform2f(this.#u.freq!, e.f1, e.f2);
    gl.uniform4f(
      this.#u.phase!,
      wrap(t * 1.15),
      wrap(1.2 - t * 1.6),
      wrap(0.4 - t * 0.9),
      wrap(t * 1.35),
    );
    gl.uniform4f(this.#u.edge!, e.amp, e.lo, e.hi, reveal);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

const pick = (sources: Source[], needed: number) =>
  sources.find((s) => s.w >= needed) ?? sources[sources.length - 1]!;

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onerror = reject;
    img.src = url;
    // Decode off the main thread, so the first drawImage of a large AVIF doesn't block a frame.
    img.decode().then(() => resolve(img), reject);
  });

class LiquidReveal extends HTMLElement {
  #abort = new AbortController();
  #cfg!: Config;
  #reduceMotion = false;

  // canvases (#gl when WebGL is available, else #ctx)
  #cv!: HTMLCanvasElement;
  #gl: GlRenderer | null = null;
  #ctx: CanvasRenderingContext2D | null = null;
  #topLayer = document.createElement("canvas");
  #bottomLayer = document.createElement("canvas");
  #mix = document.createElement("canvas");
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
    // decoded (LiquidReveal.astro fades it in from 0 to 100% opacity under the motion layer). The
    // image's own onload usually gets there first; this covers a load that beat the attribute.
    const shown = [...this.querySelectorAll<HTMLImageElement>(".liquid__image")].find(
      (img) => getComputedStyle(img).display !== "none",
    );
    const markShown = () => (this.dataset.shown = "");
    if (!shown || shown.complete) markShown();
    else shown.decode().then(markShown, markShown);

    const canvas = this.querySelector("canvas");
    if (!canvas) return;
    this.#cv = canvas;
    this.#gl = GlRenderer.create(canvas);
    if (!this.#gl) this.#ctx = canvas.getContext("2d");
    if (!this.#gl && !this.#ctx) return;

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
        if (this.#gl?.init() && this.#photo) {
          this.#paintLayers();
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
      this.#clayDark ??= loadImage(this.#clayUrl(darkSources, ".liquid__image--dark"));
      return this.#clayDark;
    }
    const lightSources = JSON.parse(this.dataset.clay ?? "[]") as Source[];
    this.#clayLight ??= loadImage(
      this.#clayUrl(lightSources, ".liquid__image:not(.liquid__image--dark)"),
    );
    return this.#clayLight;
  }

  /** The static <img>'s file when the clay is on top and that file is big enough, else a pick. */
  #clayUrl(sources: Source[], selector: string) {
    const current = this.querySelector<HTMLImageElement>(selector)?.currentSrc;
    const path = current && new URL(current, location.href).pathname;
    const shown = this.#cfg.top === "clay" ? sources.find((s) => s.url === path) : undefined;
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

  /** Paint both cutouts at the canvas size (kept transparent around the figure). */
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
      c.imageSmoothingQuality = "high";
      c.drawImage(img, this.#L.dx, this.#L.dy, this.#L.dw, this.#L.dh);
    }
    if (this.#gl?.ready) {
      this.#gl.setLayer(0, this.#topLayer);
      this.#gl.setLayer(1, this.#bottomLayer);
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

  /** The liquid edge: threshold band, wobble amplitude and noise frequencies (in field pixels). */
  #edge(r: number, hover: number): Edge {
    const amp = (this.#cfg.wobble / 100) * 0.3 * (1 + 0.9 * hover);
    const s = 0.015 + (this.#cfg.soft / 100) * 0.42 + 0.06 * hover;
    const wl = Math.max(10, r * this.#MS * 2.1);
    const f1 = (Math.PI * 2) / wl;
    return { amp, lo: ISO - s, hi: ISO + s, f1, f2: f1 * 1.61 };
  }

  /** 2D fallback: threshold the field into a liquid edge, wobbled by separable sine noise. */
  #liquidPass(t: number, { amp, lo, hi, f1, f2 }: Edge) {
    const fw = this.#field.width;
    const fh = this.#field.height;
    const src = this.#fctx.getImageData(0, 0, fw, fh).data;
    const dst = this.#outImg!.data;
    const nx = this.#noiseX;
    const ny = this.#noiseY;
    const inv = 1 / (hi - lo);
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
    if (this.#gl && !this.#gl.ready) return; // context lost; restored re-kicks
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

    const edge = this.#edge(r, m);
    const clock = rm ? 0 : this.#wobbleClock;
    if (this.#gl) this.#gl.draw(this.#field, edge, clock, this.#reveal);
    else this.#composite2d(clock, edge);

    // With reduced motion there is nothing to animate once the liquid has faded out.
    if (rm && resting && this.#reveal < 0.01 && !this.#trail.length) {
      this.#running = false;
      return;
    }
    requestAnimationFrame((t) => this.#frame(t));
  }

  #composite2d(clock: number, edge: Edge) {
    this.#liquidPass(clock, edge);

    // Top layer with the liquid cut out, over the bottom layer kept only inside the liquid.
    const W = this.#cv.width,
      H = this.#cv.height;
    if (this.#mix.width !== W || this.#mix.height !== H)
      [this.#mix.width, this.#mix.height] = [W, H];
    const mix = this.#mix.getContext("2d")!;
    mix.globalCompositeOperation = "copy";
    mix.drawImage(this.#bottomLayer, 0, 0);
    mix.globalCompositeOperation = "destination-in";
    mix.imageSmoothingEnabled = true;
    mix.imageSmoothingQuality = "high";
    mix.drawImage(this.#out, 0, 0, W, H);
    const ctx = this.#ctx!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(this.#topLayer, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.#out, 0, 0, W, H);
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(this.#mix, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }
}

if (!customElements.get("liquid-reveal")) customElements.define("liquid-reveal", LiquidReveal);
