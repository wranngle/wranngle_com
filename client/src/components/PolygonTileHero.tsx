import React, {useEffect, useRef, useState} from 'react';
import {TileTracerField, type TileSnapshot} from '@/components/tileTracers.ts';

/**
 * PolygonTileHero — port of the operator's polygon-tile-hero.html prototype.
 *
 * One primitive (rounded outlined square) repeated in concentric hexagonal
 * rings around a center tile. The field drifts/breathes/sways with
 * deterministic per-tile randomness. One tile at a time is selected as the
 * "hero": it animates from its ring slot to the center, zooms ~3.7×, holds
 * ~3s, then animates back out — a continuous spotlight rotation.
 *
 * The whole field is radially masked so its edges dissolve into the page
 * background with no hard edge. Inner rings (1-2) carry real imagery: the
 * three demo verticals (trattoria/dental/salon) swap their poster for a
 * playing <video> when they're in hero position; the other populated tiles
 * show landing-page stock photos. Outer rings stay as pure primitives so
 * the field reads as endless and dissolves cleanly.
 *
 * Props match the previous StackedWidgetCarousel contract so call sites
 * in App.tsx + websites.tsx don't change.
 */

type Props = {
  isDark: boolean;
  /** Caption above the deck — kept for compatibility but rendered subtly. */
  caption?: string;
  /** Subcaption text — kept for compatibility, rendered subtly. */
  subcaption?: string;
};

// === Layout + motion configuration ====================================
// Direct port of CFG from polygon-tile-hero.html with three changes:
// - rings reduced from 8 → 5 (we don't need that big a buffer here)
// - tileSize/spacing tuned for the hero band height (560px) instead of 700+
// - heroExtraWidth added so the zoomed hero unfurls from a square ring
//   tile into a 16:10 widescreen — necessary so the ElevenLabs demo
//   recordings (960×600) and the 1600×1000 mock landing-page captures
//   fit without cropping when a tile is in the center spotlight.
const CFG = {
  sides: 6, // hexagon ring layout
  rings: 5, // 1 center + 5 rings → 1 + 6 + 12 + 18 + 24 + 30 = 91 tiles
  spacing: 84, // px between concentric rings
  tileSize: 86, // base tile edge, px
  cornerRadius: 9, // base corner radius
  heroZoom: 3.4, // center-stage scale multiplier (vertical)
  heroExtraWidth: 1.6, // hero unfurls to 16:10 (width = height * 1.6)
  heroHold: 3000, // ms hero stays zoomed
  transIn: 1300, // ms zoom-in
  transOut: 1100, // ms zoom-out
  intensity: 0.36, // master amplitude of float / pulse / sway
  speed: 1.74, // master tempo of ambient motion
  spotlightDim: 0.32, // dim of non-hero tiles while a hero is up
};

/** Imagery on the populated inner-ring tiles. The first three carry the
 *  real demo videos; the rest carry static landing-page imagery. Order
 *  matters: tile 0 is the center, then ring 1 spirals out, then ring 2.
 *  See the prototype for the ring construction. */
type TileContent =
  | {
      kind: 'demo';
      id: string;
      poster: string;
      video: string;
      label: string;
      featured: true;
    }
  // image tiles can carry a `wide` widescreen source — shown when the tile
  // is hero-zoomed so the 1600×1000 landing-page screenshot unfurls fully;
  // `src` (smaller thumb crop) is shown in the ring. `featured: true`
  // means the tile rotates through the center spotlight; everything else
  // stays in the ring as static landing-page fill.
  | {kind: 'image'; src: string; wide?: string; alt: string; featured?: boolean}
  | {kind: 'primitive'};

const ASSET_BASE = '/assets/hero-demos';
const DEMO_TILES: TileContent[] = [
  {
    kind: 'demo',
    id: 'trattoria',
    poster: `${ASSET_BASE}/trattoria.poster.jpg`,
    video: `${ASSET_BASE}/trattoria.webm`,
    label: 'Bella Vista Trattoria',
    featured: true,
  },
  {
    kind: 'demo',
    id: 'dental',
    poster: `${ASSET_BASE}/dental.poster.jpg`,
    video: `${ASSET_BASE}/dental.webm`,
    label: 'Tidewater Family Dental',
    featured: true,
  },
  {
    kind: 'demo',
    id: 'salon',
    poster: `${ASSET_BASE}/salon.poster.jpg`,
    video: `${ASSET_BASE}/salon.webm`,
    label: 'Atlas Hair Co.',
    featured: true,
  },
];

// 37 mock business landing pages — generated under demo-stages/biz/
// and screenshotted to client/public/assets/hero-tiles/<slug>.{jpg,thumb.jpg}
// by script/generators/{biz-landing-pages,capture-biz-tiles}.mjs. Order
// drives the ring placement (k=1 = 6 tiles, k=2 = 12 tiles, k=3 = 18 tiles).
// `featured: true` on a stock tile means it joins the demo rotation —
// the 3 demo videos + 2 hand-picked stock pages = 5 total in the spotlight
// cycle; the rest stay in the ring as static landing-page fill.
const STOCK_TILES: TileContent[] = [
  // Inner ring (k=1) — 6 tiles. Two are featured (rotate to hero); these
  // are the strongest non-demo pages visually.
  {slug: 'bakery', name: 'Aviary Bakehouse', featured: true},
  {slug: 'climbing-gym', name: 'North Face Climbing Co-op', featured: true},
  {slug: 'cocktail-bar', name: 'Lantern & Owl'},
  {slug: 'nail-studio', name: 'Cosmos Nail Studio'},
  {slug: 'coffee-roaster', name: 'Stalk & Tin Coffee'},
  {slug: 'plumber', name: 'Crestline Plumbing'},
  // Middle ring (k=2) — 12 tiles, all static fill.
  {slug: 'ramen-bar', name: 'Kōri Ramen'},
  {slug: 'florist', name: 'Bramble & Stem'},
  {slug: 'tattoo-parlor', name: 'Iron Heron Tattoo'},
  {slug: 'dermatology', name: 'Field Avenue Skin Clinic'},
  {slug: 'bbq-joint', name: 'Hickory Hall'},
  {slug: 'yoga-studio', name: 'Sage & Cedar Yoga'},
  {slug: 'crossfit-gym', name: 'Iron Bell Strength'},
  {slug: 'vegan-cafe', name: 'Greenhouse 14'},
  {slug: 'electrician', name: 'Holloway Electric'},
  {slug: 'family-law', name: 'Wren & Hadley LLP'},
  {slug: 'physical-therapy', name: 'Cedar Bend PT'},
  {slug: 'hvac', name: 'Northstar HVAC'},
  // Outer ring (k=3) — 18 tiles, all static fill. Filled by the 17 newer
  // pages + 'vet' + 'barbershop' to round out the ring exactly.
  {slug: 'vet', name: 'Northside Veterinary'},
  {slug: 'barbershop', name: 'Pinion & Crow Barber Co.'},
  {slug: 'accounting-firm', name: 'Lattimer & Holt CPA'},
  {slug: 'pet-grooming', name: 'Bramble & Boop'},
  {slug: 'music-school', name: 'Stoneharbor Music Conservatory'},
  {slug: 'car-detail', name: 'Mirror Finish Auto Spa'},
  {slug: 'juice-bar', name: 'Sun & Stone Juicery'},
  {slug: 'bookbinder', name: 'Argent Bookworks'},
  {slug: 'pottery-studio', name: 'Riverstone Clay Co-op'},
  {slug: 'chiropractor', name: 'Hilltown Spine + Wellness'},
  {slug: 'pilates-studio', name: 'Halcyon Pilates'},
  {slug: 'sushi-bar', name: 'Ohba Sushi'},
  {slug: 'pizzeria', name: 'Anchor & Coal Pizza'},
  {slug: 'wine-bar', name: 'Vesper & Vine'},
  {slug: 'bookstore', name: 'Halcyon & Press'},
  {slug: 'gelato-shop', name: 'Lago Gelato'},
  {slug: 'locksmith', name: 'Cardinal Lock + Key'},
  {slug: 'roofer', name: 'Foundry Roofing'},
  {slug: 'landscaper', name: 'Quartermile Landscape Design'},
  // Outer ring (k=4) — 24 slots. 16 of the 16 new pages fill the front;
  // 8 unfilled slots in the heavy-fade band stay as primitives (they
  // dissolve out via the radial mask before they ever read as empty).
  {slug: 'bike-shop', name: 'Allwheel Cycle Works'},
  {slug: 'vinyl-shop', name: 'Bandstand Records'},
  {slug: 'candle-maker', name: 'Wax & Wick Studio'},
  {slug: 'watch-repair', name: 'Trenton Watchworks'},
  {slug: 'knife-sharpening', name: 'Whetstone & Co.'},
  {slug: 'arborist', name: 'Greatwood Tree Care'},
  {slug: 'garden-nursery', name: 'Greenstone Nursery'},
  {slug: 'frame-shop', name: 'Cornerstone Custom Framing'},
  {slug: 'letterpress', name: 'Hollow Press Print Co.'},
  {slug: 'ice-cream-truck', name: 'Big Dipper Mobile Creamery'},
  {slug: 'arcade-bar', name: 'Neon & Quarters'},
  {slug: 'piano-tuner', name: 'Sterling Piano Service'},
  {slug: 'bike-courier', name: 'Cardinal Courier Co-op'},
  {slug: 'leather-goods', name: 'Foundling Leatherworks'},
  {slug: 'sail-school', name: 'Newport Harbor Sailing'},
  {slug: 'film-lab', name: 'Argentic Film Lab'},
].map(({slug, name, featured}) => ({
  kind: 'image' as const,
  src: `/assets/hero-tiles/${slug}.thumb.jpg`,
  wide: `/assets/hero-tiles/${slug}.jpg`,
  alt: name,
  featured: featured ?? false,
}));

const PRIMITIVE: TileContent = {kind: 'primitive'};

/** Per-tile baked offsets + phases. Deterministic seeds so SSR + client
 *  match and the field doesn't pop on hydration. The `d*` fields are the
 *  tile's live geometry, rewritten by the draw loop each frame so the comet
 *  tracer overlay can route along the current lattice (see tileTracers.ts). */
type TileGeom = {
  ring: number;
  ox: number;
  oy: number;
  ang: number; // baked ring angle (atan2 of the ring offset)
  // Per-tile drift/pulse/sway phase offsets (radians)
  pdx: number;
  pdy: number;
  pp: number;
  ps: number;
  // Per-tile frequency jitter
  fj: number;
  content: TileContent;
  // Live geometry (CSS px / radians), updated per frame.
  dx: number;
  dy: number;
  ds: number;
  dr: number;
  dt: number;
};

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49_297) % 233_280;
    return s / 233_280;
  };
}

function buildTiles(): TileGeom[] {
  const tiles: TileGeom[] = [];
  const n = CFG.sides;
  const base = -Math.PI / 2;
  const rng = seededRand(1959);
  const populated: TileContent[] = [...DEMO_TILES, ...STOCK_TILES];
  // Center tile is the first populated one (a real demo).
  let popIndex = 0;
  const consume = (): TileContent =>
    popIndex < populated.length ? populated[popIndex++] : PRIMITIVE;

  const push = (ring: number, ox: number, oy: number, content: TileContent) => {
    tiles.push({
      ring,
      ox,
      oy,
      ang: ring === 0 ? 0 : Math.atan2(oy, ox),
      pdx: rng() * 6.283,
      pdy: rng() * 6.283,
      pp: rng() * 6.283,
      ps: rng() * 6.283,
      fj: 0.82 + rng() * 0.4,
      content,
      dx: 0,
      dy: 0,
      ds: 0,
      dr: 0,
      dt: 0,
    });
  };

  push(0, 0, 0, consume());
  for (let k = 1; k <= CFG.rings; k++) {
    for (let i = 0; i < n; i++) {
      const a0 = base + (2 * Math.PI * i) / n;
      const a1 = base + (2 * Math.PI * (i + 1)) / n;
      const ax = Math.cos(a0) * k;
      const ay = Math.sin(a0) * k;
      const bx = Math.cos(a1) * k;
      const by = Math.sin(a1) * k;
      for (let j = 0; j < k; j++) {
        const t = j / k;
        // Rings 1-4 carry real imagery (ring 5 stays primitive as fade
        // buffer for the radial mask). consume() returns PRIMITIVE once
        // the populated list runs out, so the back half of ring 4 ends
        // up primitive — fine, they dissolve in the mask's heavy-fade
        // band before they ever read as empty.
        const content = k <= 4 ? consume() : PRIMITIVE;
        push(k, ax + (bx - ax) * t, ay + (by - ay) * t, content);
      }
    }
  }

  return tiles;
}

/** Indices of tiles flagged `featured` — only these cycle through the
 *  hero spotlight rotation. The rest stay in the ring as landing-page
 *  fill. Computed once from the same buildTiles() output. */
function featuredIndices(tiles: TileGeom[]): number[] {
  const out: number[] = [];
  for (const [i, t] of tiles.entries()) {
    const c = t.content;
    if (c.kind === 'demo' || (c.kind === 'image' && c.featured)) out.push(i);
  }

  return out;
}

function easeOutBack(p: number) {
  const s = 0.7;
  const q = p - 1;
  return 1 + (s + 1) * q * q * q + s * q * q;
}

function easeOutCubic(p: number) {
  return 1 - (1 - p) ** 3;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (globalThis.window === undefined) return;
    const mq = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setReduce(event.matches);
    };

    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
    };
  }, []);
  return reduce;
}

export default function PolygonTileHero({isDark, caption, subcaption}: Props) {
  // React DOM refs use the null sentinel; eslint-disable preserves that
  // contract against unicorn/no-null which the project disallows globally.
  /* eslint-disable @typescript-eslint/no-restricted-types -- React refs use null sentinel. */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const tracerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tilesRef = useRef<TileGeom[]>(buildTiles());
  // Per-tile <div> refs in render order.
  const tileElementsRef = useRef<Array<HTMLDivElement | null>>([]);
  /* eslint-enable @typescript-eslint/no-restricted-types */
  const reduce = usePrefersReducedMotion();
  // Only used to swap demo posters → playing video on the active hero
  // tile. State change forces React to re-render the inner content.
  const [heroIndex, setHeroIndex] = useState(0);

  // === Animation loop — port of step()/draw() from the prototype ====
  useEffect(() => {
    const tiles = tilesRef.current;
    if (tiles.length === 0) return;
    // Only `featured` tiles rotate through the spotlight — 3 demo videos
    // + 2 hand-picked stock pages = 5 hero candidates. Everything else
    // stays in the ring as static landing-page fill.
    const heroPool = featuredIndices(tiles);
    // Comet tracers: fire a glowing ember pulse from the hero outward along
    // the ring lattice each time a hero finishes zooming in. Skipped under
    // reduced-motion. The tile geometry the tracer routes along is the live
    // d* fields written below in the draw loop.
    const ringTiles: TileSnapshot[][] = [];
    for (const t of tiles) {
      (ringTiles[t.ring] ??= []).push(t);
    }

    const tracerCanvas = tracerCanvasRef.current;
    const tracers =
      tracerCanvas && !reduce ? new TileTracerField(tracerCanvas) : undefined;

    let raf = 0;
    let animClock = 0;
    let heroTimer = 0;
    let lastTs: number | undefined;
    let poolPos = 0;
    let heroIdx = heroPool[0] ?? 0;
    let firedForHero = false;
    const cycle = CFG.transIn + CFG.heroHold + CFG.transOut;

    const draw = () => {
      const field = fieldRef.current;
      if (!field) return;
      const cx = field.clientWidth / 2;
      const cy = field.clientHeight / 2;
      const i = CFG.intensity;
      const ft = animClock * 0.001 * CFG.speed;

      let hAmt: number;
      if (reduce) {
        heroIdx = heroPool[0] ?? 0;
        hAmt = 1;
      } else {
        while (heroTimer >= cycle && heroPool.length > 0) {
          heroTimer -= cycle;
          poolPos = (poolPos + 1) % heroPool.length;
          heroIdx = heroPool[poolPos];
          firedForHero = false;
          // Re-render only when the hero changes — keeps the video
          // swap in lockstep with the spotlight.
          setHeroIndex(heroIdx);
        }

        if (heroTimer < CFG.transIn) {
          hAmt = easeOutBack(heroTimer / CFG.transIn);
        } else if (heroTimer < CFG.transIn + CFG.heroHold) {
          hAmt = 1;
        } else {
          hAmt =
            1 -
            easeOutCubic(
              (heroTimer - CFG.transIn - CFG.heroHold) / CFG.transOut,
            );
        }

        if (hAmt < 0) hAmt = 0;
      }

      // Whole-field gentle twist + rotation.
      const gAng = reduce ? 0 : 0.05 * i * Math.sin(ft * 0.13);
      const gtw = reduce ? 0 : 0.06 * i * Math.sin(ft * 0.17);

      for (const [idx, tl] of tiles.entries()) {
        const el = tileElementsRef.current[idx];
        if (!el) continue;
        let dx = 0;
        let dy = 0;
        let pulse = 1;
        let sway = 0;
        if (!reduce) {
          dx = 12 * i * Math.sin(ft * 0.5 * tl.fj + tl.pdx);
          dy = 12 * i * Math.sin(ft * 0.47 * tl.fj + tl.pdy);
          pulse = 1 + 0.045 * i * Math.sin(ft * 0.65 * tl.fj + tl.pp);
          sway = 6 * i * Math.sin(ft * 0.55 * tl.fj + tl.ps);
        }

        const ang = gAng + gtw * tl.ring;
        const ox = tl.ox * CFG.spacing;
        const oy = tl.oy * CFG.spacing;
        const rx = ox * Math.cos(ang) - oy * Math.sin(ang);
        const ry = ox * Math.sin(ang) + oy * Math.cos(ang);
        const px = cx + rx + dx;
        const py = cy + ry + dy;

        const isHero = idx === heroIdx;
        const h = isHero ? hAmt : 0;
        const fx = px + (cx - px) * h;
        const fy = py + (cy - py) * h;
        const bsize = CFG.tileSize * pulse;
        // Vertical zoom is the canonical scale; width additionally
        // unfurls toward heroExtraWidth so the hero tile reaches
        // 16:10 widescreen at full zoom. In the ring (h=0) the tile
        // stays square as the prototype demands.
        const fheight = Math.max(2, bsize * (1 + (CFG.heroZoom - 1) * h));
        const widthMult = 1 + (CFG.heroExtraWidth - 1) * h;
        const fwidth = fheight * widthMult;
        const ratio = fheight / CFG.tileSize;
        const rot = sway * (1 - 0.72 * h);
        const op = isHero ? 1 : 1 - CFG.spotlightDim * hAmt;
        const z =
          h > 0.002
            ? 9_000_000 + Math.round(h * 2000)
            : Math.round((CFG.rings - tl.ring) * 1000 + (3200 - fy));

        const radius = CFG.cornerRadius * ratio;
        const s = el.style;
        s.width = `${fwidth.toFixed(2)}px`;
        s.height = `${fheight.toFixed(2)}px`;
        s.left = `${fx.toFixed(2)}px`;
        s.top = `${fy.toFixed(2)}px`;
        s.transform = `translate(-50%,-50%) rotate(${rot.toFixed(2)}deg)`;
        s.borderRadius = `${radius.toFixed(2)}px`;
        s.borderWidth = `${(2 * (1 + 0.6 * h)).toFixed(2)}px`;
        s.opacity = op.toFixed(3);
        s.zIndex = String(z);

        // Snapshot live geometry for the comet tracer (CSS px / radians).
        // The hero unfurls to widescreen, but tracers only need a square
        // outline to launch from, so we use the vertical edge.
        tl.dx = fx;
        tl.dy = fy;
        tl.ds = fheight;
        tl.dr = radius;
        tl.dt = (rot * Math.PI) / 180;
      }

      // Comet tracers — fire once per hero, the moment it finishes zooming
      // in, then composite the live ember pulses over the DOM tiles.
      if (tracers) {
        const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
        const W = Math.max(2, Math.round(field.clientWidth * dpr));
        const H = Math.max(2, Math.round(field.clientHeight * dpr));
        if (
          !firedForHero &&
          !reduce &&
          heroTimer >= CFG.transIn &&
          heroPool.length > 0
        ) {
          firedForHero = true;
          tracers.firePulse(
            animClock,
            W,
            H,
            dpr,
            tiles[heroIdx],
            ringTiles,
            CFG.rings,
          );
        }

        tracers.render(animClock, W, H, dpr);
      }
    };

    const step = (ts: number) => {
      if (lastTs === undefined) lastTs = ts;
      const dt = Math.min(64, ts - lastTs);
      lastTs = ts;
      animClock += dt;
      heroTimer += dt;
      draw();
      raf = requestAnimationFrame(step);
    };

    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      tracers?.dispose();
    };
  }, [reduce]);

  // Theme tokens — the field is transparent and inherits the page bg,
  // so the radial mask dissolves the tiles into either the cream
  // light-mode page or the night dark-mode page with no hard edges.
  const tileFill = isDark ? '#18181b' : '#ffffff';
  const tileBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(18,17,26,0.85)';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] md:h-[600px] overflow-hidden"
      data-testid="polygon-tile-hero"
      aria-label="Animated demo tile showcase"
    >
      <div
        ref={fieldRef}
        className="absolute inset-0"
        style={{
          // Radial dissolve — closest-side ties the gradient envelope to
          // the field box so the fade reaches the edges. The opaque core
          // is pulled in to ~24% so the soft falloff intrudes ~one tile
          // further into the hero's surround (the hero's centre text still
          // sits inside the solid core; only its edges feather). The
          // canvas tracer overlay is a child of this div and inherits the
          // same mask, so embers dissolve identically.
          WebkitMaskImage:
            'radial-gradient(ellipse closest-side at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 24%, rgba(0,0,0,0.82) 46%, rgba(0,0,0,0.48) 66%, rgba(0,0,0,0.18) 85%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse closest-side at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 24%, rgba(0,0,0,0.82) 46%, rgba(0,0,0,0.48) 66%, rgba(0,0,0,0.18) 85%, transparent 100%)',
        }}
      >
        {tilesRef.current.map((tile, idx) => (
          <div
            key={`tile-${idx}`}
            ref={(node) => {
              tileElementsRef.current[idx] = node;
            }}
            className="absolute box-border overflow-hidden will-change-transform"
            style={{
              background: tileFill,
              borderStyle: 'solid',
              borderColor: tileBorder,
              borderWidth: '2px',
              top: 0,
              left: 0,
            }}
            aria-hidden={idx !== heroIndex}
          >
            <TileContentNode
              content={tile.content}
              isHero={idx === heroIndex}
              reduce={reduce}
            />
          </div>
        ))}
        {/* Comet-tracer overlay — WebGL ember pulses composited over the
            ring tiles via `screen` blend. It lives INSIDE the masked field
            so it shares the field's stacking context: its z (8.5M) sits
            above the ring tiles (z up to ~8k) but below the zoomed hero
            (z≈9.0M), so the embers streak behind the spotlighted tile.
            (As a sibling of the field it would lose, because the field's
            mask makes it a stacking context and the hero's 9M can't escape
            it.) The field's mask already dissolves this child at the edges,
            so no separate mask is needed here. */}
        <canvas
          ref={tracerCanvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{zIndex: 8_500_000, mixBlendMode: 'screen'}}
          aria-hidden="true"
        />
      </div>
      {(caption ?? subcaption) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-1 z-[60] flex flex-col items-center gap-1">
          {caption && (
            <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--s500)] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--s500)] animate-pulse" />
              {caption}
            </div>
          )}
          {subcaption && (
            <div className="text-[11px] opacity-60 leading-snug max-w-md text-center">
              {subcaption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TileContentNode({
  content,
  isHero,
  reduce,
}: {
  content: TileContent;
  isHero: boolean;
  reduce: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- React refs use null sentinel.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (content.kind !== 'demo') return;
    const v = videoRef.current;
    if (!v) return;
    if (isHero && !reduce) {
      v.currentTime = 0;
      void v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }, [isHero, reduce, content]);

  if (content.kind === 'primitive') return null;
  if (content.kind === 'image') {
    // Use the widescreen source when the tile is hero (the 1600×1000
    // landing-page screenshot); fall back to the square thumb for the
    // ring view. Browsers cache both, so the swap is paint-cost only.
    const src = isHero && content.wide ? content.wide : content.src;
    return (
      <img
        src={src}
        alt={content.alt}
        className="block h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  // demo — show poster always, swap to playing video when hero.
  return (
    <>
      <img
        src={content.poster}
        alt={content.label}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        style={{
          opacity: isHero && !reduce ? 0 : 1,
          transition: 'opacity 220ms',
        }}
      />
      {isHero && !reduce && (
        <video
          ref={videoRef}
          src={content.video}
          poster={content.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={`${content.label} live demo`}
        />
      )}
    </>
  );
}
