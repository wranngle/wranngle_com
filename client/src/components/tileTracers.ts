/**
 * Comet-tracer overlay for PolygonTileHero — a faithful port of the WebGL
 * ember tracer system from the operator's comet_tile_gallery_webgl_v4.html
 * prototype.
 *
 * When a tile settles in the hero spotlight, a "pulse" of tracers fans out
 * radially from the hero tile and threads outward along the rounded borders
 * of the ring tiles toward the field edge — each tracer a glowing ember
 * comet with a bright head, a noise-textured fading tail, chromatic
 * aberration, and a burn-in/burn-out envelope, rendered through a WebGL
 * fragment shader with additive blending.
 *
 * The prototype rendered its tiles on a 2D canvas; our hero keeps the tiles
 * as DOM nodes (they carry landing-page <img>/<video>), so this overlay only
 * draws the tracers. It reads each tile's current animated geometry — which
 * the hero's draw loop snapshots onto the tile each frame — so the comet path
 * follows the live lattice at fire time. WebGL output is composited onto a
 * visible 2D overlay canvas that sits above the DOM tiles.
 */

export type TracerParams = {
  tracerCount: number;
  travelTime: number; // ms head takes to traverse the path
  tailLength: number; // tail length as a fraction of path length
  coreWidth: number; // px core thickness (pre-dpr)
  glow: number; // glow falloff strength
  brightness: number;
  headSize: number; // px head radius (pre-dpr)
  burnIn: number; // ms fade-in
  burnOut: number; // ms fade-out after the head reaches the end
  pathSmooth: number; // chaikin iterations
  emberScale: number; // ember noise frequency
  emberFlow: number; // ember noise flow speed
  cometBulge: number; // head bulge of the core
  chroma: number; // chromatic aberration px
  sparkle: number; // ember flicker amount
  exposure: number;
  tracerHue: number; // base hue (deg)
  hueDrift: number; // hue oscillation (deg)
};

// Tuned from the prototype's "Saturated web" preset, hue shifted to the
// Wranngle brand orange (#ff5f00 ≈ 24°) and counts trimmed for our smaller
// field so the embers read rich without clutter.
export const TRACER_DEFAULTS: TracerParams = {
  tracerCount: 14,
  travelTime: 1900,
  tailLength: 1.6,
  coreWidth: 3,
  glow: 9,
  brightness: 2.1,
  headSize: 8,
  burnIn: 240,
  burnOut: 440,
  pathSmooth: 4,
  emberScale: 34,
  emberFlow: 1.2,
  cometBulge: 2.1,
  chroma: 7,
  sparkle: 0.45,
  exposure: 1.45,
  tracerHue: 24,
  hueDrift: 8,
};

/** Per-frame geometry snapshot of a tile, written by the hero draw loop. */
export type TileSnapshot = {
  ring: number;
  ang: number; // baked ring angle (atan2 of the tile's ring offset)
  dx: number;
  dy: number; // current center (CSS px)
  ds: number; // current edge length (CSS px)
  dr: number; // current corner radius (CSS px)
  dt: number; // current rotation (radians)
};

export type Pt = {x: number; y: number};
type TracerPath = {
  cum: number[];
  len: number;
  ribbon: Float32Array | undefined;
  count: number;
  frac: number;
  pts: Pt[];
};
type Pulse = {t0: number; halfW: number; paths: TracerPath[]};

const TAU = Math.PI * 2;

export function angDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

export function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : Math.min(v, hi);
}

/** Polyline tracing the outline of a rounded square centered at (cx,cy). */
export function roundedOutline(o: {
  cx: number;
  cy: number;
  half: number;
  rad: number;
  rot: number;
}): Pt[] {
  const {cx, cy, half, rot} = o;
  const rad = Math.max(0, Math.min(o.rad, half * 0.999));
  const hr = half - rad;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const pts: Pt[] = [];
  const add = (lx: number, ly: number) => {
    pts.push({x: cx + lx * c - ly * s, y: cy + lx * s + ly * c});
  };

  const es = 4;
  const cs = 5;
  let a: number;
  for (let i = 0; i < es; i++) add(-hr + (2 * hr * i) / es, -half);
  for (let i = 0; i < cs; i++) {
    a = -Math.PI / 2 + ((Math.PI / 2) * i) / cs;
    add(hr + rad * Math.cos(a), -hr + rad * Math.sin(a));
  }

  for (let i = 0; i < es; i++) add(half, -hr + (2 * hr * i) / es);
  for (let i = 0; i < cs; i++) {
    a = ((Math.PI / 2) * i) / cs;
    add(hr + rad * Math.cos(a), hr + rad * Math.sin(a));
  }

  for (let i = 0; i < es; i++) add(hr - (2 * hr * i) / es, half);
  for (let i = 0; i < cs; i++) {
    a = Math.PI / 2 + ((Math.PI / 2) * i) / cs;
    add(-hr + rad * Math.cos(a), hr + rad * Math.sin(a));
  }

  for (let i = 0; i < es; i++) add(-half, hr - (2 * hr * i) / es);
  for (let i = 0; i < cs; i++) {
    a = Math.PI + ((Math.PI / 2) * i) / cs;
    add(-hr + rad * Math.cos(a), -hr + rad * Math.sin(a));
  }

  return pts;
}

export function nearestIndex(pts: Pt[], qx: number, qy: number) {
  let bi = 0;
  let bd = 1e18;
  for (const [i, p] of pts.entries()) {
    const dx = p.x - qx;
    const dy = p.y - qy;
    const d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      bi = i;
    }
  }

  return bi;
}

export function routeSpan(
  pts: Pt[],
  iA: number,
  iB: number,
  dir: number,
): Pt[] {
  const n = pts.length;
  const out = [pts[iA]];
  let i = iA;
  let g = 0;
  while (i !== iB && g < n + 2) {
    i = (i + dir + n) % n;
    out.push(pts[i]);
    g++;
  }

  return out;
}

export function dedupe(pts: Pt[]): Pt[] {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const p = out.at(-1)!;
    if (Math.hypot(pts[i].x - p.x, pts[i].y - p.y) > 0.6) out.push(pts[i]);
  }

  return out;
}

export function chaikin(ptsIn: Pt[], iters: number): Pt[] {
  let pts = ptsIn;
  for (let it = 0; it < iters; it++) {
    if (pts.length < 3) break;
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      out.push(
        {x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25},
        {x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75},
      );
    }

    out.push(pts.at(-1)!);
    pts = out;
  }

  return pts;
}

/** For each ring ≥2, pick the tile whose baked angle is closest to theta. */
function buildChain(
  theta: number,
  rings: number,
  ringTiles: TileSnapshot[][],
): TileSnapshot[] {
  const chain: TileSnapshot[] = [];
  for (let k = 2; k <= rings; k++) {
    const list = ringTiles[k];
    if (!list || list.length === 0) continue;
    let best: TileSnapshot | undefined;
    let bd = 1e9;
    for (const t of list) {
      const d = Math.abs(angDiff(t.ang, theta));
      if (d < bd) {
        bd = d;
        best = t;
      }
    }

    if (best) chain.push(best);
  }

  return chain;
}

/**
 * Triangle-strip ribbon (x, y, arc-length, side) for the shader. Uses a
 * miter join at each vertex — the offset normal bisects the incoming and
 * outgoing segments and is lengthened by 1/cos(θ/2) (clamped) so the two
 * ribbon sides don't pinch or cross at corners. A centered-difference
 * normal (the naive approach) folds the ribbon onto itself at sharp turns,
 * which under additive blending shows up as bright glare seams.
 */
export function buildRibbon(
  pts: Pt[],
  cum: number[],
  halfW: number,
): Float32Array {
  const n = pts.length;
  const v: number[] = [];
  const miterLimit = 2.4;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    let inx = cur.x - prev.x;
    let iny = cur.y - prev.y;
    let outx = next.x - cur.x;
    let outy = next.y - cur.y;
    const inl = Math.hypot(inx, iny) || 1;
    const outl = Math.hypot(outx, outy) || 1;
    inx /= inl;
    iny /= inl;
    outx /= outl;
    outy /= outl;
    // Segment normals, then the (normalized) miter direction.
    const ninx = -iny;
    const niny = inx;
    const noutx = -outy;
    const nouty = outx;
    let mx = ninx + noutx;
    let my = niny + nouty;
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml;
    my /= ml;
    // 1/cos(θ/2) = 1/(miter·n_in); clamp so a near-reversal can't blow up.
    const cos = mx * ninx + my * niny;
    const off = halfW * Math.min(miterLimit, 1 / Math.max(0.4, cos));
    v.push(
      cur.x + mx * off,
      cur.y + my * off,
      cum[i],
      1,
      cur.x - mx * off,
      cur.y - my * off,
      cum[i],
      -1,
    );
  }

  return new Float32Array(v);
}

const VERT =
  'attribute vec2 a_pos;attribute float a_arc;attribute float a_side;' +
  'uniform vec2 u_res;varying float v_arc;varying float v_side;' +
  'void main(){v_arc=a_arc;v_side=a_side;vec2 c=(a_pos/u_res)*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);}';

const FRAG = [
  'precision highp float;',
  'varying float v_arc;varying float v_side;',
  'uniform float u_time,u_headArc,u_tailArc,u_headSize,u_bulge;',
  'uniform float u_coreFrac,u_glowK,u_coreI,u_glowI,u_chroma,u_sparkle;',
  'uniform float u_hue,u_bright,u_exposure,u_emberScale,u_emberFlow,u_endFade;',
  'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
  ' float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));',
  ' return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}',
  'float fbm(vec2 p){float v=0.,a=0.55;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+1.7;a*=0.5;}return v;}',
  'vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,0.6666667,0.3333333,3.);',
  ' vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}',
  'float prof(float x,float cf){x=abs(x);float core=smoothstep(cf,cf*0.2,x);',
  ' float gl=exp(-x*x*u_glowK);return core*u_coreI+gl*u_glowI;}',
  'void main(){',
  ' float sd=u_headArc-v_arc;',
  ' float headw=exp(-sd*sd/(u_headSize*u_headSize*0.55+1.0));',
  ' float tail=0.0;',
  ' if(sd>0.0){tail=exp(-sd/max(u_tailArc,1.0));tail*=smoothstep(0.0,u_headSize*0.7+2.0,sd);}',
  ' float fl=fbm(vec2(v_arc*u_emberScale*0.012+u_time*u_emberFlow,sd*0.03+u_time*1.3));',
  ' float along=max(headw,tail*mix(1.0,fl*1.8,clamp(u_sparkle,0.0,1.5)));',
  ' if(along<0.0025){discard;}',
  ' float cf=u_coreFrac*(1.0+headw*u_bulge);',
  ' float caf=u_chroma*0.013;',
  ' float cR=prof(v_side+caf,cf);',
  ' float cG=prof(v_side,cf);',
  ' float cB=prof(v_side-caf,cf);',
  ' vec3 base=hsv2rgb(vec3(u_hue/360.0,0.85,1.0));',
  ' vec3 col=mix(base,vec3(1.0,0.97,0.92),headw);',
  ' vec3 outc=col*vec3(cR,cG,cB)*along*u_bright*u_exposure*u_endFade;',
  ' outc=vec3(1.0)-exp(-outc);',
  ' float a=clamp(max(outc.r,max(outc.g,outc.b)),0.0,1.0);',
  ' gl_FragColor=vec4(outc,a);}',
].join('\n');

const UNIFORM_NAMES = [
  'res',
  'time',
  'headArc',
  'tailArc',
  'headSize',
  'bulge',
  'coreFrac',
  'glowK',
  'coreI',
  'glowI',
  'chroma',
  'sparkle',
  'hue',
  'bright',
  'exposure',
  'emberScale',
  'emberFlow',
  'endFade',
] as const;

function curveP(p: number) {
  // The prototype exposes accelerate/decelerate; we keep it linear.
  return p;
}

function pulseEnv(el: number, life: number, params: TracerParams) {
  const bi = params.burnIn;
  let fin = bi <= 0 ? 1 : Math.min(1, el / bi);
  fin = fin * fin * (3 - 2 * fin);
  const bo = Math.max(40, params.burnOut);
  let fout = el > life ? Math.max(0, 1 - (el - life) / bo) : 1;
  fout = fout * fout * (3 - 2 * fout);
  return Math.min(fin, fout);
}

const MAX_PULSE = 4;

export class TileTracerField {
  private readonly overlay: HTMLCanvasElement;
  private readonly octx: CanvasRenderingContext2D | undefined;
  private readonly glc: HTMLCanvasElement;
  private gl: WebGLRenderingContext | undefined;
  private prog: WebGLProgram | undefined;
  private buf: WebGLBuffer | undefined;
  private readonly u: Record<string, WebGLUniformLocation | undefined> = {};
  private aPos = 0;
  private aArc = 0;
  private aSide = 0;
  private readonly glOK: boolean;
  private pulses: Pulse[] = [];
  private params: TracerParams;

  constructor(
    overlay: HTMLCanvasElement,
    params: TracerParams = TRACER_DEFAULTS,
  ) {
    this.overlay = overlay;
    this.octx = overlay.getContext('2d') ?? undefined;
    this.glc = document.createElement('canvas');
    this.params = params;
    this.glOK = this.initGL();
  }

  setParams(params: TracerParams) {
    this.params = params;
  }

  private compile(type: number, src: string) {
    const gl = this.gl!;
    const s = gl.createShader(type);
    if (!s) return undefined;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return undefined;
    }

    return s;
  }

  private initGL(): boolean {
    const opts: WebGLContextAttributes = {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
      preserveDrawingBuffer: true,
    };
    const gl =
      this.glc.getContext('webgl', opts) ??
      (this.glc.getContext('experimental-webgl', opts) as
        | WebGLRenderingContext
        | undefined);
    if (!gl) return false;
    this.gl = gl;
    const vs = this.compile(gl.VERTEX_SHADER, VERT);
    const fs = this.compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return false;
    }

    this.prog = prog;
    this.buf = gl.createBuffer() ?? undefined;
    for (const name of UNIFORM_NAMES) {
      this.u[name] = gl.getUniformLocation(prog, `u_${name}`) ?? undefined;
    }

    this.aPos = gl.getAttribLocation(prog, 'a_pos');
    this.aArc = gl.getAttribLocation(prog, 'a_arc');
    this.aSide = gl.getAttribLocation(prog, 'a_side');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    // MAX blend (where supported) so overlapping ribbon fragments at
    // corners/turns and crossing tracers take the brighter value instead
    // of summing — additive summing is what produced the glare seams.
    // Each fragment already carries its full core+glow profile, so nothing
    // depends on accumulation within a tracer; only overlaps differ.
    const ext = gl.getExtension('EXT_blend_minmax');
    if (ext) gl.blendEquation(ext.MAX_EXT);
    return true;
  }

  /** Build a pulse from the hero tile outward along the live tile lattice. */
  firePulse(args: {
    clock: number;
    w: number;
    h: number;
    scale: number;
    heroTile: TileSnapshot;
    ringTiles: TileSnapshot[][];
    rings: number;
  }) {
    const {clock, w, h, scale, heroTile, ringTiles, rings} = args;
    const p = this.params;
    if (p.tracerCount <= 0) return;
    const cx = w / 2;
    const cy = h / 2;
    const heroOut = roundedOutline({
      cx: heroTile.dx * scale,
      cy: heroTile.dy * scale,
      half: (heroTile.ds * scale) / 2,
      rad: heroTile.dr * scale,
      rot: heroTile.dt,
    });
    const maxR = Math.hypot(cx, cy) + w * 0.42;
    const count = Math.max(1, Math.round(p.tracerCount));
    const halfW = clamp(
      (p.coreWidth * 1.4 + p.glow * 1.15 + p.headSize * 0.6) * scale,
      8,
      320,
    );
    const sm = Math.round(p.pathSmooth);
    const paths: TracerPath[] = [];

    for (let sidx = 0; sidx < count; sidx++) {
      const theta = -Math.PI / 2 + (TAU * sidx) / count;
      const dir = {x: Math.cos(theta), y: Math.sin(theta)};
      const perp = {x: -Math.sin(theta), y: Math.cos(theta)};
      const startIdx = nearestIndex(
        heroOut,
        cx + dir.x * 99_999,
        cy + dir.y * 99_999,
      );
      const pp: Pt[] = [heroOut[startIdx]];
      const chain = buildChain(theta, rings, ringTiles);
      for (let ci = 0; ci < chain.length; ci++) {
        const t = chain[ci];
        const tcx = t.dx * scale;
        const tcy = t.dy * scale;
        const out = roundedOutline({
          cx: tcx,
          cy: tcy,
          half: (t.ds * scale) / 2,
          rad: t.dr * scale,
          rot: t.dt,
        });
        const prev = pp.at(-1)!;
        const iEntry = nearestIndex(out, prev.x, prev.y);
        const nxt = ci < chain.length - 1 ? chain[ci + 1] : undefined;
        const tgt = nxt
          ? {x: nxt.dx * scale, y: nxt.dy * scale}
          : {x: cx + dir.x * maxR, y: cy + dir.y * maxR};
        const iExit = nearestIndex(out, tgt.x, tgt.y);
        const rP = routeSpan(out, iEntry, iExit, 1);
        const rM = routeSpan(out, iEntry, iExit, -1);
        const midP = rP[Math.floor(rP.length / 2)] ?? out[iEntry];
        const side = (midP.x - tcx) * perp.x + (midP.y - tcy) * perp.y;
        const route = side > 0 === (t.ring % 2 === 0) ? rP : rM;
        for (const r of route) pp.push(r);
      }

      pp.push({x: cx + dir.x * maxR, y: cy + dir.y * maxR});
      const smoothed = chaikin(dedupe(pp), sm);
      const cum = [0];
      for (let i = 1; i < smoothed.length; i++) {
        cum.push(
          cum[i - 1] +
            Math.hypot(
              smoothed[i].x - smoothed[i - 1].x,
              smoothed[i].y - smoothed[i - 1].y,
            ),
        );
      }

      const len = cum.at(-1)!;
      const ribbon = this.glOK ? buildRibbon(smoothed, cum, halfW) : undefined;
      paths.push({
        pts: smoothed,
        cum,
        len,
        ribbon,
        count: ribbon ? ribbon.length / 4 : 0,
        frac: sidx / count,
      });
    }

    this.pulses.push({t0: clock, halfW, paths});
    if (this.pulses.length > MAX_PULSE) this.pulses.shift();
  }

  /** Draw the live pulses for this frame. Returns true if anything drew. */
  render(clock: number, w: number, h: number, scale: number): boolean {
    const p = this.params;
    const maxLife =
      p.burnIn * 0.7 + p.travelTime * (1 + p.tailLength) + p.burnOut + 80;
    this.pulses = this.pulses.filter((pl) => clock - pl.t0 <= maxLife);

    if (this.octx) {
      if (this.overlay.width !== w || this.overlay.height !== h) {
        this.overlay.width = w;
        this.overlay.height = h;
      }

      this.octx.clearRect(0, 0, w, h);
    }

    if (this.pulses.length === 0) return false;

    if (this.glOK) {
      this.renderGL(clock, w, h, scale);
      if (this.octx) this.octx.drawImage(this.glc, 0, 0, w, h);
    } else if (this.octx) {
      this.render2D(this.octx, clock, scale);
    }

    return true;
  }

  private renderGL(clock: number, w: number, h: number, scale: number) {
    const gl = this.gl!;
    const p = this.params;
    if (this.glc.width !== w || this.glc.height !== h) {
      this.glc.width = w;
      this.glc.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.prog!);
    const hue = p.tracerHue + p.hueDrift * Math.sin(clock * 0.0004);
    gl.uniform2f(this.u.res!, w, h);
    gl.uniform1f(this.u.time!, clock * 0.001);
    gl.uniform1f(this.u.headSize!, Math.max(2, p.headSize * scale));
    gl.uniform1f(this.u.bulge!, p.cometBulge);
    gl.uniform1f(this.u.glowK!, 3.1);
    gl.uniform1f(this.u.coreI!, 1.35);
    gl.uniform1f(this.u.glowI!, 0.04 + p.glow * 0.05);
    gl.uniform1f(this.u.chroma!, p.chroma);
    gl.uniform1f(this.u.sparkle!, p.sparkle);
    gl.uniform1f(this.u.hue!, hue);
    gl.uniform1f(this.u.bright!, p.brightness);
    gl.uniform1f(this.u.exposure!, p.exposure);
    gl.uniform1f(this.u.emberScale!, p.emberScale);
    gl.uniform1f(this.u.emberFlow!, p.emberFlow);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf!);
    gl.enableVertexAttribArray(this.aPos);
    gl.enableVertexAttribArray(this.aArc);
    gl.enableVertexAttribArray(this.aSide);

    const tt = p.travelTime;
    const tail = p.tailLength;
    const life = tt * (1 + tail);
    const stag = p.burnIn * 0.7;
    for (const pul of this.pulses) {
      gl.uniform1f(
        this.u.coreFrac!,
        clamp((p.coreWidth * scale) / pul.halfW, 0.02, 0.92),
      );
      for (const path of pul.paths) {
        if (!path.ribbon) continue;
        const el = clock - pul.t0 - path.frac * stag;
        if (el < 0) continue;
        const env = pulseEnv(el, life, p);
        if (env <= 0) continue;
        const prog = curveP(Math.min(1, el / tt));
        const tailArc = tail * path.len * 0.5;
        const headArc = prog * (path.len + tailArc);
        gl.uniform1f(this.u.endFade!, env);
        gl.uniform1f(this.u.headArc!, headArc);
        gl.uniform1f(this.u.tailArc!, Math.max(2, tailArc));
        gl.bufferData(gl.ARRAY_BUFFER, path.ribbon, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(this.aArc, 1, gl.FLOAT, false, 16, 8);
        gl.vertexAttribPointer(this.aSide, 1, gl.FLOAT, false, 16, 12);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, path.count);
      }
    }
  }

  private render2D(g: CanvasRenderingContext2D, clock: number, scale: number) {
    const p = this.params;
    const tt = p.travelTime;
    const tail = p.tailLength;
    const life = tt * (1 + tail);
    const stag = p.burnIn * 0.7;
    const hue = p.tracerHue + p.hueDrift * Math.sin(clock * 0.0004);
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const pul of this.pulses) {
      for (const path of pul.paths) {
        const {pts, cum} = path;
        const el = clock - pul.t0 - path.frac * stag;
        if (el < 0) continue;
        const env = pulseEnv(el, life, p);
        if (env <= 0) continue;
        const prog = curveP(Math.min(1, el / tt));
        const tailArc = tail * path.len * 0.5;
        const headArc = prog * (path.len + tailArc);
        const d0 = Math.max(0, headArc - tailArc);
        const d1 = Math.min(headArc, path.len);
        if (d0 >= path.len) continue;
        g.strokeStyle = `hsla(${hue},96%,64%,${0.8 * env * p.brightness})`;
        g.lineWidth = Math.max(1, p.coreWidth * scale);
        g.beginPath();
        let started = false;
        for (const [i, pt] of pts.entries()) {
          if (cum[i] < d0 || cum[i] > d1) continue;
          if (started) g.lineTo(pt.x, pt.y);
          else {
            g.moveTo(pt.x, pt.y);
            started = true;
          }
        }

        g.stroke();
      }
    }

    g.restore();
  }

  get hasActivePulses() {
    return this.pulses.length > 0;
  }

  dispose() {
    const {gl} = this;
    if (gl) {
      if (this.buf) gl.deleteBuffer(this.buf);
      if (this.prog) gl.deleteProgram(this.prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }

    this.pulses = [];
  }
}
