/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
import React from 'react';
import {Link} from 'wouter';
import {Linkedin, Github, Mail, ArrowRight} from 'lucide-react';
import {OFFERING_CATEGORIES} from '@/data/offerings.ts';

type SiteFooterProps = {
  isDark: boolean;
  showCta?: boolean;
};

/**
 * SiteFooter — 4-column expanded nav (desktop) / stacked (mobile).
 *
 * Site / Offerings / Legal / Connect.
 * Offering links anchor to /#offerings-<id> on the home page.
 */
export default function SiteFooter({isDark, showCta = true}: SiteFooterProps) {
  const borderClass = isDark ? 'border-white/10' : 'border-black/10';
  const linkBase =
    'hover:text-[var(--s500)] transition-colors block text-sm py-1';
  const colHeading =
    'text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4';

  const offeringItems = OFFERING_CATEGORIES.flatMap((cat) => cat.items);

  return (
    <footer className={`mt-auto border-t ${borderClass} pt-12 pb-8 px-6`}>
      <div className="max-w-7xl mx-auto">
        {showCta && (
          <div
            className={`mb-12 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${
              isDark
                ? 'border-white/10 bg-[#18181b]'
                : 'border-black/5 bg-[#12111a] text-[#fcfaf5]'
            }`}
          >
            <div>
              <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-3">
                READY WHEN YOU ARE
              </div>
              <h2 className="brand-font text-3xl md:text-4xl font-bold leading-tight">
                Stop letting good calls go to voicemail.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/#talk-to-sarah"
                className="inline-flex items-center gap-2 px-5 py-3 border border-current/25 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-[var(--s500)] hover:text-[var(--s500)] transition-colors"
              >
                Talk to Sarah
              </a>
              <a
                href="/#offerings"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--s500)] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[var(--s500)]/90 transition-colors"
              >
                See Plans <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Site — logo bottom-aligned below the link list */}
          <div className="flex flex-col h-full">
            <div className={colHeading}>Site</div>
            <Link href="/" className={linkBase}>
              Home
            </Link>
            <Link href="/about" className={linkBase}>
              About
            </Link>
            <a href="/#talk-to-sarah" className={linkBase}>
              Talk to Sarah
            </a>
            <Link href="/products/ai-voice-agents" className={linkBase}>
              AI Voice Agents
            </Link>
            <Link href="/products/websites" className={linkBase}>
              Websites
            </Link>
            <Link href="/products/gtm-ops" className={linkBase}>
              gtm_ops
            </Link>
            {/* Wrap so flex doesn't stretch the bare <img>; mt-auto pushes
                this block to the column bottom; the image keeps its natural
                aspect ratio inside max-w-[136px]. */}
            <div className="mt-auto pt-6 self-start">
              <img
                src="/wordmark.png"
                alt=""
                aria-hidden
                loading="lazy"
                className="block h-10 w-auto max-w-[136px]"
                width="600"
                height="327"
              />
            </div>
          </div>

          {/* Offerings */}
          <div>
            <div className={colHeading}>Offerings</div>
            <Link href="/products/ai-voice-agents" className={linkBase}>
              AI Voice Agents
            </Link>
            <Link href="/products/websites" className={linkBase}>
              Websites
            </Link>
            <Link href="/products/gtm-ops" className={`${linkBase} mono-font`}>
              gtm_ops
            </Link>
            {offeringItems.map((item) => (
              <a
                key={item.id}
                href={`/#offerings-${item.id}`}
                className={
                  item.facts?.kind === 'saas'
                    ? `${linkBase} mono-font`
                    : linkBase
                }
              >
                {item.facts?.kind === 'saas'
                  ? `gtm_ops ${item.name}`
                  : item.name}
              </a>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div className={colHeading}>Legal</div>
            <Link href="/privacy" className={linkBase}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={linkBase}>
              Terms of Service
            </Link>
          </div>

          {/* Resources */}
          <div>
            <div className={colHeading}>Resources</div>
            <a href="/llms.txt" className={linkBase}>
              LLM Context
            </a>
            <a href="/profile.md" className={linkBase}>
              Profile.md
            </a>
          </div>

          {/* Connect */}
          <div>
            <div className={colHeading}>Connect</div>
            <div className="flex items-center gap-5 mt-2">
              <a
                href="https://www.linkedin.com/in/codyarnold96"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Linkedin size={20} aria-hidden />
              </a>
              <a
                href="https://github.com/wranngle"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Github size={20} aria-hidden />
              </a>
              <a
                href="mailto:cody@wranngle.com"
                aria-label="Email"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Mail size={20} aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div
          className={`pt-6 border-t ${borderClass} flex flex-col md:flex-row justify-between items-center gap-4 text-xs mono-font opacity-60`}
        >
          <div>© 2026 Wranngle Systems LLC</div>
          <div>AI voice agents and lead automation for busy teams</div>
        </div>
      </div>
    </footer>
  );
}
