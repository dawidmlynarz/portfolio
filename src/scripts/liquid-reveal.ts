/**
 * <liquid-reveal>: a portrait on top; a liquid, pointer-driven mask reveals a second image below.
 *
 * Motion: a "head" glides around the face at rest and follows the pointer on hover, with a
 * critically damped ease (heavy, never overshoots). It leaves a trail that recedes from its edges
 * as it heals, so it shrinks like liquid instead of fading. Three lobes drift around the head and
 * merge with it and the trail (smooth union), and the edge ripples gently. At rest (auto mode) the
 * head is bigger, its path and size drift on smooth random curves, the edge is feathered, and
 * three drops roam the face on their own, swelling, drying up and merging; on hover they all
 * stream into the pointer.
 *
 * Rendering (WebGL, all on the GPU):
 * - Trail: a small mask texture, ping-ponged each frame. Every frame lowers it by a fixed step and
 *   stamps the head's path since the last frame as a capsule, so fast moves leave no gaps. The mask
 *   holds a distance ramp, not a coverage value, so bilinear sampling keeps the edge sharp at any
 *   size and lowering it moves the edge inwards.
 * - Composite: one pass per screen pixel. The head (stretched along its velocity) and the lobes are
 *   analytic circles, smooth-merged with the trail; the edge is anti-aliased at full resolution.
 *
 * Also:
 * - Progressive enhancement: the top image is a real responsive <img> (LCP, no-JS, alt text). The
 *   canvas fades in over it once both images are decoded. Without WebGL the static image stays.
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
type Point = { x: number; y: number };
/** One frame of shape for the renderer, in CSS pixels. */
type Shape = {
  head: Point & { r: number; stretch: number; dirX: number; dirY: number };
  trails: [number, number, number, number, number][]; // x0, y0 → x1, y1, r: path since last frame
  decay: number; // amount the trail mask drops this frame (exact multiple of 1/255)
  balls: [number, number, number][]; // x, y, r: lobes and drops, merged with the head
  goo: number; // smooth-union radius
  soft: number; // edge half-width
  wobble: [number, number, number, number]; // amplitude, frequency, phase, phase
  reveal: number;
};

const FIELD_PIXELS = 90_000; // trail mask resolution budget
const MAX_TRAILS = 4; // head + drops
const MAX_BALLS = 6; // lobes + drops
const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const TAU = Math.PI * 2;

/**
 * Smooth random motion: three sines with random rates (periods of ~10–40 s) and phases. Returns a
 * function of time in seconds, roughly in -1…1, that never jumps.
 */
function wander() {
  const waves = [1, 0.6, 0.35].map((amp) => ({
    amp: amp / 1.95,
    rate: 0.15 + Math.random() * 0.45,
    phase: Math.random() * TAU,
  }));
  return (t: number) => waves.reduce((sum, w) => sum + w.amp * Math.sin(t * w.rate + w.phase), 0);
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

/**
 * Exact critically damped step towards a target (no overshoot, stable at any frame time).
 * omega is the response rate: the gap closes to ~1% in 6.6 / omega seconds.
 */
function follow(x: number, v: number, target: number, omega: number, dt: number) {
  const e = x - target;
  const k = (v + omega * e) * dt;
  const decay = Math.exp(-omega * dt);
  return [target + (e + k) * decay, (v - omega * k) * decay] as const;
}

const VERTEX = `attribute vec2 p;varying vec2 uv;
void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;

const PRECISION = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;
uniform vec2 res;
uniform float rRef;
`;

// The trail mask stores 0.5 - distance / (2 * rRef): 0.5 on the edge, rising inwards. Rows are
// written bottom-up, so it is read with y flipped.
const MASK = `${PRECISION}
uniform sampler2D prev;
uniform vec4 seg[${MAX_TRAILS}];
uniform float radius[${MAX_TRAILS}];
uniform float decay;
void main(){
  vec2 p=uv*res;
  float v=texture2D(prev,vec2(uv.x,1.-uv.y)).r-decay;
  for(int i=0;i<${MAX_TRAILS};i++){
    vec2 a=seg[i].xy,ab=seg[i].zw-a;
    float h=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-4),0.,1.);
    v=max(v,.5-(length(p-a-ab*h)-radius[i])/(2.*rRef));
  }
  gl_FragColor=vec4(v,0.,0.,1.);
}`;

const COMPOSITE = `${PRECISION}
uniform sampler2D topTex,bottomTex,maskTex;
uniform vec4 head,wob,edge;
uniform vec3 balls[${MAX_BALLS}];
uniform vec2 dir;
float smin(float a,float b,float k){
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}
void main(){
  vec2 p=uv*res;
  vec2 q=p+wob.x*vec2(
    sin(p.y*wob.y+wob.z)+.5*sin((p.x+p.y)*wob.y*1.7-wob.w),
    cos(p.x*wob.y*1.13-wob.z)+.5*cos((p.x-p.y)*wob.y*1.45+wob.w));
  vec2 m=q/res;
  float d=(.5-texture2D(maskTex,vec2(m.x,1.-m.y)).r)*2.*rRef;
  vec2 o=q-head.xy;
  float sq=inversesqrt(head.w);
  vec2 t=vec2(dot(o,dir),dot(o,vec2(-dir.y,dir.x)))/vec2(head.w,sq);
  d=smin(d,(length(t)-head.z)*sq,edge.y);
  for(int i=0;i<${MAX_BALLS};i++)d=smin(d,length(q-balls[i].xy)-balls[i].z,edge.y);
  float a=(1.-smoothstep(-edge.x,edge.x,d))*edge.w;
  vec4 top=texture2D(topTex,uv)*(1.-a);
  gl_FragColor=top+texture2D(bottomTex,uv)*a*(1.-top.a);
}`;

type Program = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };

/** Ping-pongs the trail mask and composites both layers through the liquid, once per frame. */
class GlRenderer {
  #gl: WebGLRenderingContext;
  #mask!: Program;
  #composite!: Program;
  #targets: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = [];
  #layers: WebGLTexture[] = [];
  #current = 0;
  #size = { w: 1, h: 1 };
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

  #texture() {
    const gl = this.#gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  #program(fragment: string, uniforms: string[]): Program | null {
    const gl = this.#gl;
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(p, 0, "p");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    const u: Program["u"] = {};
    for (const name of uniforms) u[name] = gl.getUniformLocation(p, name);
    return { p, u };
  }

  /** (Re)creates programs and textures; also called after a lost context is restored. */
  init() {
    const gl = this.#gl;
    const mask = this.#program(MASK, ["res", "rRef", "prev", "seg", "radius", "decay"]);
    const composite = this.#program(COMPOSITE, [
      ...["res", "rRef", "topTex", "bottomTex", "maskTex"],
      ...["head", "balls", "wob", "edge", "dir"],
    ]);
    if (!mask || !composite) return (this.ready = false);
    this.#mask = mask;
    this.#composite = composite;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Units: 0 top layer, 1 bottom layer, 2 trail mask (read side of the ping-pong).
    this.#layers = [0, 1].map((i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      return this.#texture();
    });
    gl.activeTexture(gl.TEXTURE2);
    this.#targets = [0, 1].map(() => ({ tex: this.#texture(), fb: gl.createFramebuffer()! }));
    gl.useProgram(composite.p);
    gl.uniform1i(composite.u.topTex!, 0);
    gl.uniform1i(composite.u.bottomTex!, 1);
    gl.uniform1i(composite.u.maskTex!, 2);
    gl.useProgram(mask.p);
    gl.uniform1i(mask.u.prev!, 2);
    this.ready = true;
    this.resizeMask(this.#size.w, this.#size.h);
    return this.ready;
  }

  /** Sizes and clears the trail mask. */
  resizeMask(w: number, h: number) {
    const gl = this.#gl;
    this.#size = { w, h };
    gl.activeTexture(gl.TEXTURE2);
    for (const { tex, fb } of this.#targets) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) this.ready = false;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, this.#targets[this.#current]!.tex);
  }

  /** Uploads a painted layer (0 top, 1 bottom), premultiplied like the canvas output. */
  setLayer(i: 0 | 1, source: HTMLCanvasElement) {
    const gl = this.#gl;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, this.#layers[i]!);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  draw(s: Shape, W: number, H: number, rRef: number) {
    const gl = this.#gl;
    const read = this.#targets[this.#current]!;
    const write = this.#targets[1 - this.#current]!;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, read.tex);

    // 1. Trail: lower the mask, stamp each path since the last frame.
    let u = this.#mask.u;
    gl.useProgram(this.#mask.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
    gl.viewport(0, 0, this.#size.w, this.#size.h);
    gl.uniform2f(u.res!, W, H);
    gl.uniform1f(u.rRef!, rRef);
    const segs = new Float32Array(MAX_TRAILS * 4);
    const radii = new Float32Array(MAX_TRAILS).fill(-1e4);
    s.trails.slice(0, MAX_TRAILS).forEach(([x0, y0, x1, y1, r], i) => {
      segs.set([x0, y0, x1, y1], i * 4);
      radii[i] = r;
    });
    gl.uniform4fv(u.seg!, segs);
    gl.uniform1fv(u.radius!, radii);
    gl.uniform1f(u.decay!, s.decay);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.#current = 1 - this.#current;

    // 2. Composite to the canvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, write.tex);
    u = this.#composite.u;
    gl.useProgram(this.#composite.p);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(u.res!, W, H);
    gl.uniform1f(u.rRef!, rRef);
    const { head } = s;
    gl.uniform4f(u.head!, head.x, head.y, head.r, head.stretch);
    gl.uniform2f(u.dir!, head.dirX, head.dirY);
    const balls = new Float32Array(MAX_BALLS * 3);
    for (let i = 0; i < MAX_BALLS; i++) balls.set(s.balls[i] ?? [0, 0, -1e4], i * 3);
    gl.uniform3fv(u.balls!, balls);
    gl.uniform4f(u.wob!, ...s.wobble);
    gl.uniform4f(u.edge!, s.soft, s.goo, 0, s.reveal);
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

  #cv!: HTMLCanvasElement;
  #gl: GlRenderer | null = null;
  #topLayer = document.createElement("canvas");
  #bottomLayer = document.createElement("canvas");
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
  #L: Layout | null = null;

  // motion
  #head = { x: 0, y: 0, vx: 0, vy: 0 };
  #from: Point = { x: 0, y: 0 };
  #headWander = [wander(), wander(), wander()]; // x, y, size
  // Drops: smaller blobs that roam the face on their own at rest, grow, shrink, vanish and merge,
  // then stream into the pointer on hover.
  #drops = Array.from({ length: MAX_TRAILS - 1 }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    nx: wander(),
    ny: wander(),
    size: wander(),
    from: { x: 0, y: 0 } as Point,
  }));
  #hasHead = false;
  #cursor = { x: 0, y: 0 };
  #lastClient = { x: -1, y: -1 };
  #over = false;
  #touchUntil = 0;
  #orbitAngle = -Math.PI / 2;
  #orbitSpeed = 0;
  #pullMix = 0;
  #wobbleClock = 0;
  #reveal = 1;
  #decayDebt = 0; // trail decay owed, in 1/255 steps (the mask is 8-bit)

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
    if (!this.#gl) return; // keep the static <img>

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
        if (e.pointerType === "touch") {
          // A finger still down after a tap drags the liquid until the page starts scrolling.
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
    if (!this.#photo || !this.#clay || !this.#gl) return;
    const rect = this.getBoundingClientRect();
    this.#W = Math.max(1, rect.width);
    this.#H = Math.max(1, rect.height);
    this.#dpr = Math.min(devicePixelRatio || 1, 2);
    this.#cv.width = Math.round(this.#W * this.#dpr);
    this.#cv.height = Math.round(this.#H * this.#dpr);
    const ms = Math.min(0.5, Math.sqrt(FIELD_PIXELS / (this.#W * this.#H)));
    this.#gl.resizeMask(Math.max(1, Math.ceil(this.#W * ms)), Math.max(1, Math.ceil(this.#H * ms)));
    this.#L = this.#computeLayout(this.#photo.naturalWidth, this.#photo.naturalHeight);
    this.#paintLayers();
    if (!this.#hasHead) {
      const o = this.#orbitPoint(this.#orbitAngle);
      this.#head.x = this.#from.x = o.x;
      this.#head.y = this.#from.y = o.y;
      for (const d of this.#drops) [d.x, d.y] = [o.x, o.y];
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

  #faceCentre() {
    const L = this.#L!;
    const [x0, x1] = this.#cfg.face;
    return { cx: L.dx + ((x0 + x1) / 2) * L.dw, cy: L.dy + 0.44 * L.dh };
  }

  /** How far drops may roam from the face centre. */
  #faceSpread() {
    const L = this.#L!;
    const [x0, x1, y0, y1] = this.#cfg.face;
    return {
      x: Math.min((x1 - x0) * L.dw * 0.42, this.#W * 0.42),
      y: Math.min((y1 - y0) * L.dh * 0.36, this.#H * 0.38),
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

  // ---------- loop (pauses off screen and in hidden tabs) ----------

  #kick() {
    if (this.#running || !this.#visible || document.hidden || !this.#L) return;
    if (!this.#gl?.ready) return; // context lost; restored re-kicks
    this.#running = true;
    this.#last = performance.now();
    requestAnimationFrame((t) => this.#frame(t));
  }

  #frame(now: number) {
    if (!this.#running || !this.#visible || document.hidden || !this.#gl?.ready) {
      this.#running = false;
      return;
    }
    const cfg = this.#cfg;
    const rm = this.#reduceMotion;
    const head = this.#head;
    // Real elapsed time (the follow is exact at any step), capped for stalls and background tabs.
    const dt = Math.min(0.1, (now - this.#last) / 1000);
    this.#last = now;
    const resting = !this.#over && now > this.#touchUntil;

    // Hover blend: quick to arrive, slow to let go.
    this.#pullMix +=
      ((resting ? 0 : 1) - this.#pullMix) * (1 - Math.exp(-dt * (resting ? 1.6 : 6)));
    const m = smoothstep(clamp01(this.#pullMix));

    const ts = now / 1000;
    const [wx, wy, ws] = this.#headWander.map((n) => (rm ? 0 : n(ts)));
    // Bigger and breathing at rest; one steady size under the pointer.
    const sizeMod = rm ? 1 : (1.25 + 0.22 * ws!) * (1 - m) + 1.22 * m;
    const base = this.#baseRadius();
    const r = base * sizeMod;
    this.#wobbleClock += dt * (0.5 + 0.5 * m);

    const goalSpeed = rm ? 0 : (0.12 + (cfg.orbit / 100) * 1.1) * (1 - m * 0.8);
    this.#orbitSpeed += (goalSpeed - this.#orbitSpeed) * (1 - Math.exp(-dt * 1.3));
    this.#orbitAngle += dt * this.#orbitSpeed;
    const orbit = this.#orbitPoint(this.#orbitAngle, rm ? 0 : now);
    const spread = this.#faceSpread();
    const o = { x: orbit.x + wx! * spread.x * 0.35, y: orbit.y + wy! * spread.y * 0.35 };
    const tx = o.x + (this.#cursor.x - o.x) * m;
    const ty = o.y + (this.#cursor.y - o.y) * m;

    // Floaty at rest, heavier but responsive on hover (pull sets how tightly it follows).
    const omega = 3.5 + (5 + (cfg.pull / 100) * 12 - 3.5) * m;
    this.#from = { x: head.x, y: head.y };
    if (rm && !resting) {
      head.x = tx;
      head.y = ty;
      head.vx = head.vy = 0;
      if (this.#reveal < 0.05) this.#from = { x: tx, y: ty }; // appear in place, no streak
    } else {
      [head.x, head.vx] = follow(head.x, head.vx, tx, omega, dt);
      [head.y, head.vy] = follow(head.y, head.vy, ty, omega, dt);
    }

    const want = rm ? (resting ? 0 : 1) : 1;
    this.#reveal += (want - this.#reveal) * (1 - Math.exp(-dt * 6));

    // Trail mask drop, paid in whole 8-bit steps so the heal time is exact at any frame rate.
    // At rest the trail lingers longer, so the drops leave slow, fading streams.
    const rRef = base * 1.6;
    const heal = Math.max(0.1, cfg.fade) * (1.6 - 0.6 * m);
    this.#decayDebt += ((dt * (base * 1.22)) / (2 * rRef) / heal) * 255;
    const steps = Math.floor(this.#decayDebt);
    this.#decayDebt -= steps;

    // Squash and stretch along the velocity.
    const speed = Math.hypot(head.vx, head.vy);
    const stretch = rm ? 1 : 1 + Math.min(speed / 2400, 0.35);
    const dirX = speed > 1 ? head.vx / speed : 1;
    const dirY = speed > 1 ? head.vy / speed : 0;

    const balls: [number, number, number][] = [];
    const trails: Shape["trails"] = [];
    if (this.#reveal > 0.01) trails.push([this.#from.x, this.#from.y, head.x, head.y, r * 0.9]);
    if (!rm) {
      for (let i = 0; i < 3; i++) {
        const ph = i * 2.1 + 0.7;
        const ang = ts * (0.28 + 0.3 * m) * (i % 2 ? -1 : 1) + ph + Math.sin(ts * 0.45 + ph) * 0.7;
        const dist = r * (0.42 + 0.16 * Math.sin(ts * (0.4 + 0.3 * m) + ph * 1.3));
        const size = r * (0.5 + 0.1 * Math.sin(ts * (0.5 + 0.4 * m) * (1 + i * 0.2) + ph * 2));
        balls.push([head.x + Math.cos(ang) * dist, head.y + Math.sin(ang) * dist, size]);
      }
      const { cx, cy } = this.#faceCentre();
      this.#drops.forEach((d, i) => {
        // Roam the face at rest; on hover, swirl in close around the pointer and merge with the head.
        const a = ts * 0.8 + (i * TAU) / this.#drops.length;
        const gx = cx + d.nx(ts) * spread.x;
        const gy = cy + d.ny(ts) * spread.y;
        const px = this.#cursor.x + Math.cos(a) * r * 0.45;
        const py = this.#cursor.y + Math.sin(a) * r * 0.45;
        const omegaDrop = 1.4 + (3 + (cfg.pull / 100) * 6 - 1.4) * m;
        d.from = { x: d.x, y: d.y };
        [d.x, d.vx] = follow(d.x, d.vx, gx + (px - gx) * m, omegaDrop, dt);
        [d.y, d.vy] = follow(d.y, d.vy, gy + (py - gy) * m, omegaDrop, dt);
        // Size drifts between nothing and most of the head, so drops appear, swell and dry up.
        const life = smoothstep(clamp01(0.55 + 0.75 * d.size(ts)));
        const size = r * ((0.85 * life - 0.15) * (1 - m) + 0.5 * m);
        balls.push([d.x, d.y, size]);
        if (size > 0 && this.#reveal > 0.01)
          trails.push([d.from.x, d.from.y, d.x, d.y, size * 0.85]);
      });
    }

    const w = rm ? 0 : this.#wobbleClock;
    this.#gl.draw(
      {
        head: { x: head.x, y: head.y, r, stretch, dirX, dirY },
        trails,
        decay: steps / 255,
        balls,
        goo: r * (0.38 + 0.12 * (1 - m)),
        // Feathered edge at rest, crisper under the pointer.
        soft: 0.75 + (cfg.soft / 100) * r * (0.12 + 0.3 * (1 - m)),
        wobble: [
          rm ? 0 : (cfg.wobble / 100) * r * (0.07 + 0.04 * m),
          TAU / Math.max(10, r * 1.6),
          (w * 1.3) % TAU,
          (w * 0.9) % TAU,
        ],
        reveal: this.#reveal,
      },
      this.#W,
      this.#H,
      rRef,
    );

    // With reduced motion there is nothing to animate once the liquid has faded out.
    if (rm && resting && this.#reveal < 0.01) {
      this.#running = false;
      return;
    }
    requestAnimationFrame((t) => this.#frame(t));
  }
}

if (!customElements.get("liquid-reveal")) customElements.define("liquid-reveal", LiquidReveal);
