import React from 'react';
import {ArrowRight} from 'lucide-react';
import type {OfferingFacts} from '@/data/offerings.ts';

type AgentFactsPopoutProps = {
  facts: OfferingFacts;
  itemName?: string;
  /**
   * If provided, renders a primary "Get Started — <tier>" CTA below the
   * spec sheet. The parent is responsible for closing the popout and
   * opening the intake form preselected to the relevant tier.
   */
  onGetStarted?: () => void;
  /**
   * If provided, renders a secondary "cross-sell" CTA. Parent decides what
   * happens — typically: close this popout, open the cross-sell offering's
   * intake form (or its own popout).
   */
  onCrossSell?: (offeringId: string) => void;
};

/**
 * AgentFactsPopout — FDA-nutrition-label-style spec sheet.
 *
 * Renders two faces depending on `facts.kind`:
 *   - 'ai-agent': voice / SMS / minutes labels, monthly + annual-discount
 *     pricing, per-location addon.
 *   - 'website':  delivery / pages / performance labels, project price +
 *     optional maintenance, no annual discount UI.
 *
 * Brand tokens: sunset accent on price, violet on premium tier, JetBrains
 * Mono on numerics, console-aesthetic uppercase labels.
 */
export default function AgentFactsPopout({
  facts,
  itemName,
  onGetStarted,
  onCrossSell,
}: AgentFactsPopoutProps) {
  const {
    kind,
    tierName,
    discountPercent,
    headlinePrice,
    annualMonthly,
    addon,
    specs,
    limits,
    delivery,
    features,
    crossSell,
  } = facts;
  const isWebsite = kind === 'website';
  const isPremiumTier = /elite|premium|pro|business/i.test(tierName);
  const showAnnualDiscount = !isWebsite && discountPercent > 0;
  const headerTitle = isWebsite ? 'Website Spec Sheet' : 'AI Agent Facts';
  const priceCadenceLabel = isWebsite ? 'Project' : 'Monthly';
  const priceCadenceSub = isWebsite ? 'One-time delivery' : 'No commitment';

  return (
    <div className="bg-white border-2 border-black p-4 w-full max-w-[380px] font-sans text-black shadow-sm mx-auto flex flex-col">
      <div className="flex-grow">
        {/* Header */}
        <div className="border-b-[8px] border-black pb-1 mb-1">
          <h2 className="text-4xl font-black leading-none tracking-tighter uppercase italic">
            {headerTitle}
          </h2>
          <div className="flex justify-between items-baseline font-bold text-sm mt-1">
            <span className="uppercase tracking-tighter">
              Tier:{' '}
              <span
                className={
                  isPremiumTier ? 'text-[var(--v500)]' : 'text-[var(--s500)]'
                }
              >
                {tierName}
              </span>
            </span>
            {showAnnualDiscount && (
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                {discountPercent}% Annual
              </span>
            )}
          </div>
          {itemName ? (
            <div className="text-[10px] font-bold uppercase tracking-tighter mt-1 opacity-70">
              {itemName} ·{' '}
              {isWebsite ? 'Project Engagement' : '1 Business Location'}
            </div>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-tighter mt-1 opacity-70">
              {isWebsite
                ? 'Project Engagement'
                : 'Serving Size: 1 Business Location'}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="border-b-[4px] border-black py-1">
          <div className="text-xs font-bold uppercase tracking-tighter">
            {isWebsite ? 'Project Price' : 'Base Service Price'}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-black block leading-none">
                {priceCadenceLabel}
              </span>
              <span className="text-[10px] font-bold uppercase">
                {priceCadenceSub}
              </span>
            </div>
            <span
              className="text-5xl font-black leading-none text-[var(--s500)]"
              style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
            >
              ${formatNumber(headlinePrice)}
            </span>
          </div>

          {showAnnualDiscount && (
            <div className="mt-2 pt-1 border-t border-black border-dashed flex justify-between items-center">
              <div>
                <div className="text-[11px] font-black uppercase">
                  {discountPercent}% Discount Price
                </div>
                <div className="text-[9px] leading-tight text-gray-600 font-bold uppercase">
                  w/ Annual Commitment
                </div>
              </div>
              <div className="text-right">
                <span
                  className="text-2xl font-black"
                  style={{
                    fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  }}
                >
                  ${annualMonthly}
                </span>
                <span className="text-[10px] block font-bold mt-[-4px]">
                  /mo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Specs / Limits / Delivery */}
        <div className="border-b-[4px] border-black">
          <div className="flex justify-end text-[10px] font-bold border-b border-black py-0.5 uppercase tracking-tighter">
            {isWebsite ? 'Scope *' : '% Fair Use Cap *'}
          </div>

          {isWebsite ? (
            <>
              <SpecRow
                label="Delivery Timeline"
                value={delivery?.timeline ?? '—'}
                flag="ACTIVE"
              />
              <SpecRow
                label="Pages & Scope"
                value={delivery?.pages ?? '—'}
                flag="100%"
              />
              <SpecRow
                label="Performance Target"
                value={delivery?.performance ?? '—'}
                flag="100%"
              />
              <SpecRow label="Coverage" value={specs.coverage} flag="100%" />
            </>
          ) : (
            <>
              <SpecRow
                label="Voice Coverage"
                value={specs.coverage}
                flag="ACTIVE"
              />

              <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
                <span className="font-bold uppercase tracking-tighter">
                  Total Voice Minutes
                </span>
                <span className="font-bold">100%</span>
              </div>
              <div className="pl-4 text-xs py-1 border-b border-black">
                Includes{' '}
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  }}
                  className="font-bold"
                >
                  {limits?.minutes ?? '—'}
                </span>{' '}
                Monthly Pooled Minutes
              </div>

              <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
                <span className="font-bold uppercase tracking-tighter">
                  Total SMS Segments
                </span>
                <span className="font-bold">100%</span>
              </div>
              <div className="pl-4 text-xs py-1 border-b border-black">
                Includes{' '}
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                  }}
                  className="font-bold"
                >
                  {limits?.sms ?? '—'}
                </span>{' '}
                Monthly Segments
              </div>
            </>
          )}

          {/* Features */}
          <div className="py-2">
            <div className="font-bold text-sm mb-1 uppercase tracking-tighter">
              {isWebsite ? 'Included In Build:' : 'Included System Features:'}
            </div>
            <ul className="text-xs space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex justify-between border-b border-gray-200 pb-0.5 last:border-0"
                >
                  <span className="pl-2">• {feature}</span>
                  <span className="font-bold">Yes</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Add-on */}
        {addon && (
          <div className="border-b-[4px] border-black py-1.5 flex justify-between items-baseline text-sm">
            <span className="font-bold uppercase tracking-tighter">
              {isWebsite ? 'Maintenance' : 'Additional Locations'}
            </span>
            <span
              className="font-bold"
              style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
            >
              ${addon.price}
              <span className="text-[10px] ml-1 font-bold opacity-70">
                {addon.label}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="text-[9px] mt-2 leading-tight">
          <span className="font-bold uppercase italic">
            {isWebsite ? 'Built With:' : 'Marketing Ingredients:'}
          </span>{' '}
          {specs.ingredients}
        </div>

        <div className="text-[8px] mt-2 border-t border-black pt-1 leading-[1.2]">
          {isWebsite
            ? '* Scope reflects what is included in the project quote. Out-of-scope changes priced separately. Source code is delivered to you on completion. Maintenance is optional and month-to-month.'
            : '* The % Fair Use (FU) indicates the capacity included in the base price before standard overage rates apply. Mid-annual cancellation of the Discount Price is subject to cancellation fees. API access not available. White-labeling included. All agents are trade-specific.'}
        </div>

        {crossSell && onCrossSell && (
          <button
            type="button"
            onClick={() => {
              onCrossSell(crossSell.offeringId);
            }}
            className="mt-3 w-full border-2 border-dashed border-black/40 hover:border-[var(--v500)] hover:text-[var(--v500)] text-black/80 font-bold uppercase text-[10px] tracking-wider py-2 rounded-sm transition-all flex items-center justify-center gap-2 text-center px-2"
          >
            {crossSell.label}
            <ArrowRight size={12} />
          </button>
        )}

        {onGetStarted && (
          <button
            type="button"
            onClick={onGetStarted}
            className="mt-3 w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90 text-white font-black uppercase text-xs tracking-wider py-3 rounded-sm transition-all flex items-center justify-center gap-2"
          >
            Get Started — {tierName}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  flag,
}: {
  label: string;
  value: string;
  flag: string;
}) {
  return (
    <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
      <span>
        <span className="font-bold uppercase tracking-tighter">{label}</span>{' '}
        {value}
      </span>
      <span className="font-bold text-xs italic">{flag}</span>
    </div>
  );
}

function formatNumber(n: number): string {
  return n >= 1000 ? n.toLocaleString('en-US') : String(n);
}
