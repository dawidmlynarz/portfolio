/**
 * <liquid-reveal>: a portrait on top; a liquid, pointer-driven mask reveals up to four layers below.
 *
 * Motion: a "head" glides around the face at rest and follows the pointer on hover, with a
 * critically damped ease (heavy, never overshoots). It leaves a trail that recedes from its edges
 * as it heals, so it shrinks like liquid instead of fading. Three lobes drift around the head and
 * merge with it and the trail (smooth union), and the edge ripples gently. At rest (auto mode) the
 * head is bigger, its path and size drift on smooth random curves, the trail lingers, and
 * three drops roam the face on their own, swelling, drying up and merging; on hover they all
 * stream into the pointer.
 * Fragile: the edge carries a fine travelling ripple, trails are beaded so they break into droplets
 * as they heal, and fast blobs shed small droplets that drift and dry up.
 *
 * Layers: every blob carries one of the layers below and reveals that one. The head picks a new
 * layer when the pointer arrives, on each tap, and every few seconds after that; it pours the new
 * layer in as a blob that wells up inside the old one, while the old trail heals in its own layer.
 * Each roaming drop picks a new layer whenever it has dried up. Picks are weighted, so a layer can
 * be rare (a pick of the current layer changes nothing). Where layers overlap, the deepest liquid
 * shows.
 *
 * Styles (data-style): "liquid" is all of the above. "pixels" (a cell colony, reveal-pixels.ts)
 * and "glitch" (a weak video signal, reveal-glitch.ts) are separate engines on the same canvas and
 * layers, with their own resting animation and hover physics; this element only feeds them the
 * pointer, picks and timing.
 *
 * Rendering (WebGL, all on the GPU):
 * - Trail: a small RGBA mask texture, one channel per layer, ping-ponged each frame. Every frame
 *   lowers it by a fixed step and stamps each blob's path since the last frame as a capsule into its
 *   layer's channel, so fast moves leave no gaps. The mask holds a distance ramp, not a coverage
 *   value, so bilinear sampling keeps the edge sharp at any size and lowering it moves the edge
 *   inwards. Four layers cost the same pass as one.
 * - Composite: one pass per screen pixel. The head (stretched along its velocity) and the lobes are
 *   analytic circles, smooth-merged with their layer's trail; the union of all layers masks the top,
 *   and the deepest layer at each pixel fills it. The edge is anti-aliased at full resolution.
 * - Memory: each image is drawn once at the canvas size into a scratch canvas, uploaded, and the
 *   scratch is released, so only the GPU textures stay. Their total is capped (TEXTURE_BUDGET); on
 *   very large retina screens they are drawn slightly below device resolution.
 *
 * Also:
 * - Progressive enhancement: the top image is a real responsive <img> (LCP, no-JS, alt text). The
 *   canvas fades in over it once the top and the first layer are decoded. Without WebGL the static
 *   image stays.
 * - Lazy: the other layers load one at a time at low priority once the canvas is running, each
 *   uploaded in its own idle slot, and join the picks when ready. Skipped on Save-Data or 2G/3G.
 * - Transparent: the cutouts stay cutouts, so the hero grain (HeroBackdrop) shows around them.
 *   The liquid masks every layer, so a soft edge never lets one image bleed through another.
 * - Theme-aware: the resolved --color-bg picks each layer's light or dark variant, and the canvas
 *   repaints on theme change (the `themechange` event from ThemeToggle; its waitUntil holds the
 *   theme transition until the canvas has repainted). A variant is loaded only when first needed.
 * - Images come from astro:assets (AVIF with alpha, picked to the rendered size). The top reuses
 *   the static <img>'s file when it is big enough, so it is not downloaded twice.
 * - Starts once the page has loaded and gone idle, so it never competes with first paint.
 * - All listeners are removed when the element leaves the DOM.
 */

import {
  bindLayers,
  between,
  HEADER,
  LAYER_SAMPLERS,
  LAYERS,
  program,
  texture,
  type Program,
  type StyleEngine,
} from "./reveal-gl";
import { PixelLife } from "./reveal-pixels";
import { GlitchSignal } from "./reveal-glitch";

type Config = {
  size: number; // 6–60
  soft: number; // 0–100
  pull: number; // 0–100
  wobble: number; // 0–100
  fade: number; // trail heal time, seconds
  orbit: number; // 0–100
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
type Point = { x: number; y: number };
/** One frame of shape for the renderer, in CSS pixels. */
type Shape = {
  head: Point & { r: number; stretch: number; dirX: number; dirY: number; layer: number };
  trails: [number, number, number, number, number, number][]; // x0, y0 → x1, y1, r, layer
  decay: number; // amount the trail mask drops this frame (exact multiple of 1/255)
  balls: [number, number, number, number][]; // x, y, r, layer: lobes and drops
  goo: number; // smooth-union radius
  soft: number; // edge half-width
  wobble: [number, number, number, number]; // amplitude, frequency, phase, phase
  ripple: [number, number, number]; // amplitude, frequency, phase: fine waves along the edge
  reveal: number;
  bias: number; // depth advantage of the head's layer when picking which layer shows
};

const MAX_LAYERS = 4; // one per mask channel
const FIELD_PIXELS = 90_000; // trail mask resolution budget
const TEXTURE_BUDGET = 64e6; // bytes for the top and layer textures together
const MAX_TRAILS = 13; // head + 3 drops + 8 droplets + the head's old blob when it switches
const MAX_SPRAY = 8; // droplets shed by fast blobs
const MAX_BALLS = 6; // lobes + drops
const STYLES = ["liquid", "pixels", "glitch"] as const;
type Style = (typeof STYLES)[number];
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

const PRECISION = `${HEADER}uniform float rRef;
`;

// The trail mask stores 0.5 - distance / (2 * rRef) per layer channel: 0.5 on the edge, rising
// inwards. Rows are written bottom-up, so it is read with y flipped.
const MASK = `${PRECISION}
uniform sampler2D prev;
uniform vec4 seg[${MAX_TRAILS}];
uniform vec2 radius[${MAX_TRAILS}];
uniform float decay;
void main(){
  vec2 p=uv*res;
  vec4 v=texture2D(prev,vec2(uv.x,1.-uv.y))-decay;
  for(int i=0;i<${MAX_TRAILS};i++){
    vec2 a=seg[i].xy,ab=seg[i].zw-a;
    float h=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-4),0.,1.);
    float s=.5-(length(p-a-ab*h)-radius[i].x)/(2.*rRef);
    v=max(v,mix(vec4(-1.),vec4(s),onehot(radius[i].y)));
  }
  gl_FragColor=v;
}`;

// Each layer's trail is smooth-merged with the head and the blobs that carry that layer; the union
// masks the top, with a wobbling, rippling, anti-aliased edge. The deepest layer fills each pixel,
// with the head's own layer favoured (bias) so a new pick shows at once.
const COMPOSITE = `${PRECISION}${LAYERS}
uniform sampler2D maskTex;
uniform vec4 head,wob,edge,active;
uniform float bias;
uniform vec3 rip;
uniform vec4 balls[${MAX_BALLS}];
uniform vec2 dir;
float smin(float a,float b,float k){
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}
vec4 smin4(vec4 a,float b,float k){
  vec4 h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(vec4(b),a,h)-k*h*(1.-h);
}
float min4(vec4 d){return min(min(d.x,d.y),min(d.z,d.w));}
void main(){
  vec2 p=uv*res;
  vec2 q=p+wob.x*vec2(
    sin(p.y*wob.y+wob.z)+.5*sin((p.x+p.y)*wob.y*1.7-wob.w),
    cos(p.x*wob.y*1.13-wob.z)+.5*cos((p.x-p.y)*wob.y*1.45+wob.w));
  vec2 m=q/res;
  float k=edge.y;
  vec4 d=(.5-texture2D(maskTex,vec2(m.x,1.-m.y)))*2.*rRef;
  vec2 o=q-head.xy;
  float sq=inversesqrt(head.w);
  vec2 t=vec2(dot(o,dir),dot(o,vec2(-dir.y,dir.x)))/vec2(head.w,sq);
  d=mix(d,smin4(d,(length(t)-head.z)*sq,k),onehot(edge.z));
  for(int i=0;i<${MAX_BALLS};i++)d=mix(d,smin4(d,length(q-balls[i].xy)-balls[i].z,k),onehot(balls[i].w));
  d=mix(vec4(1e4),d,active);
  float u=smin(smin(d.x,d.y,k*.5),smin(d.z,d.w,k*.5),k*.5);
  u+=rip.x*sin(dot(q,vec2(.8,.6))*rip.y+rip.z)*sin(dot(q,vec2(-.5,.87))*rip.y*.83-rip.z*1.3);
  float a=(1.-smoothstep(-edge.x,edge.x,u))*edge.w;
  vec4 s=d-onehot(edge.z)*bias;
  vec4 w=(1.-smoothstep(0.,2.*edge.x+.5,s-min4(s)))*active;
  gl_FragColor=over(a,below(w,uv));
}`;

/** Ping-pongs the trail mask and composites the layers through the liquid, once per frame. */
class GlRenderer {
  gl: WebGLRenderingContext;
  #mask!: Program;
  #composite!: Program;
  #targets: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = [];
  #images: WebGLTexture[] = []; // unit 0 top, 1–4 layers
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
    this.gl = gl;
  }

  /** (Re)creates programs and textures; also called after a lost context is restored. */
  init() {
    const gl = this.gl;
    const mask = program(gl, MASK, ["res", "rRef", "prev", "seg", "radius", "decay"]);
    const composite = program(gl, COMPOSITE, [
      ...["res", "rRef", "maskTex", ...LAYER_SAMPLERS],
      ...["head", "balls", "wob", "rip", "edge", "dir", "active", "bias"],
    ]);
    if (!mask || !composite) return (this.ready = false);
    this.#mask = mask;
    this.#composite = composite;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Units: 0 top, 1–4 layers (empty until uploaded), 5 trail mask (read side of the ping-pong).
    const empty = new Uint8Array(4);
    this.#images = LAYER_SAMPLERS.map((_, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      const tex = texture(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, empty);
      return tex;
    });
    gl.activeTexture(gl.TEXTURE5);
    this.#targets = [0, 1].map(() => ({ tex: texture(gl), fb: gl.createFramebuffer()! }));
    bindLayers(gl, composite);
    gl.uniform1i(composite.u.maskTex!, 5);
    gl.useProgram(mask.p);
    gl.uniform1i(mask.u.prev!, 5);
    this.ready = true;
    this.resizeMask(this.#size.w, this.#size.h);
    return this.ready;
  }

  /** Sizes and clears the trail mask. */
  resizeMask(w: number, h: number) {
    const gl = this.gl;
    this.#size = { w, h };
    gl.activeTexture(gl.TEXTURE5);
    for (const { tex, fb } of this.#targets) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) this.ready = false;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, this.#targets[this.#current]!.tex);
  }

  /** Uploads a painted image (0 top, 1–4 layers), premultiplied like the canvas output. */
  setImage(unit: number, source: HTMLCanvasElement) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.#images[unit]!);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  draw(s: Shape, W: number, H: number, rRef: number, active: number[]) {
    const gl = this.gl;
    const read = this.#targets[this.#current]!;
    const write = this.#targets[1 - this.#current]!;
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, read.tex);

    // 1. Trail: lower the mask, stamp each path since the last frame into its layer's channel.
    let u = this.#mask.u;
    gl.useProgram(this.#mask.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
    gl.viewport(0, 0, this.#size.w, this.#size.h);
    gl.uniform2f(u.res!, W, H);
    gl.uniform1f(u.rRef!, rRef);
    const segs = new Float32Array(MAX_TRAILS * 4);
    const radii = new Float32Array(MAX_TRAILS * 2);
    for (let i = 0; i < MAX_TRAILS; i++) radii[i * 2] = -1e4;
    s.trails.slice(0, MAX_TRAILS).forEach(([x0, y0, x1, y1, r, layer], i) => {
      segs.set([x0, y0, x1, y1], i * 4);
      radii.set([r, layer], i * 2);
    });
    gl.uniform4fv(u.seg!, segs);
    gl.uniform2fv(u.radius!, radii);
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
    const balls = new Float32Array(MAX_BALLS * 4);
    for (let i = 0; i < MAX_BALLS; i++) balls.set(s.balls[i] ?? [0, 0, -1e4, 0], i * 4);
    gl.uniform4fv(u.balls!, balls);
    gl.uniform4f(u.wob!, ...s.wobble);
    gl.uniform3f(u.rip!, ...s.ripple);
    gl.uniform4f(u.edge!, s.soft, s.goo, head.layer, s.reveal);
    gl.uniform4f(u.active!, active[0]!, active[1]!, active[2]!, active[3]!);
    gl.uniform1f(u.bias!, s.bias);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
  #gl: GlRenderer | null = null;
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

  // motion
  #head = { x: 0, y: 0, vx: 0, vy: 0 };
  #from: Point = { x: 0, y: 0 };
  #headWander = [wander(), wander(), wander()]; // x, y, size
  #headLayer = 0;
  #headGrow = 1; // 0 → 1 as a newly picked layer wells up inside the old one
  #nextSwitch = 0;
  #switchNow = false;
  // Drops: smaller blobs that roam the face on their own at rest, grow, shrink, vanish and merge,
  // then stream into the pointer on hover. Each carries its own layer, re-picked when it dries up.
  #drops = Array.from({ length: 3 }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    nx: wander(),
    ny: wander(),
    size: wander(),
    from: { x: 0, y: 0 } as Point,
    travelled: 0,
    layer: 0,
    dry: true,
  }));
  #travelled = 0; // head path length, for the beaded trail
  // Spray: small droplets that break off fast-moving blobs, drift, slow down and dry up.
  #spray: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    age: number;
    life: number;
    layer: number;
  }[] = [];
  #hasHead = false;
  #cursor = { x: 0, y: 0 };
  #lastClient = { x: -1, y: -1 };
  #over = false;
  #wasResting = true;
  #touchUntil = 0;
  #orbitAngle = -Math.PI / 2;
  #orbitSpeed = 0;
  #pullMix = 0;
  #wobbleClock = 0;
  #reveal = 1;
  #decayDebt = 0; // trail decay owed, in 1/255 steps (the mask is 8-bit)
  // Pixels and glitch run their own engines on the same canvas and layers (data-style).
  #style: Style = "liquid";
  #engines: Partial<Record<Style, StyleEngine>> = {};

  // loop
  #visible = false;
  #running = false;
  #last = 0;

  static observedAttributes = ["data-style"];

  attributeChangedCallback() {
    const style = this.dataset.style as Style;
    this.#style = STYLES.includes(style) ? style : "liquid";
    this.#kick();
  }

  connectedCallback() {
    this.#cfg = JSON.parse(this.dataset.config ?? "{}") as Config;
    this.#reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.#reveal = this.#reduceMotion ? 0 : 1;
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
    this.#gl = GlRenderer.create(canvas);
    if (!this.#gl) return; // keep the static <img>
    const { gl } = this.#gl;
    this.#engines = { pixels: new PixelLife(gl), glitch: new GlitchSignal(gl) };
    this.#initEngines();

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
        if (this.#gl?.init() && this.#top) {
          this.#initEngines();
          this.#gl.resizeMask(...this.#maskSize());
          for (const engine of Object.values(this.#engines)) engine.resize(this.#W, this.#H);
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

  /** A style whose engine fails to start falls back to the liquid. */
  #initEngines() {
    for (const [style, engine] of Object.entries(this.#engines))
      if (!engine.init()) delete this.#engines[style as Style];
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
    // Touch: a tap pulls the liquid there for a moment and pours the next layer; scrolling is
    // never blocked.
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "touch") return;
        if (this.#track(e.clientX, e.clientY)) {
          this.#touchUntil = performance.now() + 1600;
          this.#switchNow = true;
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

  #maskSize(): [number, number] {
    const ms = Math.min(0.5, Math.sqrt(FIELD_PIXELS / (this.#W * this.#H)));
    return [Math.max(1, Math.ceil(this.#W * ms)), Math.max(1, Math.ceil(this.#H * ms))];
  }

  #resize() {
    if (!this.#top || !this.#gl) return;
    const rect = this.getBoundingClientRect();
    this.#W = Math.max(1, rect.width);
    this.#H = Math.max(1, rect.height);
    this.#dpr = Math.min(devicePixelRatio || 1, 2);
    this.#cv.width = Math.round(this.#W * this.#dpr);
    this.#cv.height = Math.round(this.#H * this.#dpr);
    this.#gl.resizeMask(...this.#maskSize());
    for (const engine of Object.values(this.#engines)) engine.resize(this.#W, this.#H);
    this.#L = this.#computeLayout(this.#top.naturalWidth, this.#top.naturalHeight);
    this.#uploadAll();
    if (!this.#hasHead) {
      const o = this.#orbitPoint(this.#orbitAngle);
      this.#head.x = this.#from.x = o.x;
      this.#head.y = this.#from.y = o.y;
      for (const d of this.#drops) [d.x, d.y] = [o.x, o.y];
      this.#hasHead = true;
    }
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

  /** A random point on the face, for styles that animate on their own. */
  #facePoint() {
    const { cx, cy } = this.#faceCentre();
    const { x, y } = this.#faceSpread();
    const a = Math.random() * TAU;
    const d = Math.sqrt(Math.random());
    return { x: cx + Math.cos(a) * d * x, y: cy + Math.sin(a) * d * y };
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
    const arrived = this.#wasResting && !resting;
    this.#wasResting = resting;

    const engine = this.#engines[this.#style];
    if (engine) {
      engine.frame({
        now,
        dt,
        W: this.#W,
        H: this.#H,
        cursor: this.#cursor,
        pointing: !resting,
        arrived,
        tapped: this.#switchNow,
        reduceMotion: rm,
        active: [0, 1, 2, 3].map((i) => (this.#slots[i]?.img ? 1 : 0)),
        pick: (current) => this.#pickLayer(current),
        facePoint: () => this.#facePoint(),
      });
      this.#switchNow = false;
      requestAnimationFrame((t) => this.#frame(t));
      return;
    }

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

    const balls: Shape["balls"] = [];
    const trails: Shape["trails"] = [];

    // Next layer: when the pointer arrives, on a tap, and (with motion) every few seconds, sooner
    // on hover than at rest. The old head is left behind as trail in its own layer, and the new
    // layer wells up inside it.
    const due = !rm && now > this.#nextSwitch;
    if (arrived || this.#switchNow || due) {
      this.#switchNow = false;
      this.#nextSwitch = now + (resting ? between(3500, 6000) : between(1600, 3200));
      const next = this.#pickLayer(this.#headLayer);
      if (next !== this.#headLayer) {
        if (this.#reveal > 0.01) {
          const grown = 0.3 + 0.7 * smoothstep(this.#headGrow);
          trails.push([head.x, head.y, head.x, head.y, r * grown, this.#headLayer]);
        }
        this.#headLayer = next;
        this.#headGrow = rm ? 1 : 0;
      }
    }
    this.#headGrow = Math.min(1, this.#headGrow + dt / 0.5);
    const rHead = r * (0.3 + 0.7 * smoothstep(this.#headGrow));
    const layer = this.#headLayer;

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

    // Beaded trail: the stamp swells and pinches along the path, so as the trail heals its necks
    // dry first and it breaks into a string of droplets.
    const bead = (travelled: number, R: number) =>
      rm ? R : R * (0.55 + 0.45 * Math.cos((travelled / (R * 0.85)) * TAU));
    const hx = head.x - this.#from.x;
    const hy = head.y - this.#from.y;
    this.#travelled += Math.hypot(hx, hy);
    if (this.#reveal > 0.01)
      trails.push([
        this.#from.x,
        this.#from.y,
        head.x,
        head.y,
        bead(this.#travelled, rHead * 0.9),
        layer,
      ]);
    const shed = (x: number, y: number, vx: number, vy: number, R: number, layer: number) => {
      const v = Math.hypot(vx, vy);
      if (rm || R <= 0 || this.#spray.length >= MAX_SPRAY) return;
      if (Math.random() > clamp01((v - 120) / 900) * 10 * dt) return;
      const ux = vx / v;
      const uy = vy / v;
      const side = (Math.random() - 0.5) * 1.3;
      this.#spray.push({
        x: x - ux * R * 0.8 - uy * R * side,
        y: y - uy * R * 0.8 + ux * R * side,
        vx: vx * 0.3 - uy * side * 90,
        vy: vy * 0.3 + ux * side * 90,
        r: R * (0.1 + Math.random() * 0.12),
        age: 0,
        life: 0.5 + Math.random() * 0.7,
        layer,
      });
    };
    shed(head.x, head.y, head.vx, head.vy, rHead, layer);
    if (!rm) {
      for (let i = 0; i < 3; i++) {
        const ph = i * 2.1 + 0.7;
        const ang = ts * (0.28 + 0.3 * m) * (i % 2 ? -1 : 1) + ph + Math.sin(ts * 0.45 + ph) * 0.7;
        const dist = rHead * (0.42 + 0.16 * Math.sin(ts * (0.4 + 0.3 * m) + ph * 1.3));
        const size = rHead * (0.5 + 0.1 * Math.sin(ts * (0.5 + 0.4 * m) * (1 + i * 0.2) + ph * 2));
        balls.push([head.x + Math.cos(ang) * dist, head.y + Math.sin(ang) * dist, size, layer]);
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
        // A drop that has dried up comes back as a new layer.
        if (d.dry && size > 0) d.layer = this.#pickLayer(d.layer);
        d.dry = size <= 0;
        balls.push([d.x, d.y, size, d.layer]);
        d.travelled += Math.hypot(d.x - d.from.x, d.y - d.from.y);
        if (size > 0 && this.#reveal > 0.01)
          trails.push([d.from.x, d.from.y, d.x, d.y, bead(d.travelled, size * 0.85), d.layer]);
        shed(d.x, d.y, d.vx, d.vy, size, d.layer);
      });
    }
    this.#spray = this.#spray.filter((p) => {
      const x0 = p.x;
      const y0 = p.y;
      const drag = Math.exp(-dt * 4);
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) return false;
      trails.push([x0, y0, p.x, p.y, p.r * (1 - t * t), p.layer]);
      return true;
    });

    const w = rm ? 0 : this.#wobbleClock;
    const active = [0, 1, 2, 3].map((i) => (this.#slots[i]?.img ? 1 : 0));
    this.#gl.draw(
      {
        head: { x: head.x, y: head.y, r: rHead, stretch, dirX, dirY, layer },
        trails,
        decay: steps / 255,
        balls,
        goo: r * (0.34 + 0.1 * (1 - m)),
        soft: 0.6 + (cfg.soft / 100) * r * 0.025,
        wobble: [
          rm ? 0 : (cfg.wobble / 100) * r * (0.07 + 0.04 * m),
          TAU / Math.max(10, r * 1.6),
          (w * 1.3) % TAU,
          (w * 0.9) % TAU,
        ],
        ripple: [
          rm ? 0 : 1.2 + Math.min(speed / 1200, 1.4),
          TAU / Math.max(14, r * 0.32),
          (w * 4.2) % TAU,
        ],
        reveal: this.#reveal,
        bias: r * 0.3,
      },
      this.#W,
      this.#H,
      rRef,
      active,
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
