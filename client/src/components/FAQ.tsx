// @ts-nocheck
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
      'Most agents go live in 1–2 weeks. That covers phone provisioning, training the agent on your services and pricing, and a couple rounds of test calls before we hand it the line.',
  },
  {
    group: 'Getting started',
    question: 'Do I need new phone equipment?',
    answer:
      'No. We give you a forwarding number — no hardware, no PBX changes. Forward your existing line after-hours, or replace it entirely. Setup is cloud-based; no boxes, no installer visit.',
  },
  {
    group: 'Getting started',
    question: 'How does the agent learn my business?',
    answer:
      'During onboarding we feed it your service areas, pricing ranges, common questions, and policies. The agent gets sharper as we feed it real call transcripts. Updates go through Wranngle for now — no self-serve dashboard yet.',
  },
  // How it works
  {
    group: 'How it works',
    question: 'What happens when a call needs a human?',
    answer:
      "The agent recognizes when it's in over its head. Elite tier hot-transfers to your mobile. Core tier captures details and texts you immediately so you can call back — full transcript included.",
  },
  {
    group: 'How it works',
    question: 'How accurate is lead qualification?',
    answer:
      '95%+ at sorting service calls from spam in our test fleet. You set the criteria; the agent learns from your feedback. It\'s tuned for the trades — it knows the difference between an emergency call and a "do you do roofing?" call.',
  },
  {
    group: 'How it works',
    question: 'How does it compare to a human answering service?',
    answer:
      'Cheaper at any real call volume. Deeper system integrations. Onboards in days instead of weeks. And you can clone a voice or pick a custom one — most answering services give you a script-reader on a dial-tone.',
  },
  {
    group: 'How it works',
    question: 'Can Sarah book appointments?',
    answer:
      'Yes. Elite includes Cal.com calendar booking. The agent checks availability, schedules the job, sends confirmations, and handles common reschedule requests on its own.',
  },
  {
    group: 'How it works',
    question: 'Can I customize the voice and personality?',
    answer:
      "Elite includes a custom ElevenLabs voice identity — choose from professional voices or clone one for an additional fee. You also control the agent's personality (warm vs formal, talkative vs efficient) so it matches your brand.",
  },
  {
    group: 'How it works',
    question: 'What languages does Sarah support?',
    answer:
      'Out of the box: English, Spanish, French, Arabic, Chinese, Japanese, and Korean. Additional languages are available on request.',
  },
  // Money & limits
  {
    group: 'Money & limits',
    question: 'What if I blow past my plan limits?',
    answer:
      "Limits exist to stop abuse — not to nickel-and-dime you. No customer has hit the cap in earnest. If you do, we'll raise it. Standard overage rates kick in only after that conversation.",
  },
  {
    group: 'Money & limits',
    question: 'What if I cancel?',
    answer:
      'Monthly plans cancel anytime, end-of-period. Annual plans (which save up to 20%) carry a 50% early-termination fee on remaining months. Your data stays exportable for 30 days after cancellation.',
  },
  // Trust & data
  {
    group: 'Trust & data',
    question: 'Is caller data safe?',
    answer:
      'Encrypted at rest and in transit. GDPR- and CCPA-aligned. You own the data; you can export or delete it any time. Recordings retained 90 days by default — longer retention available on request.',
  },
  // Product
  {
    group: 'Product',
    question: 'What if I have multiple business locations?',
    answer:
      "Each location gets its own forwarding number, knowledge base, and routing rules — but all share one unified inbox so you don't lose visibility. Per-location add-ons are priced on each spec sheet.",
  },
  {
    group: 'Product',
    question: 'What is gtm_ops?',
    answer:
      'gtm_ops is the proposal-generation runtime behind the Wranngle stack. Lead in, branded proposal out, with a full audit trail and a live no-signup demo. See the dedicated product page for the pipeline and tiers.',
  },
];

type FAQProps = {
  isDark?: boolean;
};

export default function FAQ({isDark = true}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  // Group while preserving original order
  const groups: Record<string, Array<FAQItem & {idx: number}>> = {};
  for (const [i, item] of FAQ_ITEMS.entries()) {
    groups[item.group] ??= [];
    groups[item.group].push({...item, idx: i});
  }

  return (
    <section
      id="faq"
      className="py-24 px-6 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <div className="mono-font text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-2">
            FAQ
          </div>
          <h2 className="brand-font text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight mb-4">
            Straight answers,
            <br />
            <span className="text-[var(--s500)]">no fine print.</span>
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

        <div>
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="mb-7">
              <div className="mono-font text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--s500)] mb-2 pl-0.5">
                // {group}
              </div>
              {items.map((item) => {
                const isOpen = openIndex === item.idx;
                return (
                  <FAQRow
                    key={item.idx}
                    item={item}
                    isOpen={isOpen}
                    isDark={isDark}
                    onToggle={() => {
                      setOpenIndex(isOpen ? -1 : item.idx);
                    }}
                  />
                );
              })}
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
  return (
    <div className={`border-b ${borderColor}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left py-5 px-1 flex items-center justify-between gap-4 bg-transparent"
      >
        <span className="flex-1 text-[17px] font-semibold leading-snug brand-font">
          {item.question}
        </span>
        <span
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
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? 320 : 0,
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
