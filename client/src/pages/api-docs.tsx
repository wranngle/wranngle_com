// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {ArrowRight, Copy, Server} from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader.tsx';
import SiteFooter from '@/components/site/SiteFooter.tsx';
import {useDarkMode} from '@/components/site/DarkModeToggle.tsx';

type CopyState = 'idle' | 'copied';

type EndpointSpec = {
  path: string;
  method: 'GET' | 'POST';
  title: string;
  summary: string;
  description: string;
  requestBody?: string;
  responseBody: string;
  note?: string;
};

const API_ENDPOINTS: EndpointSpec[] = [
  {
    path: '/api/health',
    method: 'GET',
    title: 'Service Health',
    summary: 'Get service health status.',
    description:
      'Returns a compact health payload so monitoring and deployment checks can confirm the API is live.',
    responseBody: JSON.stringify({status: 'ok'}, null, 2),
  },
  {
    path: '/api/leads',
    method: 'POST',
    title: 'Lead Intake',
    summary: 'Submit a lead for webhook dispatch.',
    description:
      'Validates required fields and forwards the payload to the n8n workflow URL.',
    requestBody: JSON.stringify(
      {
        businessName: 'Acme HVAC',
        industry: 'HVAC',
        ownerName: 'Alex',
        phone: '+1-555-0100',
        email: 'owner@acme-hvac.com',
        package: 'landing-page',
        notes: 'Customer is asking about emergency coverage.',
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        success: true,
      },
      null,
      2,
    ),
    note: 'Returns 503 when N8N_WEBHOOK_URL is not configured.',
  },
  {
    path: '/api/checkout',
    method: 'POST',
    title: 'Checkout Session',
    summary: 'Create a Stripe Checkout session.',
    description:
      'Builds a session using configured pricing metadata and returns a hosted checkout URL.',
    requestBody: JSON.stringify(
      {
        package: 'basic',
      },
      null,
      2,
    ),
    responseBody: JSON.stringify(
      {
        url: 'https://checkout.stripe.com/c/pay/.../test_123',
      },
      null,
      2,
    ),
    note: 'Requires STRIPE_SECRET_KEY.',
  },
  {
    path: '/api/stripe-webhook',
    method: 'POST',
    title: 'Stripe Fulfillment Webhook',
    summary: 'Ingest paid Checkout events.',
    description:
      'Verifies Stripe signatures and forwards normalized paid-session events to the same lead workflow.',
    requestBody: JSON.stringify(
      {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_...',
            payment_status: 'paid',
            amount_total: 90_000,
            currency: 'usd',
            mode: 'payment',
          },
        },
      },
      null,
      2,
    ),
    responseBody: JSON.stringify({ok: true}, null, 2),
    note: 'Requires STRIPE_WEBHOOK_SECRET and a valid Stripe-Signature header.',
  },
];

const CONTAINER_CLASSES =
  'border-y border-r border-l-4 border-l-[var(--s500)] rounded-[24px_4px_24px_4px]';

function endpointTagClass(method: EndpointSpec['method']) {
  return method === 'GET'
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-sky-500/20 text-sky-300';
}

function copyCurl(endpoint: EndpointSpec, host = 'https://wranngle.com') {
  if (endpoint.method === 'GET') {
    return `curl -X GET ${host}${endpoint.path}`;
  }

  const payload = endpoint.requestBody || '';
  return [
    `curl -X POST ${host}${endpoint.path}`,
    " -H 'Content-Type: application/json'",
    ` -d '${payload}'`,
  ].join('');
}

function formatClipboard(value: string) {
  return value.replaceAll("'", String.raw`\'`);
}

function EndpointCard({
  endpoint,
  onCopy,
  copyState,
}: {
  endpoint: EndpointSpec;
  onCopy: (source: string) => void;
  copyState: CopyState;
}) {
  const curlCommand = copyCurl(endpoint);

  return (
    <article
      className={`${CONTAINER_CLASSES} p-5 transition-all ${copyState === 'copied' ? 'ring-1 ring-[var(--s500)]/30' : ''} ${copyState === 'copied' ? 'bg-[var(--s500)]/5' : 'bg-white'} border-white/5`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${endpointTagClass(endpoint.method)}`}
            >
              {endpoint.method}
            </span>
            <div className="text-xs font-mono text-white/70">
              {endpoint.path}
            </div>
          </div>
          <h2 className="brand-font text-2xl mt-3 mb-1">{endpoint.title}</h2>
          <p className="text-sm opacity-75">{endpoint.summary}</p>
        </div>
      </div>

      <p className="text-sm opacity-85 mb-4 leading-relaxed">
        {endpoint.description}
      </p>

      {endpoint.requestBody && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">
            Request
          </div>
          <pre className="text-[11px] leading-relaxed p-4 rounded-lg border border-white/10 bg-black/40 overflow-auto">
            {endpoint.requestBody}
          </pre>
        </div>
      )}

      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider opacity-60 mb-2">
          Response
        </div>
        <pre className="text-[11px] leading-relaxed p-4 rounded-lg border border-white/10 bg-black/40 overflow-auto">
          {endpoint.responseBody}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            onCopy(curlCommand);
          }}
          className="inline-flex items-center gap-2 text-xs px-3 py-2 border border-current/25 rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-colors"
        >
          {copyState === 'copied' ? (
            <>
              <Copy size={12} /> Copied request
            </>
          ) : (
            <>
              <Copy size={12} /> Copy curl
            </>
          )}
        </button>
        {endpoint.note && (
          <span className="text-xs opacity-60">Note: {endpoint.note}</span>
        )}
      </div>
    </article>
  );
}

export default function ApiDocs() {
  const {isDark, toggle: toggleTheme} = useDarkMode();
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    globalThis.scrollTo(0, 0);
    document.title = 'API Documentation | Wranngle Systems';
  }, []);

  const handleCopy = async (value: string) => {
    if (!globalThis.navigator?.clipboard?.writeText) return;

    await globalThis.navigator.clipboard.writeText(value);
    const key = formatClipboard(value);
    setCopied((current) => ({...current, [key]: true}));
    setTimeout(() => {
      setCopied((current) => ({...current, [key]: false}));
    }, 1300);
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <SiteHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main id="main" className="flex-1">
          <section className="relative overflow-hidden border-b border-current/10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--s500)]/70 to-transparent" />
            <div className="max-w-7xl mx-auto w-full px-6 pt-10 pb-12 md:pt-14 md:pb-16">
              <div className="max-w-3xl">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--s500)] mb-4 mono-font">
                  API CONTRACTS // PUBLIC INTEGRATION LAYER
                </div>
                <h1 className="brand-font text-4xl md:text-5xl font-bold mb-4">
                  API documentation
                </h1>
                <p className="text-base md:text-lg opacity-75 leading-relaxed mb-6">
                  Reference contracts for all public endpoints in this site,
                  including lead intake, checkout, and Stripe fulfillment
                  webhook behavior.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-current/25 font-bold uppercase text-xs rounded-md hover:border-[var(--s500)] hover:text-[var(--s500)] transition-all"
                >
                  Back to home
                  <ArrowRight size={14} aria-hidden />
                </a>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 py-14 md:py-16">
            <div
              className={`p-6 md:p-8 ${CONTAINER_CLASSES} mb-10 ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Server size={18} className="text-[var(--s500)]" aria-hidden />
                <h2 className="brand-font text-2xl">Endpoint catalog</h2>
              </div>
              <p className="text-sm opacity-75 leading-relaxed">
                This page intentionally favors practical integration over
                perfect spec tooling. Use these examples in staging before
                promoting to production.
              </p>
            </div>

            <div className="grid gap-6 md:gap-8">
              {API_ENDPOINTS.map((endpoint) => (
                <EndpointCard
                  key={endpoint.path}
                  endpoint={endpoint}
                  onCopy={handleCopy}
                  copyState={
                    copied[formatClipboard(copyCurl(endpoint))]
                      ? 'copied'
                      : 'idle'
                  }
                />
              ))}
            </div>
          </section>

          <section className="max-w-7xl mx-auto w-full px-6 pb-20">
            <div
              className={`p-6 md:p-8 ${CONTAINER_CLASSES} ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'}`}
            >
              <h2 className="brand-font text-2xl mb-4">Quick conventions</h2>
              <ul className="list-disc list-outside pl-5 space-y-2 opacity-85 text-sm leading-relaxed">
                <li>Lead intake and webhook endpoints expect JSON payloads.</li>
                <li>
                  Error responses use HTTP status + JSON message key when
                  possible.
                </li>
                <li>
                  CORS is allowed for front-end configured domains using
                  ALLOWED_ORIGIN.
                </li>
                <li>
                  Stripe webhook calls require a valid Stripe-Signature header
                  and STRIPE_WEBHOOK_SECRET.
                </li>
                <li>
                  Secrets are loaded from Cloudflare Pages environment
                  variables; none are stored in the repository.
                </li>
              </ul>
            </div>
          </section>
        </main>

        <SiteFooter isDark={isDark} />
      </div>
    </div>
  );
}
