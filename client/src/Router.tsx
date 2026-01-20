import React from 'react';
import {Route, Switch} from 'wouter';
import App from './App';
import TermsOfService from './pages/terms-of-service';
import PrivacyPolicy from './pages/privacy-policy';
import NotFound from './pages/not-found';

export default function Router() {
  return (
    <Switch>
      <Route path="/" component={App} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}
