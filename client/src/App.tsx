import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  MessageSquareText,
  PhoneCall,
} from 'lucide-react';
import {Link} from 'wouter';
import {OFFERING_CATEGORIES} from '@/data/offerings.ts';
import IntakeForm from '@/components/IntakeForm.tsx';
import RoiCalculator from '@/components/RoiCalculator.tsx';
import PolygonTileHero from '@/components/PolygonTileHero.tsx';
import TierCard from '@/components/TierCard.tsx';
import {
  RadarWatchdog,
  SpectralAnalyzer,
  SynapseLink,
} from '@/components/FeatureGlyphs.tsx';
import {Dialog, DialogContent, DialogTrigger} from '@/components/ui/dialog.tsx';
import type {AgentState} from '@/components/ui/orb.tsx';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {goTalkToSarah, openSarahWidget} from '@/lib/sarah.ts';

const VOICE_HERO_METRICS = [
  {value: '24/7', label: 'after-hours coverage'},
  {value: '2,500', label: 'included voice minutes'},
  {value: '5', label: 'channels: phone, SMS, web chat, email, Slack'},
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

// Every offering category is a first-class citizen: each gets the same
// "product details" banner linking to its dedicated page (round-2 F014).
const PRODUCT_DETAIL_LINKS: Record<string, {href: string; blurb: string}> = {
  'ai-agents': {
    href: '/products/ai-voice-agents',
    blurb:
      'Review the voice agent setup, channels, latency targets, and tier comparison before picking a plan.',
  },
  websites: {
    href: '/products/websites',
    blurb:
      'Review the website build process, launch targets, and package comparison before picking a tier.',
  },
  gtm_ops: {
    href: '/products/gtm-ops',
    blurb:
      'Review the proposal workflow, demo, and implementation notes before picking a tier.',
  },
};
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

function scrollToElementStart(target: HTMLElement) {
  const top = target.getBoundingClientRect().top + globalThis.scrollY;
  globalThis.scrollTo({top, behavior: 'smooth'});
}

const WranngleLanding = () => {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const [abVariant] = useState<HomeAbVariant>(() => resolveHomeAbVariant());

  const heroCta =
    abVariant === 'value-first' ? 'Build my call flow' : 'Get call coverage';

  // Scroll to anchor on hash navigation (e.g. /#offerings, /#offerings-premium).
  useEffect(() => {
    const hash = globalThis.location.hash?.slice(1);
    if (!hash) return;
    requestAnimationFrame(() => {
      const target = document.getElementById(hash);
      if (target) scrollToElementStart(target);
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
            <div className="max-w-7xl mx-auto w-full px-6 pt-5 pb-12 md:pt-7 md:pb-16">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 xl:gap-14 items-start"
              >
                <div className="max-w-2xl">
                  <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                    Your phone rings. Every tech is on a job.
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold leading-snug mb-4 max-w-xl">
                    Wranngle answers 24/7 when your team can&apos;t: it takes
                    the name, number, and problem, flags what can&apos;t wait,
                    and books the job into an open window.
                  </p>
                  <p className="text-base md:text-lg opacity-75 leading-relaxed mb-7 max-w-xl">
                    Sarah is the live demo agent on this page. Tell her about a
                    burst pipe or a loaner car; she can tell the difference. She
                    takes a name and number, books a window, and sends the
                    summary to Slack, your CRM, or email.
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

                <PolygonTileHero isDark={isDark} />
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
            id="features"
            className="pt-14 pb-28 px-6 max-w-7xl mx-auto w-full relative"
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

          <RoiCalculator isDark={isDark} />

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

        {/* The <elevenlabs-convai> widget is mounted globally in Router.tsx
            so every route gets it — see GlobalSarahWidget.tsx. */}
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
      scrollToElementStart(target);
      setPendingScrollTarget(undefined);
    });
  }, [activeCategory, pendingScrollTarget]);

  return (
    <section
      id="offerings"
      className="pt-10 pb-24 px-6 max-w-7xl mx-auto w-full scroll-mt-24"
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

            {PRODUCT_DETAIL_LINKS[category.id] && (
              <div className="max-w-3xl mx-auto mb-8">
                <Link
                  href={PRODUCT_DETAIL_LINKS[category.id].href}
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
                      {PRODUCT_DETAIL_LINKS[category.id].blurb}
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
                <TierCard
                  key={item.id}
                  item={item}
                  isDark={isDark}
                  anchored
                  ctaLabel={
                    abVariant === 'value-first'
                      ? item.cta.replace(/^Get /, 'Start ')
                      : item.cta
                  }
                />
              ))}
            </div>
          </motion.div>
        ),
      )}
    </section>
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
    <section id="about" className="pt-2 pb-12 px-6 max-w-3xl mx-auto w-full">
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

export default WranngleLanding;
