/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icon (Github) used intentionally for repo link; deprecation is upstream-future. */
import React, {useEffect} from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {motion} from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Clock3,
  DatabaseZap,
  ExternalLink,
  FileText,
  Github,
  Inbox,
  FileCheck,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import gtmOpsDemos from './gtm-ops-demos.manifest.json';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel.tsx';
import TierCard from '@/components/TierCard.tsx';
import {getCategoryById} from '@/data/offerings.ts';

// Production demo URL. app.wranngle.com is the canonical console host
// (Cloudflare Pages custom domain on the gtm-ops project).
const GTM_OPS_DEMO_URL = 'https://app.wranngle.com';
const GTM_OPS_REPO_URL = 'https://github.com/wranngle/gtm_ops';

// gtm_ops tiers keep SaaS cross-sells on this page (scroll to #pricing);
// agent/website cross-sells jump to the home offerings grid.
function crossSellFromGtmOps(targetId: string) {
  if (
    targetId === 'gtm-ops-trial' ||
    targetId === 'gtm-ops-plus' ||
    targetId === 'gtm-ops-pro'
  ) {
    const target = document.querySelector('#pricing');
    if (target) {
      const top = target.getBoundingClientRect().top + globalThis.scrollY;
      globalThis.scrollTo({top, behavior: 'smooth'});
    }
  } else {
    globalThis.location.href = `/#offerings-${targetId}`;
  }
}

// Recorded prospect-POV console walkthroughs (auto_demo). Each slide is a
// looping muted clip of the live console being driven — bind buyer proof and
// generate a draft, run the eval harness, audit settings. Regenerate with
// `bun run script/record-gtm-ops-demos.ts`; this typed copy mirrors the public
// asset manifest at client/public/assets/gtm-ops-demos/manifest.json.
const DEMO_FLOWS = gtmOpsDemos as Array<{
  id: string;
  label: string;
  sub: string;
  video: string;
  poster: string;
  href: string;
}>;

const HERO_METRICS = [
  {value: '5 min', label: 'synthetic demo run'},
  {value: '4 steps', label: 'logged proposal run'},
  {value: 'Open', label: 'source code on GitHub'},
];

const PRODUCT_EVENTS = [
  {
    label: 'Lead captured',
    value: 'Voice agent',
    tone: 'text-sky-400',
  },
  {
    label: 'Clay enrichment',
    value: 'Firmographics ready',
    tone: 'text-emerald-400',
  },
  {
    label: 'Proposal render',
    value: 'Customer PDF queued',
    tone: 'text-[var(--s500)]',
  },
];

const OPS_SIGNALS = [
  {
    Icon: Clock3,
    label: 'Quicker quote prep',
    body: 'Turn intake notes into a draft proposal while the lead is still fresh.',
  },
  {
    Icon: ShieldCheck,
    label: 'Run log included',
    body: 'Keep the intake payload, enrichment result, prompt output, and PDF render together.',
  },
  {
    Icon: DatabaseZap,
    label: 'Webhook-ready',
    body: 'Feed the same proposal flow from forms, voice agents, CRM exports, or n8n.',
  },
];

const PIPELINE_STEPS = [
  {
    Icon: Inbox,
    title: 'Lead intake',
    body: 'Accept web chat, voice-agent notes, contact forms, webhooks, internal records, or CRM exports. gtm_ops normalizes the fields before drafting starts.',
  },
  {
    Icon: Sparkles,
    title: 'Lead enrichment',
    body: 'Add company details, domain research, recent signals, and contact context so the proposal does not start from a blank form.',
  },
  {
    Icon: FileCheck,
    title: 'Branded proposal',
    body: 'Use your logo, colors, and proposal template. Structured extraction fills typed fields; the renderer creates a PDF your team can review and send.',
  },
  {
    Icon: Send,
    title: 'Delivery handoff',
    body: 'Send the PDF to email, n8n, or your CRM. Each step writes to the run log so a proposal can be reproduced later.',
  },
];

export default function GtmOpsPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const category = getCategoryById('gtm_ops');
  const tiers = category?.items ?? [];

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'gtm_ops — Lead in, branded proposal out · Wranngle';
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main id="main" className="flex-1">
          {/* Hero */}
          <section className="relative overflow-hidden border-b border-current/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s500)]/70 to-transparent" />
            <div className="max-w-7xl mx-auto w-full px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 xl:gap-14 items-center"
              >
                <div className="max-w-2xl">
                  <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                    <span className="mono-font text-[0.82em]">gtm_ops</span>
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold leading-snug mb-4 max-w-xl">
                    Lead capture, enrichment, and branded proposal generation in
                    one working console.
                  </p>
                  <p className="text-base md:text-lg opacity-75 leading-relaxed mb-7 max-w-xl">
                    Pipe a form, webhook, CRM export, or Wranngle voice agent
                    into the same flow. The console turns incomplete intake into
                    a typed proposal PDF and keeps the run history attached.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={GTM_OPS_DEMO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 px-5 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                    >
                      <Play size={15} fill="currentColor" aria-hidden /> Open
                      live demo
                      <ExternalLink size={14} aria-hidden />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                    <a
                      href="/sample-proposal.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-12 px-5 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all inline-flex items-center justify-center gap-2"
                    >
                      <FileText size={15} aria-hidden /> Sample proposal
                      <span className="opacity-60 normal-case font-normal">
                        · 3 MB PDF
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
                    {HERO_METRICS.map((metric) => (
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

                <ProductScreenshot isDark={isDark} />
              </motion.div>

              <div className="mt-10 grid md:grid-cols-3 gap-3">
                {OPS_SIGNALS.map(({Icon, label, body}) => (
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

          <div className="max-w-7xl mx-auto w-full px-6 py-14 md:py-20">
            {/* 4-step pipeline */}
            <section className="mb-24 grid lg:grid-cols-[0.74fr_1.26fr] gap-10 items-start">
              <div className="lg:sticky lg:top-28">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                  PROPOSAL FLOW
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold mb-4">
                  From lead details to proposal draft.
                </h2>
                <p className="opacity-75 text-base leading-relaxed mb-6">
                  The useful part is the handoff: capture the lead, enrich the
                  company, fill the proposal fields, render the PDF, and keep a
                  record of what happened.
                </p>
                <div
                  className={`rounded-md border p-4 ${
                    isDark
                      ? 'border-white/10 bg-[#18181b]'
                      : 'border-black/10 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mono-font mb-3">
                    <Workflow size={14} /> Current run
                  </div>
                  <div className="space-y-3">
                    {PRODUCT_EVENTS.map((event) => (
                      <div
                        key={event.label}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`mt-1 h-2 w-2 rounded-full ${event.tone} bg-current shrink-0`}
                          />
                          <span className="opacity-70">{event.label}</span>
                        </div>
                        <span className="font-semibold text-right">
                          {event.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {PIPELINE_STEPS.map((step, index) => {
                  const {Icon} = step;
                  return (
                    <div
                      key={step.title}
                      className={`relative p-6 rounded-md border-y border-r border-l-4 border-l-[var(--s500)] noise-overlay ${
                        isDark
                          ? 'border-white/10 bg-[#18181b]'
                          : 'border-black/5 bg-white'
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-md bg-[var(--s500)]/10 text-[var(--s500)] flex items-center justify-center">
                            <Icon size={19} aria-hidden />
                          </div>
                          <div className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-60">
                            Step {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>
                        <h3 className="brand-font text-xl font-bold mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm opacity-70 leading-relaxed">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Pricing tiers */}
            <section id="pricing" className="mb-24 scroll-mt-24">
              <div className="text-center mb-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                  PRICING
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold mb-3">
                  Pick the proposal volume.
                </h2>
                <p className="opacity-70 max-w-xl mx-auto text-base">
                  Trial is for testing the flow. Plus covers a small team. Pro
                  adds SSO, a custom domain, and higher-volume controls.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {tiers.map((item) => (
                  <TierCard
                    key={item.id}
                    item={item}
                    isDark={isDark}
                    onCrossSell={crossSellFromGtmOps}
                  />
                ))}
              </div>
            </section>

            {/* Upsell: Business Site + Agent Pack */}
            <section
              className={`mb-14 rounded-md border p-6 md:p-8 grid md:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-10 items-center ${
                isDark
                  ? 'border-white/10 bg-[#18181b]'
                  : 'border-black/10 bg-white'
              }`}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                  PAIR WITH AGENT + SITE
                </div>
                <h3 className="brand-font text-2xl md:text-3xl font-bold mb-3">
                  Business Site + Agent Pack
                </h3>
                <p className="text-sm md:text-base opacity-70 leading-relaxed">
                  When the proposal flow has to start from inbound traffic and
                  phone calls instead of an import, pair gtm_ops with a Business
                  Site (lead forms, CMS, analytics) and an Elite Agent (voice,
                  web chat, two-way SMS). Same intake schema feeds every channel
                  into the same enrichment + proposal run.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3">
                <a
                  href="/products/websites#offerings-business-site"
                  className="h-12 px-5 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                >
                  Business Site <ArrowRight size={15} aria-hidden />
                </a>
                <a
                  href="/#offerings-premium"
                  className="h-12 px-5 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all inline-flex items-center justify-center gap-2"
                >
                  Elite Voice Agent
                </a>
              </div>
            </section>

            {/* Footer note + GitHub link */}
            <section className="border-t border-current/10 pt-10 grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                  SOURCE + DEMO
                </div>
                <h3 className="brand-font text-2xl font-bold mb-3">
                  Source is open. Demo data is inspectable.
                </h3>
                <p className="text-sm opacity-70 leading-relaxed mb-4">
                  The runtime and console are visible before you sign up. Run it
                  locally, inspect the architecture, or use the hosted demo with
                  synthetic data.
                </p>
                <a
                  href={GTM_OPS_REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold border border-current/30 hover:border-[var(--s500)] hover:text-[var(--s500)] transition-colors px-4 py-2 rounded-md"
                >
                  <Github size={16} /> github.com/wranngle/gtm_ops
                </a>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                  RUN LOGS
                </div>
                <h3 className="brand-font text-2xl font-bold mb-3">
                  Every proposal is reproducible.
                </h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  Intake, enrichment, extraction, and render events are keyed to
                  the lead. Replay a proposal from the original payload, compare
                  a prompt revision against a previous run, or export the log
                  when a customer asks how the output was produced.
                </p>
              </div>
            </section>
          </div>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}

function ProductScreenshot({isDark}: {isDark: boolean}) {
  const reducedMotion = usePrefersReducedMotion();
  // Auto-advance pauses on hover, focus, and pointer interaction so the
  // Users can read a slide. Reduced-motion users get a static carousel
  // and swap manually with prev/next or pagination dots.

  const [autoplayPlugin] = React.useState(() =>
    // eslint-disable-next-line new-cap -- Autoplay is the embla plugin factory; upstream API is uppercase.
    Autoplay({
      delay: 6000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    }),
  );
  // useState lazy-init runs the factory exactly once. The shadcn carousel
  // example uses useRef(Autoplay({...})), but that re-evaluates the factory
  // every render and discards all but the first instance.
  const plugins = reducedMotion ? [] : [autoplayPlugin];
  const [api, setApi] = React.useState<CarouselApi | undefined>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden rounded-lg border shadow-2xl ${
          isDark
            ? 'border-white/10 bg-[#0f0e16] shadow-black/40'
            : 'border-black/10 bg-white shadow-[#12111a]/10'
        }`}
      >
        <div
          className={`h-10 px-4 flex items-center justify-between gap-3 border-b ${
            isDark
              ? 'border-white/10 bg-white/[0.03]'
              : 'border-black/10 bg-black/[0.03]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0 flex items-center gap-2 text-[10px] uppercase tracking-widest mono-font opacity-60">
            <Activity size={13} className="text-[var(--s500)] shrink-0" />
            <span className="truncate">app.wranngle.com / console</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-current" />
            Live
          </div>
        </div>

        <Carousel
          setApi={setApi}
          plugins={plugins}
          opts={{loop: true, align: 'start'}}
          aria-label="gtm_ops console screenshots"
          className="relative"
        >
          <CarouselContent>
            {DEMO_FLOWS.map((flow, index) => (
              <CarouselItem key={flow.id}>
                <a
                  href={flow.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative group"
                  aria-label={`Open ${flow.label} in the live demo (slide ${
                    index + 1
                  } of ${DEMO_FLOWS.length})`}
                >
                  <DemoFlowVideo
                    flow={flow}
                    active={current === index}
                    reducedMotion={reducedMotion}
                    isDark={isDark}
                  />
                  <div className="absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-[#12111a]/90 via-[#12111a]/55 to-transparent text-white pointer-events-none">
                    <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--s500)]">
                      {flow.label}
                    </div>
                    <div className="text-sm font-semibold leading-tight">
                      {flow.sub}
                    </div>
                  </div>
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Play size={11} aria-hidden />
                    Open live
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div
          className={`flex items-center justify-center gap-3 py-3 border-t ${
            isDark
              ? 'border-white/10 bg-white/[0.02]'
              : 'border-black/10 bg-black/[0.02]'
          }`}
        >
          <CarouselNavButton
            direction="prev"
            disabled={!api?.canScrollPrev()}
            onClick={() => api?.scrollPrev()}
            isDark={isDark}
          />
          <div className="flex items-center justify-center gap-2">
            {DEMO_FLOWS.map((flow, index) => (
              <button
                key={flow.id}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to ${flow.label} (slide ${index + 1} of ${
                  DEMO_FLOWS.length
                })`}
                aria-current={current === index ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  current === index
                    ? 'w-6 bg-[var(--s500)]'
                    : 'w-1.5 bg-current opacity-30 hover:opacity-60'
                }`}
              />
            ))}
          </div>
          <CarouselNavButton
            direction="next"
            disabled={!api?.canScrollNext()}
            onClick={() => api?.scrollNext()}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}

function DemoFlowVideo({
  flow,
  active,
  reducedMotion,
  isDark,
}: {
  flow: {video: string; poster: string; label: string; sub: string};
  active: boolean;
  reducedMotion: boolean;
  isDark: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- video ref uses React's null sentinel.
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Only the active slide plays; the rest hold their poster frame. Reduced-
  // motion users see the poster, never autoplay.
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !reducedMotion) {
      v.currentTime = 0;
      void v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }, [active, reducedMotion]);

  return (
    <video
      ref={videoRef}
      className={`block w-full aspect-[16/10] object-cover object-top ${
        isDark ? 'bg-[#12111a]' : 'bg-white'
      }`}
      src={flow.video}
      poster={flow.poster}
      muted
      loop
      playsInline
      preload={active ? 'auto' : 'metadata'}
      aria-label={`gtm_ops console — ${flow.label}: ${flow.sub}`}
    />
  );
}

function CarouselNavButton({
  direction,
  disabled,
  onClick,
  isDark,
}: {
  direction: 'prev' | 'next';
  disabled?: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
      className={`h-7 w-7 inline-flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        isDark
          ? 'border-white/15 hover:border-[var(--s500)] hover:text-[var(--s500)]'
          : 'border-black/15 hover:border-[var(--s500)] hover:text-[var(--s500)]'
      }`}
    >
      <Icon size={13} aria-hidden />
    </button>
  );
}

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = React.useState(false);
  React.useEffect(() => {
    if (globalThis.window === undefined) return;
    const mq = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mq.addEventListener('change', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
    };
  }, []);
  return prefersReduced;
}
