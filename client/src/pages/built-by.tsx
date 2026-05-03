import React, {useEffect} from 'react';
import {Link} from 'wouter';

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
    name: 'career_architect',
    href: 'https://github.com/wranngle/career_architect',
    role: 'Python automation',
    blurb:
      'Public runtime + Next.js landing page for an AI-driven job search command center. CLI scripts for JD evaluation, tailored CV generation, portal scanning, and application tracking.',
  },
];

export default function BuiltBy() {
  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Built by — Wranngle';
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
            Built by
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-prose">
            Wranngle is pre-revenue and operates under the ElevenLabs Startup
            Grant. The product runs on a stack designed end-to-end by one
            engineer; the public repos below are the technical surface a cold
            reviewer can read.
          </p>
        </header>

        <section className="space-y-10">
          {REPOS.map((repo) => (
            <article key={repo.name} className="border-l-4 border-primary pl-5">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="text-xl font-semibold font-display">
                  <a
                    href={repo.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {repo.name}
                  </a>
                </h2>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {repo.role}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                {repo.blurb}
              </p>
            </article>
          ))}
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
