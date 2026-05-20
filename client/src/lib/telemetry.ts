/**
 * Conversion-funnel telemetry client.
 *
 * Emits ECS-shaped events to `/api/events`. Fire-and-forget: failures
 * never throw and never block the UI. Uses `navigator.sendBeacon` when
 * available so events survive page navigation (CTA click → route change).
 */

export type TelemetryEventName =
  | 'cta.clicked'
  | 'voice.demo.opened'
  | 'voice.demo.completed';

export type TelemetryFields = Record<
  string,
  string | number | boolean | undefined
>;

export type TelemetryEvent = {
  '@timestamp': string;
  'event.kind': 'event';
  'event.category': 'web';
  'event.action': TelemetryEventName;
  'event.dataset': 'wranngle.funnel';
  'url.full'?: string;
  'url.path'?: string;
  'user_agent.original'?: string;
  labels?: TelemetryFields;
};

const ENDPOINT = '/api/events';

function buildEvent(
  action: TelemetryEventName,
  labels?: TelemetryFields,
): TelemetryEvent {
  const event: TelemetryEvent = {
    '@timestamp': new Date().toISOString(),
    'event.kind': 'event',
    'event.category': 'web',
    'event.action': action,
    'event.dataset': 'wranngle.funnel',
  };

  if (globalThis.window !== undefined) {
    event['url.full'] = globalThis.location.href;
    event['url.path'] = globalThis.location.pathname;
    if (globalThis.navigator?.userAgent) {
      event['user_agent.original'] = globalThis.navigator.userAgent;
    }
  }

  if (labels && Object.keys(labels).length > 0) {
    event.labels = labels;
  }

  return event;
}

export function emit(
  action: TelemetryEventName,
  labels?: TelemetryFields,
): TelemetryEvent {
  const event = buildEvent(action, labels);
  const body = JSON.stringify(event);

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function'
    ) {
      const blob = new Blob([body], {type: 'application/json'});
      navigator.sendBeacon(ENDPOINT, blob);
    } else if (typeof fetch === 'function') {
      void fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    // Telemetry must never break the UI.
  }

  return event;
}

export const telemetry = {
  ctaClicked: (labels?: TelemetryFields) => emit('cta.clicked', labels),
  voiceDemoOpened: (labels?: TelemetryFields) =>
    emit('voice.demo.opened', labels),
  voiceDemoCompleted: (labels?: TelemetryFields) =>
    emit('voice.demo.completed', labels),
};
