/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icon (Github) used intentionally for repo link; deprecation is upstream-future. */
// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {
  ArrowRight,
  Check,
  FileText,
  Github,
  Inbox,
  Sparkles,
  FileCheck,
  Send,
} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {Dialog, DialogContent, DialogTrigger} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import {getCategoryById, type OfferingItem} from '@/data/offerings.ts';

const PIPELINE_STEPS = [
  {
    Icon: Inbox,
    title: 'Lead in',
    body: 'Form, voice agent, or webhook drops a lead into your workspace with the original context attached.',
  },
  {
    Icon: Sparkles,
    title: 'Gemini extraction',
    body: 'Structured LLM extraction reads the raw lead and produces a typed proposal payload — no hallucinated fields.',
  },
  {
    Icon: FileCheck,
    title: 'Branded PDF',
    body: 'Your logo, your colors, your proposal template. Rendered server-side, ready to send.',
  },
  {
    Icon: Send,
    title: 'Out the door',
    body: 'Email, n8n, or your CRM. Every step writes to an audit log so you can reproduce any output.',
  },
];

export default function GtmOpsPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const category = getCategoryById('saas-products');
  const tiers = category?.items ?? [];

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'GTM Ops — SaaS for branded proposals · Wranngle';
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24">
          {/* Hero */}
          <motion.section
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="mb-20 relative overflow-hidden rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] noise-overlay p-10 md:p-14"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(255,95,0,0.08), rgba(207,60,105,0.06))'
                : 'linear-gradient(135deg, rgba(255,95,0,0.06), rgba(207,60,105,0.04))',
              borderColor: isDark
                ? 'rgba(255,255,255,0.10)'
                : 'rgba(0,0,0,0.05)',
            }}
          >
            <div className="relative z-10 max-w-3xl">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                PRODUCT // GTM_OPS // SAAS
              </div>
              <h1 className="brand-font text-4xl md:text-6xl font-bold leading-tight mb-6">
                Lead in.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
                  Branded proposal out.
                </span>
              </h1>
              <p className="text-lg opacity-80 max-w-2xl leading-relaxed mb-8">
                GTM Ops is the proposal-generation surface from the Wranngle
                voice-AI runtime — packaged as self-serve software. Pipe leads
                in from any source. Get a typed, branded PDF out the other side.
                Every step is auditable.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://gtm-ops.pages.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                  Try the demo <ArrowRight size={14} />
                </a>
                <a
                  href="https://gtm-ops.pages.dev/assets/sample-proposal.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 border border-current font-bold uppercase text-xs rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <FileText size={14} /> Download sample proposal
                </a>
              </div>
            </div>
          </motion.section>

          {/* 4-step pipeline */}
          <section className="mb-24">
            <div className="mb-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                THE PIPELINE
              </div>
              <h2 className="brand-font text-3xl md:text-4xl font-bold mb-4">
                Four steps. No babysitting.
              </h2>
              <p className="opacity-70 max-w-2xl text-base leading-relaxed">
                The same pipeline that ships proposals for the Wranngle voice
                agent — only now you can run it yourself, in a browser.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PIPELINE_STEPS.map((step, index) => {
                const {Icon} = step;
                return (
                  <div
                    key={step.title}
                    className={`relative p-6 rounded-[16px_4px_16px_4px] border-y border-r border-l-4 border-l-[var(--s500)] noise-overlay ${
                      isDark
                        ? 'border-white/10 bg-[#18181b]'
                        : 'border-black/5 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--s500)]/10 text-[var(--s500)] flex items-center justify-center">
                        <Icon size={18} />
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
                Three tiers. Cancel any time.
              </h2>
              <p className="opacity-70 max-w-xl mx-auto text-base">
                Start free, upgrade when you have real volume, scale to SSO when
                your team needs it. No annual lock-in.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {tiers.map((item) => (
                <GtmOpsTile key={item.id} item={item} isDark={isDark} />
              ))}
            </div>
          </section>

          {/* Footer note + GitHub link */}
          <section className="border-t border-current/10 pt-10 grid md:grid-cols-2 gap-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                BUILT IN PUBLIC
              </div>
              <h3 className="brand-font text-2xl font-bold mb-3">
                Source is open. Receipts are public.
              </h3>
              <p className="text-sm opacity-70 leading-relaxed mb-4">
                The runtime, the pipeline, the ops-console — all in the open.
                Inspect the architecture before you sign up. Run it locally if
                you want.
              </p>
              <a
                href="https://github.com/wranngle/gtm_ops"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold border border-current/30 hover:border-[var(--s500)] hover:text-[var(--s500)] transition-colors px-4 py-2 rounded-lg"
              >
                <Github size={16} /> github.com/wranngle/gtm_ops
              </a>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                HONEST DEMO MODE
              </div>
              <h3 className="brand-font text-2xl font-bold mb-3">
                The demo is a real deploy, not a video.
              </h3>
              <p className="text-sm opacity-70 leading-relaxed">
                The "Try the demo" button drops you into a static deploy of the
                operator console at gtm-ops.pages.dev. Every API call is
                intercepted client-side and answered from synthetic fixtures —
                so you can click around without a backend, and we don't fake the
                parts that aren't there yet.
              </p>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}

function GtmOpsTile({item, isDark}: {item: OfferingItem; isDark: boolean}) {
  const [factsOpen, setFactsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);

  return (
    <div className="relative group h-full">
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
                <span className="text-sm font-normal opacity-50">
                  {item.priceCadence === 'monthly' ? '/mo' : ' one-time'}
                </span>
              </div>
              {item.monthlyAddon && (
                <div className="text-sm opacity-60 mt-1">
                  or ${item.monthlyAddon.price} {item.monthlyAddon.label}
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
                  onCrossSell={(targetId) => {
                    setFactsOpen(false);
                    if (
                      targetId === 'gtm-ops-trial' ||
                      targetId === 'gtm-ops-pro' ||
                      targetId === 'gtm-ops-scale'
                    ) {
                      // Stay on this page — scroll to pricing.
                      const target = document.querySelector('#pricing');
                      target?.scrollIntoView({behavior: 'smooth'});
                    } else {
                      // Cross-sell to ai-agents/websites lives on home page.
                      globalThis.location.href = `/#offerings-${targetId}`;
                    }
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
