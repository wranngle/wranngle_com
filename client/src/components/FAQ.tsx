import React, {useState} from 'react';
import {Plus} from 'lucide-react';

type FAQItem = {
  group: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FAQItem[] = [
  // Getting started
  {
    group: 'Getting started',
    question: 'How fast can I be live?',
    answer:
      'Plan on 1\u20132 weeks from kickoff. That covers connecting your channels, training the front end on your services and policies, and a couple rounds of test conversations before it takes real traffic.',
  },
  {
    group: 'Getting started',
    question: 'What do I need to install?',
    answer:
      'Nothing. Web chat is a script tag, voice is a forwarding number, and Slack, Teams, and Discord connect as apps to the workspaces you already run. Setup is cloud-based; no hardware, no PBX changes, no installer visit.',
  },
  {
    group: 'Getting started',
    question: 'How does the front end learn my business?',
    answer:
      'During onboarding we add your services, pricing ranges, common questions, and policies. After launch, we tune it from real conversation transcripts. Updates go through Wranngle for now \u2014 no self-serve dashboard yet.',
  },
  // How it works
  {
    group: 'How it works',
    question: 'What counts as a channel, and what does each tier include?',
    answer:
      'Web chat, voice, Slack, Teams, and Discord \u2014 and every tier includes all of them. The tiers differ in what happens after the conversation is captured: Omni Intake dispatches it, Internal AI resolves it, and gtm_ops Platform turns it into pipeline.',
  },
  {
    group: 'How it works',
    question: 'What happens when a conversation needs a human?',
    answer:
      'The front end hands off whenever a request falls outside its instructions \u2014 with the full transcript and structured context attached, so your team never re-asks a question the customer already answered.',
  },
  {
    group: 'How it works',
    question: 'How accurate is triage and qualification?',
    answer:
      'It depends on your conversation mix \u2014 a single percentage does not honestly cover every business. We test against fixtures of real customer conversations (urgent requests, vendors, spam, and out-of-scope questions) and measure your actual first-month performance before tuning. The scoring rubric is open source: github.com/wranngle/voice_ai_agent_evals.',
  },
  {
    group: 'How it works',
    question: 'Can it book appointments and act in my systems?',
    answer:
      'Internal AI and above, yes. It checks availability, books via Cal.com, updates your CRM, and runs lookups in the systems you connect \u2014 with every action logged.',
  },
  {
    group: 'How it works',
    question: 'Can I customize the voice and personality?',
    answer:
      'Yes. Pick a professional voice identity and set the personality (warm vs formal, talkative vs efficient) so the front end matches your brand across every channel.',
  },
  {
    group: 'How it works',
    question: 'What languages are supported?',
    answer:
      'Out of the box: English, Spanish, French, Arabic, Chinese, Japanese, and Korean. Additional languages are available on request.',
  },
  // gtm_ops Platform
  {
    group: 'gtm_ops Platform',
    question: 'What does the Platform tier add?',
    answer:
      'Everything in Internal AI, plus go-to-market operations: lead enrichment, branded PDF proposal generation, a replayable run log on every proposal, SSO, team workspaces, and a custom domain.',
  },
  {
    group: 'gtm_ops Platform',
    question: 'Where does proposal data come from?',
    answer:
      'Any conversation the front end captures \u2014 chat, voice, Slack, Teams, Discord \u2014 plus forms, CRM exports, and webhooks. The platform normalizes the fields, runs enrichment, and feeds a typed template, so a proposal never starts from a blank form.',
  },
  // Pricing & plans
  {
    group: 'Pricing & plans',
    question: 'How is it priced?',
    answer:
      'Three tiers, all monthly, all channels included: Omni Intake at $250/mo, Internal AI at $500/mo, and gtm_ops Platform at $900/mo. No add-ons, no annual lock-in, cancel anytime.',
  },
  {
    group: 'Pricing & plans',
    question: 'What if usage exceeds my plan limits?',
    answer:
      "Limits prevent abuse and keep the plan sized correctly. If normal business volume hits the cap, we'll review it with you before any overage fees apply. No surprise bills.",
  },
  {
    group: 'Pricing & plans',
    question: 'What if I cancel?',
    answer:
      'Cancel anytime, effective at the end of the current billing period. Your data stays exportable for 30 days after cancellation.',
  },
  // Trust & data
  {
    group: 'Trust & data',
    question: 'Is customer and lead data safe?',
    answer:
      'Encrypted at rest and in transit. GDPR- and CCPA-aligned. You own the data; export or deletion requests are processed within 30 days. Conversation records are retained 90 days by default \u2014 longer retention available on request.',
  },
  {
    group: 'Trust & data',
    question: 'Will customers know they are talking to an AI?',
    answer:
      'Yes. Sarah and every deployed front end announce that they are an AI at the start of the conversation \u2014 and that calls may be recorded \u2014 and confirm plainly if asked. Agents are never configured to claim to be human.',
  },
];

type FAQProps = {
  isDark?: boolean;
};

export default function FAQ({isDark = true}: FAQProps) {
  // Multiple panels may be open at once; opening one never collapses
  // another. Seeded with the first item open.
  const [openIndices, setOpenIndices] = useState<Set<number>>(
    () => new Set([0]),
  );
  const toggleIndex = (idx: number) => {
    setOpenIndices((previous) => {
      const next = new Set(previous);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Group while preserving original order
  const groups: Record<string, Array<FAQItem & {idx: number}>> = {};
  for (const [i, item] of FAQ_ITEMS.entries()) {
    groups[item.group] ??= [];
    groups[item.group].push({...item, idx: i});
  }

  return (
    <section
      id="faq"
      className="pt-10 pb-24 px-6 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16 items-start">
        {/* min-w-0 on both grid children: grid items default to
            min-width:auto and won't shrink below their content's intrinsic
            width, which pushed the accordion column ~13px past a 375px
            phone (horizontal scrollbar). */}
        <div className="lg:sticky lg:top-24 min-w-0">
          <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-2">
            FAQ
          </div>
          <h2 className="brand-font text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight mb-4">
            Straight answers,
            <br />
            <span className="text-[var(--s500)]">clear terms.</span>
          </h2>
          <p className="text-base opacity-70 leading-relaxed max-w-sm">
            Got something we didn&apos;t cover?{' '}
            <a
              href="/#talk-to-sarah"
              className="text-[var(--s500)] hover:underline font-semibold"
            >
              Ask Sarah
            </a>{' '}
            or email{' '}
            <a
              href="mailto:hello@wranngle.com"
              className="text-[var(--s500)] hover:underline font-semibold"
            >
              hello@wranngle.com
            </a>
            .
          </p>
        </div>

        <div className="min-w-0">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-7">
              <div className="mono-font text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--s500)] mb-2 pl-0.5">
                // {group}
              </div>
              {items.map((item) => (
                <FAQRow
                  key={item.idx}
                  item={item}
                  isOpen={openIndices.has(item.idx)}
                  isDark={isDark}
                  onToggle={() => {
                    toggleIndex(item.idx);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQRow({
  item,
  isOpen,
  isDark,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  isDark: boolean;
  onToggle: () => void;
}) {
  const borderColor = isDark ? 'border-white/10' : 'border-black/10';
  const iconBorder = isDark ? 'border-white/15' : 'border-black/15';
  // Stable ids tying the toggle button to the answer panel so screen
  // readers announce this as an expandable accordion (WCAG 4.1.2).
  const questionSlug = item.question
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');
  const buttonId = `faq-q-${questionSlug}`;
  const panelId = `faq-a-${questionSlug}`;
  return (
    <div className={`border-b ${borderColor}`}>
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full text-left py-5 px-1 flex items-center justify-between gap-4 bg-transparent"
      >
        <span className="flex-1 text-[17px] font-semibold leading-snug brand-font">
          {item.question}
        </span>
        <span
          aria-hidden
          className={`shrink-0 w-7 h-7 rounded-full border ${iconBorder} flex items-center justify-center transition-all duration-200 ${
            isOpen
              ? 'bg-[var(--s500)] border-[var(--s500)] text-white rotate-45'
              : ''
          }`}
        >
          <Plus size={14} strokeWidth={2} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? 600 : 0,
          paddingBottom: isOpen ? 24 : 0,
        }}
      >
        <p className="text-[15px] leading-[1.65] opacity-80 m-0 pr-9">
          {item.answer}
        </p>
      </div>
    </div>
  );
}
