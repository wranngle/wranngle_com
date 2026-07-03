import React from 'react';

/**
 * RoiBusinessWordmark — five custom inline-SVG logo lockups for the ROI
 * calculator's rotating mock businesses. These are *not* font-and-color
 * tricks: each is a hand-drawn wordmark with an integrated brand glyph,
 * gradients/strokes/layering, and considered proportions. Renders inline
 * with the heading at `height: 0.95em` so it always sits the same
 * optical height as the surrounding "What does this look like for ?" text.
 *
 * Typing animation is handled by the ROI engine through `typedLen`: the
 * fraction of the company name currently typed. The SVG fades its glyph
 * + accent layers in across the first/last 12% of the type so the
 * wordmark assembles like a brand reveal rather than popping at the end.
 */

// prettier-ignore
export type RoiBusinessId = 'trattoria' | 'dental' | 'salon' | 'fitness' | 'plumbing';

type Props = {
  id: RoiBusinessId;
  /** 0..1 — fraction of the wordmark text currently typed. */
  progress: number;
  /** Accessible label (the full company name). */
  label: string;
};

export default function RoiBusinessWordmark({id, progress, label}: Props) {
  switch (id) {
    case 'trattoria': {
      return <Trattoria progress={progress} label={label} />;
    }

    case 'dental': {
      return <Dental progress={progress} label={label} />;
    }

    case 'salon': {
      return <Salon progress={progress} label={label} />;
    }

    case 'fitness': {
      return <Fitness progress={progress} label={label} />;
    }

    case 'plumbing': {
      return <Plumbing progress={progress} label={label} />;
    }
  }
}

// Display height of each lockup, in em of the surrounding heading font.
// Sized as a presented brand mark, not a glyph: the lockup sits on its
// own cream "business card" plate that pushes it above the heading
// baseline so the logo reads at proper scale.
const HEIGHT_EM = 1.7;

/** Plate backdrop: every lockup sits on a soft cream "brand card" so the
 *  hand-designed dark inks (oxblood, tide-teal, jet, cedar) and bright
 *  accents (sodium yellow, mint) all read with consistent contrast in
 *  BOTH light- and dark-mode pages. A thin 1px outline + soft drop
 *  shadow separates the plate from either page surface. */
function shellStyle(): React.CSSProperties {
  return {
    display: 'inline-block',
    height: `${HEIGHT_EM}em`,
    // The lockup's natural width is height × ~5.3 (1700/320 viewBox). At the
    // ROI heading's text-5xl (48px) that's ~433px, which overflows a 375px
    // phone. max-width:100% caps the shell to the heading width; the paired
    // `svg { max-width: 100% }` rule in index.css scales the artwork to fit.
    // Identity on desktop (natural width < container, so the cap never binds).
    maxWidth: '100%',
    verticalAlign: '-0.45em',
    lineHeight: 0,
    background: '#fcfaf5',
    borderRadius: '0.35em',
    padding: '0.1em 0.28em',
    boxShadow:
      '0 0 0 1px rgba(18,17,26,0.10), 0 4px 14px -4px rgba(18,17,26,0.22)',
  };
}

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

// === Bella Vista Trattoria ============================================
// Editorial coastal Italian. Cream ground, oxblood Fraunces letterforms
// hand-spaced, italic "&" amperstand cradled by olive olive-branch arcs,
// brass hairline rule running under the whole lockup.
function Trattoria({progress, label}: {progress: number; label: string}) {
  const p = clamp01(progress);
  // 1700-wide viewBox keeps the strokes crisp at large heading sizes.
  const w = 1700;
  const h = 320;
  const accent = Math.max(0, (p - 0.55) / 0.45);
  return (
    <span style={shellStyle()} role="img" aria-label={label}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="trat-wine" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8a2230" />
            <stop offset="1" stopColor="#5a141b" />
          </linearGradient>
        </defs>
        {/* Olive branch glyph — two leaves cradling an italic & */}
        <g
          style={{
            opacity: accent,
            transform: `scale(${0.85 + 0.15 * accent})`,
            transformOrigin: '155px 160px',
            transition: 'opacity 220ms ease-out',
          }}
        >
          <path
            d="M 70 175 Q 120 100 195 145"
            stroke="#7a8a3d"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse
            cx="98"
            cy="120"
            rx="22"
            ry="11"
            fill="#9fb04e"
            transform="rotate(-32 98 120)"
          />
          <ellipse
            cx="160"
            cy="118"
            rx="22"
            ry="11"
            fill="#9fb04e"
            transform="rotate(20 160 118)"
          />
          <text
            x="115"
            y="195"
            fontFamily="'Fraunces', serif"
            fontStyle="italic"
            fontWeight="600"
            fontSize="140"
            fill="#c89b32"
          >
            &amp;
          </text>
        </g>
        {/* Wordmark — Fraunces oversized italic; tiny mono micro-label */}
        <text
          x="260"
          y="170"
          fontFamily="'Fraunces', serif"
          fontWeight="500"
          fontSize="148"
          fill="url(#trat-wine)"
          fontStyle="italic"
          letterSpacing="-2"
        >
          Bella Vista
        </text>
        <text
          x="265"
          y="248"
          fontFamily="'Spline Sans Mono', 'JetBrains Mono', monospace"
          fontSize="46"
          letterSpacing="14"
          fill="#5a141b"
          opacity={0.85}
        >
          TRATTORIA
        </text>
        {/* Brass hairline rule */}
        <line
          x1="260"
          y1="282"
          x2={260 + Math.round(900 * p)}
          y2="282"
          stroke="#c89b32"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// === Tidewater Family Dental =========================================
// Clinical-modern wellness. Rounded teal "tooth + drop" monogram tile,
// Archivo Black wordmark in tide-teal, mint underline ID-strip.
function Dental({progress, label}: {progress: number; label: string}) {
  const p = clamp01(progress);
  const accent = Math.max(0, (p - 0.5) / 0.5);
  return (
    <span style={shellStyle()} role="img" aria-label={label}>
      <svg
        viewBox="0 0 1700 320"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dent-tile" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#13a7b8" />
            <stop offset="1" stopColor="#0a5b66" />
          </linearGradient>
        </defs>
        {/* Monogram tile w/ stylized tooth-glyph */}
        <g
          style={{
            opacity: accent,
            transform: `translateY(${(1 - accent) * 8}px)`,
            transition: 'opacity 220ms ease, transform 220ms ease',
          }}
        >
          <rect
            x="20"
            y="55"
            width="210"
            height="210"
            rx="46"
            fill="url(#dent-tile)"
          />
          <path
            d="M 90 110 Q 90 80 125 80 Q 135 80 145 86 Q 155 80 165 80 Q 200 80 200 110 L 195 175 Q 192 215 175 215 Q 162 215 158 195 L 153 168 Q 150 158 145 158 Q 140 158 137 168 L 132 195 Q 128 215 115 215 Q 98 215 95 175 Z"
            fill="#ffffff"
          />
          <circle cx="178" cy="100" r="14" fill="#7be0d0" opacity="0.85" />
        </g>
        {/* Wordmark */}
        <text
          x="270"
          y="180"
          fontFamily="'Archivo', sans-serif"
          fontWeight="900"
          fontSize="150"
          fill="#0d6e7a"
          letterSpacing="-3"
        >
          TIDEWATER
        </text>
        <text
          x="272"
          y="245"
          fontFamily="'Manrope', system-ui, sans-serif"
          fontWeight="600"
          fontSize="50"
          letterSpacing="6"
          fill="#0d6e7a"
          opacity={0.7}
        >
          FAMILY DENTAL
        </text>
        {/* Mint accent stripe under the wordmark */}
        <rect
          x="270"
          y="262"
          width={Math.round(620 * p)}
          height="6"
          rx="3"
          fill="#7be0d0"
        />
      </svg>
    </span>
  );
}

// === Atlas Hair Co. ==================================================
// Boutique fashion. Hot magenta wordmark on near-black, italic stylized
// scissor-strand glyph as the "A" crossbar accent, sodium-yellow dot
// terminator at the period of "Co."
function Salon({progress, label}: {progress: number; label: string}) {
  const p = clamp01(progress);
  const accent = Math.max(0, (p - 0.4) / 0.6);
  return (
    <span style={shellStyle()} role="img" aria-label={label}>
      <svg
        viewBox="0 0 1700 320"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="salon-magenta" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ff1f8f" />
            <stop offset="1" stopColor="#b6076a" />
          </linearGradient>
        </defs>
        {/* Strand-and-scissor glyph */}
        <g
          style={{
            opacity: accent,
            transition: 'opacity 220ms ease-out',
          }}
        >
          <path
            d="M 40 60 Q 90 180 60 270"
            stroke="#f2ec3a"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 70 60 Q 110 170 80 270"
            stroke="#ff1f8f"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle
            cx="110"
            cy="225"
            r="14"
            fill="none"
            stroke="#0d070b"
            strokeWidth="6"
          />
          <circle
            cx="110"
            cy="255"
            r="14"
            fill="none"
            stroke="#0d070b"
            strokeWidth="6"
          />
          <line
            x1="124"
            y1="218"
            x2="200"
            y2="170"
            stroke="#0d070b"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <line
            x1="124"
            y1="262"
            x2="200"
            y2="200"
            stroke="#0d070b"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
        {/* Wordmark — single <text> with <tspan> siblings so the browser
            auto-advances spacing; manual x= placement was guessing glyph
            widths and clipping. Sodium-yellow terminator anchored via the
            CO. tspan length plus a fixed offset. */}
        <text
          x="240"
          y="200"
          fontFamily="'Syne', sans-serif"
          fontWeight="800"
          fontSize="120"
          letterSpacing="2"
          textLength="1400"
          lengthAdjust="spacingAndGlyphs"
        >
          <tspan fill="url(#salon-magenta)">ATLAS HAIR</tspan>
          <tspan dx="40" fill="#0d070b">
            /
          </tspan>
          <tspan dx="20" fill="#0d070b">
            CO
          </tspan>
          <tspan dx="10" fill="#f2ec3a" style={{opacity: accent}}>
            •
          </tspan>
        </text>
        <text
          x="245"
          y="265"
          fontFamily="'Space Grotesk', 'Inter', sans-serif"
          fontSize="38"
          letterSpacing="10"
          fill="#0d070b"
          opacity={0.65}
        >
          COLOR · CUTS · WALK-INS WELCOME
        </text>
      </svg>
    </span>
  );
}

// === Northside Fitness Co. ===========================================
// Athletic. Bold Bebas-condensed wordmark in jet black, hi-vis yellow
// chevron forming the "N", layered angle stripes giving a speed-glyph,
// stenciled "EST." badge tag.
function Fitness({progress, label}: {progress: number; label: string}) {
  const p = clamp01(progress);
  const accent = Math.max(0, (p - 0.45) / 0.55);
  return (
    <span style={shellStyle()} role="img" aria-label={label}>
      <svg
        viewBox="0 0 1700 320"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hi-vis chevron speed glyph */}
        <g
          style={{
            opacity: accent,
            transform: `translateX(${(1 - accent) * -18}px)`,
            transition: 'opacity 220ms ease, transform 220ms ease',
          }}
        >
          <polygon points="30,260 110,60 175,60 95,260" fill="#f2ec3a" />
          <polygon
            points="115,260 195,60 240,60 160,260"
            fill="#f2ec3a"
            opacity="0.6"
          />
          <polygon
            points="200,260 270,80 305,80 235,260"
            fill="#f2ec3a"
            opacity="0.32"
          />
        </g>
        {/* Wordmark stack — NORTHSIDE big stretched caps top row,
            "FITNESS CO." bottom row, EST. stencil sits left of NORTHSIDE
            on a sub-baseline. <tspan> for spacing between FITNESS and CO. */}
        <text
          x="350"
          y="170"
          fontFamily="'Bebas Neue', sans-serif"
          fontSize="170"
          fill="#0d0d0f"
          letterSpacing="10"
        >
          NORTHSIDE
        </text>
        <text
          x="350"
          y="265"
          fontFamily="'Bebas Neue', sans-serif"
          fontSize="70"
          letterSpacing="12"
        >
          <tspan fill="#0d0d0f">FITNESS</tspan>
          <tspan dx="28" fill="#0d0d0f" opacity="0.45">
            CO.
          </tspan>
        </text>
        {/* EST. stencil badge — top-right of the lockup */}
        <g
          style={{
            opacity: accent,
            transition: 'opacity 220ms ease-out',
          }}
        >
          <rect
            x="1380"
            y="115"
            width="160"
            height="62"
            fill="none"
            stroke="#0d0d0f"
            strokeWidth="4"
          />
          <text
            x="1460"
            y="160"
            fontFamily="'Bebas Neue', sans-serif"
            fontSize="38"
            fill="#0d0d0f"
            textAnchor="middle"
            letterSpacing="6"
          >
            EST. 2014
          </text>
        </g>
      </svg>
    </span>
  );
}

// === Cedar & Co Plumbing =============================================
// Heritage trades. Cedar-brown Zilla slab letterforms, copper pipe-elbow
// glyph as the leading ornament (two pipes meeting at a brass joint),
// brass rivet dots between "Cedar" and "Co", wrench-blue micro-label
// strip beneath.
function Plumbing({progress, label}: {progress: number; label: string}) {
  const p = clamp01(progress);
  const accent = Math.max(0, (p - 0.4) / 0.6);
  return (
    <span style={shellStyle()} role="img" aria-label={label}>
      <svg
        viewBox="0 0 1700 320"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="plumb-copper" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#d68a4a" />
            <stop offset="1" stopColor="#8a4a1d" />
          </linearGradient>
        </defs>
        {/* Pipe-elbow glyph */}
        <g
          style={{
            opacity: accent,
            transition: 'opacity 220ms ease-out',
          }}
        >
          <path
            d="M 35 235 L 35 160 Q 35 110 90 110 L 175 110"
            stroke="url(#plumb-copper)"
            strokeWidth="34"
            fill="none"
            strokeLinecap="butt"
          />
          {/* Flange rings */}
          <rect x="20" y="225" width="30" height="14" fill="#8a4a1d" />
          <rect x="165" y="93" width="14" height="34" fill="#8a4a1d" />
          {/* Brass joint cap */}
          <circle cx="35" cy="160" r="9" fill="#c89b32" />
          <circle cx="170" cy="110" r="9" fill="#c89b32" />
        </g>
        {/* Wordmark — single <text> with <tspan>s so spacing follows the
            font's actual glyph widths. Italic blue ampersand between Cedar
            and Co; dropped the stacked rivet dots that read as a colon. */}
        <text
          x="220"
          y="190"
          fontFamily="'Zilla Slab', serif"
          fontWeight="700"
          fontSize="160"
          letterSpacing="-2"
        >
          <tspan fill="#4a2c14">Cedar</tspan>
          <tspan dx="22" fill="#1d4f7a" fontStyle="italic">
            &amp;
          </tspan>
          <tspan dx="14" fill="#4a2c14">
            Co
          </tspan>
        </text>
        <text
          x="220"
          y="252"
          fontFamily="'Spline Sans Mono', 'JetBrains Mono', monospace"
          fontSize="40"
          fill="#1d4f7a"
          letterSpacing="10"
          opacity={0.85}
        >
          PLUMBING · LICENSED
        </text>
        {/* Wrench-blue rule */}
        <line
          x1="220"
          y1="290"
          x2={220 + Math.round(800 * p)}
          y2="290"
          stroke="#1d4f7a"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
