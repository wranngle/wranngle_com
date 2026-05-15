import React, {useEffect} from 'react';
import {Link} from 'wouter';
import {ArrowRight, Check} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {type Vertical} from '@/data/verticals.ts';

type Properties = {
  vertical: Vertical;
};

/**
 * Idempotently update <meta> tags for the active vertical so that
 * og:image, og:title, twitter:image, and the document title reflect
 * the page a visitor or scraper actually landed on. Router.tsx's
 * RouteHeadSync owns canonical/og:url; this hook owns the per-vertical
 * image + headline copy so social cards do not unfurl with the home
 * page's hero.
 */
function useVerticalHead(vertical: Vertical): void {
  useEffect(() => {
    const title = `${vertical.displayName} — ${vertical.headline}`;
    document.title = title;
    setMeta('property', 'og:title', title);
    setMeta('property', 'twitter:title', title);
    setMeta('property', 'og:image', vertical.ogImage);
    setMeta('property', 'twitter:image', vertical.ogImage);
    setMeta('name', 'description', vertical.subhead);
    setMeta('property', 'og:description', vertical.subhead);
    setMeta('property', 'twitter:description', vertical.subhead);
  }, [vertical]);
}

function setMeta(attr: 'name' | 'property', key: string, value: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    // eslint-disable-next-line unicorn/prefer-dom-node-append -- types/lib mismatch on jsdom-style Element.append
    document.head.appendChild(element);
  }

  element.content = value;
}

export default function VerticalLanding({vertical}: Properties) {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  useVerticalHead(vertical);

  useEffect(() => {
    globalThis.scrollTo(0, 0);
  }, [vertical.slug]);

  return (
    <div
      data-testid="vertical-landing"
      data-vertical-slug={vertical.slug}
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a] text-[#fcfaf5]' : 'bg-[#fcfaf5] text-[#12111a]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark' : 'bg-page-light'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />
        <main id="main" className="flex-1 py-16 px-6">
          <style>{`
            .brand-font { font-family: 'Bricolage Grotesque', sans-serif; }
          `}</style>

          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--s500)] hover:underline mb-8"
            >
              ← Back to Home
            </Link>

            <p className="text-sm uppercase tracking-widest opacity-60 mb-4">
              For {vertical.displayName.toLowerCase()}
            </p>
            <h1
              data-testid="vertical-headline"
              className="brand-font text-4xl md:text-5xl font-bold mb-6 leading-tight"
            >
              {vertical.headline}
            </h1>
            <p
              data-testid="vertical-subhead"
              className="text-lg md:text-xl opacity-80 mb-10 leading-relaxed"
            >
              {vertical.subhead}
            </p>

            <ul data-testid="vertical-proof-points" className="space-y-4 mb-12">
              {vertical.proofPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-1 flex-shrink-0 h-5 w-5 text-[var(--s500)]"
                  />
                  <span className="text-base opacity-90">{point}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/#offerings"
              data-testid="vertical-cta"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--s500)] px-6 py-3 text-base font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {vertical.ctaLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
