import React, {useEffect, useRef} from 'react';
import {useReducedMotion} from 'framer-motion';

/**
 * FeatureGlyphs — rope-narrated card animations for the #features section.
 *
 * One brand metaphor (the lasso) tells all three cards:
 *  - RadarWatchdog    → rope-comet orbits a clock; each beat catches a missed call.
 *  - SpectralAnalyzer → rope-loop sieve filters a stream of falling leads.
 *  - SynapseLink      → rope arc whips from a pulsing call orb to the handler orb.
 *
 * Each animation is a pure `(ctx, w, h, t) => void`. State is derived from `t`
 * every frame, so the loop is exact and `prefers-reduced-motion` users just see
 * a frozen representative frame.
 */

const TAU = Math.PI * 2;
const SUNSET = '255,95,0';
const SAND = '252,250,245';
const FROZEN_T = 2.5; // representative beat used when reduced-motion is on

const clamp01 = (x: number) => (x < 0 ? 0 : Math.min(x, 1));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const hash = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43_758.5453;
  return x - Math.floor(x);
};

type Painter = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
) => void;

function bg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createRadialGradient(
    w / 2,
    h * 0.55,
    0,
    w / 2,
    h * 0.55,
    Math.max(w, h) * 0.95,
  );
  g.addColorStop(0, `rgba(${SUNSET},0.05)`);
  g.addColorStop(0.6, `rgba(${SUNSET},0.012)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function additive(ctx: CanvasRenderingContext2D, fn: () => void) {
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  fn();
  ctx.globalCompositeOperation = prev;
}

function glowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  color = SUNSET,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${alpha})`);
  g.addColorStop(0.4, `rgba(${color},${alpha * 0.6})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function ropeSegment(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  alpha: number,
) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(${SUNSET},${alpha * 0.35})`;
  ctx.lineWidth = width * 3;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${SAND},${alpha * 0.85})`;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function scanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // skip on small viewports where the zebra reads as noise; soft elsewhere
  if (h < 150) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  ctx.restore();
}

/* -------- 1 / Coverage: rope-comet orbits the clock, catches missed calls -------- */
const paintCoverage: Painter = (ctx, w, h, t) => {
  const LOOP = 6;
  const phase = (t % LOOP) / LOOP;
  bg(ctx, w, h);

  const cx = w / 2;
  const cy = h / 2 - 4;
  const R = Math.min(w, h) * 0.35;

  ctx.strokeStyle = `rgba(${SUNSET},0.22)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${SAND},0.06)`;
  ctx.beginPath();
  ctx.arc(cx, cy, R + 6, 0, TAU);
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU - Math.PI / 2;
    const major = i % 3 === 0;
    const r1 = R - (major ? 8 : 4);
    const r2 = R - 1;
    ctx.strokeStyle = major ? `rgba(${SUNSET},0.55)` : `rgba(${SAND},0.18)`;
    ctx.lineWidth = major ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  additive(ctx, () => {
    for (let i = 0; i < 12; i++) {
      const at = i / 12;
      let dt = phase - at;
      if (dt < 0) dt += 1;
      if (dt > 0.18) continue;
      const k = 1 - dt / 0.18;
      const ha = at * TAU - Math.PI / 2;
      const x = cx + Math.cos(ha) * R;
      const y = cy + Math.sin(ha) * R;
      glowDot(ctx, x, y, 14 + (1 - k) * 26, k * 0.85);
      if (k > 0.7) glowDot(ctx, x, y, 3, (k - 0.7) / 0.3, SAND);
    }
  });

  const ang = phase * TAU - Math.PI / 2;
  const hx = cx + Math.cos(ang) * (R - 14);
  const hy = cy + Math.sin(ang) * (R - 14);
  ctx.strokeStyle = `rgba(${SAND},0.55)`;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  additive(ctx, () => {
    glowDot(ctx, hx, hy, 5, 0.7);
  });

  // denser, smoother trail — finer angular step + ease-out alpha falloff
  const TRAIL = 44;
  const STEP = 0.045;
  const comet = phase * 2 * TAU - Math.PI / 2;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < TRAIL; i++) {
    const a = comet - i * STEP;
    pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
  }

  additive(ctx, () => {
    for (let i = 0; i < pts.length - 1; i++) {
      const k = i / (pts.length - 1);
      // ease-out tail: brighter near the head, faster falloff at the tip
      const fall = 1 - k * k;
      const a = 0.88 * fall;
      const wid = 1.6 * (1 - k * 0.72) + 0.35;
      ropeSegment(
        ctx,
        pts[i][0],
        pts[i][1],
        pts[i + 1][0],
        pts[i + 1][1],
        wid,
        a,
      );
    }

    // soft halo behind the head for a smoother leading edge
    glowDot(ctx, pts[0][0], pts[0][1], 9, 0.55);
    glowDot(ctx, pts[0][0], pts[0][1], 3, 1, SAND);
  });

  ctx.fillStyle = `rgba(${SUNSET},0.9)`;
  ctx.beginPath();
  ctx.arc(cx, cy, 2.2, 0, TAU);
  ctx.fill();

  ctx.font = '600 9.5px "Space Mono", ui-monospace, monospace';
  ctx.fillStyle = `rgba(${SAND},0.4)`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('24/7', cx, cy + R + 10);

  const loops = Math.floor(t / LOOP);
  const caughtThisLoop = Math.floor(phase * 12);
  const tally = 1247 + loops * 12 + caughtThisLoop;
  ctx.font = '500 9px "Space Mono", ui-monospace, monospace';
  ctx.fillStyle = `rgba(${SAND},0.32)`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CALLS CAUGHT', 12, h - 10);
  ctx.fillStyle = `rgba(${SUNSET},0.92)`;
  ctx.textAlign = 'right';
  ctx.fillText(tally.toLocaleString(), w - 12, h - 10);

  scanlines(ctx, w, h);
};

/* -------- 2 / Qualify: rope-loop sieve, deterministic keep/pass, dipping under impact ----- */
const paintQualify: Painter = (ctx, w, h, t) => {
  bg(ctx, w, h);

  const LEAD_FALL = 4.2;
  const N = 14;
  const SIEVE_Y = h * 0.5;
  const KEEP_RATE = 0.62;

  const events: Array<{x: number; intensity: number; keep: boolean}> = [];
  const trails: Array<[number, number, number, number, number]> = [];

  for (let i = 0; i < N; i++) {
    const offset = i / N;
    const t0 = (t / LEAD_FALL + offset) % 1;
    const x = lerp(w * 0.18, w * 0.82, hash(i, 1));
    const keep = hash(i, 2) < KEEP_RATE;
    const yRaw = t0 * h;
    const passedSieve = yRaw > SIEVE_Y;

    if (passedSieve) {
      const dyPx = yRaw - SIEVE_Y;
      const sinceSieve = (dyPx / h) * LEAD_FALL;
      if (sinceSieve < 0.45) {
        events.push({x, intensity: clamp01(1 - sinceSieve / 0.45), keep});
      }

      if (keep) {
        const k = clamp01(sinceSieve / 0.9);
        const targetX = w - 24;
        const targetY = h - 22;
        const px = lerp(x, targetX, easeOut(k));
        const py = lerp(SIEVE_Y, targetY, easeOut(k));
        const a = 1 - k * 0.55;
        additive(ctx, () => {
          glowDot(ctx, px, py, 7, a * 0.9);
          glowDot(ctx, px, py, 2.2, a, SAND);
        });
        trails.push([x, SIEVE_Y, px, py, a]);
      } else {
        const k = clamp01((sinceSieve - 0.05) / 0.7);
        if (yRaw < h - 6) {
          additive(ctx, () => {
            glowDot(ctx, x, yRaw, 5, 0.22 * (1 - k), '150,160,180');
            glowDot(ctx, x, yRaw, 1.6, 0.7 * (1 - k), SAND);
          });
        }
      }
    } else {
      additive(ctx, () => {
        glowDot(ctx, x, yRaw, 6, 0.32, '190,200,220');
        glowDot(ctx, x, yRaw, 2, 0.9, SAND);
      });
    }
  }

  // smoother rope: more samples + smaller breath/wave so dips read as the dominant motion
  const SAMPLES = 110;
  const dipFn = (xPx: number) => {
    let dip = 0;
    for (const ev of events) {
      const dx = (xPx - ev.x) / 30;
      // smoother dip kernel (slightly wider sigma, ease-in intensity)
      dip += Math.exp(-dx * dx) * 13 * (ev.intensity * ev.intensity);
    }

    return dip;
  };

  const ropePts: Array<[number, number]> = [];
  const breath = Math.sin(t * 1.2) * 1.2;
  for (let i = 0; i <= SAMPLES; i++) {
    const x = lerp(w * 0.08, w * 0.92, i / SAMPLES);
    const ph = (i / SAMPLES) * TAU * 1.3 + t * 0.5;
    const y = SIEVE_Y + Math.sin(ph) * 1.2 + breath + dipFn(x);
    ropePts.push([x, y]);
  }

  additive(ctx, () => {
    for (let i = 0; i < ropePts.length - 1; i++) {
      ropeSegment(
        ctx,
        ropePts[i][0],
        ropePts[i][1],
        ropePts[i + 1][0],
        ropePts[i + 1][1],
        1.4,
        0.82,
      );
    }

    const last = ropePts.at(-1)!;
    glowDot(ctx, ropePts[0][0], ropePts[0][1], 4, 0.9);
    glowDot(ctx, last[0], last[1], 4, 0.9);
  });
  additive(ctx, () => {
    for (const [x0, y0, x1, y1, a] of trails)
      ropeSegment(ctx, x0, y0, x1, y1, 1, a * 0.4);
  });
  additive(ctx, () => {
    for (let i = 0; i < 6; i++) {
      const dx = (hash(i, 7) - 0.5) * 14;
      const dy = (hash(i, 8) - 0.5) * 8;
      glowDot(ctx, w - 24 + dx, h - 22 + dy, 4, 0.32);
    }
  });

  ctx.font = '500 9px "Space Mono", ui-monospace, monospace';
  ctx.fillStyle = `rgba(${SAND},0.32)`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LEAD QUALITY', 12, 16);
  ctx.fillText('QUALIFIED', 12, h - 10);
  ctx.fillStyle = `rgba(${SUNSET},0.92)`;
  ctx.textAlign = 'right';
  const passSeen = Math.floor((t / LEAD_FALL) * N);
  const keptSeen = Math.floor(passSeen * KEEP_RATE);
  ctx.fillText(`${keptSeen} / ${passSeen}`, w - 12, h - 10);
  ctx.font = '500 8.5px "Space Mono", ui-monospace, monospace';
  ctx.fillStyle = `rgba(${SAND},0.22)`;
  ctx.textAlign = 'right';
  ctx.fillText('SIEVE', w - 12, SIEVE_Y - 6);

  scanlines(ctx, w, h);
};

/* -------- 3 / Handoff: lasso whips from call orb to handler orb in one arc --------- */
const paintHandoff: Painter = (ctx, w, h, t) => {
  const LOOP = 4;
  const ph = (t % LOOP) / LOOP;
  bg(ctx, w, h);

  const L = {x: w * 0.18, y: h * 0.5};
  const R = {x: w * 0.82, y: h * 0.5};
  const whipP = clamp01((ph - 0.18) / 0.36);
  const ignite = clamp01((ph - 0.54) / 0.1);
  const settled = clamp01((ph - 0.64) / 0.3);
  const fadeOut = clamp01((ph - 0.94) / 0.06);

  additive(ctx, () => {
    for (let i = 0; i < 3; i++) {
      const k = (ph * 2 + i * 0.33) % 1;
      const r = 8 + k * 30;
      const a = (1 - k) * 0.45 * (1 - clamp01((ph - 0.2) / 0.1));
      if (a > 0.01) {
        ctx.strokeStyle = `rgba(${SUNSET},${a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(L.x, L.y, r, 0, TAU);
        ctx.stroke();
      }
    }

    glowDot(ctx, L.x, L.y, 11, 0.55 + 0.35 * Math.sin(t * 9));
    glowDot(ctx, L.x, L.y, 3.4, 1, SAND);
  });
  // cleaner phone handset: a tilted dumbbell that reads as a receiver at any scale
  ctx.save();
  ctx.translate(L.x, L.y);
  ctx.rotate(-0.55);
  ctx.strokeStyle = `rgba(${SAND},0.88)`;
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(4, 0);
  ctx.stroke();
  ctx.fillStyle = `rgba(${SAND},0.92)`;
  ctx.beginPath();
  ctx.arc(-4, 0, 1.6, 0, TAU);
  ctx.arc(4, 0, 1.6, 0, TAU);
  ctx.fill();
  ctx.restore();

  const rAlpha = 0.25 + (ignite + settled * 0.8 - fadeOut) * 0.8;
  additive(ctx, () => {
    glowDot(ctx, R.x, R.y, 11 + ignite * 18, rAlpha);
    glowDot(ctx, R.x, R.y, 3.4, Math.max(0.5, rAlpha), SAND);
  });
  // person silhouette: round head + rounded shoulders, drawn as filled shapes for cleaner read
  const personA = 0.45 + rAlpha * 0.45;
  ctx.fillStyle = `rgba(${SAND},${personA})`;
  ctx.beginPath();
  ctx.arc(R.x, R.y - 2.5, 2.4, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(R.x - 5, R.y + 5.4);
  ctx.quadraticCurveTo(R.x, R.y + 0.8, R.x + 5, R.y + 5.4);
  ctx.lineTo(R.x + 5, R.y + 5.6);
  ctx.lineTo(R.x - 5, R.y + 5.6);
  ctx.closePath();
  ctx.fill();

  if (ph > 0.18) {
    const arcUp = -h * 0.28;
    const C1: [number, number] = [lerp(L.x, R.x, 0.3), L.y + arcUp];
    const C2: [number, number] = [lerp(L.x, R.x, 0.7), R.y + arcUp];
    const settleP = clamp01(ignite + settled - fadeOut);
    const PROG = Math.max(whipP, settleP);
    const N = 96;
    const ribbon: Array<[number, number]> = [];
    const headIdx = Math.floor(N * PROG);
    for (let i = 0; i <= headIdx; i++) {
      const u = i / N;
      const x =
        (1 - u) ** 3 * L.x +
        3 * (1 - u) ** 2 * u * C1[0] +
        3 * (1 - u) * u * u * C2[0] +
        u ** 3 * R.x;
      const y =
        (1 - u) ** 3 * L.y +
        3 * (1 - u) ** 2 * u * C1[1] +
        3 * (1 - u) * u * u * C2[1] +
        u ** 3 * R.y;
      ribbon.push([x, y]);
    }

    const baseAlpha = lerp(0.5, 1, settleP) * (1 - fadeOut);
    additive(ctx, () => {
      for (let i = 0; i < ribbon.length - 1; i++) {
        const k = i / Math.max(1, ribbon.length - 1);
        const taper = lerp(easeOut(k), 1, settleP);
        ropeSegment(
          ctx,
          ribbon[i][0],
          ribbon[i][1],
          ribbon[i + 1][0],
          ribbon[i + 1][1],
          1.4,
          baseAlpha * taper,
        );
      }

      if (whipP < 1 && ribbon.length > 0) {
        const head = ribbon.at(-1)!;
        glowDot(ctx, head[0], head[1], 9, (1 - whipP) * 0.4 + 0.6);
        glowDot(ctx, head[0], head[1], 3, 1, SAND);
      }
    });
  }

  if (ignite > 0 && settled < 1) {
    additive(ctx, () => {
      glowDot(ctx, R.x, R.y, 24 + (1 - ignite) * 18, ignite * 0.85, SAND);
    });
  }

  let status = 'INCOMING';
  if (ph > 0.54) status = 'CONNECTED';
  else if (ph > 0.18) status = 'ROUTING';
  ctx.font = '500 9px "Space Mono", ui-monospace, monospace';
  ctx.fillStyle = `rgba(${SAND},0.32)`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('STATUS', 12, h - 10);
  ctx.fillStyle = ph > 0.54 ? `rgba(${SUNSET},0.92)` : `rgba(${SAND},0.78)`;
  ctx.textAlign = 'right';
  ctx.fillText(status, w - 12, h - 10);

  scanlines(ctx, w, h);
};

/* -------- the shared canvas component -------- */
const CONTAINER_CLASS =
  'h-48 w-full bg-black/30 rounded-lg border border-white/5 relative overflow-hidden';

function CardCanvas({paint, label}: {paint: Painter; label: string}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d', {alpha: false});
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const parent = cv.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawOne = (t: number) => {
      const w = cv.width / dpr;
      const h = cv.height / dpr;
      ctx.fillStyle = '#0c0b14';
      ctx.fillRect(0, 0, w, h);
      paint(ctx, w, h, t);
    };

    if (reduce) {
      drawOne(FROZEN_T);
    } else {
      const tick = (now: number) => {
        drawOne((now - t0) / 1000);
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [paint, reduce]);

  return (
    <div className={CONTAINER_CLASS}>
      <canvas
        ref={ref}
        aria-label={label}
        role="img"
        className="block w-full h-full"
      />
    </div>
  );
}

export const RadarWatchdog = () => (
  <CardCanvas paint={paintCoverage} label="24/7 phone coverage" />
);
export const SpectralAnalyzer = () => (
  <CardCanvas paint={paintQualify} label="Lead qualification filter" />
);
export const SynapseLink = () => (
  <CardCanvas paint={paintHandoff} label="Instant handoff link" />
);
