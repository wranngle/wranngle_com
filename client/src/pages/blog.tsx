import React, {useEffect} from 'react';
import {BookOpen, ArrowRight, CalendarClock} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

type Post = {
  title: string;
  date: string;
  topic: string;
  excerpt: string;
  readMinutes: number;
};

const POSTS: Post[] = [
  {
    title: 'How AI voice agents cut missed calls for service businesses',
    date: 'May 01, 2026',
    topic: 'Voice Ops',
    excerpt:
      'A practical playbook for putting AI handling in front of voicemail, and where it should never replace humans.',
    readMinutes: 7,
  },
  {
    title: 'Lead routing architecture for SMB owners and operators',
    date: 'Mar 16, 2026',
    topic: 'Automation',
    excerpt:
      'A practical stack for capturing every lead event and moving it into one reliable runbook.',
    readMinutes: 9,
  },
  {
    title: 'The anatomy of a usable webhook contract',
    date: 'Jan 29, 2026',
    topic: 'Engineering',
    excerpt:
      'Why small, opinionated event payloads make n8n, Stripe, and CRM flows easier to debug under pressure.',
    readMinutes: 6,
  },
];

export default function BlogPage() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Wranngle Blog — Product Automation Notes';
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3 mono-font">
                    Wranngle // CONTENT LOG
                  </div>
                  <h1 className="brand-font text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] mb-5">
                    Blog
                  </h1>
                  <p className="text-base md:text-lg opacity-75 leading-relaxed">
                    Field notes on AI voice ops, lead intake design, and
                    practical automation for contractors, trades, and agencies.
                  </p>
                </div>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all"
                >
                  <ArrowRight size={14} aria-hidden /> All products
                </a>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 py-12 md:py-16">
            <div className="grid gap-5 md:gap-6">
              {POSTS.map((post) => (
                <article
                  key={post.title}
                  className={`rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] p-6 ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'}`}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-70 mb-2">
                    <span className="inline-flex items-center gap-2">
                      <BookOpen size={12} /> {post.topic}
                    </span>
                  </div>
                  <h2 className="brand-font text-2xl font-bold mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm opacity-80 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-xs uppercase tracking-wider opacity-60 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={12} /> {post.date}
                    </span>
                    <span>•</span>
                    <span>{post.readMinutes} min read</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 pb-16">
            <div
              className={`p-6 md:p-8 border-y border-r border-l-4 border-l-[var(--v500)] rounded-[24px_4px_24px_4px] ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'}`}
            >
              <h2 className="brand-font text-2xl md:text-3xl mb-3">
                More to publish
              </h2>
              <p className="text-sm opacity-75 leading-relaxed">
                This section will expand as we publish rollout playbooks,
                architecture notes, and operator retrospectives. If you want a
                topic covered, leave a request in the lead form and we will
                build it next.
              </p>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
