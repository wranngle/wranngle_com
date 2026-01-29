import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion.tsx';

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: 'How quickly can my AI agent be deployed?',
    answer:
      'Most agents are deployed within 1-2 weeks after order. This includes phone number provisioning, AI training on your business specifics, and thorough testing to ensure quality.',
  },
  {
    question: "What happens when I exceed my plan's usage limits?",
    answer:
      "We set limits high only to protect from abuse. No one has ever hit the limit, and honestly if you do hit it in earnest, we'll just increase the limit with no questions asked.",
  },
  {
    question: 'How are you different than a human answering service?',
    answer:
      'When including minute usage and overages, our service is likely higher value than live answering services. We can more deeply integrate with your systems. Our onboarding is simpler and more flexible. Our agent can be given data not only specific to your industry, but specific to your exact business. Our service also includes web AI chat and realtime calendar integrations for faster resolution times.',
  },
  {
    question: 'Can the AI agent handle appointment scheduling?',
    answer:
      'Yes! Elite tier includes Cal.com integration for automatic appointment booking. The agent can check your availability, book appointments, send confirmations, and handle rescheduling requests - all without human intervention.',
  },
  {
    question: 'What if a call requires human intervention?',
    answer:
      'The agent is trained to recognize situations requiring human expertise. It can seamlessly transfer calls to your mobile phone (Elite tier) or capture detailed information and immediately notify you via SMS. You maintain full control over transfer criteria.',
  },
  {
    question: 'How does the agent learn about my specific business?',
    answer:
      'During onboarding, we configure your agent with your service areas, pricing, common questions, and business policies. You can request updates to the knowledge base anytime through our team. The agent improves over time by learning from successful interactions.',
  },
  {
    question: 'Is my caller data secure and private?',
    answer:
      "Absolutely. All call recordings are encrypted at rest and in transit. We're GDPR and CCPA compliant. You own all your data and can export or delete it at any time. Call recordings are retained for 90 days by default, with longer retention available on request.",
  },
  {
    question: "Can I customize the agent's voice and personality?",
    answer:
      "Elite tier includes custom voice identity. You can choose from professional voice options or even clone a voice for a fee. You also control the agent's personality - whether friendly and casual or formal and professional - to match your brand.",
  },
  {
    question: 'What if I have multiple business locations?',
    answer:
      "If you have multiple locations, we'll provide a phone number for each location to automatically differentiate calls. Each location can have its own knowledge base and routing rules while sharing a unified dashboard.",
  },
  {
    question: 'What happens if I cancel my subscription?',
    answer:
      'Monthly subscriptions can be cancelled anytime, effective at the end of your billing period. Annual subscriptions have a 50% early termination fee on remaining months. All your data is accessible for 30 days after cancellation for export.',
  },
  {
    question: 'Do I need special phone equipment or setup?',
    answer:
      "No! We provide a dedicated phone number that forwards to your agent. You can use your existing number by forwarding after-hours calls to the agent, or replace your main line entirely. Setup requires no hardware - it's all cloud-based.",
  },
  {
    question: 'How accurate is the lead qualification?',
    answer:
      'The agent uses advanced natural language processing to qualify leads based on your criteria. It achieves 95%+ accuracy in distinguishing service calls from spam. You define the qualification criteria, and the agent learns from your feedback to improve accuracy over time.',
  },
  {
    question: 'What languages does the AI agent support?',
    answer:
      'The agent supports Arabic, Chinese, English, French, Japanese, Korean, and Spanish. Additional languages are available by request.',
  },
  {
    question: 'How does the agent get information about my business?',
    answer:
      "By default, your agent's knowledge will be based on your website and publicly available information. During onboarding, you can provide additional business-specific details, FAQs, and policies. Note: There's no self-service dashboard yet - all updates go through our team.",
  },
];

type FAQProps = {
  isDark?: boolean;
};

export default function FAQ({isDark = true}: FAQProps) {
  return (
    <section id="faq" className="py-24 px-6 max-w-4xl mx-auto w-full relative">
      <div className="text-center mb-12">
        <h2 className="brand-font text-4xl md:text-5xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <p className="opacity-60 text-lg">
          Everything you need to know about deploying your AI agent
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqData.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className={`border rounded-lg ${
              isDark
                ? 'border-white/10 bg-white/5'
                : 'border-black/10 bg-black/5'
            }`}
          >
            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
              <span className="brand-font text-lg font-semibold">
                {item.question}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 opacity-80 leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 text-center">
        <p className="opacity-60 mb-4">Still have questions?</p>
        <a
          href="mailto:support@wranngle.com"
          className="inline-flex items-center gap-2 text-[var(--s500)] hover:underline font-semibold"
        >
          Contact Support →
        </a>
      </div>
    </section>
  );
}
