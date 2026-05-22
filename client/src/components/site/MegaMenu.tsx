/* eslint-disable @typescript-eslint/no-deprecated -- lucide-react brand icons (Linkedin, Github) used intentionally for socials; deprecation is upstream-future. */
import React, {useState} from 'react';
import {Link} from 'wouter';
import {
  ArrowRight,
  ChevronDown,
  Linkedin,
  Github,
  Mail,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {OFFERING_CATEGORIES} from '@/data/offerings.ts';

type OfferingsMegaMenuProps = {
  isDark: boolean;
};

/**
 * OfferingsMegaMenu — 3 columns, one per OFFERING_CATEGORIES entry
 * (AI Agents, Websites, gtm_ops). Tiers stack vertically inside each
 * column. Category headers open the dedicated landing page; tier links jump
 * to the corresponding home-page tile group for quick comparison.
 */
export function OfferingsMegaMenu({isDark}: OfferingsMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const surfaceClasses = isDark
    ? 'bg-[#18181b] border-white/10 text-[#fcfaf5]'
    : 'bg-white border-black/10 text-[#12111a]';

  const dividerClass = isDark ? 'border-white/10' : 'border-black/10';

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s500)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm hover:text-[var(--s500)] transition-colors text-sm font-medium"
        >
          Offerings <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className={`w-[760px] p-0 border ${surfaceClasses} rounded-lg shadow-2xl`}
      >
        <div className="grid grid-cols-3 gap-0">
          {OFFERING_CATEGORIES.map((cat, catIndex) => {
            const isLast = catIndex === OFFERING_CATEGORIES.length - 1;
            const headerHref =
              cat.id === 'gtm_ops'
                ? '/products/gtm-ops'
                : cat.id === 'websites'
                  ? '/products/websites'
                  : '/products/ai-voice-agents';

            return (
              <div
                key={cat.id}
                className={`group/col p-4 transition-colors hover:bg-[var(--s500)]/5 ${
                  isLast ? '' : `border-r ${dividerClass}`
                }`}
              >
                <div className="flex items-baseline justify-between mb-1 gap-2">
                  <span
                    className={`text-[11px] font-bold text-[var(--s500)] group-hover/col:underline underline-offset-4 decoration-2 ${
                      cat.id === 'gtm_ops'
                        ? 'mono-font tracking-[0.08em]'
                        : 'uppercase tracking-[0.18em]'
                    }`}
                  >
                    {cat.name}
                  </span>
                  <Link
                    href={headerHref}
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="text-[9px] uppercase font-bold tracking-wider opacity-50 group-hover/col:opacity-100 group-hover/col:text-[var(--s500)] shrink-0 transition-opacity"
                  >
                    View page →
                  </Link>
                </div>
                <div className="text-[10px] opacity-50 mb-3 leading-snug">
                  {cat.description}
                </div>
                <div className="space-y-1">
                  {cat.items.map((item) => (
                    <a
                      key={item.id}
                      href={`/#offerings-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/15 transition-colors group/item flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--v500)] text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono opacity-60 mt-0.5">
                          {item.price === '0' ? 'Free' : `$${item.price}`}
                          {item.priceCadence === 'monthly' && item.price !== '0'
                            ? '/mo'
                            : item.price === '0'
                              ? ''
                              : ' one-time'}
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="opacity-40 group-hover/item:opacity-100 group-hover/item:text-[var(--s500)] group-hover/item:translate-x-0.5 transition-all mt-1 shrink-0"
                      />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type AboutMegaMenuProps = {
  isDark: boolean;
  onTalkToSarah: () => void;
};

/**
 * AboutMegaMenu — secondary nav surface for everything that isn't an
 * offering: about page, talk-to-sarah, legal, socials.
 */
export function AboutMegaMenu({isDark, onTalkToSarah}: AboutMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const surfaceClasses = isDark
    ? 'bg-[#18181b] border-white/10 text-[#fcfaf5]'
    : 'bg-white border-black/10 text-[#12111a]';

  const dividerClass = isDark ? 'border-white/10' : 'border-black/10';

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s500)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm hover:text-[var(--s500)] transition-colors text-sm font-medium"
        >
          About <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        // Bubbling close: any click on an <a> or <button> inside the menu
        // dismisses the dropdown. Radix's auto-close only fires for
        // DropdownMenuItem; we use raw Links so we close manually.
        // Skip target="_blank" anchors — the synchronous re-render races
        // with the browser's new-tab dispatch and the click vanishes
        // (only right-click "Open in new tab" worked).
        onClick={(e) => {
          const target = e.target as HTMLElement | undefined;
          const interactive = target?.closest('a, button');
          if (!interactive) return;
          const anchor = target?.closest('a');
          if (anchor?.target === '_blank') return;
          setOpen(false);
        }}
        className={`w-[480px] p-0 border ${surfaceClasses} rounded-lg shadow-2xl`}
      >
        <div className="grid grid-cols-2 gap-0">
          <div className={`p-5 border-r ${dividerClass}`}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Company
            </div>
            <div className="space-y-1 mb-5">
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                About Wranngle
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onTalkToSarah();
                }}
                className="flex w-full items-center gap-2 text-left px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-medium opacity-80 hover:opacity-100"
              >
                <Sparkles
                  size={14}
                  className="text-[var(--s500)] sarah-glimmer"
                />
                Talk to Sarah
              </button>
              <Link
                href="/products/ai-voice-agents"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                AI Voice Agents
              </Link>
              <Link
                href="/products/websites"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold"
              >
                Websites
              </Link>
              <Link
                href="/products/gtm-ops"
                className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold mono-font"
              >
                gtm_ops
              </Link>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Legal
            </div>
            <div className="space-y-1">
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
          </div>

          <div className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Contact
            </div>
            <a
              href="mailto:hello@wranngle.com"
              className="block px-3 py-2 rounded-md border-l-2 border-transparent hover:border-[var(--s500)] hover:bg-[var(--s500)]/10 transition-colors text-sm font-semibold mb-5"
            >
              hello@wranngle.com
              <div className="text-[10px] opacity-60 font-normal mt-0.5">
                Quotes, demos, and workspace setup
              </div>
            </a>

            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">
              Connect
            </div>
            <div className="flex items-center gap-3 px-3">
              <a
                href="https://www.linkedin.com/in/codyarnold96"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Linkedin size={18} aria-hidden />
              </a>
              <a
                href="https://github.com/wranngle"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Github size={18} aria-hidden />
              </a>
              <a
                href="mailto:hello@wranngle.com"
                aria-label="Email"
                className="hover:text-[var(--s500)] transition-colors"
              >
                <Mail size={18} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Backwards-compat default export — older imports of `MegaMenu` resolve
// to OfferingsMegaMenu so existing pages don't break.
export default OfferingsMegaMenu;
