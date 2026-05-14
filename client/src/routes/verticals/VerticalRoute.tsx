import React, {useEffect} from 'react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {
  VERTICALS,
  mountVerticalServiceJsonLd,
  type VerticalSlug,
} from '@/seo/jsonld.ts';

type Properties = {readonly slug: VerticalSlug};

export default function VerticalRoute({slug}: Properties) {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const v = VERTICALS[slug];

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = `${v.displayName} AI Voice Agents — Wranngle Systems`;
    const unmount = mountVerticalServiceJsonLd(slug);
    return unmount;
  }, [slug, v.displayName]);

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
              <div
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font"
                data-testid={`vertical-eyebrow-${slug}`}
              >
                {v.displayName.toUpperCase()} · AI VOICE AGENTS
              </div>
              <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                {v.displayName} AI voice agents that answer every call.
              </h1>
              <p className="text-xl md:text-2xl font-semibold leading-snug mb-3 max-w-3xl mx-auto">
                {v.description}
              </p>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
