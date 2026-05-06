// Ambient declaration for the ElevenLabs ConvAI web component
// (`<elevenlabs-convai>`). The widget is loaded as a custom element via
// `@elevenlabs/convai-widget-embed` (script tag in index.html).
//
// Without this declaration, every `<elevenlabs-convai .../>` JSX usage
// errors with: Property 'elevenlabs-convai' does not exist on type
// 'JSX.IntrinsicElements'. Adding it once here gives every TS file in
// the project the right type for the tag.
//
// Attribute set: matches the public widget API surface (Apr 2026).
// `agent-id` is the only required prop — everything else is optional
// branding/UX overrides exposed by the embed.
//
// Source: https://github.com/elevenlabs/convai-widget-embed#props

// eslint-disable-next-line import-x/no-unassigned-import -- side-effect-only import to pull React's JSX namespace into scope before the global augmentation below.
import 'react';

declare global {
  // `interface` (not `type`) is required for declaration merging into
  // the existing JSX.IntrinsicElements interface — `type` would replace
  // the entire IntrinsicElements universe (including div / span / etc.)
  // instead of adding a single tag. xo's
  // @typescript-eslint/consistent-type-definitions rule is suppressed
  // on the interface line because module augmentation has no alternative.
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging requires interface.
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id': string;
          'action-text'?: string;
          'avatar-image-url'?: string;
          'avatar-orb-color-1'?: string;
          'avatar-orb-color-2'?: string;
          'dynamic-variables'?: string;
          language?: string;
          'override-language'?: string;
          'override-prompt'?: string;
          'override-first-message'?: string;
          'override-voice-id'?: string;
          'server-location'?: string;
          'start-call-text'?: string;
          expandable?: string;
          variant?: string;
        },
        HTMLElement
      >;
    }
  }
}
