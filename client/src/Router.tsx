import React, {useEffect} from 'react';
import {Route, Switch, Redirect, useLocation} from 'wouter';
import App from './App.tsx';
import GlobalSarahWidget from './components/GlobalSarahWidget.tsx';
import TermsOfService from './pages/terms-of-service.tsx';
import PrivacyPolicy from './pages/privacy-policy.tsx';
import About from './pages/about.tsx';
import NotFound from './pages/not-found.tsx';

const CANONICAL_ORIGIN = 'https://wranngle.com';

/**
 * The site is one landing page. All former product/pricing/pilot routes
 * redirect home; only /about, /terms, and /privacy remain as sub-pages.
 */
const ROUTE_META: Record<string, {title: string; description: string}> = {
  '/': {
    title: 'One AI front end for every customer conversation | Wranngle',
    description:
      "Wranngle's unified AI front end answers, qualifies, and dispatches sales and support conversations across web chat, voice, Slack, Teams, and Discord.",
  },
  '/about': {
    title: 'Cody Arnold - About Wranngle',
    description:
      'Why Wranngle exists, the operating principles behind the practice, and the public repos that show how the work actually gets done.',
  },
  '/privacy': {
    title: 'Privacy Policy — Wranngle Systems',
    description:
      'How Wranngle Systems collects, uses, and safeguards your data. GDPR- and CCPA-aligned; recordings encrypted in transit and at rest.',
  },
  '/terms': {
    title: 'Terms of Service — Wranngle Systems',
    description:
      'Terms of Service for the Wranngle Systems platform — the unified AI front end and the gtm_ops SaaS.',
  },
};

/** Keeps canonical + og/twitter meta in sync with the current SPA route. */
function RouteHeadSync() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location || '/';
    const meta = ROUTE_META[path] ?? ROUTE_META['/'];
    const url = `${CANONICAL_ORIGIN}${ROUTE_META[path] ? path : '/'}`;

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

    document.title = meta.title;
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
        <Route path="/about" component={About} />
        {/* Backcompat: previous /built-by URL still resolves to the About page. */}
        <Route path="/built-by" component={About} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        {/* TEAROUT redirects: every retired commercial route folds into
            the single landing page. Stage-3 mirrors these in _redirects. */}
        <Route path="/offerings">
          <Redirect to="/#offerings" />
        </Route>
        <Route path="/pricing">
          <Redirect to="/#offerings" />
        </Route>
        <Route path="/pilot">
          <Redirect to="/" />
        </Route>
        <Route path="/products/:rest*">
          <Redirect to="/" />
        </Route>
        <Route component={NotFound} />
      </Switch>
      {/* Single mount point for the Sarah widget so every route shows it. */}
      <GlobalSarahWidget />
    </>
  );
}
