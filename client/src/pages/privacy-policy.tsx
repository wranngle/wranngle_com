import React, {useEffect} from 'react';
import {Link} from 'wouter';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

export default function PrivacyPolicy() {
  const {isDark, toggle: toggleTheme} = useDarkMode();

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'Privacy Policy — Wranngle';
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
              Privacy Policy
            </h1>
            <p className="text-sm opacity-60 mb-12">
              Last Updated: May 4, 2026
            </p>

            <div className="space-y-8 leading-relaxed">
              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  1. Introduction
                </h2>
                <p className="opacity-80 mb-4">
                  Wranngle Systems LLC (&quot;Wranngle,&quot; &quot;we,&quot;
                  &quot;us,&quot; or &quot;our&quot;) is committed to protecting
                  your privacy. This Privacy Policy explains how we collect,
                  use, disclose, and safeguard your information when you use our
                  AI voice agent service (&quot;Service&quot;).
                </p>
                <p className="opacity-80">
                  By using the Service, you consent to the data practices
                  described in this policy. If you do not agree with this
                  policy, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  2. Information We Collect
                </h2>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  2.1 Information You Provide
                </h3>
                <p className="opacity-80 mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>Account Information:</strong> Business name,
                    business type or use case, contact person name, email
                    address, phone number
                  </li>
                  <li>
                    <strong>Payment Information:</strong> Credit card details,
                    billing address (processed securely through Stripe)
                  </li>
                  <li>
                    <strong>Agent Configuration:</strong> Agent name, voice
                    preferences, knowledge base content, business-specific
                    settings
                  </li>
                  <li>
                    <strong>Support Communications:</strong> Messages, feedback,
                    and correspondence sent to us
                  </li>
                </ul>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  2.2 Information Collected Automatically
                </h3>
                <p className="opacity-80 mb-4">
                  When you use the Service, we automatically collect:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>Call Data:</strong> Phone numbers, call duration,
                    call timestamps, call recordings, and AI-generated
                    transcripts
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Voice minutes consumed, SMS
                    messages sent/received, feature usage patterns
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type,
                    device information, operating system
                  </li>
                  <li>
                    <strong>Analytics Data:</strong> Page views, clicks, session
                    duration, referring websites
                  </li>
                </ul>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  2.3 Information from Third Parties
                </h3>
                <p className="opacity-80 mb-4">We may receive data from:</p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>ElevenLabs Conversational AI:</strong> Voice
                    synthesis, agent runtime, and call performance data
                  </li>
                  <li>
                    <strong>Twilio / Telnyx / Bandwidth:</strong> Telephony
                    metadata and delivery status
                  </li>
                  <li>
                    <strong>Stripe:</strong> Payment status and subscription
                    details
                  </li>
                  <li>
                    <strong>Cal.com:</strong> Calendar appointment data (Elite
                    tier only)
                  </li>
                  <li>
                    <strong>Clay:</strong> Lead-enrichment data (gtm_ops only)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="opacity-80 mb-4">We use your information to:</p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>Provide the Service:</strong> Create and manage AI
                    voice agents, process calls, send SMS messages
                  </li>
                  <li>
                    <strong>Billing and Payments:</strong> Process
                    subscriptions, calculate usage charges, send invoices
                  </li>
                  <li>
                    <strong>Improve the Service:</strong> Analyze usage
                    patterns, optimize AI performance, develop new features
                  </li>
                  <li>
                    <strong>Customer Support:</strong> Respond to inquiries,
                    troubleshoot issues, provide technical assistance
                  </li>
                  <li>
                    <strong>Security:</strong> Detect and prevent fraud, abuse,
                    and security threats
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> Comply with legal
                    obligations, enforce our Terms of Service
                  </li>
                  <li>
                    <strong>Communications:</strong> Send service updates,
                    billing notifications, and marketing messages (with your
                    consent)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  4. Call Recording and Transcription
                </h2>
                <p className="opacity-80 mb-4">
                  Our Service records and transcribes calls handled by AI
                  agents. This is essential for:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Lead capture and qualification</li>
                  <li>Quality assurance and training</li>
                  <li>Compliance and dispute resolution</li>
                  <li>Service improvement and analytics</li>
                </ul>
                <p className="opacity-80 mt-4 mb-4">
                  <strong>Your Responsibilities:</strong>
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    You are responsible for complying with call recording laws
                    in your jurisdiction
                  </li>
                  <li>
                    Many regions require two-party consent or disclosure before
                    recording
                  </li>
                  <li>
                    Our AI agents can be configured to announce recording at the
                    start of calls
                  </li>
                  <li>
                    You must obtain necessary consents from callers before using
                    the Service
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  Call recordings are retained for 90 days by default and may be
                  stored longer for legal compliance or at your request.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  5. Data Sharing and Disclosure
                </h2>
                <p className="opacity-80 mb-4">
                  We do not sell your personal information. We may share data
                  with:
                </p>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  5.1 Service Providers
                </h3>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>ElevenLabs Conversational AI:</strong> Voice agent
                    runtime and natural language understanding
                  </li>
                  <li>
                    <strong>OpenAI / Anthropic / Google (Gemini):</strong>{' '}
                    Large-language-model providers used for extraction,
                    qualification, and proposal generation. Provider selection
                    varies by workload; only the data needed to complete the
                    request is sent.
                  </li>
                  <li>
                    <strong>Twilio / Telnyx / Bandwidth:</strong> Telephony
                    infrastructure and SMS delivery
                  </li>
                  <li>
                    <strong>Stripe:</strong> Payment processing and subscription
                    management
                  </li>
                  <li>
                    <strong>Cloudflare:</strong> Hosting, CDN, edge functions
                    (lead-capture API), and DDoS protection
                  </li>
                  <li>
                    <strong>n8n (self-hosted):</strong> Workflow orchestration
                    and lead-webhook routing — no third-party access to lead
                    payloads
                  </li>
                  <li>
                    <strong>Cal.com:</strong> Calendar booking integration
                    (Elite tier)
                  </li>
                  <li>
                    <strong>Clay:</strong> Lead enrichment and deep-research
                    passes (gtm_ops only)
                  </li>
                </ul>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  5.2 Legal Requirements
                </h3>
                <p className="opacity-80 mb-4">
                  We may disclose information if required by law, including:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    In response to subpoenas, court orders, or legal process
                  </li>
                  <li>To comply with government agency requests</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>To investigate fraud or security issues</li>
                </ul>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  5.3 Business Transfers
                </h3>
                <p className="opacity-80">
                  If Wranngle is acquired, merged, or undergoes bankruptcy, your
                  information may be transferred to the successor entity.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  6. Data Security
                </h2>
                <p className="opacity-80 mb-4">
                  We implement widely used security measures to protect your
                  information:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>Encryption:</strong> Data is encrypted in transit
                    (TLS 1.3) and at rest (AES-256)
                  </li>
                  <li>
                    <strong>Access Controls:</strong> Role-based access with
                    multi-factor authentication for sensitive operations
                  </li>
                  <li>
                    <strong>Monitoring:</strong> Cloudflare WAF and bot
                    detection on the perimeter; application logs reviewed for
                    anomalies
                  </li>
                  <li>
                    <strong>Audits:</strong> Dependency vulnerability scans,
                    code review, and reliance on the security attestations of
                    our infrastructure providers (Cloudflare, Stripe,
                    ElevenLabs)
                  </li>
                  <li>
                    <strong>Data Isolation:</strong> Customer data is logically
                    segregated in our systems
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  However, no method of transmission or storage is 100% secure.
                  We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  7. Data Retention
                </h2>
                <p className="opacity-80 mb-4">We retain data as follows:</p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>Account Data:</strong> Retained while your account
                    is active and for 1 year after closure
                  </li>
                  <li>
                    <strong>Call Recordings:</strong> Retained for 90 days (or
                    longer if required by law or your settings)
                  </li>
                  <li>
                    <strong>Billing Records:</strong> Retained for 7 years for
                    tax and accounting purposes
                  </li>
                  <li>
                    <strong>Usage Analytics:</strong> Aggregated data may be
                    retained indefinitely
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  You may request earlier deletion of certain data types,
                  subject to legal and operational requirements.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  8. Your Privacy Rights
                </h2>
                <p className="opacity-80 mb-4">
                  Depending on your location, you may have the right to:
                </p>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  8.1 Access and Portability
                </h3>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Request a copy of your personal data</li>
                  <li>Export your data in a machine-readable format</li>
                </ul>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  8.2 Correction and Deletion
                </h3>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Correct inaccurate or incomplete data</li>
                  <li>
                    Request deletion of your data (subject to legal
                    requirements)
                  </li>
                </ul>

                <h3 className="brand-font text-xl font-bold mb-3 mt-6">
                  8.3 Control and Objection
                </h3>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Opt out of marketing communications</li>
                  <li>Object to processing based on legitimate interests</li>
                  <li>Restrict certain types of data processing</li>
                </ul>

                <p className="opacity-80 mt-4">
                  To exercise these rights, contact us at hello@wranngle.com. We
                  will respond within 30 days.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  9. Children&apos;s Privacy
                </h2>
                <p className="opacity-80">
                  The Service is not intended for individuals under 18 years of
                  age. We do not knowingly collect personal information from
                  children. If you believe we have collected information from a
                  child, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  10. Cookies and Tracking
                </h2>
                <p className="opacity-80 mb-4">
                  We use cookies and similar technologies for:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for
                    authentication and security
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> To understand how you
                    use the Service
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> To optimize loading
                    times and functionality
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  You can control cookies through your browser settings.
                  Disabling certain cookies may limit Service functionality.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  11. International Data Transfers
                </h2>
                <p className="opacity-80 mb-4">
                  Your information may be transferred to and processed in
                  countries other than your country of residence, including the
                  United States. These countries may have data protection laws
                  different from your jurisdiction.
                </p>
                <p className="opacity-80">
                  For European users, we rely on Standard Contractual Clauses
                  approved by the European Commission for international data
                  transfers.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  12. California Privacy Rights (CCPA)
                </h2>
                <p className="opacity-80 mb-4">
                  If you are a California resident, you have additional rights
                  under the California Consumer Privacy Act:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Right to know what personal information is collected</li>
                  <li>
                    Right to know if personal information is sold or disclosed
                  </li>
                  <li>Right to say no to the sale of personal information</li>
                  <li>Right to delete personal information</li>
                  <li>
                    Right to non-discrimination for exercising CCPA rights
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  <strong>Note:</strong> We do not sell personal information as
                  defined by the CCPA.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  13. European Privacy Rights (GDPR)
                </h2>
                <p className="opacity-80 mb-4">
                  If you are in the European Economic Area, you have rights
                  under the General Data Protection Regulation:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Right to access your personal data</li>
                  <li>Right to rectification of inaccurate data</li>
                  <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                  <li>Right to restrict processing</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to withdraw consent</li>
                  <li>
                    Right to lodge a complaint with a supervisory authority
                  </li>
                </ul>
                <p className="opacity-80 mt-4">
                  Our legal basis for processing includes contract performance,
                  legitimate interests, and consent where required.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  14. Changes to This Privacy Policy
                </h2>
                <p className="opacity-80 mb-4">
                  We may update this Privacy Policy from time to time. We will
                  notify you of material changes by:
                </p>
                <ul className="list-disc list-inside opacity-80 space-y-2 ml-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending email notification to your registered address</li>
                </ul>
                <p className="opacity-80 mt-4">
                  Changes become effective 30 days after notification. Your
                  continued use of the Service after that date constitutes
                  acceptance.
                </p>
              </section>

              <section>
                <h2 className="brand-font text-2xl font-bold mb-4">
                  15. Contact Us
                </h2>
                <p className="opacity-80 mb-4">
                  If you have questions about this Privacy Policy or our data
                  practices, contact us at:
                </p>
                <p className="opacity-80 font-mono text-sm mb-4">
                  Wranngle Systems LLC
                  <br />
                  Email: hello@wranngle.com
                </p>
                <p className="opacity-80 text-sm">
                  Privacy, GDPR, and data-deletion requests all reach the same
                  inbox — Cody handles them directly.
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
