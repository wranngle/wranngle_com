/**
 * /api/ticker — funnel-telemetry sink for client-side events
 * (impressions, CTA clicks, secondary clicks). Sibling endpoint to
 * the conversion-funnel pipeline introduced in #76. Accepts the
 * payload shape produced by `client/src/lib/ab.ts#reportAbEvent`.
 *
 * The endpoint deliberately stays cheap: it validates shape, logs
 * a structured line for the Cloudflare tail, and returns 204. A
 * downstream worker (D1 / Logpush) is responsible for durable
 * persistence — see #76 for the pipeline diagram.
 */

type TickerEvent = {
  event: 'impression' | 'cta_click' | 'secondary_click';
  variant: 'A' | 'B' | 'C';
  surface: string;
  meta?: Record<string, unknown>;
};

const ALLOWED_EVENTS = new Set(['impression', 'cta_click', 'secondary_click']);
const ALLOWED_VARIANTS = new Set(['A', 'B', 'C']);

function isTickerEvent(body: unknown): body is TickerEvent {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.event === 'string' &&
    ALLOWED_EVENTS.has(b.event) &&
    typeof b.variant === 'string' &&
    ALLOWED_VARIANTS.has(b.variant) &&
    typeof b.surface === 'string' &&
    b.surface.length > 0 &&
    b.surface.length <= 64
  );
}

export const onRequestPost: PagesFunction = async ({request}) => {
  let parsed: unknown;
  try {
    // sendBeacon ships application/json with a Blob; both shapes
    // resolve through .json().
    parsed = await request.json();
  } catch {
    return new Response(JSON.stringify({error: 'invalid json'}), {
      status: 400,
      headers: {'Content-Type': 'application/json'},
    });
  }

  if (!isTickerEvent(parsed)) {
    return new Response(JSON.stringify({error: 'invalid event'}), {
      status: 400,
      headers: {'Content-Type': 'application/json'},
    });
  }

  console.log(
    JSON.stringify({
      kind: 'ticker',
      ts: new Date().toISOString(),
      ...parsed,
    }),
  );

  return new Response(null, {status: 204});
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
