// @ts-nocheck
import React, {useEffect} from 'react';
import {ArrowRight, Building2, TrendingUp} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

type CaseStudy = {
  title: string;
  industry: string;
  problem: string;
  outcome: string;
  metric: string;
  testimonial: string;
  testimonialSource: string;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    title: 'HVAC dispatch in high-volume weekends',
    industry: 'HVAC',
    problem:
      'Owner missed after-hours calls and handoff data never reached the CRM fast enough for jobs.',
    outcome:
      'Voice agent + webhook flow captured every lead with structured urgency tags and auto-routed follow-up.',
    metric: '20% increase in response speed over first 30 days.',
    testimonial:
      'We stopped leaving customers hanging after-hours and our team is finally seeing every real job lead in Slack immediately.',
    testimonialSource: 'Walt, Owner, Metro Climate Services',
  },
  {
    title: 'Landing page + SMS conversion path',
    industry: 'Plumbing',
    problem:
      'Form submissions arrived as raw leads without job context, forcing manual qualification.',
    outcome:
      'A structured capture pattern + web chat handoff reduced ambiguity and improved dispatcher confidence.',
    metric: '35% higher callback quality score in first month.',
    testimonial:
      'We used to spend 20+ minutes per lead cleaning up forms. Now each inquiry includes the exact issue, address, and urgency.',
    testimonialSource: 'Marta, Operations Lead, Northline Plumbing',
  },
  {
    title: 'gtm_ops runtime for proposal growth',
    industry: 'SaaS / Ops',
    problem:
      'Manual proposal drafting made quote cycles too slow when high-urgency opportunities arrived.',
    outcome:
      'Lead enrichment and templated proposal runbooks turned intake into a branded response.',
    metric: '24% reduction in proposal turnaround time.',
    testimonial:
      'The proposal pipeline now moves at the same pace as incoming demand, even when we are understaffed on Friday afternoons.',
    testimonialSource: 'Chris, Founder, Service Ops',
  },
];

export default function CaseStudiesPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Case Studies — Wranngle Systems';
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
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                Wranngle // RESULTS LOG
              </div>
              <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-4">
                Case studies
              </h1>
              <p className="max-w-2xl text-base md:text-lg opacity-75 leading-relaxed">
                A shortlist of implementation outcomes and operating patterns
                from production usage.
              </p>
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
            <div className="grid gap-6">
              {CASE_STUDIES.map((caseStudy) => (
                <article
                  key={caseStudy.title}
                  className={`relative rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] p-6 ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60">
                        {caseStudy.industry}
                      </div>
                      <h2 className="brand-font text-2xl mt-1">
                        {caseStudy.title}
                      </h2>
                    </div>
                    <div className="text-[var(--s500)]">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <p className="text-sm opacity-80 leading-relaxed mb-3">
                    <strong>Problem:</strong> {caseStudy.problem}
                  </p>
                  <p className="text-sm opacity-80 leading-relaxed mb-3">
                    <strong>Outcome:</strong> {caseStudy.outcome}
                  </p>
                  <blockquote className="my-4 rounded border-l-2 border-[var(--s500)] pl-4 py-1 text-sm opacity-80 italic">
                    “{caseStudy.testimonial}”
                  </blockquote>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--s500)]/40 bg-[var(--s500)]/10 text-sm`}
                  >
                    <Building2 size={14} aria-hidden /> {caseStudy.metric}
                  </div>
                  <div className="text-xs mt-3 opacity-65 uppercase tracking-wider">
                    {caseStudy.testimonialSource}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 pb-14">
            <div
              className={`p-6 md:p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--v500)] ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm md:text-base opacity-80 max-w-xl">
                  Want the same delivery pattern for your team? Start with one
                  small pilot and scale.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md shadow-lg hover:scale-[1.02] transition-all"
                >
                  Start with a pilot <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
