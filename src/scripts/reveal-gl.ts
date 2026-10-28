/**
 * WebGL pieces for the portrait's glitch reveal (portrait-reveal.ts and reveal-glitch.ts). One
 * full-screen quad; every pass is a fragment shader over it.
 *
 * Texture units are fixed for the whole canvas: 0 the top image, 1–4 the layers, 5 the glitch's
 * row state.
 */

export type Program = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };

/** What the glitch gets each frame from <portrait-reveal>, in CSS pixels and seconds. */
export type StyleFrame = {
  now: number; // ms
  dt: number; // s
  W: number;
  H: number;
  cursor: { x: number; y: number };
  pointing: boolean; // hover, or a finger shortly after a tap
  arrived: boolean; // the pointer came over the portrait this frame
  tapped: boolean;
  reduceMotion: boolean;
  pick: (current: number) => number; // a loaded layer by weight (may return `current`)
};

export const STATE_UNIT = 5;

export const VERTEX = `attribute vec2 p;varying vec2 uv;
void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;

export const HEADER = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;
uniform vec2 res;
vec4 onehot(float c){return vec4(equal(vec4(c),vec4(0.,1.,2.,3.)));}
`;

/** Samples the layers by a weight per slot and lays them under the top image. */
export const LAYERS = `
uniform sampler2D topTex,l0,l1,l2,l3;
vec4 below(vec4 w,vec2 q){
  return (texture2D(l0,q)*w.x+texture2D(l1,q)*w.y+texture2D(l2,q)*w.z+texture2D(l3,q)*w.w)
    /max(w.x+w.y+w.z+w.w,1e-3);
}
vec4 over(float a,vec4 b){vec4 t=texture2D(topTex,uv)*(1.-a);return t+b*a*(1.-t.a);}
`;
export const LAYER_SAMPLERS = ["topTex", "l0", "l1", "l2", "l3"];

export function program(gl: WebGLRenderingContext, fragment: string, uniforms: string[]) {
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
  return { p, u } as Program;
}

/** A texture on the active unit; NEAREST for state that must not blend between rows. */
export function texture(gl: WebGLRenderingContext, filter: number = gl.LINEAR) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  return tex;
}

/** Points a program's layer samplers at units 0–4. */
export function bindLayers(gl: WebGLRenderingContext, prog: Program) {
  gl.useProgram(prog.p);
  LAYER_SAMPLERS.forEach((name, i) => gl.uniform1i(prog.u[name]!, i));
}

export const between = (a: number, b: number) => a + Math.random() * (b - a);
