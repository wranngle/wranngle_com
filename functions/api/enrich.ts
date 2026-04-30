// Outbound trigger: fires lead payload to Clay enrichment table (fire-and-forget).
// Guard-clause on CLAY_WEBHOOK_URL lets ops disable this path without a code deploy.
// Timestamp ref: timestamp_seconds=86 (Clay webhook ingest pattern)

type Env = {
  CLAY_WEBHOOK_URL?: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const {CLAY_WEBHOOK_URL} = context.env;

  if (!CLAY_WEBHOOK_URL) {
    return Response.json({queued: false}, {status: 200});
  }

  let lead: unknown;
  try {
    lead = await context.request.json();
  } catch {
    return Response.json({error: 'Invalid JSON'}, {status: 400});
  }

  void fetch(CLAY_WEBHOOK_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(lead),
  }).catch((error: unknown) => {
    console.error('Clay webhook error:', error);
  });

  return Response.json({queued: true}, {status: 200});
};
