/**
 * Conversion-funnel telemetry sink.
 *
 * Accepts ECS-shaped events from `client/src/lib/telemetry.ts`,
 * validates with ArkType, and logs as one-line JSON. D1 wiring is
 * intentionally deferred — log lines are tailable via `wrangler tail`
 * and forwardable to any sink without redeploy.
 */

import {type} from 'arktype';

type Env = {
  ALLOWED_ORIGIN?: string;
};

const telemetryEventSchema = type({
  '@timestamp': 'string',
  'event.kind': '"event"',
  'event.category': '"web"',
  'event.action':
    '"cta.clicked" | "voice.demo.opened" | "voice.demo.completed"',
  'event.dataset': '"wranngle.funnel"',
  'url.full?': 'string',
  'url.path?': 'string',
  'user_agent.original?': 'string',
  'labels?': 'Record<string, string | number | boolean | null>',
});

const MAX_BODY_BYTES = 8000;

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'",
};

function corsHeaders(
  origin: string | undefined,
  allowed?: string,
): Record<string, string> {
  const ok = !allowed || allowed === '*' || origin === allowed;
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') ?? undefined;
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders(origin, context.env.ALLOWED_ORIGIN),
    ...securityHeaders,
  };

  const contentLength = context.request.headers.get('Content-Length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({error: 'Event payload too large'}), {
      status: 413,
      headers,
    });
  }

  let raw: unknown;
  try {
    raw = await context.request.json();
  } catch {
    return new Response(JSON.stringify({error: 'Invalid JSON'}), {
      status: 400,
      headers,
    });
  }

  const parsed = telemetryEventSchema(raw);
  if (parsed instanceof type.errors) {
    return new Response(
      JSON.stringify({error: `Invalid event: ${parsed.summary}`}),
      {status: 400, headers},
    );
  }

  console.log(JSON.stringify({sink: 'wranngle.funnel', ...parsed}));

  return new Response(JSON.stringify({accepted: true}), {
    status: 202,
    headers,
  });
};

export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') ?? undefined;
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(origin, context.env.ALLOWED_ORIGIN),
      ...securityHeaders,
    },
  });
};
