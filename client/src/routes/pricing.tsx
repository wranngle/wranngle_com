import React, {useEffect} from 'react';
import {Check, ArrowRight} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {plans, type PlanCard} from '@/data/plans.ts';

export default function PricingPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Pricing — Wranngle Systems';
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
            <div className="max-w-7xl mx-auto w-full px-6 pt-14 pb-10 md:pt-20 md:pb-14 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                PRICING
              </div>
              <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                Pick a plan that fits the call volume.
              </h1>
              <p className="text-xl md:text-2xl font-semibold leading-snug mb-3 max-w-3xl mx-auto">
                The same Core and Elite Agent packages shown on the home page,
                plus custom programs for multi-location teams.
              </p>
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 py-14 md:py-20">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCardComponent
                  key={plan.slug}
                  plan={plan}
                  isDark={isDark}
                />
              ))}
            </div>

            <p className="mt-12 text-center text-sm opacity-70 max-w-2xl mx-auto">
              Core and Elite are monthly AI agent subscriptions. Websites and
              gtm_ops stay priced separately in Offerings so each product keeps
              a clean scope.
            </p>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}

function PlanCardComponent({
  plan,
  isDark,
}: {
  readonly plan: PlanCard;
  readonly isDark: boolean;
}) {
  const isHighlight = Boolean(plan.highlight);
  const borderClass = isHighlight
    ? 'border-[var(--s500)] ring-2 ring-[var(--s500)]/30'
    : isDark
      ? 'border-white/10'
      : 'border-black/10';
  const surfaceClass = isHighlight
    ? isDark
      ? 'bg-white/[0.04]'
      : 'bg-white'
    : isDark
      ? 'bg-[#18181b]/70'
      : 'bg-white/70';
  const ctaClass = isHighlight
    ? 'bg-[var(--s500)] text-white hover:scale-[1.02]'
    : 'border border-current/25 hover:border-[var(--s500)] hover:text-[var(--s500)]';

  return (
    <article
      data-testid={`plan-card-${plan.slug}`}
      className={`relative rounded-lg border p-6 md:p-7 flex flex-col ${borderClass} ${surfaceClass}`}
    >
      {isHighlight ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--s500)] text-white text-[10px] font-bold uppercase tracking-widest mono-font">
          Most popular
        </div>
      ) : null}

      <h2 className="brand-font text-2xl font-bold mb-2">{plan.name}</h2>

      <div className="flex items-baseline gap-1 mb-5">
        <span
          data-testid={`plan-card-${plan.slug}-price`}
          className="brand-font text-4xl md:text-5xl font-bold leading-none"
        >
          {plan.price}
        </span>
        {plan.period ? (
          <span className="text-sm opacity-60">{plan.period}</span>
        ) : null}
      </div>

      <ul className="flex-1 space-y-2.5 mb-7">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check
              size={16}
              className="mt-0.5 text-[var(--s500)] shrink-0"
              aria-hidden
            />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={plan.ctaHref}
        data-testid={`plan-card-${plan.slug}-cta`}
        className={`h-11 px-4 font-bold uppercase text-xs rounded-md inline-flex items-center justify-center gap-2 transition-all ${ctaClass}`}
      >
        {plan.ctaLabel} <ArrowRight size={15} aria-hidden />
      </a>
    </article>
  );
}
