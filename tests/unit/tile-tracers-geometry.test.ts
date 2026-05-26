/**
 * Contract tests for the comet-tracer geometry helpers (tileTracers.ts).
 *
 * The WebGL ember tracer (PolygonTileHero) is a shipped visual feature
 * whose path math had zero coverage. These assert the input→output
 * contracts of the pure helpers that build each comet's path — not the
 * shader, not the GL plumbing (those need a real GL context). The most
 * load-bearing case is buildRibbon's miter join: a regression there is
 * exactly what produced the corner glare seams fixed in #108, so the
 * NaN-safety + degenerate-path assertions below are the real guard.
 */

import {describe, it, expect} from 'vitest';
import {
  angDiff,
  clamp,
  roundedOutline,
  nearestIndex,
  dedupe,
  chaikin,
  buildRibbon,
  type Pt,
} from '../../client/src/components/tileTracers.ts';

const TAU = Math.PI * 2;

describe('angDiff', () => {
  it('wraps any signed difference into [-π, π]', () => {
    for (let a = -10; a <= 10; a += 0.37) {
      for (let b = -10; b <= 10; b += 0.53) {
        const d = angDiff(a, b);
        expect(d).toBeGreaterThanOrEqual(-Math.PI - 1e-9);
        expect(d).toBeLessThanOrEqual(Math.PI + 1e-9);
        // d is congruent to (a-b) modulo 2π
        const raw = a - b;
        const k = Math.round((raw - d) / TAU);
        expect(Math.abs(raw - d - k * TAU)).toBeLessThan(1e-9);
      }
    }
  });

  it('is zero for equal angles and for full-turn-apart angles', () => {
    expect(angDiff(1.2, 1.2)).toBeCloseTo(0, 9);
    expect(angDiff(1.2 + TAU, 1.2)).toBeCloseTo(0, 9);
  });
});

describe('clamp', () => {
  it('bounds to [lo, hi]', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('roundedOutline', () => {
  const outline = roundedOutline({cx: 100, cy: 100, half: 40, rad: 8, rot: 0});

  it('emits a fixed-size closed polyline (36 segments)', () => {
    // 4 edges × 4 edge-samples + 4 corners × 5 corner-samples = 36.
    expect(outline.length).toBe(36);
  });

  it('stays within the tile bounding box (+ corner radius slack)', () => {
    for (const p of outline) {
      expect(p.x).toBeGreaterThanOrEqual(60 - 1e-6);
      expect(p.x).toBeLessThanOrEqual(140 + 1e-6);
      expect(p.y).toBeGreaterThanOrEqual(60 - 1e-6);
      expect(p.y).toBeLessThanOrEqual(140 + 1e-6);
    }
  });

  it('is centered on (cx, cy) — centroid within a pixel', () => {
    const cx =
      outline.reduce((s: number, p: Pt) => s + p.x, 0) / outline.length;
    const cy =
      outline.reduce((s: number, p: Pt) => s + p.y, 0) / outline.length;
    expect(cx).toBeCloseTo(100, 1);
    expect(cy).toBeCloseTo(100, 1);
  });

  it('rotation preserves point count and recenters cleanly', () => {
    const rotated = roundedOutline({
      cx: 0,
      cy: 0,
      half: 40,
      rad: 8,
      rot: Math.PI / 4,
    });
    expect(rotated.length).toBe(36);
    const cx =
      rotated.reduce((s: number, p: Pt) => s + p.x, 0) / rotated.length;
    expect(cx).toBeCloseTo(0, 6);
  });
});

describe('nearestIndex', () => {
  const pts: Pt[] = [
    {x: 0, y: 0},
    {x: 10, y: 0},
    {x: 10, y: 10},
    {x: 0, y: 10},
  ];
  it('returns the index of the closest point', () => {
    expect(nearestIndex(pts, 9, 1)).toBe(1);
    expect(nearestIndex(pts, -1, 11)).toBe(3);
    expect(nearestIndex(pts, 0.1, 0.1)).toBe(0);
  });
});

describe('dedupe', () => {
  it('drops points within 0.6px of their predecessor', () => {
    const pts: Pt[] = [
      {x: 0, y: 0},
      {x: 0.3, y: 0}, // within 0.6 — dropped
      {x: 5, y: 0}, // kept
      {x: 5.2, y: 0.2}, // within 0.6 — dropped
      {x: 20, y: 0}, // kept
    ];
    const out = dedupe(pts);
    expect(out).toEqual([
      {x: 0, y: 0},
      {x: 5, y: 0},
      {x: 20, y: 0},
    ]);
  });
});

describe('chaikin', () => {
  const square: Pt[] = [
    {x: 0, y: 0},
    {x: 10, y: 0},
    {x: 10, y: 10},
    {x: 0, y: 10},
  ];
  it('adds points each iteration and stays inside the convex hull', () => {
    const smoothed = chaikin(square, 2);
    expect(smoothed.length).toBeGreaterThan(square.length);
    for (const p of smoothed) {
      expect(p.x).toBeGreaterThanOrEqual(-1e-9);
      expect(p.x).toBeLessThanOrEqual(10 + 1e-9);
      expect(p.y).toBeGreaterThanOrEqual(-1e-9);
      expect(p.y).toBeLessThanOrEqual(10 + 1e-9);
    }
  });

  it('is a no-op below 3 points', () => {
    const two: Pt[] = [
      {x: 0, y: 0},
      {x: 1, y: 1},
    ];
    expect(chaikin(two, 3)).toEqual(two);
  });
});

describe('buildRibbon (miter join)', () => {
  // cumulative arc-length helper mirroring the production call site
  const cum = (pts: Pt[]) => {
    const c = [0];
    for (let i = 1; i < pts.length; i++) {
      c.push(
        c[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
      );
    }

    return c;
  };

  it('emits two vertices (8 floats) per input point', () => {
    const pts: Pt[] = [
      {x: 0, y: 0},
      {x: 10, y: 0},
      {x: 20, y: 0},
    ];
    const ribbon = buildRibbon(pts, cum(pts), 4);
    expect(ribbon.length).toBe(pts.length * 8);
  });

  it('produces no NaN/Infinity on a sharp near-reversal (the glare-seam case)', () => {
    // A path that doubles back on itself — the miter direction degenerates
    // and an unclamped 1/cos(θ/2) would blow up. #108 fixed this; guard it.
    const pts: Pt[] = [
      {x: 0, y: 0},
      {x: 10, y: 0},
      {x: 0.01, y: 0.2}, // ~180° turn
      {x: 10, y: 0.4},
    ];
    const ribbon = buildRibbon(pts, cum(pts), 12);
    for (const v of ribbon) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it('clamps the miter so offsets never exceed the 2.4× limit', () => {
    const pts: Pt[] = [
      {x: 0, y: 0},
      {x: 10, y: 0},
      {x: 0.5, y: 0.5}, // tight corner
      {x: 10, y: 1},
    ];
    const halfW = 10;
    const ribbon = buildRibbon(pts, cum(pts), halfW);
    // Each vertex pair straddles the centerline; the half-offset is
    // bounded by halfW * miterLimit (2.4). Check the per-vertex spread.
    for (let i = 0; i < pts.length; i++) {
      const ax = ribbon[i * 8];
      const ay = ribbon[i * 8 + 1];
      const bx = ribbon[i * 8 + 4];
      const by = ribbon[i * 8 + 5];
      const halfSpread = Math.hypot(ax - bx, ay - by) / 2;
      expect(halfSpread).toBeLessThanOrEqual(halfW * 2.4 + 1e-6);
    }
  });
});
