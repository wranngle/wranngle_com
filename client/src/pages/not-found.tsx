// @ts-nocheck
import React, {useEffect} from 'react';
import {Link} from 'wouter';
import {AlertCircle, ArrowRight} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

export default function NotFound() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = '404 Not Found — Wranngle';

    // Client-side unknown routes can still land here after SPA navigation.
    // Direct unknown requests are handled by client/public/404.html, but keep
    // this route noindexed for in-app misses.
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    // eslint-disable-next-line unicorn/prefer-dom-node-append
    document.head.appendChild(robots);
    return () => {
      robots.remove();
    };
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a] text-[#fcfaf5]' : 'bg-[#fcfaf5] text-[#12111a]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark' : 'bg-page-light'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main
          id="main"
          className="flex-1 flex items-center justify-center px-6 py-20"
        >
          <div
            className={`relative max-w-lg w-full p-10 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${
              isDark
                ? 'border-white/10 bg-[#18181b]'
                : 'border-black/5 bg-white'
            } noise-overlay overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-[var(--s500)]" size={28} />
                <h1 className="brand-font text-3xl font-bold">
                  404 — Not Found
                </h1>
              </div>
              <p className="opacity-70 text-base leading-relaxed mb-6">
                The page you were looking for doesn't exist on this site. Maybe
                it moved, or maybe the link was wrong.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-md hover:scale-105 transition-all"
              >
                Back to Home <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
