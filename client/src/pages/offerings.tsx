// @ts-nocheck
import React, {useState, useEffect} from 'react';
import {Link} from 'wouter';
import {motion} from 'framer-motion';
import {Check, ArrowRight, Moon, Sun} from 'lucide-react';
import {Dialog, DialogContent, DialogTrigger} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import {OFFERING_CATEGORIES, type OfferingItem} from '@/data/offerings.ts';

const LOGO_URL = 'https://i.ibb.co/WWFmbjKJ/wranngle-wordmark-4096w.png';

export default function Offerings() {
  const [isDark, setIsDark] = useState(true);
  const [activeCategory, setActiveCategory] = useState(
    OFFERING_CATEGORIES[0].id,
  );

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Offerings | Wranngle Systems';
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md h-20 flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <Link href="/">
              <a>
                <img
                  src={LOGO_URL}
                  alt="Wranngle"
                  className="h-14 w-auto"
                  width="136"
                  height="56"
                />
              </a>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <a className="text-sm font-medium hover:text-[var(--s500)] transition-colors">
                  Home
                </a>
              </Link>
              <button
                onClick={() => {
                  setIsDark(!isDark);
                }}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-20">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="text-center mb-16"
          >
            <h1 className="brand-font text-5xl md:text-6xl font-bold mb-4">
              Our Offerings
            </h1>
            <p className="text-lg opacity-60 max-w-xl mx-auto">
              Everything you need to automate, convert, and grow.
            </p>
          </motion.div>

          <div className="flex justify-center gap-2 mb-16">
            {OFFERING_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                }}
                className={`px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--s500)] text-white'
                    : isDark
                      ? 'bg-white/5 hover:bg-white/10'
                      : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {OFFERING_CATEGORIES.filter((c) => c.id === activeCategory).map(
            (category) => (
              <motion.div
                key={category.id}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.3}}
              >
                <p className="text-center opacity-60 mb-12 text-sm">
                  {category.description}
                </p>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {category.items.map((item) => (
                    <OfferingCard key={item.id} item={item} isDark={isDark} />
                  ))}
                </div>
              </motion.div>
            ),
          )}
        </main>

        <footer className="py-12 border-t border-white/10 px-6 text-xs mono-font">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="opacity-50">© 2026 Wranngle Systems LLC</div>
            <div className="flex gap-6 opacity-70">
              <Link href="/terms">
                <a className="hover:text-[var(--s500)] hover:underline transition-colors">
                  Terms of Service
                </a>
              </Link>
              <Link href="/privacy">
                <a className="hover:text-[var(--s500)] hover:underline transition-colors">
                  Privacy Policy
                </a>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function OfferingCard({item, isDark}: {item: OfferingItem; isDark: boolean}) {
  return (
    <div className="relative group h-full">
      <div
        className={`relative h-full p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'} flex flex-col noise-overlay overflow-hidden`}
      >
        {item.badge && (
          <div className="absolute top-0 left-8 bg-[var(--v500)] text-[9px] font-bold px-4 py-1.5 rounded-b-lg uppercase tracking-wider shadow-md z-30 border-x border-b border-white/10">
            {item.badge}
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2 mt-6">
            <h3 className="brand-font text-2xl font-bold">{item.name}</h3>
          </div>
          <p className="text-sm opacity-60 mb-6">{item.description}</p>

          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <div className="text-4xl font-bold">
                ${item.price}
                {item.facts ? (
                  <span className="text-sm font-normal opacity-50">/mo</span>
                ) : (
                  <span className="text-sm font-normal opacity-50">
                    {' '}
                    one-time
                  </span>
                )}
              </div>
              {item.monthlyAddon && (
                <div className="text-sm opacity-60 mt-1">
                  + ${item.monthlyAddon.price}/mo {item.monthlyAddon.label}
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {item.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm opacity-80"
                >
                  <Check size={16} className="text-[var(--s500)] shrink-0" />{' '}
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className={`w-full ${item.badge ? 'bg-[var(--v500)] hover:bg-[var(--v500)]/90 hover:scale-[1.02] transition-all' : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
              >
                {item.cta} <ArrowRight size={14} className="ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className={
                isDark
                  ? 'bg-[#12111a] text-white border-white/10'
                  : 'bg-white text-black border-black/10'
              }
            >
              <IntakeForm selectedPackage={item.id} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
