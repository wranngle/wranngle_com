import React from 'react';
import type {OfferingFacts} from '@/data/offerings.ts';

type AgentFactsPopoutProps = {
  facts: OfferingFacts;
  itemName?: string;
};

/**
 * AgentFactsPopout — FDA-nutrition-label-style spec sheet for an OfferingFacts.
 *
 * Header bar (tierName + discountPercent badge) → Pricing block
 * (monthly / annualMonthly / addon) → Specs block (coverage / ingredients) →
 * Limits block (minutes / sms) → Features bulleted list. Brand tokens:
 * sunset accent on price, violet accent on premium tier, JetBrains Mono on
 * numerics, console-aesthetic uppercase labels.
 */
export default function AgentFactsPopout({
  facts,
  itemName,
}: AgentFactsPopoutProps) {
  const {tierName, discountPercent, pricing, specs, limits, features} = facts;
  const isPremiumTier = /elite|premium|pro/i.test(tierName);

  return (
    <div className="bg-white border-2 border-black p-4 w-full max-w-[380px] font-sans text-black shadow-sm mx-auto flex flex-col">
      <div className="flex-grow">
        {/* Header */}
        <div className="border-b-[8px] border-black pb-1 mb-1">
          <h2 className="text-4xl font-black leading-none tracking-tighter uppercase italic">
            AI Agent Facts
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
            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
              {discountPercent}% Annual
            </span>
          </div>
          {itemName ? (
            <div className="text-[10px] font-bold uppercase tracking-tighter mt-1 opacity-70">
              {itemName} · 1 Business Location
            </div>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-tighter mt-1 opacity-70">
              Serving Size: 1 Business Location
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="border-b-[4px] border-black py-1">
          <div className="text-xs font-bold uppercase tracking-tighter">
            Base Service Price
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-black block leading-none">
                Monthly
              </span>
              <span className="text-[10px] font-bold uppercase">
                No Commitment
              </span>
            </div>
            <span
              className="text-5xl font-black leading-none text-[var(--s500)]"
              style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
            >
              ${pricing.monthly}
            </span>
          </div>

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
                style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
              >
                ${pricing.annualMonthly}
              </span>
              <span className="text-[10px] block font-bold mt-[-4px]">/mo</span>
            </div>
          </div>
        </div>

        {/* Specs / Limits */}
        <div className="border-b-[4px] border-black">
          <div className="flex justify-end text-[10px] font-bold border-b border-black py-0.5 uppercase tracking-tighter">
            % Fair Use Cap *
          </div>

          <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
            <span>
              <span className="font-bold uppercase tracking-tighter">
                Voice Coverage
              </span>{' '}
              {specs.coverage}
            </span>
            <span className="font-bold text-xs italic">ACTIVE</span>
          </div>

          <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
            <span className="font-bold uppercase tracking-tighter">
              Total Voice Minutes
            </span>
            <span className="font-bold">100%</span>
          </div>
          <div className="pl-4 text-xs py-1 border-b border-black">
            Includes{' '}
            <span
              style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
              className="font-bold"
            >
              {limits.minutes}
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
              style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
              className="font-bold"
            >
              {limits.sms}
            </span>{' '}
            Monthly Segments
          </div>

          {/* Features */}
          <div className="py-2">
            <div className="font-bold text-sm mb-1 uppercase tracking-tighter">
              Included System Features:
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
        {pricing.addon !== undefined && (
          <div className="border-b-[4px] border-black py-1.5 flex justify-between items-baseline text-sm">
            <span className="font-bold uppercase tracking-tighter">
              Additional Locations
            </span>
            <span
              className="font-bold"
              style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
            >
              ${pricing.addon}/mo
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="text-[9px] mt-2 leading-tight">
          <span className="font-bold uppercase italic">
            Marketing Ingredients:
          </span>{' '}
          {specs.ingredients}
        </div>

        <div className="text-[8px] mt-2 border-t border-black pt-1 leading-[1.2]">
          * The % Fair Use (FU) indicates the capacity included in the base
          price before standard overage rates apply. Mid-annual cancellation of
          the Discount Price is subject to cancellation fees. API access not
          available. White-labeling included. All agents are trade-specific.
        </div>
      </div>
    </div>
  );
}
