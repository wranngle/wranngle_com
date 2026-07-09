/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Gauge,
  Github,
  Linkedin,
  Mail,
  PhoneCall,
} from 'lucide-react';
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
    role: 'Voice evals',
    blurb:
      'Test runner and scenario framework for ElevenLabs voice agents: deterministic synthetic transcripts, latency budgets, prompt versioning, and a scoring rubric for user-facing failures.',
  },
  {
    fullName: 'wranngle/gtm_ops',
    role: 'Ops runtime',
    blurb:
      'GTM runtime for inbound calls, CRM context, structured extraction, proposal inputs, and reviewable logs.',
  },
  {
    fullName: 'wranngle/n8n',
    role: 'Workflow library',
    blurb:
      'Sanitized n8n flows for lead intake, enrichment, voice routing, post-call processing, and webhook security middleware.',
  },
  {
    fullName: 'wranngle/tradingbot',
    role: 'Testing discipline',
    blurb:
      'Algorithmic trading research on QuantConnect: strategy harnesses, simulations, deterministic fixtures, and risk-control tests. Backtest-only.',
  },
  {
    fullName: 'wranngle/career_architect',
    role: 'Python automation',
    blurb:
      'Job-search automation scripts for JD evaluation, tailored CV generation, portal scanning, and application tracking.',
  },
  {
    fullName: 'wranngle/wranngle_com',
    role: 'This site',
    blurb:
      'Vite, React, Tailwind, and Cloudflare Pages with ArkType-validated lead capture and shared Wranngle brand tokens.',
  },
];

const TRUST_MARKERS = [
  {
    value: '10+ years',
    label: 'IT operations experience',
    detail:
      'I spent a decade running automation inside live support work rather than beside it, so every script had to keep working through the next on-call shift.',
  },
  {
    value: '500+',
    label: 'Client environments',
    detail:
      'I supported hundreds of distinct client tenants, each with its own integrations and edge cases, and the fragile ones taught me most of the rules I still follow.',
  },
  {
    value: '4,000+',
    label: 'Endpoints supported',
    detail:
      'Python automation, n8n workflows, and TypeScript tooling cut manual oversight by roughly 40% across the fleet.',
  },
  {
    value: '700',
    label: 'SOP guides authored',
    detail:
      'I wrote the runbook library so a team of ten could move without guessing. It held up as the team grew to twenty, and new-engineer ramp fell from about three months to one.',
  },
  {
    value: '20+',
    label: 'Sites covered by voice agents',
    detail:
      'ElevenLabs on-call voice agents run in production across five client organizations spanning more than twenty sites. The agent does intake and triage, then hands the call to a person with the caller context intact.',
  },
  {
    value: '>90%',
    label: 'Regressions caught before ship',
    detail:
      'Voice is unforgiving because callers hear every failure, so a synthetic-conversation harness gates every prompt change and catches regressions before a caller ever could.',
  },
];

const WORK_SHAPES = [
  {
    label: 'Voice AI',
    title: 'Voice agents that cover the phones',
    body: 'ElevenLabs agents wired to Twilio (and Telnyx and Bandwidth when telephony gets weird). Each prompt change ships with synthetic-conversation regression tests so a 2 AM call gets the same script as a 2 PM call.',
  },
  {
    label: 'Workflow automation',
    title: 'Workflow infrastructure around the agent',
    body: 'An n8n orchestration layer enriches the lead during the call, writes back to the CRM in flight, and surfaces a clean handoff to Slack. Every boundary is schema-validated so the LLM cannot poison downstream systems.',
  },
  {
    label: 'Product systems',
    title: 'Interfaces for daily operations',
    body: 'Dashboards that show the run log next to the proposal PDF. Evals that fail loud. Review screens that let an operator replay a call from the original payload and answer "why did it route this way?" without paging an engineer.',
  },
  {
    label: 'Operating discipline',
    title: 'Runbooks and failure paths',
    body: 'The operations habits still matter. Document the path. Measure the part that breaks. Name an owner. Catch regressions before the customer does.',
  },
];

const PRINCIPLES = [
  {
    Icon: BadgeCheck,
    title: 'Make it auditable',
    body: 'Automation only gets useful when someone can inspect what happened, why it happened, and where the handoff went.',
  },
  {
    Icon: PhoneCall,
    title: 'Fix the missed handoff',
    body: 'For busy teams, the leak is often a missed call, an after-hours message, or the CRM note nobody wrote.',
  },
  {
    Icon: Gauge,
    title: 'Measure failure points',
    body: 'Latency budgets, extraction quality, transcript fixtures, and regression prompts matter because voice systems fail in front of users, not in staging.',
  },
  {
    Icon: FileText,
    title: 'Keep a run log',
    body: 'A workflow is not finished until the next person can see the inputs, outputs, ownership, and failure path.',
  },
];

const METHOD = [
  {
    step: '01',
    title: 'Map the current workflow',
    body: 'Calls, tickets, forms, texts, spreadsheets, and manual handoffs. The current workaround usually shows where the system has to improve.',
  },
  {
    step: '02',
    title: 'Build the first reliable loop',
    body: 'Answer, qualify, enrich, route, record. The first version should handle normal edge cases, not only a perfect demo script.',
  },
  {
    step: '03',
    title: 'Instrument the failure modes',
    body: 'Measure latency, extraction quality, fallback paths, and handoff completion so decisions are based on data. In voice, failures are immediate and public.',
  },
  {
    step: '04',
    title: 'Handoff with logs and docs',
    body: 'Logs, docs, alerts, permissions, and runbooks are part of the product. If support cannot reason about it, it is not done.',
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
];

export default function About() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Cody Arnold - About Wranngle';
  }, []);

  const borderClass = isDark ? 'border-white/10' : 'border-black/10';
  const mutedText = isDark ? 'text-[#d8d1c4]/75' : 'text-[#342f28]/75';

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main id="main" className="flex-1 w-full">
          <motion.section
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            className={`border-b ${borderClass}`}
          >
            <div className="max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 lg:gap-16 items-start">
              <div className="max-w-3xl">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                  ABOUT WRANNGLE
                </div>
                <h1 className="brand-font text-4xl md:text-5xl font-bold leading-tight">
                  Cody Arnold
                </h1>
                <p className={`mt-3 text-base md:text-lg ${mutedText}`}>
                  AI automation engineer and founder of Wranngle.
                </p>

                <div className="mt-8 space-y-5 text-base md:text-xl leading-relaxed">
                  <p>
                    Wranngle builds AI voice agents and workflow automation for
                    service businesses where the phone keeps ringing while every
                    tech is on a job: plumbing and HVAC shops, dealerships, help
                    desks. The agent answers the call, collects what a
                    dispatcher would ask for, and writes the job into the CRM
                    and tools the team already checks. Afterward, every step is
                    on record and easy to review.
                  </p>
                  <p className={mutedText}>
                    The discipline comes from 10+ years in IT operations,
                    supporting live service shifts where automation either
                    carried real work or got in the way. A script that failed
                    quietly meant a person inherited the mess mid-shift.
                    Everything Wranngle ships still holds that line: fail
                    visibly, write back to the CRM reproducibly, keep the
                    handoff readable for whoever takes the next step.
                  </p>
                  <p className={mutedText}>
                    Most of the day goes to the handoff, because that is where
                    automation earns trust or loses it. What did the agent hear,
                    where did the job land, and who owns it now? When something
                    breaks, the team can see the exact step that failed and
                    replay the same inputs until the answer is boring.
                  </p>
                </div>
              </div>

              <aside
                className={`lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto border-l ${borderClass} pl-6`}
                aria-label="Cody Arnold profile summary"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--s500)] ${
                      isDark ? 'bg-[#0f0f13]' : 'bg-[#f4eed8]'
                    } flex items-center justify-center`}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center brand-font text-2xl font-bold opacity-35 select-none"
                      aria-hidden
                    >
                      CA
                    </span>
                    <img
                      src="/portrait-cody.jpg"
                      alt="Cody Arnold"
                      className="relative z-10 w-full h-full object-cover scale-110 origin-center"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)]">
                      What Wranngle does
                    </p>
                    <p className="mt-1 text-sm leading-relaxed opacity-80">
                      Production voice agents and the workflow around them, so a
                      missed call becomes a clean follow-up instead of a
                      voicemail your team never hears.
                    </p>
                  </div>
                </div>

                <dl className={`mt-8 divide-y ${borderClass} hidden md:block`}>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Current focus
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      Shipping the ElevenLabs voice runtime, the n8n
                      orchestration behind it, and the proposal console that
                      consumes the resulting lead.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Work covered
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      Voice AI on the inbound. Workflow plumbing in the middle.
                      Operator-facing tooling on the outbound. The same engineer
                      owns all three so the contract between them stays honest.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      How I build
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      Every boundary is schema-validated. Every fallback is
                      named. Every run leaves a log a human can replay.
                      Documentation is part of the pull request.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Recent work
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      ElevenLabs on-call voice agents in production across 5
                      client organizations spanning 20+ sites. A
                      synthetic-conversation regression harness gates every
                      prompt change.
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </motion.section>

          <section className={`border-b ${borderClass}`}>
            <div className="max-w-7xl mx-auto w-full px-6 py-12 md:py-16 grid lg:grid-cols-[0.72fr_1.28fr] gap-10 lg:gap-16">
              <div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                  What I build
                </h2>
                <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                  Most projects combine a live workflow, a technical
                  integration, and a clear handoff for the people using it after
                  launch.
                </p>
              </div>

              <div className={`divide-y ${borderClass}`}>
                {WORK_SHAPES.map((item) => (
                  <article
                    key={item.label}
                    className="py-5 first:pt-0 last:pb-0 grid sm:grid-cols-[160px_1fr] gap-3 sm:gap-6"
                  >
                    <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)]">
                      {item.label}
                    </div>
                    <div>
                      <h3 className="brand-font text-xl font-bold leading-tight">
                        {item.title}
                      </h3>
                      <p
                        className={`mt-2 text-sm md:text-base leading-relaxed ${mutedText}`}
                      >
                        {item.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={`border-b ${borderClass}`}>
            <div className="max-w-7xl mx-auto w-full px-6 py-12 md:py-16 grid lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16">
              <div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                  Results from supported systems
                </h2>
                <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                  These numbers come from support work and production systems,
                  not isolated demos.
                </p>
              </div>

              <dl className={`divide-y ${borderClass}`}>
                {TRUST_MARKERS.map((item) => (
                  <div
                    key={`${item.value}-${item.label}`}
                    className="py-5 first:pt-0 last:pb-0 grid sm:grid-cols-[120px_1fr] gap-4"
                  >
                    <dt>
                      <span className="block brand-font text-3xl font-bold text-[var(--s500)] leading-none">
                        {item.value}
                      </span>
                      <span className="block mt-2 text-sm font-bold">
                        {item.label}
                      </span>
                    </dt>
                    <dd
                      className={`text-sm md:text-base leading-relaxed ${mutedText}`}
                    >
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className={`border-y ${borderClass}`}>
            <div className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                    PRINCIPLES
                  </div>
                  <h2 className="brand-font text-3xl md:text-4xl font-bold">
                    Rules for useful automation
                  </h2>
                </div>
                <p
                  className={`max-w-xl text-sm md:text-base leading-relaxed ${mutedText}`}
                >
                  These are the requirements I check before adding more scope.
                </p>
              </div>

              <div className={`divide-y ${borderClass}`}>
                {PRINCIPLES.map(({Icon, title, body}, index) => (
                  <article
                    key={title}
                    className="py-6 first:pt-0 last:pb-0 grid md:grid-cols-[52px_240px_1fr] lg:grid-cols-[52px_260px_1fr] gap-4 md:gap-6 items-start"
                  >
                    <div className="flex items-center gap-3 md:block">
                      <span className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <Icon
                        size={20}
                        className="text-[var(--s500)] md:mt-3"
                        aria-hidden
                      />
                    </div>
                    <h3 className="brand-font text-xl font-bold leading-tight">
                      {title}
                    </h3>
                    <p
                      className={`text-sm md:text-base leading-relaxed ${mutedText}`}
                    >
                      {body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-4 mono-font">
                HOW I WORK
              </div>
              <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                Fit the workflow, ship the smallest reliable loop
              </h2>
              <div
                className={`mt-4 space-y-4 text-base leading-relaxed ${mutedText}`}
              >
                <p>
                  Most AI products make a team change how they work before the
                  software pays off. Busy teams can&apos;t — customers are
                  calling and staff are switching context all day. So the target
                  is continuity: a missed call becomes a qualified lead, the CRM
                  gets the useful facts, the owner can pick up exactly where the
                  agent left off.
                </p>
                <p>
                  In practice that means mapping the current process, building
                  the first reliable version, measuring the failure modes, and
                  handing it off with enough context for someone else to
                  maintain it.
                </p>
              </div>
            </div>

            <div className={`divide-y ${borderClass}`}>
              {METHOD.map((item) => (
                <article
                  key={item.step}
                  className="py-5 first:pt-0 last:pb-0 grid sm:grid-cols-[72px_1fr] gap-4"
                >
                  <div className="mono-font text-[11px] font-bold uppercase tracking-widest text-[var(--s500)]">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="brand-font text-xl font-bold">
                      {item.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm md:text-base leading-relaxed ${mutedText}`}
                    >
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={`border-t ${borderClass}`}>
            <div className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
                <div className="max-w-2xl">
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
                    <Github size={14} aria-hidden />
                    <span className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-80">
                      github.com/wranngle
                    </span>
                  </a>
                  <h2 className="brand-font text-3xl md:text-4xl font-bold">
                    Code and working examples
                  </h2>
                </div>
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
            </div>
          </section>

          <section className={`border-t ${borderClass}`}>
            <div className="max-w-7xl mx-auto w-full px-6 py-14 md:py-16 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                  CONTACT
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                  Tell me what you want to improve
                </h2>
              </div>
              <div>
                <p
                  className={`text-base md:text-lg leading-relaxed ${mutedText}`}
                >
                  Send the rough version: what happens today, where it gets
                  stuck, and what a better handoff would look like. I will help
                  turn that into a concrete next step.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {SOCIALS.map(({label, href, Icon, external}) => (
                    <a
                      key={label}
                      href={href}
                      {...(external
                        ? {target: '_blank', rel: 'noreferrer'}
                        : {})}
                      className={`inline-flex min-h-11 items-center gap-3 px-4 py-2 rounded-md border ${
                        isDark
                          ? 'border-white/10 hover:border-[var(--s500)]'
                          : 'border-black/10 hover:border-[var(--s500)]'
                      } hover:text-[var(--s500)] transition-colors`}
                    >
                      <Icon size={18} aria-hidden />
                      <span className="font-medium text-sm">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} showCta={false} />
      </div>
    </div>
  );
}
