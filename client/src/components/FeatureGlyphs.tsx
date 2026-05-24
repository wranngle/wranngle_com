import React, {useEffect, useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {PhoneCall, Radio, Zap} from 'lucide-react';

/**
 * FeatureGlyphs — polished animated illustrations for the #features tiles
 * (R3-F002). Drop-in replacements for the inline RadarWatchdog /
 * SpectralAnalyzer / SynapseLink in App.tsx, with the same `() => JSX`
 * signature. Self-contained: own helpers, framer-motion, lucide icons,
 * reduced-motion handling. Aim is "action-shot" motion — one orchestrated
 * loop per tile, not scattered twitches.
 *
 * Import swap in App.tsx:
 *   import {RadarWatchdog, SpectralAnalyzer, SynapseLink} from
 *     '@/components/FeatureGlyphs.tsx';
 * and delete the three inline component definitions + the local radarPoint
 * helper (TypewriterSequence stays — SpectralAnalyzer ships its own).
 */

const SWEEP_S = 3.4;

function radarPoint(angleDeg: number, radius = 64) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {x: Math.cos(rad) * radius, y: Math.sin(rad) * radius};
}

export const RadarWatchdog = () => {
  const reduce = useReducedMotion();
  const calls = [38, 105, 172, 246, 312];
  return (
    <div className="h-48 w-full flex items-center justify-center relative overflow-hidden bg-black/30 rounded-lg border border-white/5">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle, #fff 1px, transparent 1px), radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          backgroundPosition: '0 0, 11px 11px',
        }}
      />

      {[64, 122, 180].map((size) => (
        <motion.div
          key={size}
          className="absolute rounded-full border border-[var(--s500)]"
          style={{width: size, height: size}}
          animate={reduce ? undefined : {opacity: [0.08, 0.26, 0.08]}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: size / 240,
          }}
        />
      ))}

      {/* Crosshair guides */}
      <div className="absolute h-[180px] w-px bg-white/8" />
      <div className="absolute w-[180px] h-px bg-white/8" />

      {/* Conic sweep with a soft trailing wedge. */}
      {reduce ? null : (
        <motion.div
          className="absolute h-44 w-44 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 296deg, rgba(255,95,0,0.32) 350deg, rgba(255,95,0,0.85) 360deg)',
          }}
          animate={{rotate: 360}}
          transition={{duration: SWEEP_S, repeat: Infinity, ease: 'linear'}}
        />
      )}

      {/* Incoming calls: ping ripple, flash white as the sweep lands, settle
          to answered-green. */}
      {calls.map((angle) => {
        const {x, y} = radarPoint(angle);
        const delay = (angle / 360) * SWEEP_S;
        return (
          <div
            key={angle}
            className="absolute"
            style={{transform: `translate(${x}px, ${y}px)`}}
          >
            {reduce ? null : (
              <motion.span
                className="absolute -inset-2 rounded-full border border-white/70"
                animate={{scale: [0.4, 2.2], opacity: [0.8, 0]}}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  repeatDelay: SWEEP_S - 1.1,
                  delay,
                  ease: 'easeOut',
                }}
              />
            )}
            <motion.span
              className="block h-2 w-2 rounded-full"
              style={{backgroundColor: '#5d8c61', boxShadow: '0 0 8px #5d8c61'}}
              animate={
                reduce
                  ? undefined
                  : {
                      backgroundColor: ['#fff', '#fff', '#5d8c61', '#5d8c61'],
                      boxShadow: [
                        '0 0 12px #fff',
                        '0 0 12px #fff',
                        '0 0 8px #5d8c61',
                        '0 0 8px #5d8c61',
                      ],
                      scale: [0.6, 1.7, 1, 1],
                    }
              }
              transition={{
                duration: SWEEP_S,
                repeat: Infinity,
                times: [0, 0.05, 0.14, 1],
                delay,
                ease: 'easeOut',
              }}
            />
          </div>
        );
      })}

      <div className="absolute z-10 flex flex-col items-center gap-0.5">
        <PhoneCall size={14} className="text-[var(--s500)]" aria-hidden />
        <span className="font-mono text-[8px] tracking-widest text-[var(--s500)]">
          ANSWERING
        </span>
        <span className="font-mono text-[8px] tabular-nums text-[#5d8c61]">
          0 MISSED
        </span>
      </div>
    </div>
  );
};

// Deterministic dual-band speech envelope — no Math.random in render.
const SPECTRAL_BARS = Array.from({length: 26}, (_, i) => {
  const envelope = Math.sin((i / 25) * Math.PI);
  const ripple = 0.5 + 0.5 * Math.sin((i / 25) * Math.PI * 4);
  const peak = 24 + envelope * 58 * (0.6 + 0.4 * ripple);
  return {peak: `${Math.round(peak)}%`, delay: (i % 7) * 0.06};
});

export const SpectralAnalyzer = () => {
  const reduce = useReducedMotion();
  return (
    <div className="h-48 w-full flex flex-col justify-between p-4 bg-black/30 rounded-lg border border-white/5 relative overflow-hidden">
      <div className="flex justify-between text-[10px] font-mono opacity-50">
        <span className="inline-flex items-center gap-1">
          <Radio size={10} className="text-[var(--s500)]" aria-hidden /> VOICE
          IN
        </span>
        <span>QUALIFYING</span>
      </div>

      <div className="relative flex items-end justify-between h-24 gap-[2px]">
        {SPECTRAL_BARS.map((bar, i) => (
          <motion.div
            key={i}
            className="w-full rounded-t-sm bg-gradient-to-t from-[var(--s500)] to-[var(--v500)]"
            style={reduce ? {height: bar.peak} : undefined}
            animate={
              reduce ? undefined : {height: ['14%', bar.peak, '20%', '14%']}
            }
            transition={{
              duration: 1.1,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: bar.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Scrub cursor sweeping across the spectrogram. */}
        {reduce ? null : (
          <motion.div
            className="absolute top-0 bottom-0 w-px bg-white/70"
            style={{boxShadow: '0 0 8px rgba(255,255,255,0.8)'}}
            animate={{left: ['0%', '100%']}}
            transition={{duration: 2.8, repeat: Infinity, ease: 'easeInOut'}}
          />
        )}
      </div>

      <div className="mt-2 h-6 w-full bg-black/40 rounded flex items-center px-2 font-mono text-[9px] text-[#5d8c61] gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#5d8c61] animate-pulse" />
        <GlyphTypewriter
          sequence={[
            '> caller intent: new booking',
            '> urgency: high · routed',
            '> qualified — summary ready',
          ]}
        />
      </div>
    </div>
  );
};

export const SynapseLink = () => {
  const reduce = useReducedMotion();
  const lanes = [0, 1, 2];
  return (
    <div className="h-48 w-full flex items-center justify-center relative bg-black/30 rounded-lg border border-white/5 overflow-hidden">
      <div className="absolute left-7 flex flex-col items-center gap-1.5 z-10">
        <div className="w-12 h-12 rounded-full border-2 border-[var(--s500)] flex items-center justify-center bg-[var(--s500)]/10">
          <motion.div
            className="w-3.5 h-3.5 bg-[var(--s500)] rounded-full"
            animate={
              reduce ? undefined : {scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6]}
            }
            transition={{duration: 1.6, repeat: Infinity, ease: 'easeInOut'}}
          />
        </div>
        <span className="font-mono text-[8px] tracking-widest text-white/55">
          AGENT
        </span>
      </div>

      <motion.div
        className="absolute right-7 flex flex-col items-center gap-1.5 z-10"
        animate={reduce ? undefined : {scale: [1, 1, 1.12, 1]}}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          times: [0, 0.78, 0.86, 1],
          ease: 'easeOut',
        }}
      >
        <motion.div
          className="w-12 h-12 rounded-lg border-2 flex items-center justify-center"
          style={
            reduce
              ? {
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }
              : undefined
          }
          animate={
            reduce
              ? undefined
              : {
                  borderColor: [
                    'rgba(255,255,255,0.2)',
                    'rgba(255,255,255,0.2)',
                    '#5d8c61',
                    'rgba(255,255,255,0.2)',
                  ],
                  backgroundColor: [
                    'rgba(255,255,255,0.05)',
                    'rgba(255,255,255,0.05)',
                    'rgba(93,140,97,0.25)',
                    'rgba(255,255,255,0.05)',
                  ],
                }
          }
          transition={{
            duration: 2.4,
            repeat: Infinity,
            times: [0, 0.78, 0.86, 1],
          }}
        >
          <Zap size={18} className="text-white/80" />
        </motion.div>
        <span className="font-mono text-[8px] tracking-widest text-white/55">
          CRM + INBOX
        </span>
      </motion.div>

      {/* Three parallel lanes carrying handoff packets. */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[78, 96, 114].map((y) => (
          <path
            key={y}
            d={`M 56 ${y} C 150 ${y}, 250 ${y}, 300 ${y}`}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            fill="none"
          />
        ))}
        {reduce
          ? null
          : [78, 96, 114].map((y, i) => (
              <motion.path
                key={y}
                d={`M 56 ${y} C 150 ${y}, 250 ${y}, 300 ${y}`}
                stroke="var(--s500)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="5 9"
                animate={{strokeDashoffset: [0, -28]}}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.18,
                }}
              />
            ))}
      </svg>

      {reduce
        ? null
        : lanes.map((i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-3.5 rounded-full bg-white shadow-[0_0_10px_var(--s500)]"
              style={{top: `${[78, 96, 114][i] - 4}px`}}
              initial={{left: '16%', opacity: 0}}
              animate={{left: '80%', opacity: [0, 1, 1, 0]}}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}

      <motion.div
        className="absolute right-4 top-5 bg-[#5d8c61] text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg font-mono"
        animate={
          reduce ? {opacity: 0} : {y: [4, 4, -2, 4], opacity: [0, 0, 1, 0]}
        }
        transition={{
          duration: 2.4,
          repeat: Infinity,
          times: [0, 0.78, 0.88, 1],
        }}
      >
        +1 LEAD
      </motion.div>
    </div>
  );
};

// Self-contained typewriter for the SpectralAnalyzer transcript line.
function GlyphTypewriter({sequence}: {sequence: string[]}) {
  const reduce = useReducedMotion();
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(reduce ? sequence[0].length : 0);

  useEffect(() => {
    if (reduce) return;
    const full = sequence[line] ?? '';
    if (chars < full.length) {
      const t = globalThis.setTimeout(() => {
        setChars((c) => c + 1);
      }, 36);
      return () => {
        globalThis.clearTimeout(t);
      };
    }

    const hold = globalThis.setTimeout(() => {
      setLine((l) => (l + 1) % sequence.length);
      setChars(0);
    }, 1500);
    return () => {
      globalThis.clearTimeout(hold);
    };
  }, [chars, line, reduce, sequence]);

  return (
    <span className="truncate">
      {(sequence[line] ?? '').slice(0, chars)}
      {reduce ? '' : <span className="animate-pulse">▋</span>}
    </span>
  );
}
