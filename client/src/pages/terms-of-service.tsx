import React, {useEffect} from 'react';
import {Link} from 'wouter';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

export default function TermsOfService() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Terms of Service — Wranngle';
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a] text-[#fcfaf5]' : 'bg-[#fcfaf5] text-[#12111a]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark' : 'bg-page-light'}`}
      >
        <SiteHeader
          isDark={isDark}
          toggleTheme={toggleTheme}
          showMarketingActions={false}
        />
        <main id="main" className="flex-1 py-16 px-6">
          <style>{`
            .brand-font { font-family: 'Bricolage Grotesque', sans-serif; }
          `}</style>

          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--s500)] hover:underline mb-8"
            >
              ← Back to Home
            </Link>

            <h1 className="brand-font text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-sm opacity-60 mb-12">
              Last Updated: May 4, 2026
            </p>

            <div className="space-y-8 leading-relaxed">
              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="opacity-80 mb-4">
                  By accessing or using Wranngle Systems&apos; services
                  (&quot;Service&quot;), you agree to be bound by these Terms of
                  Service (&quot;Terms&quot;). If you do not agree to these
                  Terms, do not use the Service.
                </p>
                <p className="opacity-80">
                  These Terms apply to all users of the Service, including
                  customers who have purchased AI voice agent subscriptions.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  2. Service Description
                </h2>
                <p className="opacity-80 mb-4">
                  Wranngle Systems provides AI-powered voice agents designed to
                  handle inbound calls for organizations, plus the gtm_ops
                  proposal-generation runtime. The Service includes:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>24/7 AI voice agent for call answering</li>
                  <li>Lead qualification and capture</li>
                  <li>Two-way SMS communication</li>
                  <li>Web chat integration</li>
                  <li>Calendar integration via Cal.com</li>
                  <li>
                    gtm_ops: lead intake, Clay and Apollo enrichment, and
                    branded-proposal generation
                  </li>
                  <li>Usage analytics, audit logs, and reporting</li>
                  <li>
                    AI disclosure and call-recording announcement at the start
                    of every call
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  3. Account Registration
                </h2>
                <p className="opacity-80 mb-4">
                  To use the Service, you must provide accurate and complete
                  information during registration. You are responsible for:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    Maintaining the confidentiality of your account credentials
                  </li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Ensuring your contact information remains current</li>
                </ul>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  4. Subscription Plans and Billing
                </h2>
                <p className="opacity-80 mb-4">
                  <strong>Core Agent ($250/month):</strong> Includes voice-only
                  AI agent with 1,000 voice minutes and 500 SMS segments per
                  month.
                </p>
                <p className="opacity-80 mb-4">
                  <strong>Elite Agent ($500/month):</strong> Includes
                  triple-channel voice + web + SMS AI agents with 2,500 voice
                  minutes and 1,500 SMS segments per month.
                </p>
                <p className="opacity-80 mb-4">
                  Subscriptions are billed monthly in advance. Annual
                  subscriptions receive a discount (15% for Core, 20% for Elite)
                  and require 12-month commitment.
                </p>
                <p className="opacity-80">
                  You authorize us to charge your payment method for all fees
                  due. Failure to pay may result in service suspension or
                  termination.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  5. Usage Limits and Overage Charges
                </h2>
                <p className="opacity-80 mb-4">
                  Each plan includes monthly usage limits. Usage beyond these
                  limits will be billed at standard overage rates:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Voice minutes: $0.10 per additional minute</li>
                  <li>SMS segments: $0.05 per additional segment</li>
                </ul>
                <p className="opacity-80 mt-4">
                  You will not be charged for overages without prior notice.
                  Overage charges, if applicable after that conversation, are
                  billed in arrears on your next invoice.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  6. Cancellation and Refunds
                </h2>
                <p className="opacity-80 mb-4">
                  Monthly subscriptions may be cancelled at any time, effective
                  at the end of the current billing period. No refunds are
                  provided for partial months.
                </p>
                <p className="opacity-80 mb-4">
                  Annual subscriptions may be cancelled with a cancellation fee
                  equal to 50% of remaining months. For example, cancelling 6
                  months into an annual contract incurs a fee of 3 months&apos;
                  service cost.
                </p>
                <p className="opacity-80">
                  Refunds are not provided except as required by law or at our
                  sole discretion.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  7. Acceptable Use Policy
                </h2>
                <p className="opacity-80 mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious content</li>
                  <li>Harass, abuse, or harm others</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>
                    Attempt to gain unauthorized access to our systems or
                    networks
                  </li>
                  <li>Use the Service for telemarketing or spam</li>
                  <li>
                    Configure the agent to misrepresent itself as a human, deny
                    being an AI when asked, or evade the call-start AI and
                    recording disclosures described in our Privacy Policy
                  </li>
                  <li>
                    Clone, mimic, or impersonate a third party&apos;s voice
                    without verifiable, documented consent from that person
                  </li>
                  <li>
                    Use the Service for prohibited content categories under the
                    ElevenLabs Terms of Service (e.g., misleading political
                    speech, fraud, harassment campaigns, non-consensual
                    impersonation, or unlawful surveillance)
                  </li>
                  <li>
                    Route the Service into geographies or call types where AI
                    voice agents are prohibited by local law
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  Violation of this policy may result in immediate termination
                  of your account without refund. We pass through upstream
                  enforcement actions: if ElevenLabs, Twilio, Telnyx, Bandwidth,
                  or any other infrastructure provider suspends or terminates
                  our access on your behalf, your access may be paused or
                  revoked accordingly.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  8. Intellectual Property
                </h2>
                <p className="opacity-80 mb-4">
                  All content, features, and functionality of the Service,
                  including but not limited to text, graphics, logos, software,
                  and AI models, are the exclusive property of Wranngle Systems
                  and are protected by copyright, trademark, and other
                  intellectual property laws.
                </p>
                <p className="opacity-80">
                  You may not reproduce, modify, distribute, or create
                  derivative works without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  9. Data and Privacy
                </h2>
                <p className="opacity-80 mb-4">
                  Your use of the Service is subject to our Privacy Policy,
                  which describes how we collect, use, and protect your data.
                </p>
                <p className="opacity-80 mb-4">
                  You retain ownership of all data you provide to the Service,
                  including call recordings and transcripts. We process this
                  data solely to provide the Service.
                </p>
                <p className="opacity-80">
                  You are responsible for ensuring you have proper consent and
                  authorization to record and process calls in your
                  jurisdiction.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  10. Service Level and Uptime
                </h2>
                <p className="opacity-80 mb-4">
                  We strive to maintain 99.5% uptime for the Service. However,
                  we do not guarantee uninterrupted access and are not liable
                  for downtime due to:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Scheduled maintenance (with advance notice)</li>
                  <li>Third-party service provider outages</li>
                  <li>Events beyond our reasonable control</li>
                  <li>Issues caused by your systems or network</li>
                </ul>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  11. Limitation of Liability
                </h2>
                <p className="opacity-80 mb-4">
                  To the fullest extent permitted by law, Wranngle Systems shall
                  not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including lost profits,
                  lost revenue, or lost business opportunities.
                </p>
                <p className="opacity-80">
                  Our total liability for any claims arising from or related to
                  the Service shall not exceed the amount you paid us in the 12
                  months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  12. Disclaimers
                </h2>
                <p className="opacity-80 mb-4">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
                  AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
                  IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
                  NON-INFRINGEMENT.
                </p>
                <p className="opacity-80">
                  We do not warrant that the Service will be error-free, secure,
                  or meet your specific requirements. AI-generated responses may
                  occasionally be inaccurate or inappropriate, and you should
                  review and monitor agent interactions.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  13. Indemnification
                </h2>
                <p className="opacity-80">
                  You agree to indemnify, defend, and hold harmless Wranngle
                  Systems and its officers, directors, employees, and agents
                  from any claims, liabilities, damages, losses, and expenses
                  arising from your use of the Service, violation of these
                  Terms, or infringement of any rights of another party.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  14. Modifications to Terms
                </h2>
                <p className="opacity-80 mb-4">
                  We reserve the right to modify these Terms at any time. We
                  will notify you of material changes via email at least 30 days
                  before they take effect.
                </p>
                <p className="opacity-80">
                  Your continued use of the Service after changes become
                  effective constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  15. Termination
                </h2>
                <p className="opacity-80 mb-4">
                  We may suspend or terminate your access to the Service at any
                  time, with or without cause, with or without notice. Grounds
                  for termination include:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Violation of these Terms or Acceptable Use Policy</li>
                  <li>Non-payment of fees</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Risk to the Service or other users</li>
                </ul>
                <p className="opacity-80 mt-4">
                  Upon termination, you must immediately cease using the
                  Service. We may delete your data in accordance with our data
                  retention policies.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  16. Governing Law and Dispute Resolution
                </h2>
                <p className="opacity-80 mb-4">
                  These Terms are governed by the laws of the State of Indiana,
                  United States, without regard to conflict of law principles.
                </p>
                <p className="opacity-80 mb-4">
                  Any disputes arising from these Terms or the Service shall be
                  resolved through binding arbitration in accordance with the
                  rules of the American Arbitration Association. You waive any
                  right to participate in class actions.
                </p>
                <p className="opacity-80">
                  Nothing in this section prevents either party from seeking
                  injunctive relief in court for intellectual property
                  violations or unauthorized access.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  17. Severability
                </h2>
                <p className="opacity-80">
                  If any provision of these Terms is found to be invalid or
                  unenforceable, the remaining provisions shall remain in full
                  force and effect.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  18. Contact Information
                </h2>
                <p className="opacity-80 mb-4">
                  For questions about these Terms, please contact us at:
                </p>
                <p className="opacity-80 font-mono text-sm">
                  Wranngle Systems LLC
                  <br />
                  Email: hello@wranngle.com
                </p>
              </section>
            </div>

            <div
              className={`mt-16 pt-8 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[var(--s500)] hover:underline"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
