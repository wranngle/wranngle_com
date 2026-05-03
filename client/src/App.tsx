// @ts-nocheck
import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {Check, ArrowRight, Zap, FileText} from 'lucide-react';
import {OFFERING_CATEGORIES, type OfferingItem} from '@/data/offerings.ts';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import {Dialog, DialogContent, DialogTrigger} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

const INITIAL_DIM = {w: 0, h: 0};
const CONSOLE_LINES = [
  {text: '[INFO] System initializing...', color: 'text-gray-400'},
  {text: '> Detecting missed calls (Last 24h)...', color: 'text-gray-300'},
  {text: '[WARN] 14 Potential Leads Unanswered', color: 'text-yellow-400'},
  {text: '> Loading HVAC/Plumbing Knowledge Base...', color: 'text-cyan-400'},
  {text: '> Syncing Calendar Availability...', color: 'text-cyan-400'},
  {text: '> Est. Recovered Revenue: $4,200/mo', color: 'text-green-400'},
  {text: '\n[READY] Agent awaiting deployment command.', color: 'text-white'},
];

const WranngleLanding = () => {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    const scriptId = 'el-convai-v1';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@beta';
      s.async = true;
      s.crossOrigin = 'anonymous';
      document.head.append(s);
    }

    const handleOutsideClick = (e) => {
      // Don't trigger if clicking inside a dialog
      if (e.target.closest('[role="dialog"]')) return;

      const widget = document.querySelector('elevenlabs-convai');
      if (widget && !widget.contains(e.target)) {
        const rect = widget.getBoundingClientRect();
        if (rect.height > 80 && widget.shadowRoot) {
          // Only dispatch Escape if no dialog is open to avoid conflicts
          const isDialogOpen = document.querySelector('[role="dialog"]');
          if (!isDialogOpen) {
            widget.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true,
              }),
            );
          }

          const buttons = [...widget.shadowRoot.querySelectorAll('button')];
          const closeBtn = buttons.find((b) => {
            const label = (
              b.ariaLabel ||
              b.title ||
              b.innerText ||
              ''
            ).toLowerCase();
            return (
              label.includes('close') ||
              label.includes('minimize') ||
              label.includes('collapse')
            );
          });

          if (closeBtn) {
            closeBtn.click();
          }
        }
      }
    };

    globalThis.addEventListener('click', handleOutsideClick);
    return () => {
      globalThis.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Scroll to anchor on hash navigation (e.g. /#offerings, /#offerings-premium).
  useEffect(() => {
    const hash = globalThis.location.hash?.slice(1);
    if (!hash) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(hash);
      if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main className="flex-1 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
          >
            <h1 className="brand-font text-5xl md:text-7xl font-bold leading-none mb-8">
              Tame the <br />
              <span className="text-[var(--s500)]">Wild Frontier</span> <br />
              of AI.
            </h1>
            <p className="text-lg opacity-80 mb-10 max-w-md">
              The 24/7 AI Voice Agent for small trades businesses. Stop missing
              leads after hours.
            </p>
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <ButtonPrimary>DEPLOY AGENT</ButtonPrimary>
                </DialogTrigger>
                <DialogContent
                  className={
                    isDark
                      ? 'bg-[#12111a] text-[#fcfaf5] border-white/10'
                      : 'bg-white text-[#12111a] border-black/10'
                  }
                >
                  <IntakeForm selectedPackage="premium" />
                </DialogContent>
              </Dialog>
              <ButtonGhost
                onClick={() => {
                  const element = document.querySelector('elevenlabs-convai');
                  element?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                  setTimeout(() => {
                    const btn = element?.shadowRoot?.querySelector('button');
                    if (btn) btn.click();
                  }, 1000);
                }}
              >
                LIVE DEMO
              </ButtonGhost>
            </div>
          </motion.div>
          <ConsoleVisual isDark={isDark} lines={CONSOLE_LINES} />
        </main>

        <OfferingsSection isDark={isDark} />

        <section
          id="features"
          className="py-32 px-6 max-w-7xl mx-auto w-full relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,95,0,0.03),transparent_70%)] pointer-events-none" />
          <div className="mb-24 relative z-10">
            <h2 className="brand-font text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight">
              Industrial-Grade <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
                Defense System
              </span>{' '}
              <br />
              For Your Revenue.
            </h2>
            <p className="opacity-60 max-w-xl text-lg leading-relaxed">
              Manual reception is a vulnerability. Wranngle deploys an
              autonomous, deterministic layer that insulates your business from
              chaos.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            <TerminalCard
              isDark={isDark}
              title="TEMPORAL_SENTINEL"
              status="SCANNING"
              index="01"
            >
              <RadarWatchdog />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Total Temporal Coverage
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  A persistent, non-sleeping observer. Whether it's 2 AM or
                  Christmas Day, the sentinel intercepts every signal.
                </p>
              </div>
            </TerminalCard>

            <TerminalCard
              isDark={isDark}
              title="SPECTRAL_GATE"
              status="FILTERING"
              index="02"
            >
              <SpectralAnalyzer />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Signal Validation
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Advanced heuristics analyze caller intent in real-time. Spam
                  is vaporized. Revenue is crystalized.
                </p>
              </div>
            </TerminalCard>

            <TerminalCard
              isDark={isDark}
              title="SYNAPSE_UPLINK"
              status="CONNECTED"
              index="03"
            >
              <SynapseLink />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Zero-Latency Uplink
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Valid leads are transmuted into structured data and injected
                  directly into your mobile device via SMS.
                </p>
              </div>
            </TerminalCard>
          </div>
        </section>

        <React.Suspense fallback={null}>
          <FAQ isDark={isDark} />
        </React.Suspense>

        {/* Anchor target for "Talk to Sarah" links from anywhere on the site. */}
        <section
          id="talk-to-sarah"
          className="py-16 px-6 max-w-3xl mx-auto w-full text-center"
        >
          <h2 className="brand-font text-3xl md:text-4xl font-bold mb-3">
            Talk to <span className="text-[var(--s500)]">Sarah</span>
          </h2>
          <p className="opacity-70 text-base">
            Our live demo voice agent runs in the corner of this page. Click the
            floating widget to start a conversation.
          </p>
        </section>

        <SiteFooter isDark={isDark} />

        <elevenlabs-convai agent-id="agent_xxxx_demo"></elevenlabs-convai>
      </div>
    </div>
  );
};

const FAQ = React.lazy(async () => import('@/components/FAQ.tsx'));

/**
 * OfferingsSection — full catalog (formerly /offerings page) consolidated
 * onto the home page. Each card has both a "View Spec Sheet" Dialog
 * (AgentFactsPopout) AND a primary CTA that opens the IntakeForm.
 */
function OfferingsSection({isDark}: {isDark: boolean}) {
  const [activeCategory, setActiveCategory] = useState(
    OFFERING_CATEGORIES[0]?.id ?? 'ai-agents',
  );

  return (
    <section
      id="offerings"
      className="py-24 px-6 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      <div className="text-center mb-12">
        <h2 className="brand-font text-4xl md:text-5xl font-bold mb-4">
          Our Offerings
        </h2>
        <p className="text-lg opacity-60 max-w-xl mx-auto">
          Everything you need to automate, convert, and grow.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-12 flex-wrap">
        {OFFERING_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
            }}
            className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              activeCategory === cat.id
                ? 'bg-[var(--s500)] text-white'
                : isDark
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {OFFERING_CATEGORIES.filter((c) => c.id === activeCategory).map(
        (category) => (
          <motion.div
            key={category.id}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.3}}
          >
            <p className="text-center opacity-60 mb-10 text-sm">
              {category.description}
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {category.items.map((item) => (
                <OfferingCard key={item.id} item={item} isDark={isDark} />
              ))}
            </div>
          </motion.div>
        ),
      )}
    </section>
  );
}

function OfferingCard({item, isDark}: {item: OfferingItem; isDark: boolean}) {
  const [factsOpen, setFactsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);

  return (
    <div
      id={`offerings-${item.id}`}
      className="relative group h-full scroll-mt-24"
    >
      <div
        className={`relative h-full p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${
          isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
        } flex flex-col noise-overlay overflow-hidden`}
      >
        {item.badge && (
          <div className="absolute top-0 left-8 bg-[var(--v500)] text-[9px] font-bold px-4 py-1.5 rounded-b-lg uppercase tracking-wider shadow-md z-30 border-x border-b border-white/10">
            {item.badge}
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2 mt-6">
            <h3 className="brand-font text-2xl font-bold">{item.name}</h3>
          </div>
          <p className="text-sm opacity-60 mb-6">{item.description}</p>

          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <div className="text-4xl font-bold">
                ${item.price}
                {item.facts ? (
                  <span className="text-sm font-normal opacity-50">/mo</span>
                ) : (
                  <span className="text-sm font-normal opacity-50">
                    {' '}
                    one-time
                  </span>
                )}
              </div>
              {item.monthlyAddon && (
                <div className="text-sm opacity-60 mt-1">
                  + ${item.monthlyAddon.price}/mo {item.monthlyAddon.label}
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {item.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm opacity-80"
                >
                  <Check size={16} className="text-[var(--s500)] shrink-0" />{' '}
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {item.facts && (
            <Dialog open={factsOpen} onOpenChange={setFactsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full mb-3 px-4 py-2 border border-current rounded-md text-xs font-bold uppercase tracking-wider opacity-80 hover:opacity-100 hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> View Spec Sheet
                </button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-fit outline-none">
                <AgentFactsPopout
                  facts={item.facts}
                  itemName={item.name}
                  onGetStarted={() => {
                    setFactsOpen(false);
                    setIntakeOpen(true);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={intakeOpen} onOpenChange={setIntakeOpen}>
            <DialogTrigger asChild>
              <Button
                className={`w-full ${
                  item.badge
                    ? 'bg-[var(--v500)] hover:bg-[var(--v500)]/90 hover:scale-[1.02] transition-all'
                    : isDark
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-black/10 text-black hover:bg-black/20'
                }`}
              >
                {item.cta} <ArrowRight size={14} className="ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className={
                isDark
                  ? 'bg-[#12111a] text-[#fcfaf5] border-white/10'
                  : 'bg-white text-[#12111a] border-black/10'
              }
            >
              <IntakeForm selectedPackage={item.id} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

const ButtonPrimary = React.forwardRef(({children, ...props}, ref) => (
  <button
    ref={ref}
    {...props}
    className="px-8 py-4 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-105 transition-all flex items-center gap-2"
  >
    {children} <ArrowRight size={14} />
  </button>
));

const ButtonGhost = ({children, ...props}) => (
  <button
    {...props}
    className="px-8 py-4 border border-current font-bold uppercase text-xs rounded-lg hover:bg-white/5 transition-all"
  >
    {children}
  </button>
);

const ConsoleVisual = ({isDark, lines}) => {
  const [display, setDisplay] = useState([]);
  const idx = useRef(0);
  const containerRef = useRef(null);
  const [dim, setDim] = useState(INITIAL_DIM);

  useEffect(() => {
    setDisplay([]);
    idx.current = 0;
    const interval = setInterval(() => {
      if (idx.current < lines.length) {
        const line = lines[idx.current];
        if (line) setDisplay((previous) => [...previous, line]);
        idx.current++;
      } else clearInterval(interval);
    }, 800);
    return () => {
      clearInterval(interval);
    };
  }, [lines]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDim = () => {
      const {width, height} = containerRef.current.getBoundingClientRect();
      setDim({w: width, h: height});
    };

    updateDim();
    const observer = new ResizeObserver(updateDim);
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const {w} = dim;
  const {h} = dim;
  const pathD =
    w > 0
      ? `
    M 24 1
    L ${w - 4} 1
    Q ${w - 1} 1 ${w - 1} 4
    L ${w - 1} ${h - 24}
    Q ${w - 1} ${h - 1} ${w - 24} ${h - 1}
    L 4 ${h - 1}
    Q 1 ${h - 1} 1 ${h - 4}
    L 1 24
    Q 1 1 24 1
    Z
  `
      : '';

  return (
    <div
      ref={containerRef}
      className={`relative h-80 w-full rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${isDark ? 'border-white/10 bg-[#0f0f13] text-gray-400' : 'border-black/10 bg-[#1a1a1e] text-gray-400'} p-6 mono-font text-[11px] flex flex-col overflow-hidden noise-overlay`}
      style={{boxShadow: 'var(--shadow-card)'}}
    >
      <div className="absolute inset-0 pointer-events-none z-20">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--s500)"
            strokeWidth="2"
            strokeDasharray="100 1500"
            strokeLinecap="round"
            initial={{strokeDashoffset: 0}}
            animate={{strokeDashoffset: -1600}}
            transition={{duration: 4, repeat: Infinity, ease: 'linear'}}
          />
        </svg>
      </div>

      <div className="flex justify-between border-b border-white/10 pb-2 mb-4 relative z-10">
        <span className="text-white font-bold opacity-0">_</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{' '}
          LIVE
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 relative z-10">
        {display.map(
          (l, i) =>
            l && (
              <motion.div
                key={i}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className={l.color || ''}
              >
                {l.text || ''}
              </motion.div>
            ),
        )}
        <motion.span
          animate={{opacity: [0, 1, 0]}}
          transition={{repeat: Infinity}}
          className="text-[var(--s500)] font-bold"
        >
          _
        </motion.span>
      </div>
    </div>
  );
};

const RadarWatchdog = () => {
  return (
    <div className="h-48 w-full flex items-center justify-center relative overflow-hidden bg-black/20 rounded-lg border border-white/5">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, #fff 1px, transparent 1px), radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {[60, 120, 180].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[var(--s500)] opacity-20"
          style={{width: size, height: size}}
        />
      ))}

      <motion.div
        className="absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tl from-[var(--s500)]/0 to-[var(--s500)]/50"
        style={{top: 0, left: 0, borderRight: '1px solid var(--s500)'}}
        animate={{rotate: 360}}
        transition={{duration: 4, repeat: Infinity, ease: 'linear'}}
      />

      <motion.div
        className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
        initial={{opacity: 0, scale: 0, top: '30%', left: '40%'}}
        animate={{opacity: [0, 1, 0], scale: [0, 1.5, 0]}}
        transition={{duration: 2, repeat: Infinity, repeatDelay: 1}}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 bg-[var(--v500)] rounded-full shadow-[0_0_10px_var(--v500)]"
        initial={{opacity: 0, scale: 0, top: '60%', left: '70%'}}
        animate={{opacity: [0, 1, 0], scale: [0, 1.5, 0]}}
        transition={{duration: 3, repeat: Infinity, repeatDelay: 0.5}}
      />

      <div className="absolute z-10 text-[8px] font-mono text-[var(--s500)] flex flex-col items-center">
        <span>TGT_ACQ</span>
        <span className="tabular-nums">34.9023</span>
      </div>
    </div>
  );
};

const SpectralAnalyzer = () => {
  return (
    <div className="h-48 w-full flex flex-col justify-between p-4 bg-black/20 rounded-lg border border-white/5 relative overflow-hidden">
      <div className="flex justify-between text-[10px] font-mono opacity-50 mb-2">
        <span>FREQ: 44.1kHz</span>
        <span>GAIN: +12dB</span>
      </div>

      <div className="flex items-end justify-between h-24 gap-1">
        {Array.from({length: 20}).map((_, i) => (
          <motion.div
            key={i}
            className="w-full bg-[var(--s500)] rounded-t-sm opacity-80"
            animate={{
              height: ['10%', `${Math.random() * 80 + 20}%`, '10%'],
              backgroundColor:
                i > 12 ? ['#cf3c69', '#cf3c69'] : ['#ff5f00', '#ff5f00'],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: i * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="mt-2 h-6 w-full bg-black/40 rounded flex items-center px-2 font-mono text-[9px] text-green-400 gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <TypewriterSequence
          sequence={[
            '> VOICE_MATCH_CONFIRMED',
            '> SENTIMENT: POSITIVE',
            '> ROUTING_TO_SALES',
          ]}
        />
      </div>
    </div>
  );
};

const SynapseLink = () => {
  return (
    <div className="h-48 w-full flex items-center justify-center relative bg-black/20 rounded-lg border border-white/5">
      <div className="absolute left-8 w-12 h-12 rounded-full border-2 border-[var(--s500)] flex items-center justify-center bg-[var(--s500)]/10 z-10">
        <div className="w-4 h-4 bg-[var(--s500)] rounded-full animate-ping opacity-50" />
      </div>
      <div className="absolute right-8 w-12 h-12 rounded-lg border-2 border-white/20 flex items-center justify-center bg-white/5 z-10">
        <Zap size={18} />
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d="M 60 96 C 150 96, 250 96, 300 96"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 60 96 C 150 96, 250 96, 300 96"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5 5"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--s500)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 w-3 h-1.5 bg-white rounded-full shadow-[0_0_10px_var(--s500)]"
          initial={{left: '15%', opacity: 0}}
          animate={{left: '80%', opacity: [0, 1, 1, 0]}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'linear',
          }}
          style={{marginTop: -3}}
        />
      ))}

      <motion.div
        className="absolute right-0 top-6 bg-white text-black text-[9px] font-bold px-2 py-1 rounded shadow-lg font-mono"
        animate={{y: [0, -5, 0], opacity: [0.5, 1, 0.5]}}
        transition={{duration: 2, repeat: Infinity}}
      >
        +1 LEAD
      </motion.div>
    </div>
  );
};

const TerminalCard = ({children, title, status, index, isDark}) => (
  <div className="relative group">
    <div
      className={`relative h-full p-1 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${isDark ? 'border-white/10 bg-[#12111a]' : 'border-black/10 bg-white'} overflow-hidden noise-overlay`}
      style={{boxShadow: 'var(--shadow-card)'}}
    >
      <div
        className={`absolute inset-0 border border-white/5 rounded-[24px_4px_24px_4px] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm transition-colors group-hover:border-[var(--s500)]/50 pointer-events-none z-10`}
      />

      <div className="relative p-6 h-full flex flex-col z-20">
        <div className="flex justify-between items-center mb-6 font-mono text-[10px] tracking-widest text-[var(--s500)]">
          <span className="border border-[var(--s500)]/30 px-2 py-0.5 rounded bg-[var(--s500)]/5">
            MOD_{index} // {title}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_infinite]" />
            {status}
          </span>
        </div>

        {children}
      </div>
    </div>
  </div>
);

const TypewriterSequence = ({sequence}) => {
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((previous) => (previous + 1) % sequence.length);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [sequence]);

  return (
    <div className="w-full overflow-hidden whitespace-nowrap">
      <motion.div
        key={currentLine}
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0}}
      >
        {sequence[currentLine]}
      </motion.div>
    </div>
  );
};

export default WranngleLanding;
