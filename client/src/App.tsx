import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  FileText,
  MessageSquareText,
  PhoneCall,
  Zap,
} from 'lucide-react';
import {Link} from 'wouter';
import {OFFERING_CATEGORIES, type OfferingItem} from '@/data/offerings.ts';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import Ticker from '@/components/Ticker.tsx';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import type {AgentState} from '@/components/ui/orb.tsx';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {
  SARAH_AGENT_ID,
  ensureSarahWidgetScript,
  goTalkToSarah,
  openSarahWidget,
} from '@/lib/sarah.ts';

const INITIAL_DIM = {w: 0, h: 0};
const CONSOLE_LINES = [
  {text: '[LIVE] After-hours forwarding enabled', color: 'text-gray-400'},
  {text: '> New caller: urgent after-hours request', color: 'text-gray-300'},
  {text: '[CHECK] Account context confirmed', color: 'text-green-400'},
  {text: '> Collected name, phone, address, and issue', color: 'text-cyan-400'},
  {text: '> Booking window matched to calendar', color: 'text-cyan-400'},
  {text: '> Sent transcript and summary to team', color: 'text-green-400'},
  {text: '\n[READY] Next call can be answered.', color: 'text-white'},
];

const VOICE_HERO_METRICS = [
  {value: '24/7', label: 'after-hours coverage'},
  {value: '2,500', label: 'included voice minutes'},
  {value: '3', label: 'channels: voice, web, SMS'},
];

const VOICE_OPS_SIGNALS = [
  {
    Icon: PhoneCall,
    label: 'Answers missed calls',
    body: 'Forward missed, overflow, and after-hours calls before the lead hits voicemail.',
  },
  {
    Icon: MessageSquareText,
    label: 'Gets the request details',
    body: 'Name, contact info, request type, urgency, context, and transcript land in one handoff.',
  },
  {
    Icon: CalendarCheck,
    label: 'Hands off cleanly',
    body: 'Book available windows, flag urgent calls, and notify the person who owns the next step.',
  },
];

const OFFERINGS_CATEGORY_HASH_PREFIX = 'offerings-cat-';
const OFFERINGS_ITEM_HASH_PREFIX = 'offerings-';
const SARAH_ORB_STATES: AgentState[] = ['thinking', 'listening', 'talking'];
type HomeAbVariant = 'control' | 'value-first';

const AB_STORAGE_KEY = 'wranngle-ab-home-v1';
const AB_VARIANTS: HomeAbVariant[] = ['control', 'value-first'];

function resolveHomeAbVariant() {
  if (globalThis.window === undefined) return 'control';

  const queryVariant = new URLSearchParams(globalThis.location.search).get(
    'ab',
  );
  if (queryVariant === 'control' || queryVariant === 'value-first') {
    globalThis.localStorage.setItem(AB_STORAGE_KEY, queryVariant);
    return queryVariant;
  }

  const cached = globalThis.localStorage.getItem(AB_STORAGE_KEY);
  if (cached === 'control' || cached === 'value-first') return cached;

  const pick =
    AB_VARIANTS[globalThis.Math.floor(Math.random() * AB_VARIANTS.length)];
  globalThis.localStorage.setItem(AB_STORAGE_KEY, pick);
  return pick;
}

function formatPrice(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\\.0?0$/, '');
}

function findOfferingCategoryId(offeringId: string) {
  return OFFERING_CATEGORIES.find((category) =>
    category.items.some((item) => item.id === offeringId),
  )?.id;
}

function resolveOfferingsHash(rawHash: string) {
  const hash = rawHash.replace(/^#/, '');
  if (hash === 'offerings') return {targetId: 'offerings'};

  if (hash.startsWith(OFFERINGS_CATEGORY_HASH_PREFIX)) {
    const categoryId = hash.slice(OFFERINGS_CATEGORY_HASH_PREFIX.length);
    const categoryExists = OFFERING_CATEGORIES.some(
      (category) => category.id === categoryId,
    );
    return categoryExists ? {categoryId, targetId: 'offerings'} : undefined;
  }

  if (hash.startsWith(OFFERINGS_ITEM_HASH_PREFIX)) {
    const offeringId = hash.slice(OFFERINGS_ITEM_HASH_PREFIX.length);
    const categoryId = findOfferingCategoryId(offeringId);
    return categoryId ? {categoryId, targetId: hash} : undefined;
  }

  return undefined;
}

const WranngleLanding = () => {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const [abVariant] = useState<HomeAbVariant>(() => resolveHomeAbVariant());

  const heroCta =
    abVariant === 'value-first' ? 'Build my call flow' : 'Get call coverage';

  useEffect(() => {
    ensureSarahWidgetScript();
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
        <SiteHeader
          isDark={isDark}
          toggleTheme={toggleTheme}
          homeAbVariant={abVariant}
        />

        <main id="main" className="flex-1">
          <section className="relative overflow-hidden border-b border-current/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s500)]/70 to-transparent" />
            <div className="max-w-7xl mx-auto w-full px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 xl:gap-14 items-start"
              >
                <div className="max-w-2xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                    AI CALL ANSWERING
                  </div>
                  <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                    AI voice agents that answer before voicemail.
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold leading-snug mb-4 max-w-xl">
                    24/7 call answering, qualification, scheduling, and handoff
                    for teams that lose work when nobody picks up.
                  </p>
                  <p className="text-base md:text-lg opacity-75 leading-relaxed mb-7 max-w-xl">
                    Sarah is the live demo. Send missed and after-hours calls to
                    the agent, collect the request details, and route the
                    summary to the tools your team already checks.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <ButtonPrimary>{heroCta}</ButtonPrimary>
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
                        goTalkToSarah();
                      }}
                    >
                      Talk to Sarah
                    </ButtonGhost>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
                    {VOICE_HERO_METRICS.map((metric) => (
                      <div
                        key={metric.label}
                        className={`rounded-md border px-3 py-3 ${
                          isDark
                            ? 'border-white/10 bg-white/[0.03]'
                            : 'border-black/10 bg-white/60'
                        }`}
                      >
                        <div className="brand-font text-2xl font-bold leading-none">
                          {metric.value}
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider opacity-60 leading-snug">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <ConsoleVisual isDark={isDark} lines={CONSOLE_LINES} />
              </motion.div>

              <div className="mt-10 grid md:grid-cols-3 gap-3">
                {VOICE_OPS_SIGNALS.map(({Icon, label, body}) => (
                  <div
                    key={label}
                    className={`rounded-md border p-4 ${
                      isDark
                        ? 'border-white/10 bg-[#18181b]/70'
                        : 'border-black/10 bg-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-9 w-9 rounded-md bg-[var(--s500)]/10 text-[var(--s500)] flex items-center justify-center">
                        <Icon size={18} aria-hidden />
                      </div>
                      <h2 className="brand-font text-lg font-bold">{label}</h2>
                    </div>
                    <p className="text-sm opacity-70 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            aria-label="Live anonymized bookings"
            className="px-6 max-w-7xl mx-auto w-full pt-10 md:pt-14"
          >
            <Ticker isDark={isDark} />
          </section>

          <section
            id="features"
            className="py-32 px-6 max-w-7xl mx-auto w-full relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,95,0,0.03),transparent_70%)] pointer-events-none" />
            <div className="mb-24 relative z-10">
              <h2 className="brand-font text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight">
                What it handles <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
                  on every call
                </span>{' '}
              </h2>
              <p className="opacity-60 max-w-xl text-lg leading-relaxed">
                The agent answers, asks the right questions, books when it can,
                and sends a clean handoff to your team.
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
                    Cover the phones
                  </h3>
                  <p className="text-sm opacity-60 leading-relaxed">
                    Missed, overflow, and after-hours calls get answered while
                    your team is busy, unavailable, or off the clock.
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
                    Qualify the request
                  </h3>
                  <p className="text-sm opacity-60 leading-relaxed">
                    The agent separates real jobs from junk, gathers the
                    details, and marks what needs a fast response.
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
                    Send the handoff
                  </h3>
                  <p className="text-sm opacity-60 leading-relaxed">
                    Name, contact details, request type, urgency, and transcript
                    arrive together so your team can act without replaying the
                    call.
                  </p>
                </div>
              </TerminalCard>
            </div>
          </section>

          <OfferingsSection isDark={isDark} abVariant={abVariant} />

          <TalkToSarahSection isDark={isDark} />

          <React.Suspense
            fallback={<div className="min-h-[800px]" aria-hidden />}
          >
            <FAQ isDark={isDark} />
          </React.Suspense>

          <FounderNote isDark={isDark} />
        </main>

        <SiteFooter isDark={isDark} />

        <elevenlabs-convai
          agent-id={SARAH_AGENT_ID}
          avatar-orb-color-1="#ff5f00"
          avatar-orb-color-2="#cf3c69"
          action-text="Talk to Sarah"
          expand-text="Talk to Sarah"
          collapse-text="Collapse"
          start-call-text="Start voice demo"
          end-call-text="End voice demo"
          listening-text="Sarah is listening"
          speaking-text="Sarah is speaking"
          placement="bottom-right"
        ></elevenlabs-convai>
      </div>
    </div>
  );
};

const FAQ = React.lazy(async () => import('@/components/FAQ.tsx'));
const SarahOrb = React.lazy(async () => {
  const module = await import('@/components/ui/orb.tsx');
  return {default: module.Orb};
});

/**
 * OfferingsSection — full catalog (formerly /offerings page) consolidated
 * onto the home page. Each card has both a "View Spec Sheet" Dialog
 * (AgentFactsPopout) AND a primary CTA that opens the IntakeForm.
 */
function OfferingsSection({
  isDark,
  abVariant,
}: {
  isDark: boolean;
  abVariant: HomeAbVariant;
}) {
  const [activeCategory, setActiveCategory] = useState(() => {
    // Lazy-init from the URL hash so deep-links like /#offerings-cat-websites
    // and /#offerings-business-site render the right tab on the first paint
    // (no AI Agents -> Websites flash, and item anchors exist before scroll).
    if (globalThis.window !== undefined) {
      const resolved = resolveOfferingsHash(globalThis.location.hash ?? '');
      if (resolved?.categoryId) return resolved.categoryId;
    }

    return OFFERING_CATEGORIES[0]?.id ?? 'ai-agents';
  });
  const [pendingScrollTarget, setPendingScrollTarget] = useState(() => {
    const resolved =
      globalThis.window === undefined
        ? undefined
        : resolveOfferingsHash(globalThis.location.hash ?? '');
    return resolved?.targetId;
  });

  // React to subsequent offerings hash changes (footer links, mega-menu
  // category links, and spec-sheet cross-sells while already on /). Lazy-init
  // above already handled first-paint, so this just re-applies on hashchange.
  useEffect(() => {
    const apply = () => {
      const resolved = resolveOfferingsHash(globalThis.location.hash ?? '');
      if (!resolved) return;
      if (resolved.categoryId) setActiveCategory(resolved.categoryId);
      setPendingScrollTarget(resolved.targetId);
    };

    // Run once on mount too — handles deep-link scroll behavior even
    // though the tab is already correct from lazy-init.
    apply();
    globalThis.addEventListener('hashchange', apply);
    return () => {
      globalThis.removeEventListener('hashchange', apply);
    };
  }, []);

  useEffect(() => {
    if (!pendingScrollTarget) return;

    requestAnimationFrame(() => {
      const target = document.getElementById(pendingScrollTarget);
      if (!target) return;
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      setPendingScrollTarget(undefined);
    });
  }, [activeCategory, pendingScrollTarget]);

  return (
    <section
      id="offerings"
      className="py-24 px-6 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      <div className="text-center mb-12">
        <h2 className="brand-font text-4xl md:text-5xl font-bold mb-4">
          What we build
        </h2>
        <p className="text-lg opacity-60 max-w-xl mx-auto">
          Voice agents, websites, and proposal workflows for teams that need
          fewer missed leads and cleaner follow-up.
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

            {category.id === 'websites' && (
              <div className="max-w-3xl mx-auto mb-8">
                <Link
                  href="/products/websites"
                  className={`group flex items-center justify-between gap-4 px-5 py-4 rounded-[12px_4px_12px_4px] border-y border-r border-l-4 border-l-[var(--v500)] transition-colors hover:border-l-[var(--s500)] ${
                    isDark
                      ? 'border-white/10 bg-[#18181b] hover:bg-[#1f1f24]'
                      : 'border-black/5 bg-white hover:bg-[#faf6ed]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-1">
                      PRODUCT DETAILS
                    </div>
                    <p className="text-sm font-bold leading-tight">
                      Review the website build process, launch targets, and
                      package comparison before picking a tier.
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[var(--s500)] shrink-0 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            )}

            {category.id === 'gtm_ops' && (
              <div className="max-w-3xl mx-auto mb-8">
                <Link
                  href="/products/gtm-ops"
                  className={`group flex items-center justify-between gap-4 px-5 py-4 rounded-[12px_4px_12px_4px] border-y border-r border-l-4 border-l-[var(--v500)] transition-colors hover:border-l-[var(--s500)] ${
                    isDark
                      ? 'border-white/10 bg-[#18181b] hover:bg-[#1f1f24]'
                      : 'border-black/5 bg-white hover:bg-[#faf6ed]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-1">
                      PRODUCT DETAILS
                    </div>
                    <p className="text-sm font-bold leading-tight">
                      Review the proposal workflow, demo, and implementation
                      notes before picking a tier.
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[var(--s500)] shrink-0 group-hover:translate-x-1 transition-transform"
                  />
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
                <OfferingCard
                  key={item.id}
                  item={item}
                  isDark={isDark}
                  abVariant={abVariant}
                />
              ))}
            </div>
          </motion.div>
        ),
      )}
    </section>
  );
}

function OfferingCard({
  item,
  isDark,
  abVariant,
}: {
  item: OfferingItem;
  isDark: boolean;
  abVariant: HomeAbVariant;
}) {
  const [factsOpen, setFactsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const isSaas = item.facts?.kind === 'saas';
  const annualSavings =
    abVariant === 'value-first' && (item.facts?.discountPercent ?? 0) > 0;
  const rawPrice = item.facts?.annualMonthly ?? Number(item.price);
  const monthlyPrice = item.facts?.headlinePrice ?? Number(item.price);
  const hasDiscount = abVariant === 'value-first' && annualSavings;

  const priceLabel =
    item.price === '0'
      ? 'Free'
      : `$${formatPrice(hasDiscount ? rawPrice : monthlyPrice)}`;
  const priceSuffix =
    item.price === '0'
      ? ''
      : hasDiscount
        ? '/mo annual'
        : item.priceCadence === 'monthly'
          ? '/mo'
          : ' one-time';

  const ctaLabel = hasDiscount ? item.cta.replace(/^Get /, 'Start') : item.cta;

  const addonCopy = item.monthlyAddon
    ? hasDiscount && isSaas
      ? `or $${formatPrice(rawPrice)} /mo annual equivalent`
      : item.monthlyAddon.label.startsWith('/')
        ? `+ $${item.monthlyAddon.price}${item.monthlyAddon.label}`
        : `+ $${item.monthlyAddon.price}/mo ${item.monthlyAddon.label}`
    : '';

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
                    {priceSuffix}
                  </span>
                )}
              </div>
              {addonCopy && (
                <div className="text-sm opacity-60 mt-1">{addonCopy}</div>
              )}
              {isSaas && annualSavings && item.facts ? (
                <div className="text-xs uppercase tracking-wide opacity-70 mt-1">
                  Save {item.facts.discountPercent}% with annual pricing
                </div>
              ) : null}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {item.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm opacity-80"
                >
                  <Check
                    size={16}
                    className="text-[var(--s500)] shrink-0"
                    aria-hidden
                  />{' '}
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
                <DialogTitle className="sr-only">
                  {item.name} spec sheet
                </DialogTitle>
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
                {ctaLabel} <ArrowRight size={14} className="ml-2" />
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
        className={`relative overflow-hidden rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] p-8 md:p-12 grid lg:grid-cols-[1fr_1fr] gap-10 items-center noise-overlay ${
          isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
        }`}
        style={{boxShadow: 'var(--shadow-card)'}}
      >
        <div className="relative z-10">
          <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4">
            LIVE VOICE DEMO
          </div>
          <h2 className="brand-font text-4xl md:text-5xl font-bold leading-tight mb-5">
            Try the call flow. <br />
            <span className="text-[var(--s500)]">Talk to Sarah.</span>
          </h2>
          <p className="text-base md:text-lg opacity-75 leading-relaxed max-w-xl mb-7">
            Pretend you need help at 11 PM. Sarah will answer, ask for the
            request details, and show the kind of handoff your team would
            receive.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openSarahWidget}
              className="px-7 py-3 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              Start Voice Demo <ArrowRight size={14} aria-hidden />
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

        <SarahOrbHero isDark={isDark} />
      </div>
    </section>
  );
}

function SarahOrbHero({isDark}: {isDark: boolean}) {
  const [agentState, setAgentState] = useState<AgentState>('thinking');

  useEffect(() => {
    let index = 0;
    const timer = globalThis.setInterval(() => {
      index = (index + 1) % SARAH_ORB_STATES.length;
      setAgentState(SARAH_ORB_STATES[index]);
    }, 2400);

    return () => {
      globalThis.clearInterval(timer);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={openSarahWidget}
      aria-label="Start Sarah voice demo"
      className="group relative z-10 min-h-[340px] md:min-h-[430px] w-full overflow-hidden rounded-[20px_4px_20px_4px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s500)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <div className="absolute inset-0 bg-[#101014]" />
      <div
        className={`absolute inset-0 ${
          isDark
            ? 'bg-[radial-gradient(circle_at_center,rgba(255,95,0,0.18),transparent_58%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(207,60,105,0.14),transparent_58%)]'
        }`}
      />
      <div className="relative h-[340px] md:h-[430px] w-full">
        <React.Suspense
          fallback={<div className="h-full w-full bg-[#101014]" />}
        >
          <SarahOrb
            colors={['#ff5f00', '#cf3c69']}
            seed={1196}
            agentState={agentState}
            className="absolute inset-[-8%]"
          />
        </React.Suspense>
      </div>

      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-4 mono-font text-[10px] tracking-widest text-white/60">
        <span>SARAH // LIVE DEMO</span>
        <span className="inline-flex items-center gap-2 text-[#5d8c61] font-bold">
          <span className="h-2 w-2 rounded-full bg-[#5d8c61] animate-pulse" />
          ONLINE
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 mono-font text-[10px] text-white/65">
        <span>"Thanks for calling. What can we help with?"</span>
        <span className="text-[#5d8c61]">ElevenLabs voice demo</span>
      </div>
    </button>
  );
}

function FounderNote({isDark}: {isDark: boolean}) {
  return (
    <section id="about" className="py-12 px-6 max-w-3xl mx-auto w-full">
      <Link
        href="/about"
        className={`group block rounded-[16px_4px_16px_4px] border-y border-r border-l-4 border-l-[var(--v500)] p-5 md:p-6 noise-overlay transition-all hover:scale-[1.005] ${
          isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
        }`}
      >
        <div className="flex items-center gap-4 md:gap-5">
          <div
            className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[var(--v500)] ${
              isDark ? 'bg-[#0f0f13]' : 'bg-[#f4eed8]'
            }`}
          >
            <span
              className="absolute inset-0 flex items-center justify-center brand-font text-xl font-bold opacity-35 select-none"
              aria-hidden
            >
              CA
            </span>
            <img
              src="/portrait-cody.jpg"
              alt="Cody Arnold"
              loading="lazy"
              className="relative z-10 w-full h-full object-cover scale-110 origin-center"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-1.5">
              BUILT BY CODY ARNOLD
            </div>
            <p className="brand-font text-base md:text-lg font-bold leading-snug">
              "The useful system is the one your team can check and trust."
            </p>
            <p className="text-xs opacity-60 mt-1.5">
              Cody Arnold, founder · Read about Cody →
            </p>
          </div>
          <ArrowRight
            size={18}
            className="text-[var(--v500)] shrink-0 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </Link>
    </section>
  );
}

const ButtonPrimary = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({children, ...props}, ref) => (
  <button
    ref={ref}
    {...props}
    className="h-12 px-5 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
  >
    {children} <ArrowRight size={14} aria-hidden />
  </button>
));

const ButtonGhost = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="h-12 px-5 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all inline-flex items-center justify-center gap-2"
  >
    {children}
  </button>
);

const ConsoleVisual = ({
  isDark,
  lines,
}: {
  isDark: boolean;
  lines: Array<{text: string; color: string}>;
}) => {
  const [display, setDisplay] = useState<Array<{text: string; color: string}>>(
    [],
  );
  const idx = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- React refs use null sentinel; converting to undefined breaks RefObject<HTMLDivElement> consumers.
  const containerRef = useRef<HTMLDivElement | null>(null);
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
      if (!containerRef.current) return;
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
      <img
        src="/assets/brand/wranngle-lasso-square.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 z-10 hidden h-36 w-36 -translate-y-1/2 object-contain opacity-80 mix-blend-screen drop-shadow-[0_0_28px_rgba(255,95,0,0.38)] sm:block md:right-6 md:h-44 md:w-44"
      />
      <div className="flex-1 overflow-y-auto space-y-1 relative z-10 pr-0 sm:pr-40 md:pr-52">
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
        <span>CALLS</span>
        <span className="tabular-nums">14 OPEN</span>
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
            '> ACCOUNT_CONTEXT_CONFIRMED',
            '> REQUEST_TYPE: URGENT_SUPPORT',
            '> TEAM_SUMMARY_READY',
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

const TerminalCard = ({
  children,
  title,
  status,
  index,
  isDark,
}: {
  children: React.ReactNode;
  title: string;
  status: string;
  index: string;
  isDark: boolean;
}) => (
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

const TypewriterSequence = ({sequence}: {sequence: string[]}) => {
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
