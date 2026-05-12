export const SARAH_AGENT_ID = 'agent_7801kqqqhjmcfdsa1m2a8t9w6t5c';

let sarahTextPatchInstalled = false;
let sarahTextObserver: MutationObserver | undefined;
const SARAH_VENDOR_DEFAULT_CTA = ['Start', ['Wran', 'ngling'].join('')].join(
  ' ',
);

export function ensureSarahWidgetScript() {
  if (typeof document === 'undefined') return;

  const scriptId = 'el-convai-v1';
  if (document.getElementById(scriptId)) return;

  const script = document.createElement('script');
  script.id = scriptId;
  // Exact-version pin instead of @beta or @latest. @beta currently
  // resolves to 0.6.0-beta.8 (months stale); @latest auto-updates and
  // could break the page on a third-party push. 0.12.2 is the current
  // stable as of 2026-05-11 — bump deliberately when ElevenLabs ships
  // a release we want.
  script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.12.2';
  script.async = true;
  script.crossOrigin = 'anonymous';
  // Bun's DOM typings reject HTMLScriptElement for append(), so use appendChild.
  // eslint-disable-next-line unicorn/prefer-dom-node-append
  document.head.appendChild(script);

  void globalThis.customElements?.whenDefined('elevenlabs-convai').then(() => {
    installSarahTextPatch();
  });
}

export function openSarahWidget() {
  if (typeof document === 'undefined') return false;

  const widget = document.querySelector<HTMLElement>('elevenlabs-convai');

  if (!widget) return false;

  // customElements.get() resolves at REGISTRATION time; the widget's expand
  // listener is attached later in a Preact mount effect. Dispatching in the
  // same microtask as whenDefined() can land before the listener exists, so
  // we defer one frame to let the upgraded element mount.
  const dispatch = () => {
    globalThis.requestAnimationFrame(() => {
      dispatchSarahExpandEvent('expand');
    });
  };

  if (globalThis.customElements?.get('elevenlabs-convai')) {
    dispatch();
  } else {
    void globalThis.customElements
      ?.whenDefined('elevenlabs-convai')
      .then(dispatch);
  }

  return true;
}

type SarahExpandAction = 'expand' | 'collapse' | 'toggle';

function dispatchSarahExpandEvent(action: SarahExpandAction) {
  document.dispatchEvent(
    new CustomEvent('elevenlabs-agent:expand', {
      detail: {action},
    }),
  );
}

function installSarahTextPatch() {
  if (sarahTextPatchInstalled) return;

  const widget = document.querySelector<HTMLElement>('elevenlabs-convai');
  // shadowRoot is attached during the element's connectedCallback, which runs
  // synchronously before whenDefined()'s microtask resolves. If it's still
  // missing the widget hasn't mounted in this document yet — bail and let the
  // next ensureSarahWidgetScript()/openSarahWidget() retrigger.
  const root = widget?.shadowRoot;
  if (!root) return;

  sarahTextPatchInstalled = true;
  const applyTextPatch = () => {
    for (const button of root.querySelectorAll('button')) {
      if (button.textContent?.trim() === SARAH_VENDOR_DEFAULT_CTA) {
        button.textContent = 'Talk to Sarah';
      }
    }
  };

  applyTextPatch();
  sarahTextObserver?.disconnect();
  sarahTextObserver = new MutationObserver(applyTextPatch);
  sarahTextObserver.observe(root, {childList: true, subtree: true});
}

export function goTalkToSarah() {
  if (openSarahWidget()) return;
  globalThis.location.assign('/#talk-to-sarah');
}
