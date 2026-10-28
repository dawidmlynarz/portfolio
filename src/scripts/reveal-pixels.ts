/**
 * Pixels: the portrait's layers live as colonies of 8 px cells on the figure, run by a small
 * Game-of-Life style automaton on the GPU (ticks 10 times a second).
 *
 * - Rules: a live cell survives with 2–3 live neighbours until it grows old (about 4.5 s); a dead
 *   cell on the figure is born with exactly 3. A newborn takes the layer most of its neighbours
 *   carry, so where two colonies meet they compete cell by cell and the layers weave together.
 * - At rest: a small seed lands somewhere on the face every half second or so, with a layer picked
 *   by weight, and grows or dies by the rules; rarely, a single cell twinkles to a layer for one tick.
 * - The pointer feeds the colonies: around it births need only 2 neighbours, cells age slower and
 *   new cells appear outright. Holding still blooms a dense colony; moving seeds a dotted trail
 *   (one stamp per tick) that breaks up and dies by the same rules. The pointer's layer changes on
 *   arrival, on a tap and every few seconds, so fresh seeds compete with the older colonies.
 * - Reduced motion: no automaton; a still patch of cells under the pointer only.
 *
 * State texture (unit 6, NEAREST, rows bottom-up): r alive (1, 0.5 for a twinkle), g layer / 3,
 * b age.
 */
import {
  between,
  bindLayers,
  HEADER,
  LAYERS,
  program,
  STATE_UNIT,
  texture,
  type Program,
  type StyleEngine,
  type StyleFrame,
} from "./reveal-gl";

const CELL = 8; // CSS px
const TICK = 0.1; // s
const LIFESPAN = 4.5; // s

const STEP = `${HEADER}
uniform sampler2D state,topTex;
uniform vec2 grid;
uniform vec4 feed,seed; // cell x, cell y (rows bottom-up), radius in cells (<0: off), layer
uniform vec4 rnd; // tick seed, twinkle chance, age step, reduced motion
uniform vec3 dens; // feed density, seed density, twinkle layer
vec4 S(vec2 c){return texture2D(state,(c+.5)/grid);}
float layerOf(vec4 s){return floor(s.g*3.+.5);}
void main(){
  vec2 c=floor(gl_FragCoord.xy);
  vec2 px=vec2(c.x+.5,grid.y-c.y-.5)*${CELL}.;
  float figure=step(.5,texture2D(topTex,px/res).a);
  vec4 me=S(c);
  float n=0.;
  vec4 votes=vec4(0.);
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    if(x==0&&y==0)continue;
    vec4 o=S(c+vec2(float(x),float(y)));
    float a=step(.75,o.r);
    n+=a;
    votes+=a*onehot(layerOf(o));
  }
  float r=hash(vec3(c,rnd.x)),r2=hash(vec3(c.yx,rnd.x+7.));
  float fd=feed.z>0.?length(c-feed.xy)/feed.z:9.;
  float fed=step(fd,1.);
  float sd=seed.z>0.?length(c-seed.xy)/seed.z:9.;
  // The layer most live neighbours carry; ties broken at random.
  vec4 tie=votes+.5*vec4(hash(vec3(c,rnd.x+1.)),hash(vec3(c,rnd.x+2.)),hash(vec3(c,rnd.x+3.)),hash(vec3(c,rnd.x+4.)));
  float top=max(max(tie.x,tie.y),max(tie.z,tie.w));
  float major=dot(step(top,tie),vec4(0.,1.,2.,3.));
  float layer=layerOf(me),age=me.b,next=0.;
  if(rnd.w>.5){
    next=fed*figure;
    layer=feed.w;
    age=0.;
  }else if(me.r>.75){
    next=step(1.5,n)*step(n,3.5+fed)*step(age,.999);
    age+=rnd.z*(1.-.6*fed);
  }else if(figure>.5){
    if(step(2.5,n)*step(n,3.5)+fed*step(1.5,n)*step(r,.5)>.5){next=1.;layer=major;age=0.;}
    if(fed*step(r2,dens.x*(1.-fd*.7))>.5){next=1.;layer=feed.w;age=0.;}
    if(step(sd,1.)*step(r2,dens.y)>.5){next=1.;layer=seed.w;age=0.;}
    if(next<.5&&r<rnd.y){next=.5;layer=dens.z;}
  }
  gl_FragColor=vec4(next,layer/3.,age,1.);
}`;

const SHOW = `${HEADER}${LAYERS}
uniform sampler2D state;
uniform vec2 grid;
void main(){
  vec2 p=uv*res;
  vec4 s=texture2D(state,(vec2(floor(p.x/${CELL}.),grid.y-1.-floor(p.y/${CELL}.))+.5)/grid);
  gl_FragColor=over(step(.25,s.r),below(onehot(floor(s.g*3.+.5)),uv));
}`;

export class PixelLife implements StyleEngine {
  #gl: WebGLRenderingContext;
  #step!: Program;
  #show!: Program;
  #targets: { tex: WebGLTexture; fb: WebGLFramebuffer }[] = [];
  #current = 0;
  #grid = { w: 1, h: 1 };
  #W = 1;
  #H = 1;
  #acc = 0;
  #tick = 0;
  #layer = 0;
  #nextSwitch = 0;
  #nextSeed = 0;
  #last = { x: 0, y: 0 };
  #speed = 0;

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
  }

  init() {
    const gl = this.#gl;
    const step = program(gl, STEP, [
      "res",
      "state",
      "topTex",
      "grid",
      "feed",
      "seed",
      "rnd",
      "dens",
    ]);
    const show = program(gl, `${SHOW}`, ["res", "state", "grid", "topTex", "l0", "l1", "l2", "l3"]);
    if (!step || !show) return false;
    this.#step = step;
    this.#show = show;
    gl.activeTexture(gl.TEXTURE0 + STATE_UNIT);
    this.#targets = [0, 1].map(() => ({
      tex: texture(gl, gl.NEAREST),
      fb: gl.createFramebuffer()!,
    }));
    bindLayers(gl, show);
    gl.uniform1i(show.u.state!, STATE_UNIT);
    gl.useProgram(step.p);
    gl.uniform1i(step.u.state!, STATE_UNIT);
    gl.uniform1i(step.u.topTex!, 0);
    this.resize(this.#W, this.#H);
    return true;
  }

  resize(W: number, H: number) {
    const gl = this.#gl;
    this.#W = W;
    this.#H = H;
    this.#grid = { w: Math.ceil(W / CELL), h: Math.ceil(H / CELL) };
    gl.activeTexture(gl.TEXTURE0 + STATE_UNIT);
    for (const { tex, fb } of this.#targets) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      const { w, h } = this.#grid;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  frame(f: StyleFrame) {
    const rm = f.reduceMotion;
    // Pointer speed, for blooming when still and a dotted trail when moving.
    const moved = Math.hypot(f.cursor.x - this.#last.x, f.cursor.y - this.#last.y);
    this.#last = { ...f.cursor };
    this.#speed += (moved / Math.max(f.dt, 1e-3) - this.#speed) * (1 - Math.exp(-f.dt * 8));
    if (f.arrived || f.tapped || (f.pointing && !rm && f.now > this.#nextSwitch)) {
      this.#layer = f.pick(this.#layer);
      this.#nextSwitch = f.now + between(1600, 3200);
    }

    this.#acc += f.dt;
    if (this.#acc < TICK) return;
    this.#acc = Math.min(this.#acc - TICK, TICK);
    this.#tick++;

    const { w, h } = this.#grid;
    const toCell = (p: { x: number; y: number }) => [p.x / CELL - 0.5, h - p.y / CELL - 0.5];
    const still = this.#speed < 80;
    const feed = f.pointing
      ? [...toCell(f.cursor), rm ? 6 : still ? 6 : 3.5, this.#layer]
      : [0, 0, -1, 0];
    let seed = [0, 0, -1, 0];
    if (!f.pointing && !rm && f.now > this.#nextSeed) {
      seed = [...toCell(f.facePoint()), 3, f.pick(-1)];
      this.#nextSeed = f.now + between(300, 700);
    }

    const gl = this.#gl;
    const read = this.#targets[this.#current]!;
    const write = this.#targets[1 - this.#current]!;
    gl.activeTexture(gl.TEXTURE0 + STATE_UNIT);
    gl.bindTexture(gl.TEXTURE_2D, read.tex);
    let u = this.#step.u;
    gl.useProgram(this.#step.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(u.res!, this.#W, this.#H);
    gl.uniform2f(u.grid!, w, h);
    gl.uniform4f(u.feed!, feed[0]!, feed[1]!, feed[2]!, feed[3]!);
    gl.uniform4f(u.seed!, seed[0]!, seed[1]!, seed[2]!, seed[3]!);
    // About 1.5 twinkles a second over the figure (roughly 40% of the box).
    const twinkle = rm ? 0 : (1.5 * TICK) / (w * h * 0.4);
    gl.uniform4f(u.rnd!, this.#tick % 997, twinkle, TICK / LIFESPAN, rm ? 1 : 0);
    gl.uniform3f(u.dens!, still ? 0.35 : 0.7, 0.55, f.pick(-1));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.#current = 1 - this.#current;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, write.tex);
    u = this.#show.u;
    gl.useProgram(this.#show.p);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(u.res!, this.#W, this.#H);
    gl.uniform2f(u.grid!, w, h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
