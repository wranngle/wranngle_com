export const SARAH_AGENT_ID = 'agent_7801kqqqhjmcfdsa1m2a8t9w6t5c';

export function ensureSarahWidgetScript() {
  if (typeof document === 'undefined') return;

  const scriptId = 'el-convai-v1';
  if (document.getElementById(scriptId)) return;

  const script = document.createElement('script');
  script.id = scriptId;
  // Exact-version pin instead of @beta or @latest. @beta currently
  // resolves to 0.6.0-beta.8 (months stale); @latest auto-updates and
  // could break the page on a third-party push. 0.11.7 is the current
  // stable as of 2026-05-04 — bump deliberately when ElevenLabs ships
  // a release we want.
  script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.7';
  script.async = true;
  script.crossOrigin = 'anonymous';
  // Bun's DOM typings reject HTMLScriptElement for append(), so use appendChild.
  // eslint-disable-next-line unicorn/prefer-dom-node-append
  document.head.appendChild(script);
}

export function openSarahWidget() {
  if (typeof document === 'undefined') return false;

  const widget = document.querySelector<HTMLElement>('elevenlabs-convai');

  if (!widget) return false;

  globalThis.setTimeout(() => {
    widget.dataset.visible = 'true';
  }, 0);
  widget.scrollIntoView({behavior: 'smooth', block: 'center'});
  globalThis.setTimeout(() => {
    const button =
      widget.shadowRoot?.querySelector<HTMLButtonElement>('button');
    button?.click();
  }, 700);

  return true;
}

// Collapsed orb is small (~80px). Expanded chat panel is much larger. Use
// this to detect "did the widget actually go back to the orb?" since the
// shadow-DOM widget exposes no public API for state.
const SARAH_COLLAPSED_MAX_DIMENSION = 200;

export function isSarahExpanded(widget: HTMLElement) {
  const rect = widget.getBoundingClientRect();
  return (
    rect.width > SARAH_COLLAPSED_MAX_DIMENSION ||
    rect.height > SARAH_COLLAPSED_MAX_DIMENSION
  );
}

export function syncSarahVisibility(widget?: HTMLElement) {
  if (typeof document === 'undefined') return;
  const target =
    widget ?? document.querySelector<HTMLElement>('elevenlabs-convai');
  if (!target) return;

  if (isSarahExpanded(target)) {
    target.dataset.visible = 'true';
  } else {
    delete target.dataset.visible;
  }
}

export function collapseSarahWidget(widget?: HTMLElement) {
  if (typeof document === 'undefined') return;

  const target =
    widget ?? document.querySelector<HTMLElement>('elevenlabs-convai');

  if (!target) return;

  // The widget exposes no public collapse API — events dispatched at the
  // host don't enter shadow DOM. Simulating a click on the widget's own
  // close/toggle button is the only reliable lever.
  const root = target.shadowRoot;
  const closeButton =
    root?.querySelector<HTMLButtonElement>(
      'button[aria-label*="close" i], button[aria-label*="minimize" i], button[aria-label*="end" i], button[aria-label*="dismiss" i]',
    ) ?? root?.querySelector<HTMLButtonElement>('button');
  closeButton?.click();

  // Belt-and-suspenders: clear the visibility flag now AND re-sync after
  // the widget's collapse animation settles, in case the click missed.
  delete target.dataset.visible;
  globalThis.setTimeout(() => {
    syncSarahVisibility(target);
  }, 350);
}

export function goTalkToSarah() {
  if (openSarahWidget()) return;
  globalThis.location.assign('/#talk-to-sarah');
}
