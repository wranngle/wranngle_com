import React, {useEffect} from 'react';
import {useLocation} from 'wouter';
import {
  SARAH_AGENT_ID,
  buildSarahDynamicVariables,
  ensureSarahWidgetScript,
} from '@/lib/sarah.ts';

/**
 * Single mount point for the ElevenLabs `<elevenlabs-convai>` widget,
 * rendered at the Router root so every SPA route shows Sarah — not just
 * the home page. Routes set their own `surface_context` so Sarah's
 * opening line knows which page the caller is looking at.
 *
 * Previously the widget lived inside App.tsx, which meant /about,
 * /privacy, /terms, and 404 had no widget at all.
 */
const SURFACE_BY_ROUTE: Record<string, string> = {
  '/': 'wranngle-com/home',
  '/about': 'wranngle-com/about',
  '/built-by': 'wranngle-com/about',
  '/privacy': 'wranngle-com/privacy',
  '/terms': 'wranngle-com/terms',
};

export default function GlobalSarahWidget() {
  const [location] = useLocation();
  useEffect(() => {
    ensureSarahWidgetScript();
  }, []);
  const surface = SURFACE_BY_ROUTE[location] ?? `wranngle-com${location}`;
  return (
    <elevenlabs-convai
      agent-id={SARAH_AGENT_ID}
      avatar-orb-color-1="#ff5f00"
      avatar-orb-color-2="#cf3c69"
      action-text="Talk to Sarah"
      expand-text="Talk to Sarah"
      collapse-text="Collapse"
      start-call-text="Start voice demo"
      end-call-text="End voice demo"
      listening-text="Sarah is listening"
      speaking-text="Sarah is speaking"
      placement="bottom-right"
      dynamic-variables={buildSarahDynamicVariables('lead-intake', surface)}
    />
  );
}
