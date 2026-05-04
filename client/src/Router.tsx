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
 * Keeps `<link rel="canonical">` and `<meta property="og:url">` in
 * sync with the current SPA route. Without this, every sub-route
 * shipped the static index.html canonical pointing at "/", telling
 * search engines to consolidate /about, /products/gtm-ops, /privacy,
 * /terms back into the home page (active SEO damage).
 */
function RouteHeadSync() {
  const [location] = useLocation();
  useEffect(() => {
    const url = `${CANONICAL_ORIGIN}${location || '/'}`;

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

    const ogUrl = document.head.querySelector<HTMLMetaElement>(
      'meta[property="og:url"]',
    );
    if (ogUrl) ogUrl.content = url;

    const twUrl = document.head.querySelector<HTMLMetaElement>(
      'meta[property="twitter:url"]',
    );
    if (twUrl) twUrl.content = url;
  }, [location]);
  return null;
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
