export const SARAH_AGENT_ID = 'agent_7801kqqqhjmcfdsa1m2a8t9w6t5c';

export function ensureSarahWidgetScript() {
  if (typeof document === 'undefined') return;

  const scriptId = 'el-convai-v1';
  if (document.getElementById(scriptId)) return;

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@beta';
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

  widget.scrollIntoView({behavior: 'smooth', block: 'center'});
  globalThis.setTimeout(() => {
    const button =
      widget.shadowRoot?.querySelector<HTMLButtonElement>('button');
    button?.click();
  }, 700);

  return true;
}

export function goTalkToSarah() {
  if (openSarahWidget()) return;
  globalThis.location.assign('/#talk-to-sarah');
}
