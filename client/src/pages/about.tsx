/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
import React, {useEffect} from 'react';
import {Link} from 'wouter';
import {Linkedin, Github, Mail, Globe} from 'lucide-react';

const REPOS = [
  {
    name: 'voice_ai_agent_evals',
    href: 'https://github.com/wranngle/voice_ai_agent_evals',
    role: 'Eval harness',
    blurb:
      'Test runner and scenario framework for ElevenLabs voice agents — deterministic synthetic transcripts, latency budgets (TTFB p95 ≤ 800ms, end-to-first-audio p95 ≤ 1.4s, total-turn p95 ≤ 3.0s), prompt versioning, scoring rubric. Wired to the production Sarah agent for regression testing.',
  },
  {
    name: 'gtm_ops',
    href: 'https://github.com/wranngle/gtm_ops',
    role: 'Runtime + architecture',
    blurb:
      'Voice-AI-led GTM motion runtime. Inbound voice agent enriches the lead from CRM context, structured LLM extraction generates a branded PDF proposal, every step writes audit logs, operators review in the ops-console. Runs end-to-end against synthetic fixtures (DEMO_MODE) or a live backend.',
  },
  {
    name: 'n8n',
    href: 'https://github.com/wranngle/n8n',
    role: 'Workflow library',
    blurb:
      'Sanitized n8n flows for lead intake, enrichment, voice routing, post-call processing, and webhook security middleware.',
  },
  {
    name: 'tradingbot',
    href: 'https://github.com/wranngle/tradingbot',
    role: 'Quant infra',
    blurb:
      'Algorithmic trading research surface — strategy harness, backtests, and live-paper plumbing. Same DevOps-style rigor (deterministic fixtures, audit trails, latency budgets) applied to a different problem domain.',
  },
  {
    name: 'career_architect',
    href: 'https://github.com/wranngle/career_architect',
    role: 'Python automation',
    blurb:
      'Public runtime + Next.js landing page for an AI-driven job search command center. CLI scripts for JD evaluation, tailored CV generation, portal scanning, and application tracking.',
  },
];

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/codyarnold96',
    Icon: Linkedin,
    external: true,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Wranngle',
    Icon: Github,
    external: true,
  },
  {
    label: 'Email',
    href: 'mailto:codymann88@gmail.com',
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
  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'About — Wranngle';
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12">
          <Link
            href="/"
            className="inline-block text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to wranngle.com
          </Link>
          <h1 className="mt-6 text-3xl md:text-4xl font-bold font-display tracking-tight">
            About — Wranngle Systems{' '}
            <span className="text-[var(--s500)]">/</span> Cody Arnold
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-prose">
            The company and the engineer behind it. Pre-revenue, technically
            opinionated, and shipping in public.
          </p>
        </header>

        <section className="mb-14">
          <h2 className="text-2xl font-semibold font-display mb-4">
            Wranngle Systems
          </h2>
          <p className="text-base leading-relaxed text-foreground/85 max-w-prose">
            Wranngle is a voice-AI-led GTM motion runtime for trades businesses
            — HVAC, plumbing, electrical, and adjacent service operators who
            lose revenue every time the phone rings after-hours. The product is
            an autonomous, deterministic layer between caller intent and
            operator follow-through: voice agent intercepts, LLM extracts and
            scores the lead, n8n routes the structured payload, and the operator
            gets an SMS while the audit trail writes itself.
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/85 max-w-prose">
            We are pre-revenue and operate under the ElevenLabs Startup Grant.
            The technical surface is public:{' '}
            <a
              href="https://github.com/wranngle/gtm_ops"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--s500)] transition-colors"
            >
              gtm_ops
            </a>{' '}
            (runtime),{' '}
            <a
              href="https://github.com/wranngle/voice_ai_agent_evals"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--s500)] transition-colors"
            >
              voice_ai_agent_evals
            </a>{' '}
            (eval harness), and{' '}
            <a
              href="https://github.com/wranngle/n8n"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[var(--s500)] transition-colors"
            >
              n8n
            </a>{' '}
            (workflow library).
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-semibold font-display mb-4">
            Cody Arnold
          </h2>
          <p className="text-base leading-relaxed text-foreground/85 max-w-prose">
            Senior AI Automation Architect. Ten years inside an MSP running
            4,000+ endpoints across 100+ client environments — the daily grind
            of keeping infrastructure deterministic when humans, vendors, and
            networks are all simultaneously trying to violate that contract.
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/85 max-w-prose">
            That background shows up in the AI-agent stack: n8n + Python +
            PowerShell as the orchestration spine, Vapi and ElevenLabs
            Conversational AI for voice, RAG for grounded responses, and a
            DevOps-style discipline around evals, audit logs, latency budgets,
            and reproducible fixtures. Fort Wayne, IN.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-semibold font-display mb-6">
            Public repos
          </h2>
          <div className="space-y-10">
            {REPOS.map((repo) => (
              <article
                key={repo.name}
                className="border-l-4 border-primary pl-5"
              >
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h3 className="text-xl font-semibold font-display">
                    <a
                      href={repo.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {repo.name}
                    </a>
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {repo.role}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                  {repo.blurb}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-semibold font-display mb-6">Contact</h2>
          <div className="flex flex-wrap items-center gap-8">
            {SOCIALS.map(({label, href, Icon, external}) => (
              <a
                key={label}
                href={href}
                {...(external ? {target: '_blank', rel: 'noreferrer'} : {})}
                className="inline-flex items-center gap-2 text-sm text-foreground/85 hover:text-[var(--s500)] transition-colors"
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
          <p>
            For broader engineering context, see the{' '}
            <a
              href="https://github.com/wranngle"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              GitHub profile
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}
