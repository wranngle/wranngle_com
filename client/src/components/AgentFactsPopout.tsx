import React from 'react';
import {ArrowRight} from 'lucide-react';
import type {OfferingFacts, OfferingKind} from '@/data/offerings.ts';

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
  const state = getPopoutState(facts, itemName);

  return (
    <div className="bg-white border-2 border-black p-4 w-full max-w-[380px] font-sans text-black shadow-sm mx-auto flex flex-col">
      <div className="flex-grow">
        <PopoutHeader facts={facts} state={state} />
        <PriceBlock facts={facts} state={state} />
        <SpecBlock facts={facts} labels={state.labels} />
        <AddonRow facts={facts} state={state} />
      </div>

      <PopoutFooter
        facts={facts}
        state={state}
        onGetStarted={onGetStarted}
        onCrossSell={onCrossSell}
      />
    </div>
  );
}

const KIND_LABELS: Record<
  OfferingKind,
  {
    headerTitle: string;
    itemMeta: string;
    fallbackMeta: string;
    priceTitle: string;
    priceCadenceLabel: string;
    priceCadenceSub: string;
    limitsTitle: string;
    featuresTitle: string;
    addonLabel: string;
    footerLead: string;
    footerFinePrint: string;
  }
> = {
  'ai-agent': {
    headerTitle: 'AI Agent Facts',
    itemMeta: '1 Business Location',
    fallbackMeta: 'Serving Size: 1 Business Location',
    priceTitle: 'Base Service Price',
    priceCadenceLabel: 'Monthly',
    priceCadenceSub: 'No commitment',
    limitsTitle: '% Fair Use Cap *',
    featuresTitle: 'Included System Features:',
    addonLabel: 'Additional Locations',
    footerLead: 'Marketing Ingredients:',
    footerFinePrint:
      '* The % Fair Use figure shows capacity included in the base price before standard overage rates apply. Mid-annual cancellation of the Discount Price is subject to cancellation fees. White-labeling included. All agents are trained for your business context.',
  },
  website: {
    headerTitle: 'Website Spec Sheet',
    itemMeta: 'Project Engagement',
    fallbackMeta: 'Project Engagement',
    priceTitle: 'Project Price',
    priceCadenceLabel: 'Project',
    priceCadenceSub: 'One-time delivery',
    limitsTitle: 'Scope *',
    featuresTitle: 'Included In Build:',
    addonLabel: 'Maintenance',
    footerLead: 'Built With:',
    footerFinePrint:
      '* Scope reflects what is included in the project quote. Out-of-scope changes priced separately. Source code is delivered to you on completion. Maintenance is optional and month-to-month.',
  },
  saas: {
    headerTitle: 'gtm_ops Spec Sheet',
    itemMeta: 'gtm_ops Workspace',
    fallbackMeta: 'gtm_ops Workspace',
    priceTitle: 'Subscription Price',
    priceCadenceLabel: 'Monthly',
    priceCadenceSub: 'Cancel any time',
    limitsTitle: 'Plan Limits *',
    featuresTitle: 'Included In Plan:',
    addonLabel: 'Annual Plan',
    footerLead: 'Stack Includes:',
    footerFinePrint:
      '* Plan limits reset monthly on the billing anniversary. Annual plans billed up-front; monthly plans cancel any time. SSO + custom domain require a verified workspace. Audit logs retained 12 months on Plus, indefinitely on Pro.',
  },
};

type PopoutState = {
  itemMeta: string;
  isPremiumTier: boolean;
  isTrial: boolean;
  showAnnualDiscount: boolean;
  priceCadenceLabel: string;
  priceCadenceSub: string;
  priceTitle: string;
  labels: (typeof KIND_LABELS)[OfferingKind];
};

function getPopoutState(
  facts: OfferingFacts,
  itemName: string | undefined,
): PopoutState {
  const labels = KIND_LABELS[facts.kind];
  const isTrial = facts.kind === 'saas' && facts.headlinePrice === 0;

  return {
    itemMeta: itemName
      ? `${itemName} · ${labels.itemMeta}`
      : labels.fallbackMeta,
    isPremiumTier: /elite|premium|plus|pro|business/i.test(facts.tierName),
    isTrial,
    showAnnualDiscount:
      facts.kind !== 'website' && !isTrial && facts.discountPercent > 0,
    priceCadenceLabel: isTrial ? 'Free' : labels.priceCadenceLabel,
    priceCadenceSub: isTrial ? '14-day evaluation' : labels.priceCadenceSub,
    priceTitle: isTrial ? 'Trial Price' : labels.priceTitle,
    labels,
  };
}

function PopoutHeader({
  facts,
  state,
}: {
  facts: OfferingFacts;
  state: PopoutState;
}) {
  return (
    <div className="border-b-[8px] border-black pb-1 mb-1">
      <h2 className="text-4xl font-black leading-none tracking-tighter uppercase italic">
        {state.labels.headerTitle}
      </h2>
      <div className="flex justify-between items-baseline font-bold text-sm mt-1">
        <span className="uppercase tracking-tighter">
          Tier:{' '}
          <span
            className={
              state.isPremiumTier ? 'text-[var(--v500)]' : 'text-[var(--s500)]'
            }
          >
            {facts.tierName}
          </span>
        </span>
        {state.showAnnualDiscount && (
          <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
            {facts.discountPercent}% Annual
          </span>
        )}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-tighter mt-1 opacity-70">
        {state.itemMeta}
      </div>
    </div>
  );
}

function PriceBlock({
  facts,
  state,
}: {
  facts: OfferingFacts;
  state: PopoutState;
}) {
  return (
    <div className="border-b-[4px] border-black py-1">
      <div className="text-xs font-bold uppercase tracking-tighter">
        {state.priceTitle}
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-black block leading-none">
            {state.priceCadenceLabel}
          </span>
          <span className="text-[10px] font-bold uppercase">
            {state.priceCadenceSub}
          </span>
        </div>
        <span
          className="text-5xl font-black leading-none text-[var(--s500)]"
          style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
        >
          {state.isTrial ? 'FREE' : `$${formatNumber(facts.headlinePrice)}`}
        </span>
      </div>

      {state.showAnnualDiscount && <AnnualDiscount facts={facts} />}
    </div>
  );
}

function AnnualDiscount({facts}: {facts: OfferingFacts}) {
  const annualMonthly = Number.isInteger(facts.annualMonthly)
    ? facts.annualMonthly
    : facts.annualMonthly.toFixed(2);

  return (
    <div className="mt-2 pt-1 border-t border-black border-dashed flex justify-between items-center">
      <div>
        <div className="text-[11px] font-black uppercase">
          {facts.discountPercent}% Discount Price
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
          ${annualMonthly}
        </span>
        <span className="text-[10px] block font-bold mt-[-4px]">/mo</span>
      </div>
    </div>
  );
}

function SpecBlock({
  facts,
  labels,
}: {
  facts: OfferingFacts;
  labels: PopoutState['labels'];
}) {
  return (
    <div className="border-b-[4px] border-black">
      <div className="flex justify-end text-[10px] font-bold border-b border-black py-0.5 uppercase tracking-tighter">
        {labels.limitsTitle}
      </div>
      <SpecRows facts={facts} />
      <FeatureRows features={facts.features} title={labels.featuresTitle} />
    </div>
  );
}

function SpecRows({facts}: {facts: OfferingFacts}) {
  if (facts.kind === 'saas') return <SaasSpecRows facts={facts} />;
  if (facts.kind === 'website') return <WebsiteSpecRows facts={facts} />;

  return <AgentSpecRows facts={facts} />;
}

function SaasSpecRows({facts}: {facts: OfferingFacts}) {
  return (
    <>
      <SpecRow label="Coverage" value={facts.specs.coverage} flag="ACTIVE" />
      <SpecRow
        label="Proposals / mo"
        value={facts.saasLimits?.proposalsCap ?? '—'}
        flag="100%"
      />
      <SpecRow
        label="Users / Seats"
        value={facts.saasLimits?.users ?? '—'}
        flag="100%"
      />
      <SpecRow
        label="SSO"
        value={facts.saasLimits?.sso ? 'Google + Azure AD' : 'Not included'}
        flag={facts.saasLimits?.sso ? 'YES' : 'NO'}
      />
      <SpecRow
        label="Custom Domain"
        value={facts.saasLimits?.customDomain ? 'Included' : 'Not included'}
        flag={facts.saasLimits?.customDomain ? 'YES' : 'NO'}
      />
      <SpecRow
        label="Audit Chain"
        value={facts.saasLimits?.auditChain ?? '—'}
        flag="100%"
      />
    </>
  );
}

function WebsiteSpecRows({facts}: {facts: OfferingFacts}) {
  return (
    <>
      <SpecRow
        label="Delivery Timeline"
        value={facts.delivery?.timeline ?? '—'}
        flag="ACTIVE"
      />
      <SpecRow
        label="Pages & Scope"
        value={facts.delivery?.pages ?? '—'}
        flag="100%"
      />
      <SpecRow
        label="Performance Target"
        value={facts.delivery?.performance ?? '—'}
        flag="100%"
      />
      <SpecRow label="Coverage" value={facts.specs.coverage} flag="100%" />
    </>
  );
}

function AgentSpecRows({facts}: {facts: OfferingFacts}) {
  return (
    <>
      <SpecRow
        label="Voice Coverage"
        value={facts.specs.coverage}
        flag="ACTIVE"
      />
      <UsageRow
        label="Total Voice Minutes"
        value={facts.limits?.minutes ?? '—'}
        suffix="Monthly Pooled Minutes"
      />
      <UsageRow
        label="Total SMS Segments"
        value={facts.limits?.sms ?? '—'}
        suffix="Monthly Segments"
      />
    </>
  );
}

function UsageRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <>
      <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
        <span className="font-bold uppercase tracking-tighter">{label}</span>
        <span className="font-bold">100%</span>
      </div>
      <div className="pl-4 text-xs py-1 border-b border-black">
        Includes{' '}
        <span
          style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
          className="font-bold"
        >
          {value}
        </span>{' '}
        {suffix}
      </div>
    </>
  );
}

function FeatureRows({features, title}: {features: string[]; title: string}) {
  return (
    <div className="py-2">
      <div className="font-bold text-sm mb-1 uppercase tracking-tighter">
        {title}
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
  );
}

function AddonRow({facts, state}: {facts: OfferingFacts; state: PopoutState}) {
  if (!facts.addon || state.isTrial) return null;

  return (
    <div className="border-b-[4px] border-black py-1.5 flex justify-between items-baseline text-sm">
      <span className="font-bold uppercase tracking-tighter">
        {state.labels.addonLabel}
      </span>
      <span
        className="font-bold"
        style={{fontFamily: 'JetBrains Mono, ui-monospace, monospace'}}
      >
        ${facts.addon.price}
        <span className="text-[10px] ml-1 font-bold opacity-70">
          {facts.addon.label}
        </span>
      </span>
    </div>
  );
}

function PopoutFooter({
  facts,
  state,
  onGetStarted,
  onCrossSell,
}: {
  facts: OfferingFacts;
  state: PopoutState;
  onGetStarted?: () => void;
  onCrossSell?: (offeringId: string) => void;
}) {
  return (
    <div className="mt-auto">
      <div className="text-[9px] mt-2 leading-tight">
        <span className="font-bold uppercase italic">
          {state.labels.footerLead}
        </span>{' '}
        {facts.specs.ingredients}
      </div>
      <div className="text-[8px] mt-2 border-t border-black pt-1 leading-[1.2]">
        {state.labels.footerFinePrint}
      </div>
      <PrimaryCta facts={facts} state={state} onGetStarted={onGetStarted} />
      <CrossSellCta facts={facts} onCrossSell={onCrossSell} />
    </div>
  );
}

function PrimaryCta({
  facts,
  state,
  onGetStarted,
}: {
  facts: OfferingFacts;
  state: PopoutState;
  onGetStarted?: () => void;
}) {
  if (!onGetStarted) return null;

  return (
    <button
      type="button"
      onClick={onGetStarted}
      className="mt-4 w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90 text-white font-black uppercase text-sm tracking-wider py-4 rounded-sm transition-all flex items-center justify-between gap-2 px-4 shadow-md hover:scale-[1.01] ring-2 ring-[var(--s500)]/30 ring-offset-2 ring-offset-white"
    >
      <span className="flex flex-col items-start leading-tight">
        <span>Get Started — {facts.tierName}</span>
        <span className="text-[10px] font-bold opacity-90 normal-case tracking-normal">
          {getCtaSubLabel(facts, state)}
        </span>
      </span>
      <ArrowRight size={18} />
    </button>
  );
}

function CrossSellCta({
  facts,
  onCrossSell,
}: {
  facts: OfferingFacts;
  onCrossSell?: (offeringId: string) => void;
}) {
  const {crossSell} = facts;
  if (!crossSell || !onCrossSell) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onCrossSell(crossSell.offeringId);
      }}
      className="mt-2 w-full border border-dashed border-black/30 hover:border-[var(--v500)] hover:text-[var(--v500)] text-black/60 font-bold uppercase text-[10px] tracking-wider py-1.5 rounded-sm transition-all flex items-center justify-center gap-2 text-center px-2"
    >
      {crossSell.label}
      <ArrowRight size={11} />
    </button>
  );
}

function getCtaSubLabel(facts: OfferingFacts, state: PopoutState): string {
  if (state.isTrial) return 'No card · 14-day trial';
  if (facts.kind === 'website') {
    return `Project · $${formatNumber(facts.headlinePrice)}`;
  }

  return `${state.priceCadenceLabel} · $${formatNumber(facts.headlinePrice)}`;
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
