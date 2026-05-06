// @ts-nocheck
import React, {useState} from 'react';
import {Link} from 'wouter';
import {motion, AnimatePresence} from 'framer-motion';
import {Menu, X, ArrowRight, Sparkles} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle.tsx';
import {OfferingsMegaMenu, AboutMegaMenu} from './MegaMenu.tsx';
import {Dialog, DialogContent} from '@/components/ui/dialog.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import {goTalkToSarah} from '@/lib/sarah.ts';

const LOGO_URL = '/wordmark.png';
type HomeAbVariant = 'control' | 'value-first';

type SiteHeaderProps = {
  isDark: boolean;
  toggleTheme: () => void;
  homeAbVariant?: HomeAbVariant;
};

export default function SiteHeader({
  isDark,
  toggleTheme,
  homeAbVariant = 'control',
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const deployCta =
    homeAbVariant === 'value-first' ? 'Build my stack' : 'Get my agent';

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[110] focus:px-4 focus:py-2 focus:rounded-md focus:bg-[var(--s500)] focus:text-white focus:font-bold focus:text-xs focus:uppercase focus:tracking-wider"
      >
        Skip to content
      </a>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md h-20 flex items-center px-6 ${
          isDark
            ? 'border-white/10 bg-[#12111a]/80'
            : 'border-black/10 bg-[#fcfaf5]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link
            href="/"
            aria-label="Wranngle home"
            className="inline-flex items-center"
          >
            <img
              src={LOGO_URL}
              alt=""
              className="h-14 w-auto"
              width="600"
              height="327"
              fetchpriority="high"
            />
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 items-center">
              <Link
                href="/"
                className="text-sm font-medium hover:text-[var(--s500)] transition-colors"
              >
                Home
              </Link>
              <OfferingsMegaMenu isDark={isDark} />
              <AboutMegaMenu isDark={isDark} onTalkToSarah={goTalkToSarah} />
              <Link
                href="/blog"
                className="text-sm font-medium hover:text-[var(--s500)] transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/case-studies"
                className="text-sm font-medium hover:text-[var(--s500)] transition-colors"
              >
                Case Studies
              </Link>
              <DarkModeToggle isDark={isDark} toggle={toggleTheme} />
            </nav>

            <div className="hidden md:block">
              <button
                type="button"
                onClick={goTalkToSarah}
                className="px-4 py-2.5 border border-current rounded-md text-[10px] font-bold uppercase tracking-wider hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all flex items-center gap-2"
              >
                <Sparkles
                  size={12}
                  className="text-[var(--s500)] sarah-glimmer"
                />
                Talk to Sarah
              </button>
            </div>

            <div className="hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setDeployOpen(true);
                }}
                className="px-5 py-2.5 bg-[var(--s500)] text-white font-bold uppercase text-[10px] rounded-md shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                {deployCta} <ArrowRight size={12} />
              </button>
            </div>

            <button
              type="button"
              className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => {
                setMobileOpen((previous) => !previous);
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className={`fixed inset-0 z-40 md:hidden pt-28 px-6 overflow-y-auto ${
              isDark
                ? 'bg-[#12111a] text-[#fcfaf5]'
                : 'bg-[#fcfaf5] text-[#12111a]'
            }`}
          >
            <nav className="flex flex-col gap-6 text-2xl font-bold brand-font">
              <Link
                href="/"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                About
              </Link>
              <a
                href="/#offerings"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                Offerings
              </a>
              <Link
                href="/products/ai-voice-agents"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                AI Voice Agents
              </Link>
              <Link
                href="/products/websites"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                Websites
              </Link>
              <Link
                href="/products/gtm-ops"
                onClick={() => {
                  setMobileOpen(false);
                }}
                className="mono-font"
              >
                gtm_ops
              </Link>
              <Link
                href="/case-studies"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                Case Studies
              </Link>
              <Link
                href="/blog"
                onClick={() => {
                  setMobileOpen(false);
                }}
              >
                Blog
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  goTalkToSarah();
                }}
                className="text-left flex items-center gap-2"
              >
                <Sparkles
                  size={18}
                  className="text-[var(--s500)] sarah-glimmer"
                />
                Talk to Sarah
              </button>
              <Link
                href="/privacy"
                onClick={() => {
                  setMobileOpen(false);
                }}
                className="text-base font-medium opacity-70"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                onClick={() => {
                  setMobileOpen(false);
                }}
                className="text-base font-medium opacity-70"
              >
                Terms of Service
              </Link>
              <div
                className={`flex items-center justify-between py-6 border-y ${
                  isDark ? 'border-white/10' : 'border-black/10'
                }`}
              >
                <span className="text-sm font-medium opacity-60 uppercase tracking-widest">
                  Toggle Appearance
                </span>
                <DarkModeToggle isDark={isDark} toggle={toggleTheme} />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setDeployOpen(true);
                }}
                className="w-full py-6 bg-[var(--s500)] text-white font-bold uppercase text-sm rounded-xl shadow-xl flex items-center justify-center gap-3"
              >
                {deployCta} <ArrowRight size={18} />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deploy Agent CTA in header — opens IntakeForm preselected to premium. */}
      <Dialog open={deployOpen} onOpenChange={setDeployOpen}>
        <DialogContent
          className={
            isDark
              ? 'bg-[#12111a] text-[#fcfaf5] border-white/10'
              : 'bg-white text-[#12111a] border-black/10'
          }
        >
          <IntakeForm selectedPackage="premium" />
        </DialogContent>
      </Dialog>
    </>
  );
}
