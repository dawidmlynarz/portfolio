/**
 * <reveal-lab data-mode>: one tile of the reveal playground. The photo on top; three layers below
 * (clay, marble, iridescent: the home portrait's set, themed, weighted the same way). The pointer
 * (or, at rest, a wandering autopilot) drives one of the reveal modes below.
 *
 * Most modes share a paint field: a small RGBA texture, one channel per layer, ping-ponged each
 * frame. The brush stamps a soft disc along the pointer's path into the current layer's channel and
 * the whole field heals over ~1.6 s. Each mode reads the field differently (ink: noisy threshold,
 * dither: ordered dither on chunky pixels, halftone: dot size, shards: one value per Voronoi cell,
 * slices: one value per strip). Lens and wave need no field: they get the pointer and timing.
 *
 * The layer switches when the pointer arrives, on a tap, and every few seconds. Loops pause off
 * screen; reduced motion turns the autopilot off (tiles then only react to the pointer).
 */

type Images = {
  top: string;
  layers: { light: string; dark?: string; weight: number }[];
};
type Point = { x: number; y: number };

const FIELD_SCALE = 0.35; // paint field resolution, relative to CSS pixels
const HEAL = 1.6; // seconds for the field to clear
const between = (a: number, b: number) => a + Math.random() * (b - a);
const smoothstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const loadImage = (url: string) => {
  if (!imageCache.has(url))
    imageCache.set(
      url,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        img.decode().then(() => resolve(img), reject);
      }),
    );
  return imageCache.get(url)!;
};

const isDark = () => document.documentElement.dataset.theme === "dark";

const VERTEX = `attribute vec2 p;varying vec2 uv;
void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;

const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;
uniform vec2 res;
`;

// Stamps a soft disc along the brush path into one channel; everything heals by `decay`.
const PAINT = `${HEAD}
uniform sampler2D prev;
uniform vec4 seg;
uniform vec2 brush; // radius, channel
uniform float decay;
void main(){
  vec2 p=uv*res;
  vec4 v=texture2D(prev,vec2(uv.x,1.-uv.y))-decay;
  vec2 a=seg.xy,ab=seg.zw-a;
  float h=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-4),0.,1.);
  float s=1.-smoothstep(brush.x*.55,brush.x,length(p-a-ab*h));
  v=max(v,vec4(equal(vec4(brush.y),vec4(0.,1.,2.,3.)))*s);
  gl_FragColor=v;
}`;

const COMMON = `${HEAD}
uniform sampler2D topTex,l0,l1,l2,field;
uniform vec3 active,cur,prev;
uniform vec4 ptr; // x, y (px), speed, radius
uniform vec4 anim; // time, grow (0-1), wave radius, unused
uniform vec2 wave; // wave centre
uniform vec4 base,next; // wave: one-hot over top, l0, l1, l2
vec4 F(vec2 q){return texture2D(field,vec2(q.x,1.-q.y));}
float V(vec4 f){vec3 g=f.xyz*active;return max(g.x,max(g.y,g.z));}
vec3 hot(vec4 f){vec3 g=f.xyz*active;float m=max(g.x,max(g.y,g.z));return step(m-1e-4,g)*step(1e-3,m);}
vec4 below(vec3 w,vec2 q){
  return (texture2D(l0,q)*w.x+texture2D(l1,q)*w.y+texture2D(l2,q)*w.z)/max(w.x+w.y+w.z,1e-3);
}
vec4 img4(vec4 w,vec2 q){return texture2D(topTex,q)*w.x+below(w.yzw,q)*(w.y+w.z+w.w);}
vec4 over(vec2 q,float a,vec4 b){vec4 t=texture2D(topTex,q)*(1.-a);return t+b*a*(1.-t.a);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){return .5*noise(p)+.25*noise(p*2.03)+.125*noise(p*4.01)+.125*noise(p*8.);}
float bayer2(vec2 a){a=floor(a);return fract(a.x/2.+a.y*a.y*.75);}
float bayer8(vec2 a){return bayer2(.25*a)*.0625+bayer2(.5*a)*.25+bayer2(a);}
`;

const MODES: Record<string, string> = {
  // A lens with an iris: the new layer opens from the centre inside the old one.
  lens: `void main(){
    vec2 p=uv*res,c=ptr.xy;float r=ptr.w,d=length(p-c);
    float a=1.-smoothstep(r-1.,r+1.,d);
    vec2 n=(p-c)/max(d,1e-3);float bend=pow(clamp(d/r,0.,1.),3.);
    vec2 q=(c+(p-c)*.86)/res-n*bend*12./res;
    vec3 w=mix(prev,cur,1.-smoothstep(r*anim.y-1.,r*anim.y+1.,d));
    vec4 b=below(w,q);
    b.r=mix(b.r,below(w,q-n*bend*3./res).r,.8);
    float rim=(smoothstep(r-4.,r-1.,d)-smoothstep(r-1.,r+1.,d))*.35;
    vec4 o=over(uv,a,b);
    gl_FragColor=o+vec4(rim)*a;
  }`,
  // Ink soaking through paper: a noisy threshold of the field, with a dark rim.
  ink: `void main(){
    vec2 p=uv*res;vec4 f=F(uv);float v=V(f);
    float n=fbm(p*.03+anim.x*.12);
    float e=v+(n-.5)*.95;
    float a=smoothstep(.42,.45,e);
    float rim=smoothstep(.3,.42,e)*(1.-a);
    vec4 b=below(hot(f),uv);
    vec4 o=over(uv,a,b);
    gl_FragColor=mix(o,vec4(0.,0.,0.,o.a),rim*.55*o.a);
  }`,
  // Ordered dither on 6 px cells.
  dither: `void main(){
    vec2 cell=floor(uv*res/6.);vec2 q=(cell*6.+3.)/res;vec4 f=F(q);
    float a=step(bayer8(cell)+.02,V(f)*1.1);
    gl_FragColor=over(uv,a,below(hot(f),uv));
  }`,
  // Voronoi glass: each cell takes the field value at its seed and flips past its own threshold.
  shards: `void main(){
    vec2 p=uv*res,g=p/64.,i=floor(g);
    float d1=1e4,d2=1e4;vec2 seed;
    for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
      vec2 c=i+vec2(x,y),s=c+.15+.7*hash2(c);float d=length(g-s);
      if(d<d1){d2=d1;d1=d;seed=s;}else if(d<d2)d2=d;
    }
    float t=.2+.55*hash(seed*1.7);vec4 f=F(seed*64./res);
    float a=step(t,V(f));
    vec2 shift=(hash2(seed*3.1)-.5)*10.*a/res;
    float edge=(1.-smoothstep(.0,.035,d2-d1))*a;
    vec4 o=over(uv+shift,a,below(hot(f),uv+shift));
    gl_FragColor=mix(o,vec4(0.,0.,0.,o.a),edge*.6*o.a);
  }`,
  // Strips slide sideways and swap layers; the slide grows with pointer speed.
  slices: `void main(){
    vec2 p=uv*res;float row=floor(p.y/14.),r=hash(vec2(row,7.));
    float cy=(row*14.+7.)/res.y;vec4 f=F(vec2(uv.x,cy));float v=V(f);
    float off=(r-.5)*(30.+ptr.z*.08)*v;
    vec2 q=uv+vec2(off/res.x,0.);vec4 f2=F(vec2(q.x,cy));
    float a=step(.3+.4*r,V(f2));
    vec3 w=hot(f2);vec4 b=below(w,q);
    b.r=below(w,q+vec2(4./res.x,0.)).r;b.b=below(w,q-vec2(4./res.x,0.)).b;
    gl_FragColor=over(uv,a,b);
  }`,
  // A ring sweeps out from the pointer and swaps the whole portrait to the next layer.
  wave: `void main(){
    vec2 p=uv*res,c=wave;float d=length(p-c),R=anim.z;
    float band=1.-smoothstep(0.,42.,abs(d-R));
    vec2 n=(p-c)/max(d,1e-3);
    vec2 q=uv-n*band*sin((d-R)*.15)*10./res;
    float inside=1.-smoothstep(R-1.,R+1.,d);
    vec4 o=mix(img4(base,q),img4(next,q),inside);
    gl_FragColor=o+vec4(band*.12*o.a);
  }`,
};
// Dots on a 45° grid, sized by the field at each dot's centre.
MODES.halftone = `void main(){
  vec2 p=uv*res;
  vec2 g=mat2(.7071,-.7071,.7071,.7071)*p/12.;
  vec2 c=floor(g)+.5;
  vec2 cp=mat2(.7071,.7071,-.7071,.7071)*c*12.;
  vec4 f=F(cp/res);float v=V(f);
  float d=length(fract(g)-.5),r=v*.78;
  float a=1.-smoothstep(r-.05,r+.05,d);
  a*=step(.02,v);
  gl_FragColor=over(uv,a,below(hot(f),uv));
}`;

type Program = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };

class RevealLab extends HTMLElement {
  #abort = new AbortController();
  #gl!: WebGLRenderingContext;
  #paint!: Program;
  #show!: Program;
  #targets: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = [];
  #images: WebGLTexture[] = [];
  #current = 0;
  #mode = "lens";
  #data!: Images;
  #loaded: (HTMLImageElement | null)[] = [null, null, null, null]; // top, layers
  #W = 1;
  #H = 1;
  #rm = false;

  #visible = false;
  #running = false;
  #last = 0;
  #over = false;
  #wasOver = false;
  #pointer: Point = { x: 0, y: 0 };
  #brush: Point & { vx: number; vy: number } = { x: 0, y: 0, vx: 0, vy: 0 };
  #from: Point = { x: 0, y: 0 };
  #layer = 0;
  #prevLayer = 0;
  #grow = 1;
  #nextSwitch = 0;
  #switchNow = false;
  #wanderSeed = Math.random() * 100;
  #decayDebt = 0;
  // wave
  #base = 0; // 0 top, 1–3 layers
  #next = 0;
  #waveR = -1;
  #waveC: Point = { x: 0, y: 0 };

  connectedCallback() {
    this.#mode = this.dataset.mode ?? "lens";
    this.#data = JSON.parse(this.dataset.images ?? "{}") as Images;
    this.#rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = this.querySelector("canvas");
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!canvas || !gl || !this.#init(gl)) return;

    const { signal } = this.#abort;
    const io = new IntersectionObserver(
      (entries) => {
        this.#visible = entries.some((e) => e.isIntersecting);
        if (this.#visible) void this.#load().then(() => this.#kick());
      },
      { rootMargin: "300px" },
    );
    io.observe(this);
    signal.addEventListener("abort", () => io.disconnect());
    new ResizeObserver(() => this.#resize()).observe(this);

    const local = (e: PointerEvent) => {
      const r = this.getBoundingClientRect();
      this.#pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    this.addEventListener(
      "pointerenter",
      (e) => {
        local(e);
        this.#over = true;
      },
      { signal },
    );
    this.addEventListener(
      "pointermove",
      (e) => {
        local(e);
        this.#over = true;
        this.#kick();
      },
      { signal },
    );
    this.addEventListener("pointerleave", () => (this.#over = false), { signal });
    this.addEventListener(
      "pointerdown",
      (e) => {
        local(e);
        this.#switchNow = true;
        this.#kick();
      },
      { signal },
    );
    document.addEventListener(
      "themechange",
      () => {
        this.#loaded = [this.#loaded[0]!, null, null, null];
        void this.#load();
      },
      { signal },
    );
    document.addEventListener("visibilitychange", () => this.#kick(), { signal });
  }

  disconnectedCallback() {
    this.#abort.abort();
    this.#abort = new AbortController();
    this.#running = false;
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

  #texture() {
    const gl = this.#gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    return tex;
  }

  #init(gl: WebGLRenderingContext) {
    this.#gl = gl;
    const paint = this.#program(PAINT, ["res", "prev", "seg", "brush", "decay"]);
    const samplers = ["topTex", "l0", "l1", "l2", "field"];
    const show = this.#program(`${COMMON}\n${MODES[this.#mode] ?? MODES.lens}`, [
      ...samplers,
      ...["res", "active", "cur", "prev", "ptr", "anim", "wave", "base", "next"],
    ]);
    if (!paint || !show) return false;
    this.#paint = paint;
    this.#show = show;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.#images = [0, 1, 2, 3].map((i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      return this.#texture();
    });
    gl.activeTexture(gl.TEXTURE4);
    this.#targets = [0, 1].map(() => ({ tex: this.#texture(), fb: gl.createFramebuffer()! }));
    gl.useProgram(show.p);
    samplers.forEach((name, i) => gl.uniform1i(show.u[name]!, i));
    gl.useProgram(paint.p);
    gl.uniform1i(paint.u.prev!, 4);
    return true;
  }

  async #load() {
    const dark = isDark();
    const urls = [this.#data.top, ...this.#data.layers.map((l) => (dark && l.dark) || l.light)];
    await Promise.all(
      urls.map(async (url, i) => {
        if (this.#loaded[i]) return;
        try {
          const img = await loadImage(url);
          this.#loaded[i] = img;
          this.#upload(i);
        } catch {
          // that layer stays out
        }
      }),
    );
    if (this.#loaded[0]) this.dataset.ready = "";
  }

  #upload(i: number) {
    const img = this.#loaded[i];
    if (!img) return;
    const gl = this.#gl;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, this.#images[i]!);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  }

  #resize() {
    const rect = this.getBoundingClientRect();
    this.#W = Math.max(1, rect.width);
    this.#H = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const canvas = this.#gl.canvas as HTMLCanvasElement;
    canvas.width = Math.round(this.#W * dpr);
    canvas.height = Math.round(this.#H * dpr);
    const gl = this.#gl;
    gl.activeTexture(gl.TEXTURE4);
    for (const { tex, fb } of this.#targets) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const w = Math.ceil(this.#W * FIELD_SCALE);
      const h = Math.ceil(this.#H * FIELD_SCALE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.#kick();
  }

  /** A loaded layer (0–2) other than `not`, weighted. */
  #pick(not: number) {
    const ready = this.#data.layers
      .map((l, i) => ({ i, w: this.#loaded[i + 1] ? l.weight : 0 }))
      .filter((c) => c.w > 0 && c.i !== not);
    let roll = Math.random() * ready.reduce((s, c) => s + c.w, 0);
    for (const c of ready) if ((roll -= c.w) <= 0) return c.i;
    return ready[ready.length - 1]?.i ?? not;
  }

  #kick() {
    if (this.#running || !this.#visible || document.hidden || !this.#loaded[0]) return;
    this.#running = true;
    this.#last = performance.now();
    requestAnimationFrame((t) => this.#frame(t));
  }

  #frame(now: number) {
    if (!this.#running || !this.#visible || document.hidden) {
      this.#running = false;
      return;
    }
    const gl = this.#gl;
    const dt = Math.min(0.1, (now - this.#last) / 1000);
    this.#last = now;
    const ts = now / 1000;
    const W = this.#W;
    const H = this.#H;
    const auto = !this.#over && !this.#rm;

    // Target: the pointer, or a slow wander around the face at rest.
    const s = this.#wanderSeed;
    const target = this.#over
      ? this.#pointer
      : {
          x: W * (0.5 + 0.2 * Math.sin(ts * 0.53 + s) + 0.06 * Math.sin(ts * 1.7 + s * 2)),
          y: H * (0.42 + 0.2 * Math.sin(ts * 0.71 + s * 3) + 0.05 * Math.cos(ts * 1.3 + s)),
        };
    const b = this.#brush;
    this.#from = { x: b.x, y: b.y };
    const k = 1 - Math.exp(-dt * (this.#over ? 14 : 3));
    b.vx = (target.x - b.x) * k;
    b.vy = (target.y - b.y) * k;
    b.x += b.vx;
    b.y += b.vy;
    const speed = Math.hypot(b.vx, b.vy) / Math.max(dt, 1e-3);

    // Layer switching.
    const arrived = this.#over && !this.#wasOver;
    this.#wasOver = this.#over;
    const due = (this.#over || auto) && now > this.#nextSwitch;
    if (arrived || this.#switchNow || due) {
      this.#switchNow = false;
      this.#nextSwitch = now + (this.#over ? between(1800, 3000) : between(2600, 4200));
      const next = this.#pick(this.#layer);
      if (next !== this.#layer) {
        this.#prevLayer = this.#layer;
        this.#layer = next;
        this.#grow = 0;
      }
      if (this.#mode === "wave" && this.#waveR < 0) {
        this.#next = this.#base === 0 ? 1 + this.#layer : 0;
        this.#waveC = { x: b.x, y: b.y };
        this.#waveR = 0;
      }
    }
    this.#grow = Math.min(1, this.#grow + dt / 0.45);
    const maxR = Math.hypot(W, H);
    if (this.#waveR >= 0) {
      this.#waveR += dt * maxR * 1.1;
      if (this.#waveR > maxR) {
        this.#base = this.#next;
        this.#waveR = -1;
      }
    }

    // 1. Paint (all but lens and wave read it).
    const read = this.#targets[this.#current]!;
    const write = this.#targets[1 - this.#current]!;
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, read.tex);
    gl.useProgram(this.#paint.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
    gl.viewport(0, 0, Math.ceil(W * FIELD_SCALE), Math.ceil(H * FIELD_SCALE));
    let u = this.#paint.u;
    gl.uniform2f(u.res!, W, H);
    gl.uniform4f(u.seg!, this.#from.x, this.#from.y, b.x, b.y);
    const showing = this.#over || auto;
    gl.uniform2f(u.brush!, showing ? Math.sqrt(W * H) * 0.16 : -1, this.#layer);
    this.#decayDebt += (dt / HEAL) * 255;
    const steps = Math.floor(this.#decayDebt);
    this.#decayDebt -= steps;
    gl.uniform1f(u.decay!, steps / 255);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.#current = 1 - this.#current;

    // 2. Show.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, write.tex);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(this.#show.p);
    u = this.#show.u;
    const oneHot = (i: number) =>
      [0, 1, 2].map((j) => (i === j ? 1 : 0)) as [number, number, number];
    const oneHot4 = (i: number) =>
      [0, 1, 2, 3].map((j) => (i === j ? 1 : 0)) as [number, number, number, number];
    gl.uniform2f(u.res!, W, H);
    gl.uniform3f(
      u.active!,
      ...([1, 2, 3].map((i) => (this.#loaded[i] ? 1 : 0)) as [number, number, number]),
    );
    gl.uniform3f(u.cur!, ...oneHot(this.#layer));
    gl.uniform3f(u.prev!, ...oneHot(this.#prevLayer));
    const lensR = showing ? Math.min(W, H) * 0.24 * (this.#over ? 1 : 0.85) : 0;
    gl.uniform4f(u.ptr!, b.x, b.y, speed, lensR);
    gl.uniform4f(u.anim!, ts % 1000, smoothstep(clamp01(this.#grow)), this.#waveR, 0);
    gl.uniform2f(u.wave!, this.#waveC.x, this.#waveC.y);
    gl.uniform4f(u.base!, ...oneHot4(this.#base));
    gl.uniform4f(u.next!, ...oneHot4(this.#next));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame((t) => this.#frame(t));
  }
}

if (!customElements.get("reveal-lab")) customElements.define("reveal-lab", RevealLab);

export {};
