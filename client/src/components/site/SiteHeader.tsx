// @ts-nocheck
import React, {useState} from 'react';
import {Link} from 'wouter';
import {motion, AnimatePresence} from 'framer-motion';
import {Menu, X, ArrowRight, Sparkles} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle.tsx';
import {OfferingsMegaMenu, AboutMegaMenu} from './MegaMenu.tsx';
import {Dialog, DialogContent} from '@/components/ui/dialog.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import type {OfferingItem} from '@/data/offerings.ts';
import {goTalkToSarah} from '@/lib/sarah.ts';

const LOGO_URL = 'https://i.ibb.co/WWFmbjKJ/wranngle-wordmark-4096w.png';

type SiteHeaderProps = {
  isDark: boolean;
  toggleTheme: () => void;
};

export default function SiteHeader({isDark, toggleTheme}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [factsItem, setFactsItem] = useState<OfferingItem | undefined>(
    undefined,
  );
  const [intakePackage, setIntakePackage] = useState<string | undefined>(
    undefined,
  );
  const [deployOpen, setDeployOpen] = useState(false);

  const handleSelectOffering = (item: OfferingItem) => {
    if (item.facts) {
      setFactsItem(item);
    } else {
      // Offerings without a facts spec sheet (e.g. websites) jump straight
      // to the intake form preselected.
      setIntakePackage(item.id);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md h-20 flex items-center px-6 ${
          isDark
            ? 'border-white/10 bg-[#12111a]/80'
            : 'border-black/10 bg-[#fcfaf5]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <Link href="/" className="inline-flex items-center">
            <img
              src={LOGO_URL}
              alt="Wranngle"
              className="h-14 w-auto"
              width="136"
              height="56"
              fetchPriority="high"
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
              <OfferingsMegaMenu
                isDark={isDark}
                onSelectOffering={handleSelectOffering}
              />
              <AboutMegaMenu isDark={isDark} onTalkToSarah={goTalkToSarah} />
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
                DEPLOY AGENT <ArrowRight size={12} />
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
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
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
                DEPLOY AGENT <ArrowRight size={18} />
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spec-sheet popout, opened via mega-menu Offerings click. */}
      <Dialog
        open={Boolean(factsItem)}
        onOpenChange={(open) => {
          if (!open) setFactsItem(undefined);
        }}
      >
        <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-fit outline-none">
          {factsItem?.facts && (
            <div className="space-y-3">
              <AgentFactsPopout
                facts={factsItem.facts}
                itemName={factsItem.name}
                onGetStarted={() => {
                  const {id} = factsItem;
                  setFactsItem(undefined);
                  // Defer to next tick — see App.tsx onGetStarted comment.
                  globalThis.setTimeout(() => {
                    setIntakePackage(id);
                  }, 80);
                }}
                onCrossSell={(targetId) => {
                  setFactsItem(undefined);
                  globalThis.location.hash = `offerings-${targetId}`;
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Intake form, opened from mega-menu (non-facts items) and the AgentFactsPopout CTA. */}
      <Dialog
        open={Boolean(intakePackage)}
        onOpenChange={(open) => {
          if (!open) setIntakePackage(undefined);
        }}
      >
        <DialogContent
          className={
            isDark
              ? 'bg-[#12111a] text-[#fcfaf5] border-white/10'
              : 'bg-white text-[#12111a] border-black/10'
          }
        >
          {intakePackage && (
            <IntakeForm
              selectedPackage={intakePackage}
              onSuccess={() => {
                /* dialog auto-closes when user closes the receipt */
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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
