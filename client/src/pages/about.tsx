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
      'Algorithmic research app with strategy harnesses, simulations, deterministic fixtures, run logs, and latency budgets.',
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
    value: '10 years',
    label: 'IT operations experience',
    detail:
      'A decade running automation inside live support work — not beside it. Every script had to survive the next on-call shift.',
  },
  {
    value: '500+',
    label: 'Client environments',
    detail:
      'Hundreds of distinct tenants, each with its own integrations and edge cases. The fragile ones taught most of the rules I still use.',
  },
  {
    value: '4,000+',
    label: 'Endpoints supported',
    detail:
      'Python and PowerShell tooling that cut manual oversight by roughly 40% across the fleet.',
  },
  {
    value: '700',
    label: 'SOP guides authored',
    detail:
      'A team of ten had to move without guessing. The runbook library made the next engineer the same engineer.',
  },
  {
    value: '15',
    label: 'Client sites in voice deployment',
    detail:
      'ElevenLabs on-call voice agents in production. Zero dropped calls. P95 under 500 ms. CRM enrichment lands cleanly on 92% of calls.',
  },
  {
    value: '<500 ms',
    label: 'P95 latency target',
    detail:
      'Voice is unforgiving — callers hear every pause. Latency, fallbacks, and transcript quality get measured because the customer notices first.',
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
    body: 'A 13-node n8n orchestration enriches the lead during the call, writes back to the CRM in flight, and surfaces a clean handoff to Slack. Every boundary is schema-validated so the LLM cannot poison downstream systems.',
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
    body: 'Latency budgets, enrichment success, transcript fixtures, and regression prompts matter because voice systems fail in front of users, not in staging.',
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
                    teams with real customer follow-up. The job is
                    straightforward — answer the call, get the useful details,
                    route the work into tools the team already checks, and make
                    every step easy to review afterwards.
                  </p>
                  <p className={mutedText}>
                    This work started in IT operations. Automation had to
                    support live service shifts, not run alongside them. That
                    background still shapes everything that ships now: the voice
                    agent has to fail visibly when it fails, the CRM write-back
                    has to be reproducible, the handoff has to be readable by
                    whoever picks up next.
                  </p>
                  <p className={mutedText}>
                    Most of the day is spent on the handoff. What did the agent
                    understand? Where did the work go after the call ended? If
                    something broke, can the team see exactly which step broke
                    and replay the inputs?
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
                      ElevenLabs on-call voice agents in production across 15
                      client sites. Synthetic-conversation regression harness
                      gates every prompt change. P95 under 500 ms.
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </motion.section>

          <section className={`border-b ${borderClass}`}>
            <div className="max-w-7xl mx-auto w-full px-6 py-12 md:py-16 grid lg:grid-cols-[0.72fr_1.28fr] gap-10 lg:gap-16">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-4 mono-font">
                  WORK AREAS
                </div>
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
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                  RESULTS
                </div>
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

          <section className="max-w-7xl mx-auto w-full px-6 py-16 md:py-20 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--v500)] mb-4 mono-font">
                APPROACH
              </div>
              <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                Fit the existing workflow
              </h2>
            </div>
            <div
              className={`space-y-5 text-base md:text-lg leading-relaxed ${mutedText}`}
            >
              <p>
                Many AI products require teams to change how they work before
                the software creates value. Busy teams do not have that luxury.
                Customers are calling, work is moving, and staff are switching
                context all day.
              </p>
              <p>
                The better target is continuity. A missed call becomes a
                qualified lead. The CRM gets the useful facts. A proposal starts
                from captured details. The owner can review what happened
                afterward — and pick up exactly where the agent left off.
              </p>
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
                Ship the smallest reliable loop
              </h2>
              <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                Map the current process, build the first reliable version,
                measure the failure modes, and hand it off with enough context
                for someone else to maintain it.
              </p>
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
