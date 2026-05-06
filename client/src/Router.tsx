import React, {useEffect} from 'react';
import {Route, Switch, Redirect, useLocation} from 'wouter';
import App from './App.tsx';
import TermsOfService from './pages/terms-of-service.tsx';
import PrivacyPolicy from './pages/privacy-policy.tsx';
import About from './pages/about.tsx';
import GtmOps from './pages/gtm-ops.tsx';
import Websites from './pages/websites.tsx';
import CaseStudies from './pages/case-studies.tsx';
import NotFound from './pages/not-found.tsx';

const CANONICAL_ORIGIN = 'https://wranngle.com';

/**
 * Featured-product config. The chosen product owns BOTH `/` and
 * `/products/<slug>` — same component, same meta, canonical URL on
 * both routes points to `/` so search engines see one page, not two.
 *
 * To swap the home page to a different product, change this constant
 * and update `HOME_PRODUCT_META_KEY` (or just rely on the product's
 * own /products/<slug> ROUTE_META entry, which is what `/` will read).
 */
type ProductSlug = 'ai-voice-agents' | 'websites' | 'gtm-ops';
const HOME_PRODUCT: ProductSlug = 'ai-voice-agents';
const HOME_PRODUCT_PATH = `/products/${HOME_PRODUCT}`;
const PRODUCT_COMPONENT: Record<ProductSlug, React.ComponentType> = {
  'ai-voice-agents': App,
  websites: Websites,
  'gtm-ops': GtmOps,
};
const HomeComponent = PRODUCT_COMPONENT[HOME_PRODUCT];

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
    title: 'Cody Arnold - About Wranngle',
    description:
      'Why Wranngle exists, the operating principles behind the practice, and the public repos that show how the work actually gets done.',
  },
  '/products/gtm-ops': {
    title: 'gtm_ops — Lead in, branded proposal out · Wranngle',
    description:
      'gtm_ops turns inbound leads into branded PDF proposals. Clay-powered enrichment, full audit trail, live demo with synthetic data. No signup.',
  },
  '/products/websites': {
    title: 'Websites that capture leads — Wranngle Systems',
    description:
      'Conversion-focused landing pages and business websites built with fast performance, lead capture, SEO foundations, and owned source code.',
  },
  '/products/ai-voice-agents': {
    title: 'AI Voice Agents for Trades — Wranngle Systems',
    description:
      '24/7 AI voice agents for HVAC, plumbing, electrical, and trades businesses. Capture missed calls, qualify leads, and route handoffs.',
  },
  '/case-studies': {
    title: 'Case Studies — Wranngle Systems',
    description:
      'Real implementation outcomes for lead routing, conversion flows, and automation workflows.',
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
    // Two URL classes get folded together:
    //   - `/products/gtm_ops` is a legacy alias of `/products/gtm-ops`.
    //   - `/products/<HOME_PRODUCT>` serves the same component as `/`,
    //     so canonical/meta both point to `/` to dedupe SEO signals.
    let canonicalPath = path;
    if (path === '/products/gtm_ops') canonicalPath = '/products/gtm-ops';
    if (path === HOME_PRODUCT_PATH) canonicalPath = '/';
    // For `/` itself, surface the featured product's meta so the
    // home page advertises the actual content visitors will see.
    const metaKey = canonicalPath === '/' ? HOME_PRODUCT_PATH : canonicalPath;
    const meta = ROUTE_META[metaKey] ?? ROUTE_META['/'];
    const url = `${CANONICAL_ORIGIN}${canonicalPath}`;

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
        {/* `/` mirrors whichever product is featured (HOME_PRODUCT). The
            same component still serves at /products/<slug>; canonical URL
            on both routes points to `/` so SEO signals consolidate. */}
        <Route path="/" component={HomeComponent} />
        {/* Backcompat: /offerings consolidated into the home page (#offerings). */}
        <Route path="/offerings">
          <Redirect to="/#offerings" />
        </Route>
        <Route path="/about" component={About} />
        {/* Backcompat: previous /built-by URL still resolves to the About page. */}
        <Route path="/built-by" component={About} />
        <Route path="/products/ai-voice-agents" component={App} />
        <Route path="/products/websites" component={Websites} />
        <Route path="/products/gtm-ops" component={GtmOps} />
        <Route path="/products/gtm_ops" component={GtmOps} />
        <Route path="/case-studies" component={CaseStudies} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
