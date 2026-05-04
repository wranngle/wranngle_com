import React, {useEffect} from 'react';
import {Route, Switch, Redirect, useLocation} from 'wouter';
import App from './App.tsx';
import TermsOfService from './pages/terms-of-service.tsx';
import PrivacyPolicy from './pages/privacy-policy.tsx';
import About from './pages/about.tsx';
import GtmOps from './pages/gtm-ops.tsx';
import NotFound from './pages/not-found.tsx';

const CANONICAL_ORIGIN = 'https://wranngle.com';

/**
 * Per-route SEO metadata. Each entry is what a social-card scraper or
 * search index sees when crawling that URL. Keep titles ≤60 chars and
 * descriptions 120-160 chars (Google's display range). Pages that set
 * document.title in their own useEffect (about, gtm-ops, privacy,
 * terms) take precedence — see RouteHeadSync below.
 */
const ROUTE_META: Record<string, {title: string; description: string}> = {
  '/': {
    title: 'Wranngle Systems | AI Voice Agents for HVAC, Plumbing & Electrical',
    description:
      'Automate your after-hours calls with Wranngle Systems. 24/7 AI voice agents and lead capture for HVAC, plumbing, and electrical businesses.',
  },
  '/about': {
    title: 'About — Wranngle Systems',
    description:
      'Wranngle ships practical AI systems for trades businesses — voice agents, lead pipelines, proposal automation. Built by Cody Arnold (Founder / Principal Solutions Architect).',
  },
  '/products/gtm-ops': {
    title: 'gtm_ops — Lead in, branded proposal out · Wranngle',
    description:
      'gtm_ops is the proposal-generation runtime from the Wranngle stack. Lead intake, Clay enrichment, branded proposal output, full audit trail. Live demo, no signup.',
  },
  '/privacy': {
    title: 'Privacy Policy — Wranngle Systems',
    description:
      'How Wranngle Systems collects, uses, and safeguards your data. GDPR- and CCPA-aligned; recordings encrypted in transit and at rest.',
  },
  '/terms': {
    title: 'Terms of Service — Wranngle Systems',
    description:
      'Terms of Service for the Wranngle Systems platform — voice agents, websites, and the gtm_ops SaaS.',
  },
};

/**
 * Keeps canonical, og:url, og:title, og:description, twitter:url, and
 * twitter:description in sync with the current SPA route. Without this,
 * static index.html shipped the home-page values on every URL — so
 * social cards for /about and /products/gtm-ops unfurled with the
 * home page's headline and search engines consolidated all sub-pages'
 * signals into "/".
 */
function RouteHeadSync() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location || '/';
    const url = `${CANONICAL_ORIGIN}${path}`;
    // Normalize the gtm-ops alias to the canonical path so its meta
    // matches the gtm-ops entry in the registry.
    const metaKey = path === '/products/gtm_ops' ? '/products/gtm-ops' : path;
    const meta = ROUTE_META[metaKey] ?? ROUTE_META['/'];

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      // eslint-disable-next-line unicorn/prefer-dom-node-append
      document.head.appendChild(canonical);
    }

    canonical.href = url;

    setMeta('property', 'og:url', url);
    setMeta('property', 'twitter:url', url);
    setMeta('property', 'og:title', meta.title);
    setMeta('property', 'twitter:title', meta.title);
    setMeta('property', 'og:description', meta.description);
    setMeta('property', 'twitter:description', meta.description);
    setMeta('name', 'description', meta.description);
  }, [location]);
  return null;
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  const el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (el) el.content = value;
}

export default function Router() {
  return (
    <>
      <RouteHeadSync />
      <Switch>
        <Route path="/" component={App} />
        {/* Backcompat: /offerings consolidated into the home page (#offerings). */}
        <Route path="/offerings">
          <Redirect to="/#offerings" />
        </Route>
        <Route path="/about" component={About} />
        {/* Backcompat: previous /built-by URL still resolves to the About page. */}
        <Route path="/built-by" component={About} />
        <Route path="/products/gtm-ops" component={GtmOps} />
        <Route path="/products/gtm_ops" component={GtmOps} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
