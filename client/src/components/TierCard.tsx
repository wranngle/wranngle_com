import React, {useState} from 'react';
import {ArrowRight, Check, FileText} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/ui/button.tsx';
import IntakeForm from '@/components/IntakeForm.tsx';
import AgentFactsPopout from '@/components/AgentFactsPopout.tsx';
import {getTierPricing, type OfferingItem} from '@/data/offerings.ts';

/**
 * TierCard — the single source-of-truth pricing/offering card. Every tier
 * on every surface (home offerings grid, /products/ai-voice-agents,
 * /products/websites, /products/gtm-ops) renders through this one
 * component so the 9 service tiers no longer drift across pages
 * (round-2 F006 + F011). Pricing display comes from `getTierPricing`;
 * feature lists use the "Everything in <lower>, plus:" framing via
 * `item.includesPrevious` so higher tiers never restate lower-tier features.
 */

const KICKER_BY_KIND: Record<string, string | undefined> = {
  'ai-agent': undefined,
  website: 'WEBSITE BUILD',
  saas: 'gtm_ops // SAAS',
};

function defaultCrossSell(targetId: string) {
  // Absolute home URL, not a bare hash mutation: the #offerings-<id> anchors
  // only exist on the home page, so setting the hash while on a product page
  // (websites / ai-voice-agents) would point at nothing.
  globalThis.location.href = `/#offerings-${targetId}`;
}

function tierButtonClass(item: OfferingItem, isDark: boolean) {
  if (item.badge) {
    return 'bg-[var(--v500)] hover:bg-[var(--v500)]/90 hover:scale-[1.02] transition-all';
  }

  return isDark
    ? 'bg-white/10 text-white hover:bg-white/20'
    : 'bg-black/10 text-black hover:bg-black/20';
}

function TierPriceBlock({item}: {item: OfferingItem}) {
  const pricing = getTierPricing(item);

  return (
    <div className="mb-6 min-h-[5.5rem]">
      <div className="text-4xl font-bold leading-none">
        {pricing.priceLabel}
        {!pricing.isFree && (
          <span className="text-sm font-normal opacity-50">
            {pricing.priceSuffix}
          </span>
        )}
      </div>
      {pricing.annualLine && (
        <div className="mt-2 text-sm opacity-70">{pricing.annualLine}</div>
      )}
      {pricing.addonLine && (
        <div className="mt-1 text-sm opacity-70">{pricing.addonLine}</div>
      )}
    </div>
  );
}

function TierFeatureList({item}: {item: OfferingItem}) {
  return (
    <div className="mb-8 flex-1">
      {item.includesPrevious && (
        <div className="mb-3 text-sm font-semibold">
          Everything in {item.includesPrevious}, plus:
        </div>
      )}
      <ul className="space-y-3">
        {item.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 text-sm opacity-80"
          >
            <Check
              size={16}
              className="text-[var(--s500)] shrink-0"
              aria-hidden
            />{' '}
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

type TierCardProps = {
  item: OfferingItem;
  isDark: boolean;
  /** Home grid anchors each card for /#offerings-<id> deep links. */
  anchored?: boolean;
  /** Override cross-sell navigation (gtm-ops keeps SaaS targets on-page). */
  onCrossSell?: (targetId: string) => void;
  /** CTA label override (home A/B "Start" variant). Defaults to item.cta. */
  ctaLabel?: string;
};

export default function TierCard({
  item,
  isDark,
  anchored = false,
  onCrossSell = defaultCrossSell,
  ctaLabel,
}: TierCardProps) {
  const [factsOpen, setFactsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const kicker = KICKER_BY_KIND[item.facts?.kind ?? 'ai-agent'];

  return (
    <div
      id={anchored ? `offerings-${item.id}` : undefined}
      className={`relative group h-full ${anchored ? 'scroll-mt-24' : ''}`}
    >
      <div
        className={`relative h-full p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${
          isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'
        } flex flex-col noise-overlay overflow-hidden`}
      >
        {item.badge && (
          <div className="absolute top-0 left-8 bg-[var(--v500)] text-[9px] font-bold px-4 py-1.5 rounded-b-lg uppercase tracking-wider shadow-md z-30 border-x border-b border-white/10">
            {item.badge}
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2 mt-6">
            <div>
              {kicker && (
                <div className="mono-font text-[10px] text-[var(--s500)] tracking-[0.08em] mb-1">
                  {kicker}
                </div>
              )}
              <h3 className="brand-font text-2xl font-bold">{item.name}</h3>
            </div>
          </div>
          <p className="text-sm opacity-60 mb-6">{item.description}</p>

          <div className="flex-1 flex flex-col">
            <TierPriceBlock item={item} />
            <TierFeatureList item={item} />
          </div>

          {item.facts && (
            <Dialog open={factsOpen} onOpenChange={setFactsOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-full mb-3 px-4 py-2 border border-current rounded-md text-xs font-bold uppercase tracking-wider opacity-80 hover:opacity-100 hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> View Spec Sheet
                </button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-fit outline-none [&>button]:bg-[#12111a] [&>button]:text-white [&>button]:opacity-100 [&>button]:shadow-lg">
                <DialogTitle className="sr-only">
                  {item.name} spec sheet
                </DialogTitle>
                <AgentFactsPopout
                  facts={item.facts}
                  itemName={item.name}
                  onGetStarted={() => {
                    // Close popout, then open intake one tick later — Radix
                    // focus-trap cleanup races if both fire in one commit.
                    setFactsOpen(false);
                    globalThis.setTimeout(() => {
                      setIntakeOpen(true);
                    }, 80);
                  }}
                  onCrossSell={(targetId) => {
                    setFactsOpen(false);
                    onCrossSell(targetId);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={intakeOpen} onOpenChange={setIntakeOpen}>
            <DialogTrigger asChild>
              <Button className={`w-full ${tierButtonClass(item, isDark)}`}>
                {ctaLabel ?? item.cta} <ArrowRight size={14} className="ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className={
                isDark
                  ? 'bg-[#12111a] text-[#fcfaf5] border-white/10'
                  : 'bg-white text-[#12111a] border-black/10'
              }
            >
              <IntakeForm
                selectedPackage={item.id}
                onSuccess={() => {
                  setIntakeOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
