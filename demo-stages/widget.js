/* Mounts the real ElevenLabs convai widget on a demo landing page with the
   call (voice) button LIVE — `text-input` stays on so the auto_demo recorder
   can still type + record a conversation, but `override-text-only` is removed
   so a real prospect can click to start a voice call. Reads config from the
   <body data-agent-id data-orb-1 data-orb-2> attributes. */
(function () {
  const {body} = document;
  const {agentId} = body.dataset;
  if (!agentId) {
    console.warn('[hero-demo] no data-agent-id on body; widget not mounted');
    return;
  }

  const widget = document.createElement('elevenlabs-convai');
  widget.setAttribute('agent-id', agentId);
  widget.setAttribute('variant', 'expanded');
  widget.setAttribute('default-expanded', 'true');
  widget.setAttribute('text-input', 'true');
  // No override-text-only: the call/mic button is live for real visitors.
  widget.setAttribute('placement', 'bottom-right');
  const {orb1, orb2} = body.dataset;
  if (orb1) widget.setAttribute('avatar-orb-color-1', orb1);
  if (orb2) widget.setAttribute('avatar-orb-color-2', orb2);
  document.body.append(widget);

  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.12.2';
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.append(script);

  // The recording account is on a metered ElevenLabs plan; once text-LLM
  // characters run out the widget paints a red "quota limit" toast inside its
  // shadow root. That toast is an account-billing artifact, not product UX, so
  // suppress it in the recording stage only. Inject the style into the shadow
  // root once the element upgrades (page CSS cannot cross the shadow boundary).
  customElements.whenDefined('elevenlabs-convai').then(() => {
    const tryInject = () => {
      const root = document.querySelector('elevenlabs-convai')?.shadowRoot;
      if (!root) return false;
      const style = document.createElement('style');
      style.textContent = '.text-base-error{display:none !important;}';
      root.append(style);
      return true;
    };

    if (!tryInject()) {
      const obs = new MutationObserver(() => {
        if (tryInject()) obs.disconnect();
      });
      obs.observe(document.body, {childList: true, subtree: true});
    }
  });
})();
