import React, {useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {Mic, PhoneCall, Sparkles, Volume2} from 'lucide-react';

/**
 * StackedWidgetCarousel — hero visual that gives the impression of an
 * infinite stack of diverse client landing pages, each running its own
 * ElevenLabs-style voice widget being chatted with. Front card holds the
 * focus (glowing border tracer + full opacity). Back cards step away with
 * scale + blur + opacity. A radial vignette fades the deck into the
 * surrounding page so the stack reads as extending into the background.
 *
 * MVP-only: every "landing page" is a static mock; the widget bubbles
 * cycle through a baked transcript. No real ElevenLabs traffic, no real
 * landing pages, no real audio.
 *
 * Round-2 feedback F002 (homepage) and F013 (/products/websites).
 */

type WidgetMock = {
  id: string;
  brand: string;
  tagline: string;
  /** Tailwind gradient class used on the page-card top half. */
  gradient: string;
  /** Accent hex used on the simulated widget orb. */
  accent: string;
  /** Conversation lines that cycle in the chat bubble. */
  transcript: Array<{speaker: 'caller' | 'agent'; text: string}>;
};

const MOCK_PAGES: WidgetMock[] = [
  {
    id: 'bistro',
    brand: 'River North Bistro',
    tagline: 'Reservations · Private events · Patio season',
    gradient:
      'bg-gradient-to-br from-[#ff5f00]/30 via-[#cf3c69]/15 to-[#12111a]/60',
    accent: '#ff8a3d',
    transcript: [
      {speaker: 'caller', text: 'Table for four, Saturday at 7?'},
      {
        speaker: 'agent',
        text: 'I can hold 7:15 on the patio. Send a confirm text?',
      },
      {speaker: 'caller', text: 'Perfect, yes.'},
      {speaker: 'agent', text: 'Booked. Confirmation sent.'},
    ],
  },
  {
    id: 'dental',
    brand: 'Tide Family Dental',
    tagline: 'Cleanings · Whitening · Emergency same-day',
    gradient:
      'bg-gradient-to-br from-[#5d8c61]/30 via-[#3b82f6]/15 to-[#12111a]/60',
    accent: '#5db38a',
    transcript: [
      {speaker: 'caller', text: 'My filling cracked over the weekend.'},
      {
        speaker: 'agent',
        text: 'I have Dr. Lee at 9:40 tomorrow. Insurance on file?',
      },
      {speaker: 'caller', text: 'Yes, same as before.'},
      {speaker: 'agent', text: "Hold's in. Text reminder going out tonight."},
    ],
  },
  {
    id: 'salon',
    brand: 'Atlas Hair Studio',
    tagline: 'Color · Cuts · Bridal · Walk-in friendly',
    gradient:
      'bg-gradient-to-br from-[#cf3c69]/35 via-[#ff5f00]/15 to-[#12111a]/60',
    accent: '#cf3c69',
    transcript: [
      {speaker: 'caller', text: 'Can I move my balayage to next Wednesday?'},
      {speaker: 'agent', text: 'Riley at 1 PM works. Same color formula?'},
      {speaker: 'caller', text: 'Same, please.'},
      {speaker: 'agent', text: 'Moved. See you Wednesday.'},
    ],
  },
  {
    id: 'fitness',
    brand: 'Northside CrossFit',
    tagline: 'On-ramp · Open gym · Personal training',
    gradient:
      'bg-gradient-to-br from-[#ff9e33]/30 via-[#cf3c69]/15 to-[#12111a]/60',
    accent: '#ffa845',
    transcript: [
      {speaker: 'caller', text: 'Drop-in tomorrow at 6 AM?'},
      {
        speaker: 'agent',
        text: 'Spot open. First class is free — want me to book it?',
      },
      {speaker: 'caller', text: 'Yeah.'},
      {speaker: 'agent', text: 'Booked. Coach Mike will meet you at the door.'},
    ],
  },
];

const DECK_INTERVAL_MS = 4200;
const BUBBLE_INTERVAL_MS = 1700;

type StackedWidgetCarouselProps = {
  isDark: boolean;
  /** Heading shown above the deck. */
  caption: string;
  /** Subtle subheading. */
  subcaption: string;
};

export default function StackedWidgetCarousel({
  isDark,
  caption,
  subcaption,
}: StackedWidgetCarouselProps) {
  const [frontIndex, setFrontIndex] = useState(0);
  // Container size drives the SVG glow-tracer path on the front card.
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- React refs use null sentinel; converting to undefined breaks RefObject<HTMLDivElement> consumers.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dim, setDim] = useState({w: 0, h: 0});

  useEffect(() => {
    const id = globalThis.setInterval(() => {
      setFrontIndex((i) => (i + 1) % MOCK_PAGES.length);
    }, DECK_INTERVAL_MS);
    return () => {
      globalThis.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      setDim({w: r.width, h: r.height});
    };

    update();
    const obs = new ResizeObserver(update);
    obs.observe(containerRef.current);
    return () => {
      obs.disconnect();
    };
  }, []);

  const {w, h} = dim;
  const tracerD =
    w > 0
      ? `M 24 1 L ${w - 4} 1 Q ${w - 1} 1 ${w - 1} 4 L ${w - 1} ${h - 24} Q ${w - 1} ${h - 1} ${w - 24} ${h - 1} L 4 ${h - 1} Q 1 ${h - 1} 1 ${h - 4} L 1 24 Q 1 1 24 1 Z`
      : '';

  return (
    <div
      ref={containerRef}
      className="relative h-[420px] md:h-[480px] w-full"
      data-testid="stacked-widget-carousel"
    >
      {MOCK_PAGES.map((mock, i) => {
        const offset = (i - frontIndex + MOCK_PAGES.length) % MOCK_PAGES.length;
        const isFront = offset === 0;
        const z = MOCK_PAGES.length - offset;
        // Behind-card positioning: each step pushes the card up + back +
        // smaller + more transparent. Front card sits in front, fully
        // visible, with the border tracer animating on it.
        const translateY = -offset * 14;
        const scale = 1 - offset * 0.06;
        const opacity = isFront ? 1 : Math.max(0.18, 0.7 - offset * 0.18);
        const blur = offset * 1.5;
        return (
          <motion.div
            key={mock.id}
            initial={false}
            animate={{
              y: translateY,
              scale,
              opacity,
              filter: `blur(${blur}px)`,
            }}
            transition={{type: 'spring', stiffness: 60, damping: 18}}
            style={{zIndex: z}}
            className="absolute inset-0"
            aria-hidden={!isFront}
          >
            <MockLandingCard
              mock={mock}
              isDark={isDark}
              isFront={isFront}
              tracerD={tracerD}
            />
          </motion.div>
        );
      })}

      {/* Vignette mask: fades the deck into the surrounding page so the
          stack reads as extending out into the background. */}
      <div
        className="pointer-events-none absolute inset-0 z-50"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 30%, rgba(18,17,26,0.55) 78%, rgba(18,17,26,0.92) 100%)'
            : 'radial-gradient(ellipse at center, transparent 30%, rgba(252,250,245,0.55) 78%, rgba(252,250,245,0.92) 100%)',
        }}
      />

      {/* Caption strip below the deck */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-1 z-[60] flex flex-col items-center gap-1 pb-1">
        <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--s500)] flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--s500)] animate-pulse" />
          {caption}
        </div>
        <div className="text-[11px] opacity-60 leading-snug max-w-md text-center">
          {subcaption}
        </div>
      </div>
    </div>
  );
}

function MockLandingCard({
  mock,
  isDark,
  isFront,
  tracerD,
}: {
  mock: WidgetMock;
  isDark: boolean;
  isFront: boolean;
  tracerD: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[20px_4px_20px_4px] border ${
        isDark ? 'border-white/10 bg-[#15141d]' : 'border-black/10 bg-white'
      }`}
      style={{boxShadow: 'var(--shadow-card)'}}
    >
      {/* Animated glow-tracer — only the front card runs it. */}
      {isFront && tracerD ? (
        <div className="absolute inset-0 pointer-events-none z-30">
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <motion.path
              d={tracerD}
              fill="none"
              stroke="var(--s500)"
              strokeWidth="2"
              strokeDasharray="120 1600"
              strokeLinecap="round"
              initial={{strokeDashoffset: 0}}
              animate={{strokeDashoffset: -1720}}
              transition={{duration: 4.2, repeat: Infinity, ease: 'linear'}}
            />
          </svg>
        </div>
      ) : null}

      {/* Fake browser chrome */}
      <div
        className={`h-9 px-3 flex items-center gap-2 border-b ${
          isDark
            ? 'border-white/10 bg-white/[0.03]'
            : 'border-black/10 bg-black/[0.03]'
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-3 mono-font text-[10px] opacity-50 truncate">
          {mock.id}.com
        </span>
      </div>

      {/* Fake hero block */}
      <div className={`relative h-[58%] ${mock.gradient}`}>
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div className="brand-font text-xl md:text-2xl font-bold text-white drop-shadow leading-tight">
            {mock.brand}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-white/75">
            {mock.tagline}
          </div>
        </div>
      </div>

      {/* Fake body block + CTA */}
      <div
        className={`px-5 py-3 ${
          isDark ? 'bg-[#15141d]' : 'bg-white'
        } flex items-center justify-between gap-3 border-t ${
          isDark ? 'border-white/5' : 'border-black/5'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="h-2 rounded-full bg-current opacity-15 w-[88%] mb-1.5" />
          <div className="h-2 rounded-full bg-current opacity-10 w-[64%]" />
        </div>
        <div className="shrink-0">
          <div
            className="h-7 px-3 rounded-full text-[10px] uppercase tracking-wider font-bold text-white inline-flex items-center gap-1.5"
            style={{backgroundColor: mock.accent}}
          >
            <PhoneCall size={11} aria-hidden />
            Call
          </div>
        </div>
      </div>

      {/* Simulated ElevenLabs widget bubble */}
      <MockWidgetBubble mock={mock} isFront={isFront} isDark={isDark} />
    </div>
  );
}

function MockWidgetBubble({
  mock,
  isFront,
  isDark,
}: {
  mock: WidgetMock;
  isFront: boolean;
  isDark: boolean;
}) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!isFront) return;
    const id = globalThis.setInterval(() => {
      setLineIndex((i) => (i + 1) % mock.transcript.length);
    }, BUBBLE_INTERVAL_MS);
    return () => {
      globalThis.clearInterval(id);
    };
  }, [isFront, mock.transcript.length]);

  const currentLine = mock.transcript[lineIndex] ?? mock.transcript[0];
  if (!currentLine) return null;

  return (
    <div className="absolute bottom-3 right-3 z-20 flex items-end gap-2 max-w-[78%]">
      <motion.div
        key={`${mock.id}-${lineIndex}`}
        initial={{opacity: 0, y: 8}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}
        className={`rounded-2xl px-3 py-2 text-[11px] leading-snug shadow-md border ${
          currentLine.speaker === 'agent'
            ? 'bg-[#12111a] text-white border-white/10'
            : isDark
              ? 'bg-white/10 text-white border-white/10'
              : 'bg-white text-[#12111a] border-black/10'
        }`}
      >
        <div className="mono-font text-[9px] uppercase tracking-widest opacity-55 mb-0.5">
          {currentLine.speaker === 'agent' ? 'AI · agent' : 'caller'}
        </div>
        {currentLine.text}
      </motion.div>
      <div
        className="h-11 w-11 rounded-full shrink-0 flex items-center justify-center text-white shadow-lg border border-white/10"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${mock.accent}, #12111a 75%)`,
        }}
        aria-hidden
      >
        {isFront ? (
          <Mic size={16} className="animate-pulse" />
        ) : (
          <Volume2 size={16} />
        )}
      </div>
    </div>
  );
}

export function StackedWidgetCarouselBadge() {
  return (
    <span className="inline-flex items-center gap-1 mono-font text-[10px] uppercase tracking-widest text-[var(--s500)]">
      <Sparkles size={11} className="sarah-glimmer" aria-hidden />
      Live across client sites
    </span>
  );
}
