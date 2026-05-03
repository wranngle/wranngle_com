/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
// @ts-nocheck
import React from 'react';
import {Link} from 'wouter';
import {ArrowRight, ChevronDown, Linkedin, Github, Mail} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {OFFERING_CATEGORIES, type OfferingItem} from '@/data/offerings.ts';

type MegaMenuProps = {
  isDark: boolean;
  onSelectOffering: (item: OfferingItem) => void;
  onTalkToSarah: () => void;
};

/**
 * MegaMenu — full-site nav.
 *
 * Three columns:
 *   1. Site         (Home / About / Talk to Sarah)
 *   2. Offerings    (each item -> opens AgentFactsPopout dialog directly)
 *   3. Legal & Socials (Privacy / Terms / LinkedIn / GitHub / Email)
 *
 * Per operator directive: clicking an Offerings entry should open the
 * spec-sheet popout, NOT navigate to /offerings.
 */
export default function MegaMenu({
  isDark,
  onSelectOffering,
  onTalkToSarah,
}: MegaMenuProps) {
  const surfaceClasses = isDark
    ? 'bg-[#18181b] border-white/10 text-[#fcfaf5]'
    : 'bg-white border-black/10 text-[#12111a]';

  const dividerClass = isDark ? 'border-white/10' : 'border-black/10';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 outline-none focus:outline-none hover:text-[var(--s500)] transition-colors text-sm font-medium"
        >
          Menu <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className={`w-[760px] p-0 border ${surfaceClasses} rounded-lg shadow-2xl`}
      >
        <div className="grid grid-cols-3 gap-0">
          {/* Column 1: Site */}
          <div className={`p-5 border-r ${dividerClass}`}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Site
            </div>
            <div className="space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                About
              </Link>
              <button
                type="button"
                onClick={onTalkToSarah}
                className="block w-full text-left px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                Talk to Sarah
              </button>
            </div>
          </div>

          {/* Column 2: Offerings (opens popout directly) */}
          <div className={`p-5 border-r ${dividerClass}`}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Offerings
            </div>
            <div className="space-y-1">
              {OFFERING_CATEGORIES.flatMap((cat) => cat.items).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectOffering(item);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{item.name}</span>
                      {item.badge && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--v500)] text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-60 mt-0.5 leading-snug">
                      {item.description}
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="opacity-40 group-hover:opacity-100 group-hover:text-[var(--s500)] group-hover:translate-x-0.5 transition-all mt-1 shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Legal + Socials */}
          <div className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Legal
            </div>
            <div className="space-y-1 mb-5">
              <Link
                href="/privacy"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                Terms of Service
              </Link>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Connect
            </div>
            <div className="flex items-center gap-3 px-3">
              <a
                href="https://linkedin.com/in/codyarnold96"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com/Wranngle"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:cody@wranngle.com"
                aria-label="Email"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
