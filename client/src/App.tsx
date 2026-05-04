// @ts-nocheck
import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {Check, ArrowRight, Zap, FileText} from 'lucide-react';
import {Link} from 'wouter';
import {OFFERING_CATEGORIES, type OfferingItem} from '@/data/offerings.ts';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import {Dialog, DialogContent, DialogTrigger} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {
  SARAH_AGENT_ID,
  ensureSarahWidgetScript,
  openSarahWidget,
} from '@/lib/sarah.ts';

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
    ensureSarahWidgetScript();

    const handleOutsideClick = (e) => {
      // Bail if click is inside any Radix-managed surface (Dialog, DropdownMenu,
      // Popover, Tooltip…). Without this, opening the mega-menu fires this
      // handler on the same tick and the bubbling Escape we dispatch below
      // reaches Radix's document keydown listener — which closes the menu
      // we just opened. (Same risk for any popper-based UI.)
      const {target} = e;
      if (
        target.closest?.(
          '[role="dialog"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper], [data-radix-portal]',
        )
      )
        return;

      const widget = document.querySelector('elevenlabs-convai');
      if (widget && !widget.contains(e.target)) {
        const rect = widget.getBoundingClientRect();
        if (rect.height > 80 && widget.shadowRoot) {
          // Dispatch a NON-bubbling Escape so Radix's document-level keydown
          // listener never sees it. The widget's own shadow-DOM listener still
          // catches it because dispatchEvent fires synchronously on its target.
          const isDialogOpen = document.querySelector(
            '[role="dialog"], [role="menu"]',
          );
          if (!isDialogOpen) {
            widget.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: false,
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
                  openSarahWidget();
                }}
              >
                TALK TO SARAH
              </ButtonGhost>
            </div>
          </motion.div>
          <ConsoleVisual isDark={isDark} lines={CONSOLE_LINES} />
        </main>

        <section
          id="features"
          className="py-32 px-6 max-w-7xl mx-auto w-full relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,95,0,0.03),transparent_70%)] pointer-events-none" />
          <div className="mb-24 relative z-10">
            <h2 className="brand-font text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight">
              What the agent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
                actually does
              </span>{' '}
            </h2>
            <p className="opacity-60 max-w-xl text-lg leading-relaxed">
              No "AI transformation" fog. The agent answers, qualifies, books,
              and sends the lead where you already work.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            <TerminalCard
              isDark={isDark}
              title="24_7_COVERAGE"
              status="ANSWERING"
              index="01"
            >
              <RadarWatchdog />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Never miss a call
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Every ring gets answered, including 2 AM, holidays, and the
                  hours when your crew is already on a job.
                </p>
              </div>
            </TerminalCard>

            <TerminalCard
              isDark={isDark}
              title="LEAD_QUALIFY"
              status="FILTERING"
              index="02"
            >
              <SpectralAnalyzer />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Filter spam, capture revenue
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  The agent sorts service calls from junk, gathers the details,
                  and escalates only the leads worth your time.
                </p>
              </div>
            </TerminalCard>

            <TerminalCard
              isDark={isDark}
              title="INSTANT_HANDOFF"
              status="CONNECTED"
              index="03"
            >
              <SynapseLink />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Texts you the lead
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Name, address, job type, urgency, and transcript arrive in a
                  structured handoff while the caller is still warm.
                </p>
              </div>
            </TerminalCard>
          </div>
        </section>

        <OfferingsSection isDark={isDark} />

        <TalkToSarahSection isDark={isDark} />

        <React.Suspense fallback={null}>
          <FAQ isDark={isDark} />
        </React.Suspense>

        <FounderNote isDark={isDark} />

        <SiteFooter isDark={isDark} />

        <elevenlabs-convai agent-id={SARAH_AGENT_ID}></elevenlabs-convai>
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
  const [activeCategory, setActiveCategory] = useState(() => {
    // Lazy-init from the URL hash so deep-links like
    // /#offerings-cat-websites render the right tab on the first paint
    // (no AI Agents → Websites flash).
    if (globalThis.window !== undefined) {
      const hash = globalThis.location.hash?.slice(1) ?? '';
      const prefix = 'offerings-cat-';
      if (hash.startsWith(prefix)) {
        const requested = hash.slice(prefix.length);
        const matched = OFFERING_CATEGORIES.find((c) => c.id === requested);
        if (matched) return matched.id;
      }
    }

    return OFFERING_CATEGORIES[0]?.id ?? 'ai-agents';
  });

  // React to subsequent `#offerings-cat-<id>` hash changes (mega menu
  // clicks while already on /). Lazy-init above already handled
  // first-paint, so this just re-applies on hashchange events.
  useEffect(() => {
    const apply = () => {
      const hash = globalThis.location.hash?.slice(1) ?? '';
      const prefix = 'offerings-cat-';
      if (!hash.startsWith(prefix)) return;
      const requested = hash.slice(prefix.length);
      const matched = OFFERING_CATEGORIES.find((c) => c.id === requested);
      if (!matched) return;
      setActiveCategory(matched.id);
      requestAnimationFrame(() => {
        const target = document.getElementById('offerings');
        if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
      });
    };

    // Run once on mount too — handles deep-link scroll behavior even
    // though the tab is already correct from lazy-init.
    apply();
    globalThis.addEventListener('hashchange', apply);
    return () => {
      globalThis.removeEventListener('hashchange', apply);
    };
  }, []);

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
        {OFFERING_CATEGORIES.map((cat) => {
          const isGtmOps = cat.id === 'gtm_ops';
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
              }}
              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                isGtmOps
                  ? 'mono-font tracking-[0.06em]'
                  : 'uppercase tracking-wider'
              } ${
                activeCategory === cat.id
                  ? 'bg-[var(--s500)] text-white'
                  : isDark
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {OFFERING_CATEGORIES.filter((c) => c.id === activeCategory).map(
        (category) => (
          <motion.div
            key={category.id}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.3}}
          >
            <p className="text-center opacity-60 mb-6 text-sm">
              {category.description}
            </p>

            {category.id === 'gtm_ops' && (
              <div className="max-w-3xl mx-auto mb-8">
                <Link href="/products/gtm-ops">
                  <a
                    className={`group flex items-center justify-between gap-4 px-5 py-4 rounded-[12px_4px_12px_4px] border-y border-r border-l-4 border-l-[var(--v500)] transition-colors hover:border-l-[var(--s500)] ${
                      isDark
                        ? 'border-white/10 bg-[#18181b] hover:bg-[#1f1f24]'
                        : 'border-black/5 bg-white hover:bg-[#faf6ed]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-1">
                        DEDICATED PRODUCT PAGE
                      </div>
                      <p className="text-sm font-bold leading-tight">
                        See the full gtm_ops pipeline, demo, and architecture
                        before picking a tier.
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-[var(--s500)] shrink-0 group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                </Link>
              </div>
            )}

            <div
              className={`grid gap-8 mx-auto ${
                category.id === 'gtm_ops'
                  ? 'md:grid-cols-3 max-w-6xl'
                  : 'md:grid-cols-2 max-w-4xl'
              }`}
            >
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
  const isSaas = item.facts?.kind === 'saas';
  const priceLabel = item.price === '0' ? 'Free' : `$${item.price}`;

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
            <div>
              {isSaas && (
                <div className="mono-font text-[10px] text-[var(--s500)] tracking-[0.08em] mb-1">
                  gtm_ops // SAAS
                </div>
              )}
              <h3 className="brand-font text-2xl font-bold">{item.name}</h3>
            </div>
          </div>
          <p className="text-sm opacity-60 mb-6">{item.description}</p>

          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <div className="text-4xl font-bold">
                {priceLabel}
                {item.price !== '0' && (
                  <span className="text-sm font-normal opacity-50">
                    {item.priceCadence === 'monthly' ? '/mo' : ' one-time'}
                  </span>
                )}
              </div>
              {item.monthlyAddon && (
                <div className="text-sm opacity-60 mt-1">
                  {isSaas
                    ? `or $${item.monthlyAddon.price}${item.monthlyAddon.label}`
                    : `+ $${item.monthlyAddon.price}/mo ${item.monthlyAddon.label}`}
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
                    // Close popout, then open intake on the next tick — Radix
                    // Dialog focus-trap cleanup races if both happen in the
                    // same render commit, which manifested as the spec sheet
                    // closing without the intake ever opening.
                    setFactsOpen(false);
                    globalThis.setTimeout(() => {
                      setIntakeOpen(true);
                    }, 80);
                  }}
                  onCrossSell={(targetId) => {
                    setFactsOpen(false);
                    // Hash-jump to the cross-sell card so the user lands on the
                    // right offering tile and can read it in context.
                    globalThis.location.hash = `offerings-${targetId}`;
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

function TalkToSarahSection({isDark}: {isDark: boolean}) {
  return (
    <section id="talk-to-sarah" className="py-24 px-6 max-w-7xl mx-auto w-full">
      <div
        className={`relative overflow-hidden rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] p-8 md:p-12 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center noise-overlay ${
          isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
        }`}
        style={{boxShadow: 'var(--shadow-card)'}}
      >
        <div className="relative z-10">
          <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4">
            LIVE // ELEVENLABS CONVAI
          </div>
          <h2 className="brand-font text-4xl md:text-5xl font-bold leading-tight mb-5">
            Hear it for yourself. <br />
            <span className="text-[var(--s500)]">Talk to Sarah.</span>
          </h2>
          <p className="text-base md:text-lg opacity-75 leading-relaxed max-w-xl mb-7">
            Sarah is the live demo agent. Pretend you need a plumber at 11 PM:
            she will answer, qualify the job, collect the handoff, and show the
            customer experience your callers would get.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openSarahWidget}
              className="px-7 py-3 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              Start Voice Demo <ArrowRight size={14} />
            </button>
            <a
              href="#offerings"
              className="px-7 py-3 border border-current font-bold uppercase text-xs rounded-lg hover:bg-white/5 transition-all"
            >
              See Plans
            </a>
          </div>
          <div className="mono-font mt-6 text-[11px] opacity-55 flex flex-wrap gap-4">
            <span>2 min average</span>
            <span>No signup</span>
            <span>Mic permissions required</span>
          </div>
        </div>

        <div className="relative z-10 console-panel-like rounded-[16px_4px_16px_4px] bg-[#101014] border border-white/10 p-6 min-h-[240px] flex flex-col justify-between">
          <div className="flex items-center justify-between mono-font text-[10px] tracking-widest text-white/50">
            <span>SARAH // v3.2</span>
            <span className="inline-flex items-center gap-2 text-[#5d8c61] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#5d8c61] animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 h-32">
            {Array.from({length: 28}).map((_, index) => (
              <motion.div
                key={index}
                className={`w-1 rounded-full ${
                  index % 3 === 0 ? 'bg-[var(--v500)]' : 'bg-[var(--s500)]'
                }`}
                animate={{height: ['22%', '82%', '34%', '68%', '22%']}}
                transition={{
                  duration: 1.3 + (index % 5) * 0.12,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: index * 0.025,
                }}
              />
            ))}
          </div>
          <div className="mono-font text-[10px] text-white/60 flex flex-wrap justify-between gap-3">
            <span>"Thanks for calling. What is going on?"</span>
            <span className="text-[#5d8c61]">Powered by ElevenLabs</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderNote({isDark}: {isDark: boolean}) {
  return (
    <section id="about" className="py-12 px-6 max-w-3xl mx-auto w-full">
      <Link href="/about">
        <a
          className={`group block rounded-[16px_4px_16px_4px] border-y border-r border-l-4 border-l-[var(--v500)] p-5 md:p-6 noise-overlay transition-all hover:scale-[1.005] ${
            isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-1.5">
                BUILT BY AN OPERATOR
              </div>
              <p className="brand-font text-base md:text-lg font-bold leading-snug">
                "AI should answer the phone, not add another dashboard."
              </p>
              <p className="text-xs opacity-60 mt-1.5">
                Read the operator story →
              </p>
            </div>
            <ArrowRight
              size={18}
              className="text-[var(--v500)] shrink-0 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </a>
      </Link>
    </section>
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
