/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
// @ts-nocheck
import React from 'react';
import {Link} from 'wouter';
import {Linkedin, Github, Mail, Globe} from 'lucide-react';
import {OFFERING_CATEGORIES} from '@/data/offerings.ts';

type SiteFooterProps = {
  isDark: boolean;
};

/**
 * SiteFooter — 4-column expanded nav (desktop) / stacked (mobile).
 *
 * Site / Offerings / Legal / Connect.
 * Offering links anchor to /#offerings-<id> on the home page.
 */
export default function SiteFooter({isDark}: SiteFooterProps) {
  const borderClass = isDark ? 'border-white/10' : 'border-black/10';
  const linkBase =
    'hover:text-[var(--s500)] transition-colors block text-sm py-1';
  const colHeading =
    'text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4';

  const offeringItems = OFFERING_CATEGORIES.flatMap((cat) => cat.items);

  return (
    <footer className={`mt-auto border-t ${borderClass} pt-12 pb-8 px-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Site */}
          <div>
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
          </div>

          {/* Offerings */}
          <div>
            <div className={colHeading}>Offerings</div>
            {offeringItems.map((item) => (
              <a
                key={item.id}
                href={`/#offerings-${item.id}`}
                className={linkBase}
              >
                {item.name}
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

          {/* Connect */}
          <div>
            <div className={colHeading}>Connect</div>
            <div className="flex items-center gap-5 mt-2">
              <a
                href="https://linkedin.com/in/codyarnold96"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://github.com/Wranngle"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:codymann88@gmail.com"
                aria-label="Email"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Mail size={20} />
              </a>
              <a
                href="https://wranngle.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Wranngle"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>

        <div
          className={`pt-6 border-t ${borderClass} flex flex-col md:flex-row justify-between items-center gap-4 text-xs mono-font opacity-60`}
        >
          <div>© 2026 Wranngle Systems LLC</div>
          <div>Voice-AI-led GTM motion runtime · ElevenLabs Startup Grant</div>
        </div>
      </div>
    </footer>
  );
}
