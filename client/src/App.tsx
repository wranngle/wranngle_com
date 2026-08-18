import React from 'react';
import {OFFERING_CATEGORIES} from '@/data/offerings.ts';
import PolygonTileHero from '@/components/PolygonTileHero.tsx';
import TierCard from '@/components/TierCard.tsx';
import FAQ from '@/components/FAQ.tsx';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';
import {goTalkToSarah} from '@/lib/sarah.ts';

/**
 * The single landing page: one offer (a unified AI front end for sales and
 * customer service across web chat, voice, Slack, Teams, and Discord) sold
 * as three capability tiers. No hero art or simulated telemetry — visual
 * proof returns only when it can be honest.
 */

const CHANNELS = ['Web chat', 'Voice', 'Slack', 'Teams', 'Discord'];

const [UNIFIED] = OFFERING_CATEGORIES;

export default function App() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main className="flex-1">
          {/* HERO — stage-2 rewrite target */}
          <section className="mx-auto max-w-5xl px-6 pt-20 pb-14 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-60">
              unified ai front end · sales + customer service
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-balance">
              One AI front door for every customer conversation.
            </h1>
            <p
              className={`mx-auto mt-5 max-w-2xl text-lg ${isDark ? 'text-white/70' : 'text-black/70'}`}
            >
              Sales and customer service, answered and dispatched by one AI
              front end — wherever the customer shows up. Intake is the base.
              Internal AI is the upgrade. gtm_ops is the max.
            </p>
            <ul className="mt-8 flex flex-wrap justify-center gap-2 list-none p-0">
              {CHANNELS.map((channel) => (
                <li
                  key={channel}
                  className={`rounded-full border px-4 py-1.5 font-mono text-sm ${isDark ? 'border-white/20 text-white/80' : 'border-black/15 text-black/70'}`}
                >
                  {channel}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={goTalkToSarah}
                className={`rounded px-6 py-3 font-semibold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
              >
                Talk to Sarah
              </button>
              <a
                href="#offerings"
                className={`rounded border px-6 py-3 font-semibold ${isDark ? 'border-white/30' : 'border-black/25'}`}
              >
                See tiers
              </a>
            </div>
          </section>

          {/* Animated tile field — generated sample storefronts + recorded
              agent demos, labeled as such so the mosaic never reads as a
              client portfolio. */}
          <section aria-label="Illustrative demo tiles">
            <PolygonTileHero
              isDark={isDark}
              caption="Illustrative demo tiles"
              subcaption="Generated sample storefronts and recorded agent demos — not client sites."
            />
          </section>

          {/* TIERS — base intake / internal AI upgrade / gtm_ops max */}
          <section
            id="offerings"
            className="mx-auto max-w-6xl px-6 py-16 scroll-mt-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold">{UNIFIED.name}</h2>
            <p
              className={`mt-2 max-w-2xl ${isDark ? 'text-white/70' : 'text-black/70'}`}
            >
              {UNIFIED.description}
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3 items-stretch">
              {UNIFIED.items.map((item) => (
                <TierCard key={item.id} item={item} isDark={isDark} anchored />
              ))}
            </div>
          </section>

          {/* FAQ — survives tear-out; copy is sed-junked, stage-2 rewrites */}
          <section className="mx-auto max-w-4xl px-6 pb-20">
            <FAQ isDark={isDark} />
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
