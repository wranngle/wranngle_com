import React, {useEffect, useRef, useState} from 'react';

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
// Direct port of CFG from polygon-tile-hero.html with two changes:
// - rings reduced from 8 → 5 (we don't need that big a buffer here)
// - tileSize/spacing tuned for the hero band height (480px) instead of 700+
const CFG = {
  sides: 6, // hexagon ring layout
  rings: 5, // 1 center + 5 rings → 1 + 6 + 12 + 18 + 24 + 30 = 91 tiles
  spacing: 84, // px between concentric rings
  tileSize: 86, // base tile edge, px
  cornerRadius: 9, // base corner radius
  heroZoom: 3.5, // center-stage scale multiplier
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
  | {kind: 'demo'; id: string; poster: string; video: string; label: string}
  | {kind: 'image'; src: string; alt: string}
  | {kind: 'primitive'};

const ASSET_BASE = '/assets/hero-demos';
const DEMO_TILES: TileContent[] = [
  {
    kind: 'demo',
    id: 'trattoria',
    poster: `${ASSET_BASE}/trattoria.poster.jpg`,
    video: `${ASSET_BASE}/trattoria.webm`,
    label: 'Bella Vista Trattoria',
  },
  {
    kind: 'demo',
    id: 'dental',
    poster: `${ASSET_BASE}/dental.poster.jpg`,
    video: `${ASSET_BASE}/dental.webm`,
    label: 'Tidewater Family Dental',
  },
  {
    kind: 'demo',
    id: 'salon',
    poster: `${ASSET_BASE}/salon.poster.jpg`,
    video: `${ASSET_BASE}/salon.webm`,
    label: 'Atlas Hair Co.',
  },
];

const STOCK_TILES: TileContent[] = [
  'trattoria-dining-room',
  'trattoria-dish-pasta',
  'trattoria-dish-pizza',
  'trattoria-hero',
  'trattoria-wine',
  'dental-care',
  'dental-clinic',
  'dental-dentist',
  'dental-hero',
  'dental-patient',
  'dental-smile',
  'dental-team',
  'salon-blowout',
  'salon-color',
  'salon-hero',
  'salon-interior',
  'salon-portrait',
].map((slug) => ({
  kind: 'image' as const,
  src: `${ASSET_BASE}/tiles/${slug}.jpg`,
  alt: slug.replaceAll('-', ' '),
}));

const PRIMITIVE: TileContent = {kind: 'primitive'};

/** Per-tile baked offsets + phases. Deterministic seeds so SSR + client
 *  match and the field doesn't pop on hydration. */
type TileGeom = {
  ring: number;
  ox: number;
  oy: number;
  // Per-tile drift/pulse/sway phase offsets (radians)
  pdx: number;
  pdy: number;
  pp: number;
  ps: number;
  // Per-tile frequency jitter
  fj: number;
  content: TileContent;
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
      pdx: rng() * 6.283,
      pdy: rng() * 6.283,
      pp: rng() * 6.283,
      ps: rng() * 6.283,
      fj: 0.82 + rng() * 0.4,
      content,
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
        // Inner two rings get real imagery; outer rings stay primitive
        // so the field reads as endless and the radial mask dissolves
        // it cleanly into the page.
        const content = k <= 2 ? consume() : PRIMITIVE;
        push(k, ax + (bx - ax) * t, ay + (by - ay) * t, content);
      }
    }
  }

  return tiles;
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
    let raf = 0;
    let animClock = 0;
    let heroTimer = 0;
    let lastTs: number | undefined;
    let heroIdx = 0;
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
        heroIdx = 0;
        hAmt = 1;
      } else {
        while (heroTimer >= cycle && tiles.length > 0) {
          heroTimer -= cycle;
          heroIdx = (heroIdx + 1) % tiles.length;
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
        const fsize = Math.max(2, bsize * (1 + (CFG.heroZoom - 1) * h));
        const ratio = fsize / CFG.tileSize;
        const rot = sway * (1 - 0.72 * h);
        const op = isHero ? 1 : 1 - CFG.spotlightDim * hAmt;
        const z =
          h > 0.002
            ? 9_000_000 + Math.round(h * 2000)
            : Math.round((CFG.rings - tl.ring) * 1000 + (3200 - fy));

        const s = el.style;
        s.width = `${fsize.toFixed(2)}px`;
        s.height = `${fsize.toFixed(2)}px`;
        s.left = `${fx.toFixed(2)}px`;
        s.top = `${fy.toFixed(2)}px`;
        s.transform = `translate(-50%,-50%) rotate(${rot.toFixed(2)}deg)`;
        s.borderRadius = `${(CFG.cornerRadius * ratio).toFixed(2)}px`;
        s.borderWidth = `${(2 * (1 + 0.6 * h)).toFixed(2)}px`;
        s.opacity = op.toFixed(3);
        s.zIndex = String(z);
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
      className="relative w-full h-[420px] md:h-[520px] overflow-hidden"
      data-testid="polygon-tile-hero"
      aria-label="Animated demo tile showcase"
    >
      <div
        ref={fieldRef}
        className="absolute inset-0"
        style={{
          // Radial dissolve — opaque core for the hero tile, edges fade
          // into the page background so the field reads as endless.
          WebkitMaskImage:
            'radial-gradient(ellipse closest-side at 50% 50%, #000 0 72%, transparent 100%)',
          maskImage:
            'radial-gradient(ellipse closest-side at 50% 50%, #000 0 72%, transparent 100%)',
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
    return (
      <img
        src={content.src}
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
