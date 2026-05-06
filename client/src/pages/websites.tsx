// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Check,
  Cloud,
  Code2,
  FileText,
  FormInput,
  Gauge,
  Globe2,
  Layers3,
  MousePointerClick,
  Palette,
  SearchCheck,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import {getCategoryById, type OfferingItem} from '@/data/offerings.ts';

const HERO_METRICS = [
  {value: '7 days', label: 'landing page quickstart'},
  {value: '95+', label: 'Lighthouse target'},
  {value: 'Yours', label: 'source code ownership'},
];

const WEBSITE_SIGNALS = [
  {
    Icon: SearchCheck,
    label: 'Search-ready',
    body: 'Sitemap, metadata, OG cards, robots, and page structure are handled before launch.',
  },
  {
    Icon: FormInput,
    label: 'Lead capture',
    body: 'Forms route to email and n8n, so the site feeds the rest of your sales workflow.',
  },
  {
    Icon: ShieldCheck,
    label: 'Owned surface',
    body: 'No locked-in page builder. You get the code, hosting path, and maintenance option.',
  },
];

const BUILD_STEPS = [
  {
    Icon: MousePointerClick,
    title: 'Conversion map',
    body: 'Offer, audience, proof, objections, and contact path are decided before pixels move.',
  },
  {
    Icon: Palette,
    title: 'Custom design',
    body: 'A practical visual system built around your business, not a theme marketplace template.',
  },
  {
    Icon: Code2,
    title: 'Performance build',
    body: 'Responsive React/Tailwind implementation with image discipline and Core Web Vitals budget.',
  },
  {
    Icon: Workflow,
    title: 'Automation handoff',
    body: 'Lead forms, webhook payloads, analytics, and optional AI chat connect to your operating stack.',
  },
];

export default function WebsitesPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const category = getCategoryById('websites');
  const tiers = category?.items ?? [];

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Websites that capture leads - Wranngle Systems';
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
          <section className="relative overflow-hidden border-b border-current/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s500)]/70 to-transparent" />
            <div className="max-w-7xl mx-auto w-full px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 xl:gap-14 items-center"
              >
                <div className="max-w-2xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                    PRODUCT // CONVERSION SITE SYSTEM
                  </div>
                  <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                    Websites that turn attention into work.
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold leading-snug mb-4 max-w-xl">
                    Fast, owned, lead-capture websites for operators who need
                    the phone to ring and the inbox to stay organized.
                  </p>
                  <p className="text-base md:text-lg opacity-75 leading-relaxed mb-7 max-w-xl">
                    Wranngle builds the page, wires the forms, ships the source,
                    and keeps maintenance optional. Landing page or full
                    business site, the goal is the same: convert real buyers.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="h-12 px-5 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                        >
                          Start a website <ArrowRight size={15} aria-hidden />
                        </button>
                      </DialogTrigger>
                      <DialogContent
                        className={
                          isDark
                            ? 'bg-[#12111a] text-[#fcfaf5] border-white/10'
                            : 'bg-white text-[#12111a] border-black/10'
                        }
                      >
                        <IntakeForm selectedPackage="business-site" />
                      </DialogContent>
                    </Dialog>
                    <a
                      href="#pricing"
                      className="h-12 px-5 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all inline-flex items-center justify-center gap-2"
                    >
                      Compare packages
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

                <WebsitePreview isDark={isDark} />
              </motion.div>

              <div className="mt-10 grid md:grid-cols-3 gap-3">
                {WEBSITE_SIGNALS.map(({Icon, label, body}) => (
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
            <section className="mb-24 grid lg:grid-cols-[0.74fr_1.26fr] gap-10 items-start">
              <div className="lg:sticky lg:top-28">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                  THE BUILD FLOW
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold mb-4">
                  Practical site work, not brochure theater.
                </h2>
                <p className="opacity-75 text-base leading-relaxed mb-6">
                  The site has one job: make trust legible and make the next
                  action obvious. Design, copy, build, SEO, and automation stay
                  tied to that job.
                </p>
                <div
                  className={`rounded-md border p-4 ${
                    isDark
                      ? 'border-white/10 bg-[#18181b]'
                      : 'border-black/10 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mono-font mb-3">
                    <BarChart3 size={14} /> Launch targets
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Speed', 'Sub-2s first load target'],
                      ['Capture', 'Form + webhook routing'],
                      ['Ownership', 'Git handoff included'],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="opacity-70">{label}</span>
                        <span className="font-semibold text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {BUILD_STEPS.map((step, index) => {
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

            <section id="pricing" className="mb-24 scroll-mt-24">
              <div className="text-center mb-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                  PRICING
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold mb-3">
                  Pick the website shape.
                </h2>
                <p className="opacity-70 max-w-xl mx-auto text-base">
                  One focused landing page when speed matters. A business site
                  when you need pages, CMS, analytics, and a longer shelf life.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {tiers.map((item) => (
                  <WebsiteTierTile key={item.id} item={item} isDark={isDark} />
                ))}
              </div>
            </section>

            <section
              className={`rounded-md border p-6 md:p-8 grid md:grid-cols-[1.08fr_0.92fr] gap-8 items-center ${
                isDark
                  ? 'border-white/10 bg-[#18181b]'
                  : 'border-black/10 bg-white'
              }`}
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                  PAIRS WELL WITH VOICE AI
                </div>
                <h3 className="brand-font text-2xl md:text-3xl font-bold mb-3">
                  A good site should not be your only after-hours capture.
                </h3>
                <p className="text-sm md:text-base opacity-70 leading-relaxed">
                  Add Sarah-style web chat or a full voice agent when the site
                  is ready. The website handles intent you can see. The agent
                  handles the calls and typed questions that happen after hours.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3">
                <a
                  href="/#talk-to-sarah"
                  className="h-12 px-5 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                >
                  Talk to Sarah <ArrowRight size={15} aria-hidden />
                </a>
                <a
                  href="/#offerings-basic"
                  className="h-12 px-5 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all inline-flex items-center justify-center gap-2"
                >
                  See AI agent tiers
                </a>
              </div>
            </section>
          </div>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}

function WebsitePreview({isDark}: {isDark: boolean}) {
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
            <Globe2 size={13} className="text-[var(--s500)] shrink-0" />
            <span className="truncate">wranngle.com / website build</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-current" />
            Live
          </div>
        </div>

        <div className="relative p-3 sm:p-4">
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-[linear-gradient(135deg,rgba(255,95,0,0.10),rgba(93,140,97,0.10),rgba(207,60,105,0.08))]'
                : 'bg-[linear-gradient(135deg,rgba(255,95,0,0.08),rgba(93,140,97,0.08),rgba(207,60,105,0.05))]'
            }`}
          />
          <div className="relative grid sm:grid-cols-[0.78fr_1.22fr] gap-3 min-h-[370px]">
            <aside
              className={`hidden sm:flex flex-col rounded-md border p-3 ${
                isDark
                  ? 'border-white/10 bg-[#12111a]/90'
                  : 'border-black/10 bg-white/90'
              }`}
            >
              <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--s500)] mb-4">
                Launch stack
              </div>
              <PreviewRow Icon={Gauge} label="Performance" value="95+" />
              <PreviewRow Icon={SearchCheck} label="SEO basics" value="Ready" />
              <PreviewRow Icon={Cloud} label="Hosting" value="Cloudflare" />
              <div className="mt-auto rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <FormInput size={15} />
                  <span className="mono-font text-[10px] uppercase tracking-widest">
                    Lead path
                  </span>
                </div>
                <div className="mt-2 brand-font text-2xl font-bold">
                  Form {'->'} n8n
                </div>
                <div className="text-[10px] uppercase tracking-wider opacity-60">
                  email + workflow handoff
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex flex-col gap-3">
              <div
                className={`relative overflow-hidden rounded-md border min-h-[148px] ${
                  isDark ? 'border-white/10' : 'border-black/10'
                }`}
              >
                <img
                  src="/assets/rcs/hero-welcome.png"
                  alt="Website hero and welcome screen preview"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#12111a]/95 via-[#12111a]/60 to-[#12111a]/15" />
                <div className="relative z-10 p-4 text-white">
                  <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--s500)] mb-3">
                    Conversion surface
                  </div>
                  <h2 className="brand-font text-2xl font-bold leading-tight mb-2">
                    Hero, proof, CTA, form
                  </h2>
                  <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                    The first screen says what you do, who it is for, why to
                    trust you, and what happens next.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-[0.94fr_1.06fr] gap-3 flex-1">
                <div
                  className={`rounded-md border p-4 ${
                    isDark
                      ? 'border-white/10 bg-[#12111a]/90'
                      : 'border-black/10 bg-white/95'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--s500)]">
                        Build checklist
                      </div>
                      <h3 className="brand-font text-xl font-bold">
                        Launch-ready
                      </h3>
                    </div>
                    <Layers3 size={18} className="text-[var(--s500)]" />
                  </div>
                  <div className="space-y-3">
                    {[
                      'Responsive layout',
                      'OG social cards',
                      'Webhook forms',
                    ].map((label) => (
                      <div
                        key={label}
                        className={`rounded-md border px-3 py-2 flex items-center justify-between gap-3 ${
                          isDark
                            ? 'border-white/10 bg-white/[0.03]'
                            : 'border-black/10 bg-black/[0.03]'
                        }`}
                      >
                        <span className="text-sm font-semibold">{label}</span>
                        <Check
                          size={15}
                          className="text-emerald-400 shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-md border p-4 flex flex-col ${
                    isDark
                      ? 'border-white/10 bg-[#12111a]/90'
                      : 'border-black/10 bg-white/95'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="mono-font text-[10px] uppercase tracking-widest text-[var(--v500)]">
                        Analytics
                      </div>
                      <h3 className="brand-font text-xl font-bold">
                        Lead signal
                      </h3>
                    </div>
                    <BarChart3 size={18} className="text-[var(--v500)]" />
                  </div>
                  <div
                    className={`relative rounded-md overflow-hidden border flex-1 min-h-[132px] ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}
                  >
                    <img
                      src="/assets/rcs/analytics-dashboard.png"
                      alt="Website analytics and lead dashboard preview"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-[#12111a]/80 text-white">
                      <div className="text-sm font-bold">Pipeline visible</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/60">
                        visitors, forms, and follow-up
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({Icon, label, value}) {
  return (
    <div className="mb-2 rounded-md border border-current/10 bg-current/[0.03] p-3">
      <div className="flex items-center gap-2 text-[var(--s500)]">
        <Icon size={15} />
        <span className="mono-font text-[10px] uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

function WebsiteTierTile({
  item,
  isDark,
}: {
  item: OfferingItem;
  isDark: boolean;
}) {
  const [factsOpen, setFactsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const priceLabel = item.price === '0' ? 'Free' : `$${item.price}`;

  return (
    <div className="relative group h-full">
      <div
        className={`relative h-full p-8 rounded-md border-y border-r border-l-4 border-l-[var(--s500)] ${
          isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
        } flex flex-col noise-overlay overflow-hidden`}
      >
        {item.badge && (
          <div className="absolute top-0 left-8 bg-[var(--v500)] text-[9px] font-bold px-4 py-1.5 rounded-b-md uppercase tracking-wider shadow-md z-30 border-x border-b border-white/10">
            {item.badge}
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2 mt-6">
            <div>
              <div className="mono-font text-[10px] text-[var(--s500)] tracking-[0.08em] mb-1">
                WEBSITE BUILD
              </div>
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
                  + ${item.monthlyAddon.price}/mo {item.monthlyAddon.label}
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {item.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm opacity-80"
                >
                  <Check
                    size={16}
                    className="text-[var(--s500)] shrink-0"
                    aria-hidden
                  />
                  {feature}
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
                  {item.name} website spec sheet
                </DialogTitle>
                <AgentFactsPopout
                  facts={item.facts}
                  itemName={item.name}
                  onGetStarted={() => {
                    setFactsOpen(false);
                    globalThis.setTimeout(() => {
                      setIntakeOpen(true);
                    }, 80);
                  }}
                  onCrossSell={(targetId) => {
                    setFactsOpen(false);
                    globalThis.location.href = `/#offerings-${targetId}`;
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
