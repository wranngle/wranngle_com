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
      'Voice-AI-led GTM runtime. Inbound calls enrich from CRM context, structured extraction creates proposal inputs, and every step leaves an audit trail for operator review.',
  },
  {
    fullName: 'wranngle/n8n',
    role: 'Workflow library',
    blurb:
      'Sanitized n8n flows for lead intake, enrichment, voice routing, post-call processing, and webhook security middleware.',
  },
  {
    fullName: 'wranngle/tradingbot',
    role: 'Systems rigor',
    blurb:
      'Algorithmic trading research surface with strategy harnesses, backtests, live-paper plumbing, deterministic fixtures, audit trails, and latency budgets.',
  },
  {
    fullName: 'wranngle/career_architect',
    role: 'Python automation',
    blurb:
      'AI-driven job search command center with scripts for JD evaluation, tailored CV generation, portal scanning, and application tracking.',
  },
  {
    fullName: 'wranngle/wranngle_com',
    role: 'This site',
    blurb:
      'Vite, React, Tailwind, and Cloudflare Pages with ArkType-validated lead capture and brand tokens mirrored from the Wranngle product surface.',
  },
];

const TRUST_MARKERS = [
  {
    value: '10 years',
    label: 'MSP operating depth',
    detail:
      'Automation, escalation, documentation, and support work inside environments where downtime is not theoretical.',
  },
  {
    value: '500+',
    label: 'Client environments',
    detail:
      'Enough variety to distrust fragile demos and design for weird real-world edge cases first.',
  },
  {
    value: '4,000+',
    label: 'Endpoints supported',
    detail:
      'Python and PowerShell automation that absorbed the recurring drudgery so engineers stayed on the work that needed a human.',
  },
  {
    value: '700',
    label: 'SOP guides authored',
    detail:
      'Runbooks, handoffs, and repeatable patterns for a 10-person team that had to keep moving without guesswork.',
  },
  {
    value: '5',
    label: 'Client orgs in voice deployment',
    detail:
      'ATG ElevenLabs on-call agent work across 15 client sites: zero dropped calls, P95 latency under 500ms, 92% CRM enrichment.',
  },
  {
    value: '<500 ms',
    label: 'P95 latency target',
    detail:
      'Voice systems are trust systems. Latency, fallbacks, and transcript quality get measured because users feel them.',
  },
];

const WORK_SHAPES = [
  {
    label: 'Voice AI',
    title: 'Agents that survive real callers',
    body: 'ElevenLabs agents, Twilio handoffs, transcript fixtures, post-call webhooks, and latency budgets built around production behavior instead of demo scripts.',
  },
  {
    label: 'Workflow automation',
    title: 'The glue around the agent',
    body: 'n8n, CRM enrichment, lead routing, proposal inputs, Slack alerts, and operator review surfaces that keep the system inspectable.',
  },
  {
    label: 'Full-stack systems',
    title: 'Small interfaces for messy operations',
    body: 'TypeScript, React, Vite, Cloudflare Pages Functions, Bun, ArkType, Python, and PowerShell used to turn workflows into durable tools.',
  },
  {
    label: 'Operating discipline',
    title: 'Runbooks, evals, and failure paths',
    body: 'The MSP habits still matter: document the path, measure the awkward parts, leave ownership clear, and make regression visible before customers feel it.',
  },
];

const PRINCIPLES = [
  {
    Icon: BadgeCheck,
    title: 'Earn trust before speed',
    body: 'Automation only gets useful when someone can inspect what happened, why it happened, and where the handoff went.',
  },
  {
    Icon: PhoneCall,
    title: 'Start where work leaks',
    body: 'For service businesses, the leak is often a missed call, an after-hours voicemail, or the CRM note nobody wrote.',
  },
  {
    Icon: Gauge,
    title: 'Measure the awkward parts',
    body: 'Latency budgets, enrichment success, transcript fixtures, and regression prompts matter because voice systems fail in front of users, not in staging.',
  },
  {
    Icon: FileText,
    title: 'Leave receipts',
    body: 'A workflow is not finished until the next operator can see the inputs, outputs, ownership, and failure path.',
  },
];

const METHOD = [
  {
    step: '01',
    title: 'Trace the real day',
    body: 'Calls, tickets, forms, texts, spreadsheets, and the person everyone quietly routes around. The unofficial workflow is usually the honest one.',
  },
  {
    step: '02',
    title: 'Build the smallest durable loop',
    body: 'Answer, qualify, enrich, route, record. The first version should survive normal mess, not impress a perfect demo script.',
  },
  {
    step: '03',
    title: 'Instrument the failure modes',
    body: 'Measure latency, extraction quality, fallback paths, and handoff completion so decisions are based on data. In voice, failures are immediate and public.',
  },
  {
    step: '04',
    title: 'Hand it off like an operator will own it',
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
                  Founder, Wranngle. Fort Wayne, Indiana.
                </p>

                <div className="mt-8 space-y-5 text-base md:text-xl leading-relaxed">
                  <p>
                    Wranngle exists because most "AI for service businesses"
                    pitches quietly ask the business to bend around the tool.
                    The work I care about is the opposite: keep the day intact,
                    answer the phone, capture what was said, route it where work
                    already lives, and leave a trail the owner can audit before
                    coffee.
                  </p>
                  <p className={mutedText}>
                    The practice grew out of automation work inside an MSP —
                    voice agents, workflow plumbing, and the connective tissue
                    between the CRM, the dispatcher, and the audit log. The
                    receipts are further down the page. The principle comes
                    first, because the principle is what the operator has to
                    live with.
                  </p>
                  <p className={mutedText}>
                    Depending on the room, the work looks like AI automation
                    engineering, voice AI engineering, workflow automation, or
                    full-stack TypeScript. The useful part is the overlap:
                    agents that understand the job, systems that move the work,
                    and enough instrumentation to know when either one failed.
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
                      Wranngle, in one line
                    </p>
                    <p className="mt-1 text-sm leading-relaxed opacity-80">
                      Voice and workflow automation for service businesses where
                      downtime is not theoretical.
                    </p>
                  </div>
                </div>

                <dl className={`mt-8 divide-y ${borderClass} hidden md:block`}>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Current focus
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      ElevenLabs voice agents, n8n automation, structured lead
                      capture, proposal generation, and eval harnesses.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Working shape
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      Voice AI, workflow automation, full-stack TypeScript, and
                      operator-facing internal tools.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Operating bias
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      Logs, fallbacks, ownership, and documentation before
                      scale.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Recent proof
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      On-call ElevenLabs voice agent covering 15 client sites:
                      P95 under 500ms, 92% CRM enrichment, regression-tested
                      before release.
                    </dd>
                  </div>
                  <div className="py-4">
                    <dt className="mono-font text-[10px] font-bold uppercase tracking-widest opacity-55">
                      Outside read
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed">
                      ElevenLabs Startup Grant, 2025 — for the on-call voice
                      work that became this practice.
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
                  WORKING SHAPE
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                  The title changes. The operating surface stays the same.
                </h2>
                <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                  The strongest work usually sits between a live workflow, a
                  technical integration, and the person who has to trust the
                  result after launch.
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
                  OPERATING RECORD
                </div>
                <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                  The proof I trust is operational.
                </h2>
                <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                  The numbers came from systems someone had to support after the
                  build was done.
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
                THE WHY
              </div>
              <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                Do not ask operators to reorganize around the tool.
              </h2>
            </div>
            <div
              className={`space-y-5 text-base md:text-lg leading-relaxed ${mutedText}`}
            >
              <p>
                A lot of AI software quietly asks the business to change shape
                around the tool. That is backwards for the operators I care
                about. They already have customers calling, techs moving,
                dispatchers switching context, and owners trying to keep the day
                from leaking revenue.
              </p>
              <p>
                The better promise is continuity. If a missed call becomes a
                qualified lead, if the CRM has the useful facts, if the proposal
                can be drafted from evidence, and if the owner can audit the
                path afterward, the system earned its place before anybody
                opened a new tab.
              </p>
              <p>
                Software is secondary. First, the workflow has to prove it
                deserves to exist.
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
                    What has to be true
                  </h2>
                </div>
                <p
                  className={`max-w-xl text-sm md:text-base leading-relaxed ${mutedText}`}
                >
                  These are the constraints I design around before talking about
                  scale, polish, or a bigger roadmap.
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
                Find the smallest loop that survives production.
              </h2>
              <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                Map what actually breaks in the workflow, build the minimal
                version that handles it reliably, measure the failure modes, and
                hand it off so the next person can own it without asking me.
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
                    Public proof
                  </h2>
                  <p className={`mt-4 text-base leading-relaxed ${mutedText}`}>
                    The repositories are not a polished portfolio museum. They
                    are the receipts: evals, workflow plumbing, operating
                    surfaces, and the adjacent systems work that shows how I
                    think.
                  </p>
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
                  Start with the messy version.
                </h2>
              </div>
              <div>
                <p
                  className={`text-base md:text-lg leading-relaxed ${mutedText}`}
                >
                  The fastest conversation is the unpolished one: what breaks,
                  what people work around, what you already tried, and what you
                  need to trust before automating it.
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
