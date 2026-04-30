// Inbound receiver: accepts Clay's async enriched-row callback and forwards to n8n.
// Always returns 200 to Clay regardless of n8n response — prevents Clay retry storms.
// Timestamp ref: timestamp_seconds=1511 (Clay outbound push to downstream platform)

type Env = {
  N8N_WEBHOOK_URL?: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const {N8N_WEBHOOK_URL} = context.env;

  let enriched: unknown;
  try {
    enriched = await context.request.json();
  } catch {
    // Still ack to Clay even on parse error — prevents retries on malformed rows
    return Response.json({received: true}, {status: 200});
  }

  if (N8N_WEBHOOK_URL) {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(enriched),
      });
    } catch (error: unknown) {
      console.error('n8n forward error:', error);
    }
  }

  return Response.json({received: true}, {status: 200});
};
