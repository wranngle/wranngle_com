/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
// @ts-nocheck
import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
import {Linkedin, Github, Mail, Globe, ArrowRight} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import GitHubRepoCard from '@/components/GitHubRepoCard.tsx';

type RepoEntry = {
  fullName: string;
  role: string;
  blurb: string;
};

const REPOS: RepoEntry[] = [
  {
    fullName: 'wranngle/voice_ai_agent_evals',
    role: 'Eval harness',
    blurb:
      'Test runner and scenario framework for ElevenLabs voice agents — deterministic synthetic transcripts, latency budgets (TTFB p95 ≤ 800ms, end-to-first-audio p95 ≤ 1.4s, total-turn p95 ≤ 3.0s), prompt versioning, scoring rubric.',
  },
  {
    fullName: 'wranngle/gtm_ops',
    role: 'Runtime + architecture',
    blurb:
      'Voice-AI-led GTM motion runtime. Inbound voice agent enriches the lead from CRM context, structured LLM extraction generates a branded PDF proposal, every step writes audit logs, operators review in the ops-console.',
  },
  {
    fullName: 'wranngle/n8n',
    role: 'Workflow library',
    blurb:
      'Sanitized n8n flows for lead intake, enrichment, voice routing, post-call processing, and webhook security middleware.',
  },
  {
    fullName: 'wranngle/tradingbot',
    role: 'Quant infra',
    blurb:
      'Algorithmic trading research surface — strategy harness, backtests, and live-paper plumbing. DevOps-style rigor (deterministic fixtures, audit trails, latency budgets) applied to a different domain.',
  },
  {
    fullName: 'wranngle/career_architect',
    role: 'Python automation',
    blurb:
      'Public runtime + Next.js landing page for an AI-driven job search command center. CLI scripts for JD evaluation, tailored CV generation, portal scanning, and application tracking.',
  },
  {
    fullName: 'wranngle/wranngle_com',
    role: 'Marketing site',
    blurb:
      'This site. Vite + React + Tailwind on Cloudflare Pages, ArkType-validated lead capture, brand-token design system mirrored from gtm_ops.',
  },
];

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/codyarnold96',
    Icon: Linkedin,
    external: true,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/wranngle',
    Icon: Github,
    external: true,
  },
  {
    label: 'Email',
    href: 'mailto:cody@wranngle.com',
    Icon: Mail,
    external: false,
  },
  {
    label: 'Wranngle',
    href: 'https://wranngle.com',
    Icon: Globe,
    external: true,
  },
];

export default function About() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'About — Wranngle';
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
            className="mb-16 relative overflow-hidden rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] noise-overlay p-10 md:p-14"
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
                ABOUT // WRANNGLE_SYSTEMS
              </div>
              <h1 className="brand-font text-4xl md:text-6xl font-bold leading-tight mb-6">
                AI should answer the phone,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
                  not add another dashboard.
                </span>
              </h1>
              <p className="text-lg opacity-80 max-w-2xl leading-relaxed">
                Wranngle ships practical AI systems for trades businesses —
                voice agents that qualify the call, lead pipelines that
                don&apos;t drop work overnight, and proposal automation with
                receipts. Built from the MSP side of the world: logs, handoffs,
                fallbacks, clear ownership.
              </p>
            </div>
          </motion.section>

          {/* Two-column: Wranngle (company) + Cody (engineer + portrait) */}
          <section className="grid md:grid-cols-2 gap-8 mb-20">
            <article
              className={`relative p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${
                isDark
                  ? 'border-white/10 bg-[#18181b]'
                  : 'border-black/5 bg-white'
              } noise-overlay overflow-hidden`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                COMPANY
              </div>
              <h2 className="brand-font text-3xl font-bold mb-4">
                Wranngle Systems
              </h2>
              <p className="text-base leading-relaxed opacity-85 mb-4">
                Voice-AI-led GTM motion runtime for trades businesses — HVAC,
                plumbing, electrical, and adjacent service operators who lose
                revenue every time the phone rings after-hours.
              </p>
              <p className="text-base leading-relaxed opacity-85">
                Answer the call, qualify the intent, route the handoff, leave
                receipts. The stack is voice AI, n8n, structured extraction, and
                enough discipline to make the output repeatable.
              </p>
            </article>

            <article
              className={`relative p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--v500)] ${
                isDark
                  ? 'border-white/10 bg-[#18181b]'
                  : 'border-black/5 bg-white'
              } noise-overlay overflow-hidden`}
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-3 mono-font">
                ENGINEER
              </div>
              <div className="flex items-start gap-5 mb-4">
                <div
                  className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[var(--v500)] ${
                    isDark ? 'bg-[#0f0f13]' : 'bg-[#f4eed8]'
                  } flex items-center justify-center`}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center brand-font text-2xl font-bold opacity-40 select-none"
                    aria-hidden
                  >
                    CA
                  </span>
                  <img
                    src="/portrait-cody.jpg"
                    alt="Cody Arnold"
                    className="relative z-10 w-full h-full object-cover scale-110 origin-center"
                    onError={(e) => {
                      // If portrait isn't published yet, hide the broken image
                      // and the CA initials placeholder underneath shows through.
                      (e.currentTarget as HTMLImageElement).style.display =
                        'none';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="brand-font text-3xl font-bold leading-tight">
                    Cody Arnold
                  </h2>
                  <p className="text-xs opacity-60 mt-1 leading-tight">
                    Founder / Principal Solutions Architect · Fort Wayne, IN
                  </p>
                </div>
              </div>
              <p className="text-base leading-relaxed opacity-85 mb-3">
                Ten years inside an MSP — running automation across{' '}
                <span className="font-bold">500+ client environments</span> and{' '}
                <span className="font-bold">4,000+ endpoints</span>. Reduced
                manual oversight by 40% with Python/PowerShell at scale, then
                authored a 700-guide SOP framework so a 10-person team could
                ship the same patterns repeatably.
              </p>
              <p className="text-base leading-relaxed opacity-85">
                Productized an on-call ElevenLabs Conversational AI agent now
                live at 5 clients —{' '}
                <span className="mono-font text-[13px]">P95 &lt; 500 ms</span>,
                100% call success, 92% enrichment success, regression-tested via
                a synthetic-conversation harness. That work secured the
                ElevenLabs Startup Grant.
              </p>
            </article>
          </section>

          {/* Public repos grid */}
          <section className="mb-20">
            <a
              href="https://github.com/wranngle"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-md border transition-colors hover:border-[var(--s500)] hover:text-[var(--s500)] ${
                isDark
                  ? 'border-white/15 bg-white/5'
                  : 'border-black/15 bg-black/5'
              }`}
            >
              <Github size={14} />
              <span className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-80">
                github.com/wranngle
              </span>
            </a>
            <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
              <h2 className="brand-font text-3xl md:text-4xl font-bold">
                GitHub projects
              </h2>
              <a
                href="https://github.com/wranngle"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--s500)] hover:underline"
              >
                View all on GitHub <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REPOS.map((repo) => (
                <GitHubRepoCard
                  key={repo.fullName}
                  fullName={repo.fullName}
                  role={repo.role}
                  fallbackBlurb={repo.blurb}
                  isDark={isDark}
                />
              ))}
            </div>
          </section>

          {/* Socials */}
          <section className="mb-20">
            <h2 className="brand-font text-3xl md:text-4xl font-bold mb-6">
              Connect
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              {SOCIALS.map(({label, href, Icon, external}) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? {target: '_blank', rel: 'noreferrer'} : {})}
                  className={`inline-flex items-center gap-3 px-5 py-3 rounded-md border ${
                    isDark
                      ? 'border-white/10 hover:border-[var(--s500)]'
                      : 'border-black/10 hover:border-[var(--s500)]'
                  } hover:text-[var(--s500)] transition-all`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{label}</span>
                </a>
              ))}
            </div>
          </section>

          {/* Talk to Sarah CTA */}
          <section
            className={`mb-12 p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${
              isDark
                ? 'border-white/10 bg-[#18181b]'
                : 'border-black/5 bg-white'
            } text-center noise-overlay overflow-hidden relative`}
          >
            <div className="relative z-10">
              <h2 className="brand-font text-3xl font-bold mb-3">
                Want to see it in action?
              </h2>
              <p className="opacity-70 mb-6 max-w-xl mx-auto">
                Sarah is our live demo voice agent. She runs in the corner of
                the home page — go say hi.
              </p>
              <a
                href="/#talk-to-sarah"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-105 transition-all"
              >
                Talk to Sarah <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
