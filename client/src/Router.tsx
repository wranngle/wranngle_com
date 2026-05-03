import React from 'react';
import {Route, Switch} from 'wouter';
import App from './App.tsx';
import TermsOfService from './pages/terms-of-service.tsx';
import PrivacyPolicy from './pages/privacy-policy.tsx';
import Offerings from './pages/offerings.tsx';
import About from './pages/about.tsx';
import NotFound from './pages/not-found.tsx';

export default function Router() {
  return (
    <Switch>
      <Route path="/" component={App} />
      <Route path="/offerings" component={Offerings} />
      <Route path="/about" component={About} />
      {/* Backcompat: previous /built-by URL still resolves to the About page. */}
      <Route path="/built-by" component={About} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}
