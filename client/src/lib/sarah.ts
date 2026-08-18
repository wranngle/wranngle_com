export const SARAH_AGENT_ID = 'agent_7801kqqqhjmcfdsa1m2a8t9w6t5c';

/**
 * Sarah operating modes. The ElevenLabs agent reads `mode` and
 * `surface_context` from the widget's `dynamic-variables` attribute and
 * branches on them inside the agent's system prompt. Keep in sync with
 * the agent's prompt template in the ElevenLabs dashboard.
 */
export type SarahMode =
  | 'lead-intake' // default on wranngle.com — open-ended project scoping call
  | 'roleplay-demo' // role-play the caller's own front-end agent
  | 'general'; // ask which the caller wants

let sarahTextPatchInstalled = false;
let sarahTextObserver: MutationObserver | undefined;
let sarahOutsideClickInstalled = false;
let sarahSuppressionCount = 0;
const SARAH_VENDOR_DEFAULT_CTA = ['Start', ['Wran', 'ngling'].join('')].join(
  ' ',
);
const releaseSarahNoop = () => undefined;

/**
 * Encode `mode` + optional `surface_context` for the widget's
 * `dynamic-variables` attribute. ElevenLabs requires JSON-encoded values
 * and lowercase keys per
 * https://elevenlabs.io/docs/conversational-ai/customization/personalization/dynamic-variables.
 */
export function buildSarahDynamicVariables(
  mode: SarahMode,
  surfaceContext?: string,
) {
  return JSON.stringify({
    mode,
    surface_context: surfaceContext ?? 'wranngle-com',
  });
}

export function ensureSarahWidgetScript() {
  if (typeof document === 'undefined') return;

  installSarahOutsideClickCollapse();

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

export function suppressSarahWidget() {
  if (typeof document === 'undefined') return releaseSarahNoop;

  sarahSuppressionCount += 1;
  syncSarahSuppression();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    sarahSuppressionCount = Math.max(0, sarahSuppressionCount - 1);
    syncSarahSuppression();
  };
}

type SarahExpandAction = 'expand' | 'collapse' | 'toggle';

function dispatchSarahExpandEvent(action: SarahExpandAction) {
  document.dispatchEvent(
    new CustomEvent('elevenlabs-agent:expand', {
      detail: {action},
    }),
  );
}

function syncSarahSuppression() {
  if (typeof document === 'undefined') return;

  const suppressed = sarahSuppressionCount > 0;
  document.documentElement.toggleAttribute('data-sarah-suppressed', suppressed);

  if (suppressed) dispatchSarahExpandEvent('collapse');
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

/**
 * The widget ships no outside-click-to-dismiss; capture-phase pointerdown
 * on document is the only lever. Detect "expanded" by the vendor's
 * aria-label="Collapse" button in the shadow root — that aria-label is
 * what the vendor uses for the toggle button when the sheet is open
 * (collapsed bubble has aria-label="Start Wranngling" instead). The
 * visible text on both is "Talk to Sarah" from our text patch, so the
 * aria-label is the only stable signal across collapsed vs expanded.
 */
function installSarahOutsideClickCollapse() {
  if (sarahOutsideClickInstalled) return;
  sarahOutsideClickInstalled = true;

  globalThis.addEventListener(
    'pointerdown',
    (event) => {
      const widget = document.querySelector<HTMLElement>('elevenlabs-convai');
      const root = widget?.shadowRoot;
      if (!widget || !root) return;

      const collapseBtn = root.querySelector<HTMLButtonElement>(
        'button[aria-label="Collapse"]',
      );
      if (!collapseBtn) return;

      const path = event.composedPath();
      const insideWidget =
        path.includes(widget) ||
        path.some(
          (node) => node instanceof Node && node.getRootNode() === root,
        );
      if (insideWidget) return;

      collapseBtn.click();
    },
    {capture: true},
  );
}
