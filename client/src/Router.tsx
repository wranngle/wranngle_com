import React from 'react';
import {Route, Switch, Redirect} from 'wouter';
import App from './App.tsx';
import TermsOfService from './pages/terms-of-service.tsx';
import PrivacyPolicy from './pages/privacy-policy.tsx';
import About from './pages/about.tsx';
import GtmOps from './pages/gtm-ops.tsx';
import NotFound from './pages/not-found.tsx';

export default function Router() {
  return (
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
  );
}
