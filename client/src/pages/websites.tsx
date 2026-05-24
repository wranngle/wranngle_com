import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Code2,
  FormInput,
  MousePointerClick,
  Palette,
  SearchCheck,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {Dialog, DialogContent, DialogTrigger} from '@/components/ui/dialog.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import PolygonTileHero from '@/components/PolygonTileHero.tsx';
import TierCard from '@/components/TierCard.tsx';
import {getCategoryById} from '@/data/offerings.ts';

const HERO_METRICS = [
  {value: '7 days', label: 'landing page quickstart'},
  {value: '95+', label: 'Lighthouse target'},
  {value: 'Yours', label: 'source code included'},
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
    body: 'Forms send clean lead details to email and n8n instead of leaving them buried in a plugin inbox.',
  },
  {
    Icon: ShieldCheck,
    label: 'Code included',
    body: 'No page-builder lock-in. You get the source, hosting setup, and an optional maintenance plan.',
  },
];

const BUILD_STEPS = [
  {
    Icon: MousePointerClick,
    title: 'Offer map',
    body: 'Clarify the offer, audience, trust signals, objections, and contact path before design starts.',
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
    body: 'Connect lead forms, webhook payloads, analytics, and optional AI chat to the tools you already use.',
  },
];

export default function WebsitesPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const category = getCategoryById('websites');
  const tiers = category?.items ?? [];
  const [heroIntakeOpen, setHeroIntakeOpen] = useState(false);

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
            <div className="max-w-7xl mx-auto w-full px-6 pt-5 pb-12 md:pt-7 md:pb-16">
              <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="grid lg:grid-cols-[0.86fr_1.14fr] gap-10 xl:gap-14 items-center"
              >
                <div className="max-w-2xl">
                  <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                    Websites built to capture leads.
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold leading-snug mb-4 max-w-xl">
                    Fast, owned websites for teams that need a clear offer,
                    working forms, and a clean handoff.
                  </p>
                  <p className="text-base md:text-lg opacity-75 leading-relaxed mb-7 max-w-xl">
                    Wranngle builds the page, wires the forms, ships the source,
                    and keeps maintenance optional. Landing page or full
                    business site, the goal is the same: turn visitors into
                    reachable leads.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog
                      open={heroIntakeOpen}
                      onOpenChange={setHeroIntakeOpen}
                    >
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
                        <IntakeForm
                          selectedPackage="business-site"
                          onSuccess={() => {
                            setHeroIntakeOpen(false);
                          }}
                        />
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

                <PolygonTileHero isDark={isDark} />
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
                  Site work tied to lead capture.
                </h2>
                <p className="opacity-75 text-base leading-relaxed mb-6">
                  The site has one job: explain the service, make the business
                  credible, and make the next step obvious. Design, copy, SEO,
                  and automation stay tied to that job.
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
                  <TierCard key={item.id} item={item} isDark={isDark} />
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
                  ADD CHAT OR VOICE
                </div>
                <h3 className="brand-font text-2xl md:text-3xl font-bold mb-3">
                  Add chat or voice when the site starts producing leads.
                </h3>
                <p className="text-sm md:text-base opacity-70 leading-relaxed">
                  A website can collect forms. A web chat or voice agent can
                  answer questions, qualify callers, and send the details to the
                  same follow-up path after hours.
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
