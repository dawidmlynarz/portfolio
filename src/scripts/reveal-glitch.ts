/**
 * Glitch: the portrait is a weak video signal. Everything happens in horizontal 6 px rows.
 *
 * - At rest: two tracking bands roll slowly down the picture, as on a mistracked VHS tape. Inside
 *   them the rows show another layer, slightly torn sideways; each time a band wraps it picks a new
 *   layer and comes back in after a random gap, so the distance between the two keeps changing.
 *   Every 6–8 s a hiccup tears a few rows elsewhere for about 150 ms.
 * - The pointer is interference, like a magnet held near a CRT: the band snaps to its height and
 *   widens, and its rows open across a span around the pointer with ragged ends. Speed drives the
 *   tearing (rows jump sideways, colours split); holding still lets the signal settle into a clean
 *   view. Rows the band leaves behind hold for a moment, then close one at a time. A layer switch
 *   (on arrival, on a tap and every 3–5 s) is a hiccup; hiccups have a 1.4 s cooldown.
 * - Leaving: the band lets go and rolls on from where it was. The second band waits during hover.
 * - Reduced motion: no rolling band or hiccups; a clean band at the pointer only.
 *
 * Row data lives in JS and is uploaded each frame as a rows × 2 texture (unit 6, NEAREST):
 * row 0 = left, right, offset, open; row 1 = layer, colour split.
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

const ROW = 6; // CSS px
const HICCUP = 0.15; // s
const COOLDOWN = 1400; // ms between bursts

const SHOW = `${HEADER}${LAYERS}
uniform sampler2D rows;
uniform float count;
void main(){
  vec2 p=uv*res;
  float v=(floor(p.y/${ROW}.)+.5)/count;
  vec4 a=texture2D(rows,vec2(v,.25)),b=texture2D(rows,vec2(v,.75));
  float off=a.b*255.-128.;
  float x=p.x-off;
  float open=a.a*step(a.r*res.x,x)*step(x,a.g*res.x);
  vec4 w=onehot(floor(b.r*3.+.5));
  vec2 q=uv-vec2(off/res.x,0.);
  vec2 split=vec2(b.g*10./res.x,0.);
  vec4 c=below(w,q);
  c.r=below(w,q+split).r;
  c.b=below(w,q-split).b;
  gl_FragColor=over(open,c);
}`;

type Row = {
  open: number;
  hold: number; // s left before it closes
  left: number;
  right: number;
  offset: number;
  layer: number;
  ragged: [number, number]; // how far past the span each end reaches, 0–1
};

export class GlitchSignal implements StyleEngine {
  #gl: WebGLRenderingContext;
  #show!: Program;
  #tex!: WebGLTexture;
  #W = 1;
  #H = 1;
  #rows: Row[] = [];
  #data = new Uint8Array(4);
  #band = { y: 0, vy: 0, half: 0 };
  #restLayer = 0;
  #second = { y: NaN, layer: 0 }; // the other resting band
  #layer = 0;
  #nextSwitch = 0;
  #nextHiccup = 0;
  #burstAt = -1e4;
  #energy = 0; // burst, decays in about half a second
  #hiccup = { from: 0, to: -1, until: 0, layer: 0 };
  #last = { x: 0, y: 0 };
  #speed = 0;
  #jitterAt = 0;

  constructor(gl: WebGLRenderingContext) {
    this.#gl = gl;
  }

  init() {
    const gl = this.#gl;
    const show = program(gl, SHOW, ["res", "rows", "count", "topTex", "l0", "l1", "l2", "l3"]);
    if (!show) return false;
    this.#show = show;
    gl.activeTexture(gl.TEXTURE0 + STATE_UNIT);
    this.#tex = texture(gl, gl.NEAREST);
    bindLayers(gl, show);
    gl.uniform1i(show.u.rows!, STATE_UNIT);
    this.resize(this.#W, this.#H);
    return true;
  }

  resize(W: number, H: number) {
    this.#W = W;
    this.#H = H;
    const count = Math.max(1, Math.ceil(H / ROW));
    this.#rows = Array.from({ length: count }, (_, i) => this.#rows[i] ?? this.#row());
    this.#data = new Uint8Array(count * 2 * 4);
  }

  #row(): Row {
    return {
      open: 0,
      hold: 0,
      left: 0,
      right: 0,
      offset: 0,
      layer: 0,
      ragged: [Math.random(), Math.random()],
    };
  }

  /** Where a band that rolled off the bottom comes back in: above the top, at a random gap. */
  #reenter(half: number, other: number, H: number) {
    return Math.min(-half, other - H * 0.2) - H * between(0, 0.35);
  }

  /** A burst of tearing, unless one started within the cooldown. */
  #burst(now: number, amount: number, rm: boolean) {
    if (rm || now - this.#burstAt < COOLDOWN) return false;
    this.#burstAt = now;
    this.#energy = Math.max(this.#energy, amount);
    return true;
  }

  frame(f: StyleFrame) {
    const { now, dt, W, H, cursor } = f;
    const rm = f.reduceMotion;
    const band = this.#band;

    const moved = Math.hypot(cursor.x - this.#last.x, cursor.y - this.#last.y);
    this.#last = { ...cursor };
    this.#speed += (moved / Math.max(dt, 1e-3) - this.#speed) * (1 - Math.exp(-dt * 8));
    this.#energy *= Math.exp(-dt * 4.5);

    // Layer switches are hiccups.
    if (f.arrived || f.tapped || (f.pointing && !rm && now > this.#nextSwitch)) {
      this.#layer = f.pick(this.#layer);
      this.#nextSwitch = now + between(3200, 5000);
      this.#burst(now, 1, rm);
    }
    // Moving fast tears the signal, within the same cooldown.
    if (f.pointing && this.#speed > 1400) this.#burst(now, 0.6, rm);

    // The band: rolls at rest, locks onto the pointer's height on hover.
    if (f.pointing) {
      const omega = 16;
      const e = band.y - cursor.y;
      const k = (band.vy + omega * e) * dt;
      const decay = Math.exp(-omega * dt);
      band.y = cursor.y + (e + k) * decay;
      band.vy = (band.vy - omega * k) * decay;
      band.half += (H * 0.07 - band.half) * (1 - Math.exp(-dt * 10));
    } else {
      band.vy = 0;
      band.half += ((rm ? 0 : H * 0.03) - band.half) * (1 - Math.exp(-dt * 3));
      if (!rm) band.y += H * 0.08 * dt;
      if (band.y - band.half > H) {
        band.y = this.#reenter(band.half, this.#second.y, H);
        this.#restLayer = f.pick(this.#restLayer);
      }
    }
    const second = this.#second;
    if (Number.isNaN(second.y)) {
      second.y = band.y - H * between(0.3, 0.6);
      second.layer = f.pick(-1);
    }
    if (!f.pointing && !rm) {
      second.y += H * 0.08 * dt;
      if (second.y - band.half > H) {
        second.y = this.#reenter(band.half, band.y, H);
        second.layer = f.pick(second.layer);
      }
    }

    // Rare hiccup at rest: a few rows elsewhere tear for a moment.
    if (!f.pointing && !rm && now > this.#nextHiccup) {
      this.#nextHiccup = now + between(6000, 8000);
      if (this.#burst(now, 1, rm)) {
        const from = Math.floor(Math.random() * this.#rows.length);
        this.#hiccup = {
          from,
          to: from + 3 + Math.floor(Math.random() * 4),
          until: now + HICCUP * 1000,
          layer: f.pick(this.#restLayer),
        };
      }
    }

    // Tearing: speed and bursts; at rest the band only shimmers a little.
    const e = rm ? 0 : Math.max(this.#energy, f.pointing ? Math.min(1, this.#speed / 2400) : 0);
    const rejitter = now > this.#jitterAt;
    if (rejitter) this.#jitterAt = now + 1000 / 14;
    const span = W * 0.24;
    const hiccup = now < this.#hiccup.until ? this.#hiccup : null;

    this.#rows.forEach((row, i) => {
      const y = (i + 0.5) * ROW;
      const inBand =
        band.half > 1 && Math.abs(y - band.y) < band.half * (0.8 + 0.4 * row.ragged[0]);
      const inSecond =
        !f.pointing &&
        band.half > 1 &&
        Math.abs(y - second.y) < band.half * (0.8 + 0.4 * row.ragged[1]);
      const inHiccup = hiccup && i >= hiccup.from && i < hiccup.to;
      if (inSecond && !inBand) {
        row.open = 1;
        row.hold = between(0.1, 0.7);
        row.layer = second.layer;
        row.left = 0;
        row.right = W;
      } else if (inBand) {
        row.open = 1;
        row.hold = between(0.1, 0.7);
        row.layer = f.pointing ? this.#layer : this.#restLayer;
        if (f.pointing) {
          row.left = cursor.x - span * (0.5 + row.ragged[0]);
          row.right = cursor.x + span * (0.5 + row.ragged[1]);
        } else {
          row.left = 0;
          row.right = W;
        }
      } else if (inHiccup) {
        row.open = 1;
        row.hold = 0;
        row.layer = hiccup.layer;
        row.left = 0;
        row.right = W;
      } else if (row.open > 0) {
        // Rows left behind hold for a moment, then close one at a time.
        row.hold -= dt;
        if (row.hold <= 0) {
          row.open = 0;
          row.ragged = [Math.random(), Math.random()];
        }
      }
      if (rejitter) {
        const tear = Math.random() > 0.45 ? (Math.random() - 0.5) * 2 : 0;
        const shimmer = f.pointing || rm ? 0 : (Math.random() - 0.5) * 6;
        row.offset = inHiccup ? (Math.random() - 0.5) * 80 : tear * e * 60 + shimmer;
      }
    });

    // Upload: row 0 = left, right, offset, open; row 1 = layer, colour split.
    const n = this.#rows.length;
    const d = this.#data;
    const byte = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
    this.#rows.forEach((row, i) => {
      d.set(
        [
          byte((row.left / W) * 255),
          byte((row.right / W) * 255),
          byte(row.offset + 128),
          row.open ? 255 : 0,
        ],
        i * 4,
      );
      d.set([byte((row.layer / 3) * 255), byte(e * 255), 0, 255], (n + i) * 4);
    });
    const gl = this.#gl;
    gl.activeTexture(gl.TEXTURE0 + STATE_UNIT);
    gl.bindTexture(gl.TEXTURE_2D, this.#tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);

    gl.useProgram(this.#show.p);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(this.#show.u.res!, W, H);
    gl.uniform1f(this.#show.u.count!, n);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
